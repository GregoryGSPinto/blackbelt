-- 00003_progression.sql
-- Belt systems, promotions, skill tracks, assessments, milestones

-- ── ENUMs ───────────────────────────────────────────────

CREATE TYPE milestone_type AS ENUM (
  'belt_promotion', 'attendance_streak', 'competition', 'skill_mastery', 'custom'
);

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE belt_systems (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  martial_art martial_art NOT NULL,
  name        text NOT NULL,
  ranks       jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (martial_art, name)
);

CREATE TABLE promotions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  belt_system_id  uuid NOT NULL REFERENCES belt_systems(id),
  from_rank       text,
  to_rank         text NOT NULL,
  promoted_by     uuid NOT NULL REFERENCES memberships(id),
  promoted_at     timestamptz NOT NULL DEFAULT now(),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE skill_tracks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id  uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  martial_art martial_art NOT NULL,
  name        text NOT NULL,
  description text,
  skills      jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER skill_tracks_updated_at
  BEFORE UPDATE ON skill_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE skill_assessments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  skill_track_id  uuid NOT NULL REFERENCES skill_tracks(id) ON DELETE CASCADE,
  skill_key       text NOT NULL,
  score           smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
  assessed_by     uuid NOT NULL REFERENCES memberships(id),
  assessed_at     timestamptz NOT NULL DEFAULT now(),
  notes           text
);

CREATE TABLE milestones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  type            milestone_type NOT NULL,
  title           text NOT NULL,
  description     text,
  achieved_at     timestamptz NOT NULL DEFAULT now(),
  metadata        jsonb
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_promotions_member ON promotions(membership_id);
CREATE INDEX idx_promotions_academy ON promotions(academy_id);
CREATE INDEX idx_skill_tracks_academy ON skill_tracks(academy_id);
CREATE INDEX idx_skill_assessments_member ON skill_assessments(membership_id);
CREATE INDEX idx_skill_assessments_track ON skill_assessments(skill_track_id);
CREATE INDEX idx_milestones_member ON milestones(membership_id);
CREATE INDEX idx_milestones_academy ON milestones(academy_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE belt_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Belt systems: public read
CREATE POLICY belt_systems_select ON belt_systems FOR SELECT USING (true);

-- Promotions: viewable by academy members
CREATE POLICY promotions_select ON promotions FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY promotions_insert ON promotions FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

-- Skill tracks: viewable by academy members
CREATE POLICY skill_tracks_select ON skill_tracks FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY skill_tracks_insert ON skill_tracks FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY skill_tracks_update ON skill_tracks FOR UPDATE USING (
  academy_id IN (SELECT get_user_academy_ids())
);

-- Skill assessments: viewable by academy members (via skill track)
CREATE POLICY skill_assessments_select ON skill_assessments FOR SELECT USING (
  skill_track_id IN (
    SELECT id FROM skill_tracks WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

CREATE POLICY skill_assessments_insert ON skill_assessments FOR INSERT WITH CHECK (
  skill_track_id IN (
    SELECT id FROM skill_tracks WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

-- Milestones: viewable by academy members
CREATE POLICY milestones_select ON milestones FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY milestones_insert ON milestones FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

-- ── Seed: Default Belt Systems ──────────────────────────

INSERT INTO belt_systems (martial_art, name, ranks) VALUES
('bjj', 'IBJJF Adult', '[
  {"key": "white", "label": "Branca", "color": "#FFFFFF", "order": 1},
  {"key": "blue", "label": "Azul", "color": "#0000FF", "order": 2},
  {"key": "purple", "label": "Roxa", "color": "#800080", "order": 3},
  {"key": "brown", "label": "Marrom", "color": "#8B4513", "order": 4},
  {"key": "black", "label": "Preta", "color": "#000000", "order": 5}
]'::jsonb),
('judo', 'Kodokan Standard', '[
  {"key": "white", "label": "Branca", "color": "#FFFFFF", "order": 1},
  {"key": "yellow", "label": "Amarela", "color": "#FFD700", "order": 2},
  {"key": "orange", "label": "Laranja", "color": "#FFA500", "order": 3},
  {"key": "green", "label": "Verde", "color": "#008000", "order": 4},
  {"key": "blue", "label": "Azul", "color": "#0000FF", "order": 5},
  {"key": "brown", "label": "Marrom", "color": "#8B4513", "order": 6},
  {"key": "black", "label": "Preta", "color": "#000000", "order": 7}
]'::jsonb),
('karate', 'Shotokan Standard', '[
  {"key": "white", "label": "Branca", "color": "#FFFFFF", "order": 1},
  {"key": "yellow", "label": "Amarela", "color": "#FFD700", "order": 2},
  {"key": "orange", "label": "Laranja", "color": "#FFA500", "order": 3},
  {"key": "green", "label": "Verde", "color": "#008000", "order": 4},
  {"key": "blue", "label": "Azul", "color": "#0000FF", "order": 5},
  {"key": "purple", "label": "Roxa", "color": "#800080", "order": 6},
  {"key": "brown", "label": "Marrom", "color": "#8B4513", "order": 7},
  {"key": "black", "label": "Preta", "color": "#000000", "order": 8}
]'::jsonb),
('muay_thai', 'Traditional Thai', '[
  {"key": "white", "label": "Branca", "color": "#FFFFFF", "order": 1},
  {"key": "yellow", "label": "Amarela", "color": "#FFD700", "order": 2},
  {"key": "green", "label": "Verde", "color": "#008000", "order": 3},
  {"key": "blue", "label": "Azul", "color": "#0000FF", "order": 4},
  {"key": "red", "label": "Vermelha", "color": "#FF0000", "order": 5},
  {"key": "black", "label": "Preta", "color": "#000000", "order": 6}
]'::jsonb);
