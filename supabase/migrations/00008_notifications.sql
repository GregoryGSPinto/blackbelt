-- 00008_notifications.sql
-- Notifications with realtime support

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id  uuid REFERENCES academies(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text NOT NULL,
  type        text NOT NULL DEFAULT 'general',
  read        boolean NOT NULL DEFAULT false,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_notifications_profile ON notifications(profile_id, read);
CREATE INDEX idx_notifications_academy ON notifications(academy_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_select ON notifications FOR SELECT USING (
  profile_id = auth.uid()
);

CREATE POLICY notifications_update ON notifications FOR UPDATE USING (
  profile_id = auth.uid()
);

-- Insert via server functions (service role)
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY notifications_delete ON notifications FOR DELETE USING (
  profile_id = auth.uid()
);

-- ── Enable Realtime ─────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ── Helper Functions ────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_member(
  _profile_id uuid,
  _title text,
  _body text,
  _type text DEFAULT 'general',
  _academy_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO notifications (profile_id, academy_id, title, body, type)
  VALUES (_profile_id, _academy_id, _title, _body, _type)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_class_members(
  _schedule_id uuid,
  _title text,
  _body text,
  _type text DEFAULT 'class'
)
RETURNS int AS $$
DECLARE
  _count int := 0;
  _academy uuid;
  _profile uuid;
BEGIN
  SELECT cs.academy_id INTO _academy
  FROM class_schedules cs WHERE cs.id = _schedule_id;

  FOR _profile IN
    SELECT m.profile_id
    FROM class_enrollments ce
    JOIN memberships m ON m.id = ce.membership_id
    WHERE ce.schedule_id = _schedule_id AND ce.status = 'active'
  LOOP
    INSERT INTO notifications (profile_id, academy_id, title, body, type)
    VALUES (_profile, _academy, _title, _body, _type);
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_academy(
  _academy_id uuid,
  _title text,
  _body text,
  _type text DEFAULT 'academy'
)
RETURNS int AS $$
DECLARE
  _count int := 0;
  _profile uuid;
BEGIN
  FOR _profile IN
    SELECT m.profile_id
    FROM memberships m
    WHERE m.academy_id = _academy_id AND m.status = 'active'
  LOOP
    INSERT INTO notifications (profile_id, academy_id, title, body, type)
    VALUES (_profile, _academy_id, _title, _body, _type);
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
