-- 00009_lgpd.sql
-- LGPD compliance: consent log, data export/deletion requests

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE lgpd_consent_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type  text NOT NULL,
  granted       boolean NOT NULL,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE data_export_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url      text,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);

CREATE TABLE data_deletion_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'denied')),
  reason        text,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_lgpd_consent_profile ON lgpd_consent_log(profile_id);
CREATE INDEX idx_data_export_profile ON data_export_requests(profile_id);
CREATE INDEX idx_data_export_status ON data_export_requests(status);
CREATE INDEX idx_data_deletion_profile ON data_deletion_requests(profile_id);
CREATE INDEX idx_data_deletion_status ON data_deletion_requests(status);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE lgpd_consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent log
CREATE POLICY lgpd_consent_select ON lgpd_consent_log FOR SELECT USING (
  profile_id = auth.uid()
);

CREATE POLICY lgpd_consent_insert ON lgpd_consent_log FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

-- Users can view/create their own export requests
CREATE POLICY data_export_select ON data_export_requests FOR SELECT USING (
  profile_id = auth.uid()
);

CREATE POLICY data_export_insert ON data_export_requests FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

-- Users can view/create their own deletion requests
CREATE POLICY data_deletion_select ON data_deletion_requests FOR SELECT USING (
  profile_id = auth.uid()
);

CREATE POLICY data_deletion_insert ON data_deletion_requests FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

-- ── LGPD Functions ──────────────────────────────────────

-- Export all user data (LGPD Art. 18, V)
CREATE OR REPLACE FUNCTION export_user_data(_profile_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.id = _profile_id),
    'memberships', (
      SELECT COALESCE(jsonb_agg(row_to_json(m)), '[]'::jsonb)
      FROM memberships m WHERE m.profile_id = _profile_id
    ),
    'attendances', (
      SELECT COALESCE(jsonb_agg(row_to_json(a)), '[]'::jsonb)
      FROM attendances a
      JOIN memberships m ON m.id = a.membership_id
      WHERE m.profile_id = _profile_id
    ),
    'promotions', (
      SELECT COALESCE(jsonb_agg(row_to_json(pr)), '[]'::jsonb)
      FROM promotions pr
      JOIN memberships m ON m.id = pr.membership_id
      WHERE m.profile_id = _profile_id
    ),
    'skill_assessments', (
      SELECT COALESCE(jsonb_agg(row_to_json(sa)), '[]'::jsonb)
      FROM skill_assessments sa
      JOIN memberships m ON m.id = sa.membership_id
      WHERE m.profile_id = _profile_id
    ),
    'points', (
      SELECT COALESCE(jsonb_agg(row_to_json(pl)), '[]'::jsonb)
      FROM points_ledger pl
      JOIN memberships m ON m.id = pl.membership_id
      WHERE m.profile_id = _profile_id
    ),
    'achievements', (
      SELECT COALESCE(jsonb_agg(row_to_json(ma)), '[]'::jsonb)
      FROM member_achievements ma
      JOIN memberships m ON m.id = ma.membership_id
      WHERE m.profile_id = _profile_id
    ),
    'notifications', (
      SELECT COALESCE(jsonb_agg(row_to_json(n)), '[]'::jsonb)
      FROM notifications n WHERE n.profile_id = _profile_id
    ),
    'consent_log', (
      SELECT COALESCE(jsonb_agg(row_to_json(cl)), '[]'::jsonb)
      FROM lgpd_consent_log cl WHERE cl.profile_id = _profile_id
    ),
    'exported_at', now()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Anonymize user data (preserves pedagogical data)
CREATE OR REPLACE FUNCTION anonymize_user_data(_profile_id uuid)
RETURNS boolean AS $$
DECLARE
  _hash text;
BEGIN
  _hash := encode(sha256((_profile_id::text || now()::text)::bytea), 'hex');

  -- Anonymize profile (keep id for referential integrity)
  UPDATE profiles SET
    full_name = 'Aluno Anonimizado #' || substring(_hash for 8),
    display_name = NULL,
    avatar_url = NULL,
    phone = NULL,
    cpf_hash = _hash,
    birth_date = NULL,
    updated_at = now()
  WHERE id = _profile_id;

  -- Delete notifications
  DELETE FROM notifications WHERE profile_id = _profile_id;

  -- Log the anonymization
  INSERT INTO audit_log (user_id, action, resource_type, resource_id)
  VALUES (_profile_id, 'data:anonymize', 'profile', _profile_id::text);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Data retention report
CREATE OR REPLACE FUNCTION get_data_retention_report()
RETURNS jsonb AS $$
  SELECT jsonb_build_object(
    'total_profiles', (SELECT count(*) FROM profiles),
    'active_members', (SELECT count(*) FROM memberships WHERE status = 'active'),
    'inactive_members', (SELECT count(*) FROM memberships WHERE status = 'inactive'),
    'pending_exports', (SELECT count(*) FROM data_export_requests WHERE status = 'pending'),
    'pending_deletions', (SELECT count(*) FROM data_deletion_requests WHERE status = 'pending'),
    'consent_records', (SELECT count(*) FROM lgpd_consent_log),
    'generated_at', now()
  );
$$ LANGUAGE sql SECURITY DEFINER;
