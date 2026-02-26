-- 00010_audit_monitoring.sql
-- Audit log, rate limiting, auto-audit trigger

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id),
  action        text NOT NULL,
  resource_type text NOT NULL,
  resource_id   text,
  old_value     jsonb,
  new_value     jsonb,
  ip_address    inet,
  user_agent    text,
  academy_id    uuid REFERENCES academies(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rate_limit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address    text NOT NULL,
  endpoint      text NOT NULL,
  count         int NOT NULL DEFAULT 1,
  window_start  timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_academy ON audit_log(academy_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_rate_limit_ip_endpoint ON rate_limit_log(ip_address, endpoint, window_start);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Audit log: admin/auditor can view academy logs
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (
  user_id = auth.uid()
  OR academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid()
      AND role IN ('admin', 'owner')
      AND status = 'active'
  )
);

-- Audit log: insert allowed (server-side via trigger or admin client)
CREATE POLICY audit_log_insert ON audit_log FOR INSERT WITH CHECK (true);

-- Audit log: never update or delete (immutable)
-- No UPDATE or DELETE policies

-- Rate limit log: service role only
CREATE POLICY rate_limit_select ON rate_limit_log FOR SELECT USING (false);
CREATE POLICY rate_limit_insert ON rate_limit_log FOR INSERT WITH CHECK (true);

-- ── Auto-audit trigger function ─────────────────────────

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

-- ── Attach audit triggers to key tables ─────────────────

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
