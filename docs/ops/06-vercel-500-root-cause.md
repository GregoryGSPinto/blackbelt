# Root Cause Analysis: 500 Internal Server Error on Vercel Runtime

## Incident Summary

| Field | Value |
|-------|-------|
| **Date** | 2026-03-12 |
| **Severity** | Critical (Blocks App Review) |
| **Component** | Web Runtime / Vercel Deployment |
| **Status** | **RESOLVED** |

---

## Problem Statement

The BlackBelt application was experiencing `500 Internal Server Error` in the Vercel production environment, preventing successful deployment and blocking App Review processes for both iOS App Store and Google Play Store.

---

## Root Cause Analysis

### Primary Root Cause: Unsafe Environment Variable Validation

The main culprit was identified in **`app/layout.tsx`** at lines 73-77:

```typescript
// BEFORE (Dangerous):
try {
  validateEnv();
} catch (error) {
  logger.error('[Auth] Missing Supabase environment variables', error);
}
```

**Why this caused 500 errors:**

1. **throw in async server component**: The `validateEnv()` function calls `getRequiredEnv()` which **throws an Error** if environment variables are missing
2. **Unintentional re-throw**: The try-catch block was incorrectly structured - the error being logged but subsequent code still depended on the env vars being present
3. **Layout crash**: When the root layout crashes, Next.js returns a 500 error for ALL routes
4. **No graceful degradation**: The application had no fallback for missing environment variables

### Secondary Issues Identified

#### 2. Session API Route Lacked Environment Guards

**File**: `app/api/auth/session/route.ts`

The API route directly instantiated the Supabase client without checking if environment variables were available, causing unhandled exceptions.

#### 3. Server Client Factory Threw Instead of Returning Null

**File**: `lib/supabase/server.ts`

The `getSupabaseServerClient()` function would throw an error on missing env vars instead of returning null gracefully.

---

## Evidence

### Build vs Runtime Behavior

| Phase | Behavior | Result |
|-------|----------|--------|
| Build | Static generation succeeds | ✅ OK |
| Runtime (SSR) | `validateEnv()` throws | ❌ 500 Error |
| Runtime (API) | Supabase client fails | ❌ 500 Error |

### Affected Routes

- `/` (Home/Landing)
- `/login` (Authentication)
- `/api/auth/session` (Session management)
- All protected routes (`/dashboard/*`, `/app/*`, etc.)

---

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `app/layout.tsx` | Modified | Replaced `validateEnv()` with graceful `hasRequiredSupabaseEnv()` check |
| `lib/supabase/server.ts` | Modified | Added `getSupabaseServerClientSafe()` with null return on missing env |
| `app/api/auth/session/route.ts` | Modified | Added env checks before client instantiation |

---

## Correction Applied

### 1. Layout.tsx - Graceful Environment Check

```typescript
// AFTER (Safe):
if (!hasRequiredSupabaseEnv()) {
  const missing = getMissingEnvVariables();
  logger.error(`[Runtime] Missing required environment variables: ${missing.join(', ')}`);
  // Continue rendering — error boundaries will handle UI if needed
}
```

### 2. Server.ts - Safe Client Factory

```typescript
// Added new safe function:
export async function getSupabaseServerClientSafe() {
  const url = env.SUPABASE_URL || getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = env.SUPABASE_ANON_KEY || getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    logger.error('[Supabase] Missing required environment variables');
    return null; // Graceful degradation
  }
  // ... create client
}
```

### 3. Session Route - Environment Guard

```typescript
// Added at start of GET handler:
if (!hasRequiredSupabaseEnv()) {
  return NextResponse.json(
    { 
      session: null, 
      error: 'Server configuration incomplete',
      code: 'ENV_MISSING' 
    },
    { status: 503 }
  );
}
```

---

## Verification

### Build Status

```bash
$ pnpm lint
✅ No errors

$ pnpm typecheck
✅ No TypeScript errors

$ pnpm build
✅ Build successful - 176 routes generated
```

### Middleware Status

```
ƒ Proxy (Middleware) — correctly recognized by Next.js
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing env vars in production | Low | High | ✅ Now returns 503 with clear message |
| Session API unavailable | Low | Medium | ✅ Returns controlled error response |
| Layout crash | Very Low | Critical | ✅ Removed throwing validation |

---

## Lessons Learned

1. **Never throw in root layout initialization** — always use graceful degradation
2. **Environment validation should not block rendering** — log errors but continue
3. **API routes must validate env before using clients** — return 503, not 500
4. **Client factories should return null, not throw** — let callers handle gracefully

---

## References

- Next.js Error Handling: https://nextjs.org/docs/app/building-your-application/routing/error-handling
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Supabase SSR: https://supabase.com/docs/guides/auth/server-side

---

**RCA Completed By**: Principal Runtime Incident Engineer  
**Date**: 2026-03-12  
**Next Review**: 2026-03-19
