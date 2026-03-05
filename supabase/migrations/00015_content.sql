-- 00015_content.sql
-- Content library (videos, documents, links)

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  type            text NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'document', 'link', 'image')),
  url             text,
  thumbnail_url   text,
  tags            text[],
  martial_art     text,
  belt_level      text,
  visibility      text NOT NULL DEFAULT 'academy' CHECK (visibility IN ('public', 'academy', 'restricted')),
  duration_secs   int,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_content_academy ON content(academy_id);
CREATE INDEX idx_content_type ON content(academy_id, type);
CREATE INDEX idx_content_martial_art ON content(martial_art) WHERE martial_art IS NOT NULL;
CREATE INDEX idx_content_belt_level ON content(belt_level) WHERE belt_level IS NOT NULL;
CREATE INDEX idx_content_created ON content(created_at DESC);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Public content visible to all; academy content visible to members
CREATE POLICY content_select ON content FOR SELECT USING (
  visibility = 'public'
  OR academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY content_insert ON content FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
  OR academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY content_update ON content FOR UPDATE USING (
  is_academy_admin(academy_id)
  OR created_by = auth.uid()
);

CREATE POLICY content_delete ON content FOR DELETE USING (
  is_academy_admin(academy_id)
);
