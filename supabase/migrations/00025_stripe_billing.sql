-- 00025_stripe_billing.sql
-- Stripe integration columns + billing usage metering

-- ── Stripe columns on existing tables ──────────────────────

ALTER TABLE academies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- ── Billing usage metering ─────────────────────────────────

CREATE TABLE IF NOT EXISTS billing_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES academies(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN (
    'active_members', 'checkins', 'storage_mb',
    'api_calls', 'push_sent', 'video_minutes'
  )),
  quantity BIGINT NOT NULL DEFAULT 0,
  UNIQUE(academy_id, period_start, metric)
);

CREATE INDEX IF NOT EXISTS idx_billing_usage_academy ON billing_usage(academy_id);
CREATE INDEX IF NOT EXISTS idx_billing_usage_period ON billing_usage(academy_id, period_start);

-- ── RLS ────────────────────────────────────────────────────

ALTER TABLE billing_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY billing_usage_select ON billing_usage FOR SELECT USING (
  is_academy_admin(academy_id)
);

CREATE POLICY billing_usage_insert ON billing_usage FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);

CREATE POLICY billing_usage_update ON billing_usage FOR UPDATE USING (
  is_academy_admin(academy_id)
);
