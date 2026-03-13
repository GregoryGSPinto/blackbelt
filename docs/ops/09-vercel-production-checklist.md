# Vercel Production Deployment Checklist

**Project**: BlackBelt Platform  
**Version**: 1.0.0  
**Last Updated**: 2026-03-12  

---

## Pre-Deployment Checklist

### 1. Environment Variables

Required variables MUST be set in Vercel Dashboard before deployment:

#### Critical (Application fails without these)

| Variable | Value Example | Where to Get |
|----------|---------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Dashboard → Project Settings → API |

#### Required for Full Functionality

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations | Supabase Dashboard → Project Settings → API |
| `STRIPE_SECRET_KEY` | Payment processing | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | Stripe Dashboard → Webhooks → Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe | Stripe Dashboard → Developers → API Keys |
| `RESEND_API_KEY` | Email sending | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | Sender address | Resend Dashboard → Domains |

#### Optional (Degraded functionality without)

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | Uses Supabase |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | Disabled |
| `NEXT_PUBLIC_GA_ID` | Analytics | Disabled |
| `NEXT_PUBLIC_USE_MOCK` | Mock data mode | `false` |

---

## Build Configuration

### vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "regions": ["gru1"]
}
```

✅ **Verified**: Build uses correct commands  
✅ **Verified**: Node.js functions timeout set to 30s  
✅ **Verified**: Region locked to gru1 (South America)

### next.config.js

Critical checks:

- [ ] `CAPACITOR_BUILD` is NOT set in Vercel environment
- [ ] `output: 'export'` is NOT active (would break API routes)
- [ ] `serverExternalPackages` includes `pg`
- [ ] Images config allows Supabase hostnames

---

## Health Check Endpoints

Verify all endpoints return expected status:

```bash
# 1. Basic health
curl https://your-app.vercel.app/api/health
# Expected: { "status": "ok" | "degraded", ... }

# 2. Environment check
curl https://your-app.vercel.app/api/health/env
# Expected: { "ok": true/false, "checks": {...} }

# 3. Full health + dependencies
curl https://your-app.vercel.app/api/health/full
# Expected: { "status": "healthy" | "degraded" | "unhealthy", ... }

# 4. Runtime diagnostics
curl https://your-app.vercel.app/api/health/runtime
# Expected: { "status": "healthy", "checks": {...} }

# 5. Database connectivity
curl https://your-app.vercel.app/api/health/db
# Expected: { "status": "ok" | "error", ... }
```

---

## Smoke Tests

### Public Pages (should always work)

```bash
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/login
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/cadastro
curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app/politica-privacidade
```

**Expected**: All return 200

### API Routes

```bash
# Session endpoint (should work even without auth)
curl https://your-app.vercel.app/api/auth/session
# Expected: { "session": null } or { "session": {...} }

# Protected API (should return 401 without auth)
curl https://your-app.vercel.app/api/admin/dashboard
# Expected: { "error": "Unauthorized", "code": "UNAUTHORIZED" } (401)
```

### Webhooks

```bash
# Stripe webhook (should validate signature)
curl -X POST https://your-app.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
# Expected: { "error": "Missing stripe-signature header" } (400)
```

---

## Post-Deployment Verification

### 1. Check Vercel Logs

```
Vercel Dashboard → Project → Deployments → [Latest] → Logs
```

Look for:
- [ ] No "Missing environment variable" errors
- [ ] No middleware crashes
- [ ] Health checks returning 200

### 2. Check Function Logs

```
Vercel Dashboard → Project → Functions
```

Verify:
- [ ] API routes show successful invocations
- [ ] No timeout errors
- [ ] Memory usage within limits

### 3. Runtime Diagnostics

Run the runtime check and verify:

```bash
curl https://your-app.vercel.app/api/health/runtime | jq .
```

Expected output structure:
```json
{
  "status": "healthy",
  "checks": {
    "supabase": {
      "url_configured": true,
      "anon_key_configured": true,
      "fully_configured": true
    },
    "stripe": {
      "secret_key_configured": true,
      "webhook_secret_configured": true
    }
  }
}
```

---

## Rollback Plan

If deployment fails:

1. **Immediate**: Promote previous deployment in Vercel Dashboard
2. **Check**: Compare environment variables between deployments
3. **Verify**: Run local build with production env vars
4. **Debug**: Check Vercel function logs for specific errors

---

## Troubleshooting

### 500 Errors on All Routes

**Symptoms**: Every page returns 500  
**Likely Cause**: Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Fix**: Add missing env vars and redeploy

### 500 on API Routes Only

**Symptoms**: Pages work but API returns 500  
**Likely Cause**: Server-side env vars missing (SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY)  
**Fix**: Check `/api/health/runtime` for missing vars

### Middleware Errors

**Symptoms**: Redirect loops or 500 on specific routes  
**Likely Cause**: Session refresh failing  
**Fix**: Check Supabase connection, verify env vars

### Webhook Failures

**Symptoms**: Stripe webhooks return 500  
**Likely Cause**: Missing STRIPE_WEBHOOK_SECRET  
**Fix**: Set webhook secret in env vars

---

## Sign-off

| Check | Status | Date |
|-------|--------|------|
| Environment variables configured | ⬜ | |
| Build successful | ⬜ | |
| Health checks passing | ⬜ | |
| Smoke tests successful | ⬜ | |
| Production deploy approved | ⬜ | |

**Deployed By**: _________________  
**Date**: _________________
