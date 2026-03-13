# Environment & Supabase Runtime Hardening

**Status**: ✅ IMPLEMENTED  
**Date**: 2026-03-12  
**Owner**: Staff Next.js + Supabase Reliability Engineer  

---

## Executive Summary

This document describes the hardening measures implemented to prevent `500 Internal Server Error` caused by missing environment variables or Supabase configuration issues in production.

### Key Improvements

| Metric | Before | After |
|--------|--------|-------|
| 500 on missing env | ✅ Yes | ❌ No (returns 503) |
| 500 on Supabase fail | ✅ Yes | ❌ No (returns 503/401) |
| Middleware crash on error | ✅ Yes | ❌ No (graceful fallback) |
| Error observability | Poor | ✅ Structured logging |
| Session refresh scope | All routes | ✅ Protected routes only |

---

## 1. Environment Variable Hardening

### 1.1 Centralized Environment Access

**Files**: 
- `lib/env.ts` — Core env utilities
- `src/config/env.ts` — App-specific env configuration

**Key Functions**:

```typescript
// Safe optional access
getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL')

// Check without throwing
hasRequiredSupabaseEnv() // boolean
getMissingEnvVariables() // string[]

// ⚠️ Avoid in server components — throws on missing
getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
```

### 1.2 Required vs Optional Variables

| Variable | Required | Used In | Fallback Behavior |
|----------|----------|---------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | All auth | 503 Service Unavailable |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | All auth | 503 Service Unavailable |
| `SUPABASE_SERVICE_ROLE_KEY` | Server ops | Admin APIs | Degraded functionality |
| `NEXT_PUBLIC_USE_MOCK` | ❌ No | Dev mode | `false` |
| `DATABASE_URL` | ❌ No | Event store | In-memory mode |

### 1.3 Safe Patterns

**✅ DO**:
```typescript
if (!hasRequiredSupabaseEnv()) {
  logger.error('[Runtime] Missing env vars');
  return NextResponse.json(
    { error: 'Config incomplete', code: 'ENV_MISSING' },
    { status: 503 }
  );
}
```

**❌ DON'T**:
```typescript
// In root layout or middleware
try {
  validateEnv(); // Throws!
} catch (e) {
  // Too late — error already propagated
}
```

---

## 2. Supabase Server Client Hardening

### 2.1 Client Factory Functions

**File**: `lib/supabase/server.ts`

Three functions available, ordered by safety:

#### A. `getSupabaseServerClientSafe()` — RECOMMENDED

```typescript
const client = await getSupabaseServerClientSafe();
if (!client) {
  // Handle gracefully — env missing or client creation failed
  return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
}
// Use client...
```

**Characteristics**:
- Never throws
- Returns `null` on any error
- Logs error details internally

#### B. `createSupabaseServerClient()` — RESULT-BASED

```typescript
const result = await createSupabaseServerClient();
if (!result.success) {
  // result.error: 'CONFIG_MISSING' | 'CLIENT_CREATE_FAILED'
  // result.message: human-readable description
  return NextResponse.json(
    { error: result.message, code: result.error },
    { status: 503 }
  );
}
// Use result.client...
```

**Characteristics**:
- Never throws
- Returns structured result
- Rich error context

#### C. `getSupabaseServerClient()` — LEGACY

```typescript
// ⚠️ Throws on missing env!
const client = await getSupabaseServerClient();
```

**Characteristics**:
- Throws `Error` on missing env
- Deprecated for new code
- Maintain for backward compatibility

### 2.2 Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `ENV_MISSING` | Environment variables not configured | 503 |
| `AUTH_UNAVAILABLE` | Supabase client creation failed | 503 |
| `CONFIG_MISSING` | URL or anon key missing | 503 |
| `CLIENT_CREATE_FAILED` | Unexpected client creation error | 503 |
| `SESSION_REFRESH_FAILED` | Token refresh failed | 401 (if auth required) |
| `MIDDLEWARE_EXCEPTION` | Unexpected middleware error | Pass-through |

---

## 3. Middleware Hardening

### 3.1 Session Refresh Scope Reduction

**File**: `proxy.ts`

**Before**: Session refresh ran on ALL non-static routes  
**After**: Session refresh only on protected routes and API routes

```typescript
// Only refresh session when needed
const needsSessionRefresh = isProtected || (!isPublicApi && pathname.startsWith('/api/'));

if (needsSessionRefresh) {
  const sessionResult = await updateSupabaseSession(request, response);
  // Log issues but don't block request
  if (!sessionResult.success) {
    logger.warn('[Proxy] Session refresh issue', { error: sessionResult.error });
  }
}
```

### 3.2 Defensive Error Handling

**File**: `lib/supabase/middleware.ts`

