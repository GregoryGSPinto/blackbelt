-- 00022_read_models.sql
-- CQRS Read Model tables for materialized views

-- ── Read Model: Academy Stats ────────────────────────────

CREATE TABLE rm_academy_stats (
  academy_id UUID PRIMARY KEY REFERENCES academies(id),
  total_members INT DEFAULT 0,
  active_members INT DEFAULT 0,
  total_checkins_30d INT DEFAULT 0,
  avg_attendance_pct NUMERIC(5,2) DEFAULT 0,
  revenue_30d_cents BIGINT DEFAULT 0,
  churn_risk_high_count INT DEFAULT 0,
  last_computed_at TIMESTAMPTZ DEFAULT now()
);

-- ── Read Model: Athlete Profile ──────────────────────────

CREATE TABLE rm_athlete_profile (
  membership_id UUID PRIMARY KEY,
  academy_id UUID NOT NULL,
  display_data JSONB NOT NULL DEFAULT '{}',
  stats JSONB NOT NULL DEFAULT '{}',
  ml_scores JSONB,
  last_computed_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────

CREATE INDEX idx_rm_academy_stats_computed ON rm_academy_stats(last_computed_at);
CREATE INDEX idx_rm_athlete_profile_academy ON rm_athlete_profile(academy_id);
CREATE INDEX idx_rm_athlete_profile_computed ON rm_athlete_profile(last_computed_at);

-- ── RLS (same tenant policies) ───────────────────────────

ALTER TABLE rm_academy_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rm_athlete_profile ENABLE ROW LEVEL SECURITY;

-- Read models are server-side managed (via service role)
CREATE POLICY rm_academy_stats_service ON rm_academy_stats FOR ALL USING (false);
CREATE POLICY rm_athlete_profile_service ON rm_athlete_profile FOR ALL USING (false);

-- ── Trigger: auto-update last_computed_at ────────────────

CREATE OR REPLACE FUNCTION update_rm_last_computed_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_computed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rm_academy_stats_computed_at
  BEFORE UPDATE ON rm_academy_stats
  FOR EACH ROW EXECUTE FUNCTION update_rm_last_computed_at();

CREATE TRIGGER rm_athlete_profile_computed_at
  BEFORE UPDATE ON rm_athlete_profile
  FOR EACH ROW EXECUTE FUNCTION update_rm_last_computed_at();
