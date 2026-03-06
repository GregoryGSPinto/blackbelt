-- ============================================================
-- Migration 00023: Feature Flags + Background Job Scheduling
-- Part of Block 0.2: Feature Flags + Background Jobs + Deep Linking
-- ============================================================

-- ── Feature Flags Table ──
CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY,
  description TEXT,
  enabled_globally BOOLEAN DEFAULT false,
  enabled_for_academies UUID[] DEFAULT '{}',
  enabled_for_roles TEXT[] DEFAULT '{}',
  enabled_percentage INT DEFAULT 0 CHECK (enabled_percentage BETWEEN 0 AND 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- RLS: anyone authenticated can read flags, only service_role can write
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_read_all" ON feature_flags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "feature_flags_admin_write" ON feature_flags
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Seed initial flags ──
INSERT INTO feature_flags (id, description, enabled_globally) VALUES
  ('social_feed', 'Rede social com feed de posts', false),
  ('video_platform', 'Plataforma de videos e cursos', false),
  ('competitions', 'Sistema de competicoes', false),
  ('marketplace', 'Marketplace de produtos', false),
  ('ai_coaching', 'Dicas de coaching por IA generativa', false),
  ('offline_mode', 'Modo offline para check-in', false),
  ('live_scoring', 'Placar ao vivo em competicoes', false)
ON CONFLICT (id) DO NOTHING;

-- ── Background Job Scheduling (pg_cron) ──
-- Note: pg_cron must be enabled in Supabase dashboard (Extensions)
-- These will fail silently if pg_cron is not enabled

DO $$
BEGIN
  -- Daily stats recalculation at 03:00 UTC
  PERFORM cron.schedule(
    'daily-stats',
    '0 3 * * *',
    format(
      'SELECT net.http_post(url := %L || %L, headers := jsonb_build_object(%L, %L || current_setting(%L, true)))',
      coalesce(current_setting('app.settings.edge_function_url', true), ''),
      '/cron-daily-stats',
      'Authorization',
      'Bearer ',
      'app.settings.service_role_key'
    )
  );

  -- Churn risk alerts at 04:00 UTC
  PERFORM cron.schedule(
    'churn-alert',
    '0 4 * * *',
    format(
      'SELECT net.http_post(url := %L || %L, headers := jsonb_build_object(%L, %L || current_setting(%L, true)))',
      coalesce(current_setting('app.settings.edge_function_url', true), ''),
      '/cron-churn-alert',
      'Authorization',
      'Bearer ',
      'app.settings.service_role_key'
    )
  );

  -- Cleanup expired data at 02:00 UTC
  PERFORM cron.schedule(
    'daily-cleanup',
    '0 2 * * *',
    format(
      'SELECT net.http_post(url := %L || %L, headers := jsonb_build_object(%L, %L || current_setting(%L, true)))',
      coalesce(current_setting('app.settings.edge_function_url', true), ''),
      '/cron-cleanup',
      'Authorization',
      'Bearer ',
      'app.settings.service_role_key'
    )
  );

EXCEPTION
  WHEN undefined_function THEN
    RAISE NOTICE 'pg_cron not available — skipping cron job scheduling. Enable pg_cron extension in Supabase dashboard.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule cron jobs: %', SQLERRM;
END;
$$;
