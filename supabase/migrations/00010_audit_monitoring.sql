-- 00010_audit_monitoring.sql
-- Rate limiting + audit triggers
-- NOTE: audit_log table was created in 00009_lgpd.sql (needed by anonymize_user_data)
-- ORDER: tables → indexes → RLS → trigger function → triggers

-- ── 1. Tables ─────────────────────────────────────────────

CREATE TABLE rate_limit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address    text NOT NULL,
  endpoint      text NOT NULL,
  count         int NOT NULL DEFAULT 1,
  window_start  timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Indexes ────────────────────────────────────────────

CREATE INDEX idx_rate_limit_ip_endpoint ON rate_limit_log(ip_address, endpoint, window_start);

-- ── 3. RLS ────────────────────────────────────────────────

ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Rate limit log: service role only
CREATE POLICY rate_limit_select ON rate_limit_log FOR SELECT USING (false);
CREATE POLICY rate_limit_insert ON rate_limit_log FOR INSERT WITH CHECK (true);

-- ── 4. Auto-audit trigger function ───────────────────────

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, new_value)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME || ':create',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, old_value, new_value)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME || ':update',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, old_value)
    VALUES (
      auth.uid(),
      TG_TABLE_NAME || ':delete',
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. Attach audit triggers to key tables ────────────────

CREATE TRIGGER audit_memberships
  AFTER INSERT OR UPDATE OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_promotions
  AFTER INSERT OR UPDATE OR DELETE ON promotions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments
  AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