```typescript
export async function updateSupabaseSession(request, response) {
  // 1. Check env first
  if (!url || !anonKey) {
    logger.error('[Middleware] Missing Supabase env');
    return { success: false, response, error: 'CONFIG_MISSING' };
  }

  try {
    // 2. Create client and refresh
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // 3. Log but don't fail
      logger.warn('[Middleware] Session refresh error', { 
        error: error.message,
        code: error.code 
      });
      return { success: false, response, error: error.code };
    }
    
    return { success: true, response, user };
  } catch (error) {
    // 4. Never crash the request
    logger.error('[Middleware] Unexpected error', { error });
    return { success: false, response, error: 'MIDDLEWARE_EXCEPTION' };
  }
}
```

### 3.3 Public Route Protection

**File**: `proxy.ts`

Public routes completely bypass session handling:

```typescript
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/politica-privacidade',
  '/termos-de-uso',
  // ... 20+ routes
];

if (isPublicRoute) {
  // No session refresh, no auth checks
  return publicResponse;
}
```

---

## 4. HTTP Status Code Mapping

### 4.1 New Status Code Behavior

| Scenario | Old Status | New Status | Code |
|----------|------------|------------|------|
| Missing env vars | 500 | 503 | `ENV_MISSING` |
| Supabase unavailable | 500 | 503 | `AUTH_UNAVAILABLE` |
| Session refresh fail | 500 | 200/401* | `SESSION_REFRESH_FAILED` |
| Invalid CSRF header | 403 | 403 | — |
| Unauthenticated API | 500/302 | 401 | `UNAUTHORIZED` |
| Unexpected error | 500 | 500 | `INTERNAL_ERROR` |

\* Returns 200 for public pages, 401 for protected API routes

### 4.2 Error Response Format

```json
{
  "error": "Human readable description",
  "code": "MACHINE_READABLE_CODE",
  "session": null  // For auth endpoints
}
```

---

## 5. Observability Improvements

### 5.1 Structured Logging

**File**: `lib/logger.ts`

All logs are sanitized to prevent secret leakage:

```typescript
// Automatic redaction of:
// - Email addresses → [redacted-email]
// - Stripe keys → [redacted-secret]
// - Bearer tokens → Bearer [redacted-token]
// - JWT tokens → [redacted-jwt]
// - Object fields: token, password, secret, apiKey...

logger.error('[Supabase] Client creation failed', {
  error: 'Missing env var',  // Sanitized
  userEmail: 'user@example.com',  // → [redacted-email]
  apiKey: 'sk_live_...',  // → [redacted-secret]
});
```

### 5.2 Log Levels by Environment

| Level | Development | Production | Notes |
|-------|-------------|------------|-------|
| `debug` | ✅ Console | ❌ Silent | Never in prod |
| `info` | ✅ Console | ❌ Silent | Breadcrumb only |
| `warn` | ✅ Console | ❌ Silent | Sentry warning (TODO) |
| `error` | ✅ Console | ✅ Console | Sentry exception (TODO) |

### 5.3 Critical Log Points

| Location | Level | Context |
|----------|-------|---------|
| `lib/supabase/server.ts` | error | Missing env, client creation fail |
| `lib/supabase/middleware.ts` | error/warn | Session refresh issues |
| `proxy.ts` | warn | Session refresh issues (non-critical) |
| `app/layout.tsx` | error | Missing env (graceful) |
| `app/api/auth/session` | error | API errors with request context |

---

## 6. Migration Guide

### 6.1 For New API Routes

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasRequiredSupabaseEnv } from '@/src/config/env';

export async function GET() {
  // 1. Check env first
  if (!hasRequiredSupabaseEnv()) {
    return NextResponse.json(
      { error: 'Config incomplete', code: 'ENV_MISSING' },
      { status: 503 }
    );
  }

  // 2. Create client safely
  const result = await createSupabaseServerClient();
  if (!result.success) {
    return NextResponse.json(
      { error: result.message, code: result.error },
      { status: 503 }
    );
  }

  // 3. Use client
  const { data, error } = await result.client.from('table').select();
  // ...
}
```

### 6.2 For Existing Routes

Replace `getSupabaseServerClient()` with safe version:

```typescript
// Before
const supabase = await getSupabaseServerClient();

// After
const supabase = await getSupabaseServerClientSafe();
if (!supabase) {
  return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
}
```

---

## 7. Validation Checklist

Before deploying to production:

- [ ] All API routes use safe client factories
- [ ] No `validateEnv()` calls in root layout
- [ ] Middleware handles `updateSupabaseSession` errors gracefully
- [ ] Public routes bypass session refresh
- [ ] Error responses include `code` field
- [ ] Logs don't contain secrets (check redaction)
- [ ] Health check endpoint (`/api/health`) returns 200
- [ ] Session endpoint (`/api/auth/session`) returns 503 when env missing

---

## 8. Files Modified

| File | Changes |
|------|---------|
| `lib/supabase/server.ts` | Added safe client factories, error handling |
| `lib/supabase/middleware.ts` | Added try/catch, result types, logging |
| `proxy.ts` | Reduced session refresh scope, defensive checks |
| `lib/logger.ts` | Improved dev logging, sanitization |
| `app/api/auth/session/route.ts` | Added env guards, structured errors |
| `app/layout.tsx` | Removed throwing `validateEnv()` call |

---

## 9. References

- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Supabase SSR: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-12
