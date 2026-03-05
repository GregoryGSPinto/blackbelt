-- 00018_video_playlists.sql
-- Playlists, video watch history, and favorites

-- ── Playlists ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS playlists (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  thumbnail_url   text,
  visibility      text NOT NULL DEFAULT 'academy' CHECK (visibility IN ('public', 'academy', 'restricted')),
  sort_order      int NOT NULL DEFAULT 0,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS playlist_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id     uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  content_id      uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  sort_order      int NOT NULL DEFAULT 0,
  added_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, content_id)
);

-- ── Video Watch History ─────────────────────────────────

CREATE TABLE IF NOT EXISTS video_watch_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id      uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  watched_secs    int NOT NULL DEFAULT 0,
  total_secs      int,
  completed       boolean NOT NULL DEFAULT false,
  last_watched_at timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, content_id)
);

CREATE TRIGGER video_watch_history_updated_at
  BEFORE UPDATE ON video_watch_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Video Favorites ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS video_favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id  uuid NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, content_id)
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_playlists_academy ON playlists(academy_id);
CREATE INDEX idx_playlist_items_playlist ON playlist_items(playlist_id, sort_order);
CREATE INDEX idx_playlist_items_content ON playlist_items(content_id);

CREATE INDEX idx_video_watch_history_profile ON video_watch_history(profile_id);
CREATE INDEX idx_video_watch_history_academy ON video_watch_history(academy_id);
CREATE INDEX idx_video_watch_history_content ON video_watch_history(content_id);

CREATE INDEX idx_video_favorites_profile ON video_favorites(profile_id);
CREATE INDEX idx_video_favorites_content ON video_favorites(content_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_favorites ENABLE ROW LEVEL SECURITY;

-- Playlists: similar to content visibility
CREATE POLICY playlists_select ON playlists FOR SELECT USING (
  visibility = 'public'
  OR academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY playlists_insert ON playlists FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
  OR academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY playlists_update ON playlists FOR UPDATE USING (
  is_academy_admin(academy_id) OR created_by = auth.uid()
);

CREATE POLICY playlists_delete ON playlists FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- Playlist items: same as playlist access
CREATE POLICY playlist_items_select ON playlist_items FOR SELECT USING (
  playlist_id IN (SELECT id FROM playlists WHERE visibility = 'public' OR academy_id IN (SELECT get_user_academy_ids()))
);

CREATE POLICY playlist_items_insert ON playlist_items FOR INSERT WITH CHECK (true);

-- Video watch history: user sees own
CREATE POLICY video_watch_history_select ON video_watch_history FOR SELECT USING (
  profile_id = auth.uid()
);

CREATE POLICY video_watch_history_insert ON video_watch_history FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

CREATE POLICY video_watch_history_update ON video_watch_history FOR UPDATE USING (
  profile_id = auth.uid()
);

-- Video favorites: user sees own
CREATE POLICY video_favorites_select ON video_favorites FOR SELECT USING (
  profile_id = auth.uid()
);

CREATE POLICY video_favorites_insert ON video_favorites FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

CREATE POLICY video_favorites_delete ON video_favorites FOR DELETE USING (
  profile_id = auth.uid()
);
