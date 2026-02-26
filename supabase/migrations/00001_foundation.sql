-- 00001_foundation.sql
-- Core tables: academies, profiles, memberships, parent_child_links

-- ── ENUMs ───────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('student', 'professor', 'admin', 'owner', 'parent');
CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'suspended', 'frozen');
CREATE TYPE relationship_type AS ENUM ('parent', 'guardian', 'tutor');

-- ── Trigger function: auto-update updated_at ────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Helper: get academy IDs for current user ────────────

CREATE OR REPLACE FUNCTION get_user_academy_ids()
RETURNS SETOF uuid AS $$
  SELECT academy_id FROM memberships WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: get roles for current user in an academy ────

CREATE OR REPLACE FUNCTION get_user_roles(_academy_id uuid)
RETURNS SETOF user_role AS $$
  SELECT role FROM memberships
  WHERE profile_id = auth.uid() AND academy_id = _academy_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE academies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  owner_id    uuid NOT NULL REFERENCES auth.users(id),
  settings    jsonb NOT NULL DEFAULT '{}',
  address     jsonb,
  phone       text,
  email       text,
  logo_url    text,
  status      text NOT NULL DEFAULT 'active',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER academies_updated_at
  BEFORE UPDATE ON academies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  display_name  text,
  avatar_url    text,
  phone         text,
  cpf_hash      text,
  birth_date    date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE memberships (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id  uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'student',
  status      membership_status NOT NULL DEFAULT 'active',
  belt_rank   text,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, academy_id, role)
);

CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE parent_child_links (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship  relationship_type NOT NULL DEFAULT 'parent',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, child_id)
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_memberships_academy ON memberships(academy_id);
CREATE INDEX idx_memberships_profile ON memberships(profile_id);
CREATE INDEX idx_memberships_academy_role ON memberships(academy_id, role);
CREATE INDEX idx_parent_child_parent ON parent_child_links(parent_id);
CREATE INDEX idx_parent_child_child ON parent_child_links(child_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_links ENABLE ROW LEVEL SECURITY;

-- Academies: members can view their academies
CREATE POLICY academies_select ON academies FOR SELECT USING (
  id IN (SELECT get_user_academy_ids())
);

CREATE POLICY academies_insert ON academies FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY academies_update ON academies FOR UPDATE USING (
  owner_id = auth.uid()
);

-- Profiles: users can view/edit their own profile
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (
  id = auth.uid()
);

CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (
  id = auth.uid()
);

CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (
  id = auth.uid()
);

-- Memberships: members can view memberships in their academies
CREATE POLICY memberships_select ON memberships FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY memberships_insert ON memberships FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY memberships_update ON memberships FOR UPDATE USING (
  academy_id IN (SELECT get_user_academy_ids())
);

-- Parent-child: parents can view their links
CREATE POLICY parent_child_select ON parent_child_links FOR SELECT USING (
  parent_id = auth.uid() OR child_id = auth.uid()
);

CREATE POLICY parent_child_insert ON parent_child_links FOR INSERT WITH CHECK (
  parent_id = auth.uid()
);
