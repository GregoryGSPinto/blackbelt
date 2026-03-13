# Required Vercel Environment Variables

**Document**: Environment Variable Reference  
**Environment**: Production (Vercel)  
**Classification**: INTERNAL  

---

## Quick Reference Table

| Variable | Required | Scope | Category | Status Check |
|----------|----------|-------|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ CRITICAL | Client + Server | Auth | `/api/health/runtime` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ CRITICAL | Client + Server | Auth | `/api/health/runtime` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Required | Server-only | Database | `/api/health/runtime` |
| `STRIPE_SECRET_KEY` | ✅ Required | Server-only | Payments | `/api/health/runtime` |
| `STRIPE_WEBHOOK_SECRET` | ✅ Required | Server-only | Webhooks | `/api/health/runtime` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Required | Client + Server | Payments | `/api/health/runtime` |
| `RESEND_API_KEY` | ✅ Required | Server-only | Email | `/api/health/runtime` |
| `RESEND_FROM_EMAIL` | ⬜ Optional | Server-only | Email | `/api/health/runtime` |
| `DATABASE_URL` | ⬜ Optional | Server-only | Database | `/api/health/db` |
| `NEXT_PUBLIC_SENTRY_DSN` | ⬜ Optional | Client + Server | Monitoring | `/api/health/runtime` |
| `NEXT_PUBLIC_GA_ID` | ⬜ Optional | Client-only | Analytics | - |
| `NEXT_PUBLIC_USE_MOCK` | ⬜ Optional | Client + Server | Dev Mode | `/api/health/runtime` |

---

## Detailed Specifications

### 🔴 CRITICAL - Application fails without these

#### `NEXT_PUBLIC_SUPABASE_URL`

```bash
# Example
NEXT_PUBLIC_SUPABASE_URL=https://conmfnjaqmqrlmjswhru.supabase.co

# Where to find
# Supabase Dashboard → Project Settings → API → Project URL
```

**Usage**:
- Client-side Supabase client initialization
- Server-side Supabase client initialization
- Middleware session refresh
- API routes (auth, database)

**Failure Mode**: 503 Service Unavailable with code `ENV_MISSING`

---

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

```bash
# Example
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Where to find
# Supabase Dashboard → Project Settings → API → Project API Keys → anon public
```

**Usage**:
- Client authentication
- Row Level Security (RLS) policies
- Anonymous database access

**Failure Mode**: 503 Service Unavailable with code `ENV_MISSING`

---

### 🟡 REQUIRED - Core functionality degraded without these

#### `SUPABASE_SERVICE_ROLE_KEY`

```bash
# Example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Where to find
# Supabase Dashboard → Project Settings → API → Project API Keys → service_role secret
# ⚠️ NEVER expose this to client-side code
```

**Usage**:
- Admin operations bypassing RLS
- Webhook processing
- Background jobs
- Server-side data migrations

**Failure Mode**: Admin operations fail with `CONFIG_MISSING` error

---

#### `STRIPE_SECRET_KEY`

```bash
# Example
STRIPE_SECRET_KEY=sk_live_51ABC123...

# Where to find
# Stripe Dashboard → Developers → API Keys → Secret key
# ⚠️ Use live key for production, test key for development
```

**Usage**:
- Payment processing
- Subscription management
- Invoice generation
- Webhook verification

**Failure Mode**: Payment operations fail with `CONFIG_MISSING` error

---

#### `STRIPE_WEBHOOK_SECRET`

```bash
# Example
STRIPE_WEBHOOK_SECRET=whsec_123ABC...

# Where to find
# Stripe Dashboard → Webhooks → [Your Endpoint] → Signing secret
```

**Usage**:
- Webhook signature verification
- Event authenticity validation

**Failure Mode**: Webhook returns 503 with `CONFIG_MISSING`

---

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

```bash
# Example
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC123...

# Where to find
# Stripe Dashboard → Developers → API Keys → Publishable key
```

**Usage**:
- Stripe.js initialization
- Payment element rendering
- Client-side payment flows

**Failure Mode**: Payment UI fails to load

---

#### `RESEND_API_KEY`

```bash
# Example
RESEND_API_KEY=re_123ABC...

# Where to find
# Resend Dashboard → API Keys
```

**Usage**:
- Transactional email sending
- Welcome emails
- Password reset emails
- Payment reminders

**Failure Mode**: Email sends fail silently (logged but not blocking)

---

### 🟢 OPTIONAL - Enhanced functionality

#### `RESEND_FROM_EMAIL`

```bash
# Example
RESEND_FROM_EMAIL=noreply@blackbelt.app

# Default
BlackBelt <noreply@blackbelt.app>
```

**Usage**:
- Sender address for transactional emails

---

#### `DATABASE_URL`

```bash
# Example
DATABASE_URL=postgresql://user:pass@host:5432/blackbelt?sslmode=require

# When needed
# For direct PostgreSQL connections (event store, complex queries)
```

**Usage**:
- Event store persistence
- Complex aggregation queries
- Background job processing

**Default**: Uses Supabase if not set

---

#### `NEXT_PUBLIC_SENTRY_DSN`

```bash
# Example
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Where to find
# Sentry Dashboard → Projects → [Project] → Settings → Client Keys
```

**Usage**:
- Error tracking
- Performance monitoring
- Release health

---

#### `NEXT_PUBLIC_GA_ID`

```bash
# Example
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Where to find
# Google Analytics → Admin → Property Settings → Tracking ID
```

**Usage**:
- Page view tracking
- Event analytics
- User behavior analysis

---

#### `NEXT_PUBLIC_USE_MOCK`

```bash
# Example
NEXT_PUBLIC_USE_MOCK=false

# Values
# true  = Use mock data (development without backend)
# false = Use real Supabase backend (production)
```

**Usage**:
- Development mode without backend
- Testing UI components
- Demo deployments

**Default**: `false`

---

## Environment-Specific Values

### Development (Local)

```bash
# Use test keys
NEXT_PUBLIC_SUPABASE_URL=https://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_test_...
NEXT_PUBLIC_USE_MOCK=true
```

### Production (Vercel)

```bash
# Use live keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (live anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (live service role)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=re_... (production key)
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_USE_MOCK=false
```

---

## Validation Commands

### Check All Environment Variables

```bash
# Via API endpoint
curl https://your-app.vercel.app/api/health/runtime

# Expected response when configured:
{
  "status": "healthy",
  "checks": {
    "supabase": {
      "url_configured": true,
      "anon_key_configured": true,
      "service_role_configured": true,
      "fully_configured": true
    },
    "stripe": {
      "secret_key_configured": true,
      "webhook_secret_configured": true,
      "publishable_key_configured": true
    },
    "email": {
      "resend_key_configured": true,
      "from_email_configured": true
    }
  }
}
```

---

## Security Notes

### ⚠️ NEVER Commit These

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `DATABASE_URL` (if contains password)

### ✅ Safe for Client-Side

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_GA_ID`

---

## Troubleshooting

### Variable Not Available in Runtime

1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Verify variable is set for Production (not just Preview/Development)
3. Redeploy after adding variables (Vercel doesn't auto-redeploy on env change)
4. Check `/api/health/runtime` to confirm visibility

### Variable Visible in Build but Not Runtime

- Build-time variables (used in `next.config.js`) need `NEXT_PUBLIC_` prefix
- Runtime variables are accessed via `process.env` in API routes

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-12  
**Maintained By**: Platform Engineering Team
