-- ============================================================
-- Migration 00027: Federation + Onboarding Wizard
-- Block 1.3 — Federation management + onboarding wizard
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- PART 1: Federations
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS federations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  country TEXT DEFAULT 'BR',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS federation_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id UUID REFERENCES federations(id) ON DELETE CASCADE,
  academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin','member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(federation_id, academy_id)
);

CREATE TABLE IF NOT EXISTS federation_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id UUID REFERENCES federations(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','viewer')) DEFAULT 'admin',
  UNIQUE(federation_id, profile_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_federation_memberships_federation
  ON federation_memberships (federation_id);
CREATE INDEX IF NOT EXISTS idx_federation_memberships_academy
  ON federation_memberships (academy_id);
CREATE INDEX IF NOT EXISTS idx_federation_admins_federation
  ON federation_admins (federation_id);
CREATE INDEX IF NOT EXISTS idx_federation_admins_profile
  ON federation_admins (profile_id);
CREATE INDEX IF NOT EXISTS idx_federations_slug
  ON federations (slug);

-- RLS for federations
ALTER TABLE federations ENABLE ROW LEVEL SECURITY;
ALTER TABLE federation_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE federation_admins ENABLE ROW LEVEL SECURITY;

-- Federation admins can see their federation
CREATE POLICY "federation_admins_select" ON federations
  FOR SELECT USING (
    id IN (
      SELECT federation_id FROM federation_admins
      WHERE profile_id = auth.uid()
    )
    OR
    id IN (
      SELECT fm.federation_id FROM federation_memberships fm
      JOIN memberships m ON m.academy_id = fm.academy_id
      WHERE m.profile_id = auth.uid()
    )
  );

-- Only federation owners/admins can update
CREATE POLICY "federation_admins_update" ON federations
  FOR UPDATE USING (
    id IN (
      SELECT federation_id FROM federation_admins
      WHERE profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Federation memberships: visible to federation admins and academy members
CREATE POLICY "federation_memberships_select" ON federation_memberships
  FOR SELECT USING (
    federation_id IN (
      SELECT federation_id FROM federation_admins
      WHERE profile_id = auth.uid()
    )
    OR
    academy_id IN (
      SELECT academy_id FROM memberships
      WHERE profile_id = auth.uid()
    )
  );

-- Federation memberships: only federation admins can insert/delete
CREATE POLICY "federation_memberships_insert" ON federation_memberships
  FOR INSERT WITH CHECK (
    federation_id IN (
      SELECT federation_id FROM federation_admins
      WHERE profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "federation_memberships_delete" ON federation_memberships
  FOR DELETE USING (
    federation_id IN (
      SELECT federation_id FROM federation_admins
      WHERE profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Federation admins: visible to other admins
CREATE POLICY "federation_admins_select" ON federation_admins
  FOR SELECT USING (
    federation_id IN (
      SELECT federation_id FROM federation_admins fa2
      WHERE fa2.profile_id = auth.uid()
    )
  );

-- Only owners can manage admins
CREATE POLICY "federation_admins_insert" ON federation_admins
  FOR INSERT WITH CHECK (
    federation_id IN (
      SELECT federation_id FROM federation_admins
      WHERE profile_id = auth.uid() AND role = 'owner'
    )
  );

-- Trigger: update updated_at on federations
CREATE OR REPLACE FUNCTION update_federations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_federations_updated_at
  BEFORE UPDATE ON federations
  FOR EACH ROW EXECUTE FUNCTION update_federations_updated_at();

-- ════════════════════════════════════════════════════════════
-- PART 2: Onboarding Progress
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS onboarding_progress (
  academy_id UUID PRIMARY KEY REFERENCES academies(id),
  steps_completed TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Academy members can see their onboarding progress
CREATE POLICY "onboarding_progress_select" ON onboarding_progress
  FOR SELECT USING (
    academy_id IN (
      SELECT academy_id FROM memberships
      WHERE profile_id = auth.uid()
    )
  );

-- Academy admins can update onboarding progress
CREATE POLICY "onboarding_progress_update" ON onboarding_progress
  FOR UPDATE USING (
    academy_id IN (
      SELECT academy_id FROM memberships
      WHERE profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "onboarding_progress_insert" ON onboarding_progress
  FOR INSERT WITH CHECK (
    academy_id IN (
      SELECT academy_id FROM memberships
      WHERE profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
