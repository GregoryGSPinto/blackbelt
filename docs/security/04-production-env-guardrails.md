# Production Environment Guardrails

**Classification**: INTERNAL — Engineering Team  
**Status**: ✅ ACTIVE  
**Last Review**: 2026-03-12  

---

## Purpose

This document defines security guardrails for environment variable handling in production to prevent:
- Information disclosure through error messages
- Application downtime due to missing configuration
- Secret leakage in logs or error traces

---

## 1. Environment Variable Security

### 1.1 Variable Classification

| Tier | Variables | Storage | Access |
|------|-----------|---------|--------|
| **Critical** | `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` | Vercel Dashboard (Encrypted) | Server-only |
| **Required** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel Dashboard | Client + Server |
| **Optional** | `NEXT_PUBLIC_USE_MOCK`, `DATABASE_URL` | Vercel Dashboard | Context-dependent |
| **Development** | `VERCEL_*`, `TURBO_*` | CI/CD only | Build-time |

### 1.2 Naming Conventions

| Prefix | Usage | Example |
|--------|-------|---------|
| `NEXT_PUBLIC_*` | Exposed to browser | `NEXT_PUBLIC_SUPABASE_URL` |
| No prefix | Server-only | `SUPABASE_SERVICE_ROLE_KEY` |
| `VERCEL_*` | Vercel platform | `VERCEL_URL` |

**⚠️ WARNING**: Never prefix server secrets with `NEXT_PUBLIC_`.

---

## 2. Error Message Security

### 2.1 Safe Error Messages

| Scenario | Safe Message | Unsafe (Don't Use) |
|----------|--------------|-------------------|
| Missing env | "Server configuration incomplete" | "Missing NEXT_PUBLIC_SUPABASE_URL" |
| Invalid key | "Authentication failed" | "Invalid anon key: eyJhbG..." |
| DB error | "Database unavailable" | "Connection refused to postgres://..." |
| Token error | "Session invalid" | "JWT expired at 1640995200" |

### 2.2 Error Code Standards

All error responses must include a machine-readable code:

```typescript
{
  "error": "Human readable (safe)",
  "code": "MACHINE_READABLE",
  "details": "Optional additional context (sanitized)"
}
```

**Approved Codes**:
- `ENV_MISSING` — Configuration incomplete
- `AUTH_UNAVAILABLE` — Auth service down
- `UNAUTHORIZED` — Not authenticated
- `FORBIDDEN` — Permission denied
- `CONFIG_MISSING` — Required config missing
- `INTERNAL_ERROR` — Unexpected error (log id)

---

## 3. Log Sanitization

### 3.1 Automatic Redaction

**File**: `lib/logger.ts`

The logger automatically redacts:

| Pattern | Example | Redacted To |
|---------|---------|-------------|
| Email | `user@example.com` | `[redacted-email]` |
| Stripe keys | `sk_live_abc123` | `[redacted-secret]` |
| Bearer tokens | `Bearer eyJhbG...` | `Bearer [redacted-token]` |
| JWT | `eyJhbGciOiJIUzI1NiIs...` | `[redacted-jwt]` |
| Object fields | `{ password: 'secret' }` | `{ password: '[redacted]' }` |

### 3.2 Manual Redaction

When logging manually, use helper functions:

```typescript
import { logger } from '@/lib/logger';

// ❌ DON'T
logger.error('Auth failed', { token: user.jwtToken });

// ✅ DO
logger.error('Auth failed', { 
  userId: user.id,  // Safe
  token: '[redacted]'  // Explicit redaction
});
```

### 3.3 What Never to Log

- [ ] JWT tokens (full or partial)
- [ ] Passwords or hashes
- [ ] API keys (any format)
- [ ] Credit card numbers
- [ ] Personal emails (redact)
- [ ] Database connection strings
- [ ] Internal IP addresses
- [ ] Stack traces to client (log only)

---

## 4. Production Deployment Checklist

### 4.1 Pre-Deployment

- [ ] All required env vars set in Vercel Dashboard
- [ ] No `NEXT_PUBLIC_*` prefix on server secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not exposed to client
- [ ] `STRIPE_SECRET_KEY` not exposed to client
- [ ] `VERCEL_ENV` is "production"

### 4.2 Post-Deployment Verification

```bash
# 1. Health check
curl https://your-app.vercel.app/api/health/full

# 2. Verify no secrets in error
curl https://your-app.vercel.app/api/auth/session
# Should return: { "error": "Server configuration incomplete", "code": "ENV_MISSING" }
# Should NOT return actual env var names

# 3. Check logs don't contain secrets
# In Vercel Dashboard: Logs should show [redacted-...] for sensitive data
```

### 4.3 Rollback Criteria

Rollback deployment if:
- Error messages expose configuration details
- Logs contain unredacted secrets
- Health check returns 500 (not 503)
- More than 1% of requests return 500

---

## 5. Incident Response

### 5.1 Secret Exposure Detected

If secrets are found in logs/errors:

1. **Immediate**: Rotate exposed credentials
   ```bash
   # Supabase
   Dashboard → Project Settings → API → Generate new anon key
   
   # Stripe
   Dashboard → Developers → API Keys → Revoke & Create
   ```

2. **Short-term**: Purge affected logs
   - Vercel: Can't purge, document in incident log
   - External: Contact provider for log purge

3. **Long-term**: Review code that leaked secret
   - Add redaction
   - Update this document
   - Team training if needed

### 5.2 Missing Configuration in Production

If app returns `ENV_MISSING`:

1. Check Vercel Dashboard → Environment Variables
2. Verify variables are set for Production (not just Preview)
3. Redeploy if variables were just added
4. Check `/api/health/env` for specific missing vars

---

## 6. Audit Log

| Date | Change | Owner |
|------|--------|-------|
| 2026-03-12 | Initial guardrails | Staff Reliability Engineer |
| 2026-03-12 | Added safe error patterns | Staff Reliability Engineer |
| 2026-03-12 | Implemented log sanitization | Staff Reliability Engineer |

---

## 7. References

- Vercel Env Vars: https://vercel.com/docs/concepts/projects/environment-variables
- OWASP Logging: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- Supabase Security: https://supabase.com/docs/guides/security

---

**Document Owner**: Security & Platform Team  
**Review Cycle**: Monthly  
**Next Review**: 2026-04-12
