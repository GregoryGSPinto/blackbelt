-- ============================================================
-- Migration 00024: Observability + Push Notifications
-- BLOCO 0.4 — Request Logs, Push Tokens, Notification Preferences
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. REQUEST LOGS (partitioned by month)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INT,
  duration_ms INT,
  user_id UUID,
  academy_id UUID,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Partitions for current and next month
CREATE TABLE IF NOT EXISTS request_logs_2026_03 PARTITION OF request_logs
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS request_logs_2026_04 PARTITION OF request_logs
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- Index for querying by time
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_user_id ON request_logs (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_request_logs_path ON request_logs (path);

-- RLS
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read request logs"
  ON request_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ────────────────────────────────────────────────────────────
-- 2. PUSH TOKENS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens (active) WHERE active = true;

-- RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL
  USING (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 3. NOTIFICATION PREFERENCES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  disabled_types TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_preferences_updated
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_timestamp();

-- Auto-update push_tokens timestamp trigger
CREATE OR REPLACE FUNCTION update_push_tokens_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_push_tokens_updated
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_timestamp();
