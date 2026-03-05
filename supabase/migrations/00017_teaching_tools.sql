-- 00017_teaching_tools.sql
-- Lesson plans, daily feedback, and broadcasts

-- ── Lesson Plans ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  professor_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id     uuid REFERENCES class_schedules(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text,
  objectives      text[],
  warm_up         jsonb,
  main_content    jsonb,
  cool_down       jsonb,
  notes           text,
  planned_date    date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER lesson_plans_updated_at
  BEFORE UPDATE ON lesson_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Daily Feedback ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  session_id      uuid REFERENCES class_sessions(id) ON DELETE SET NULL,
  mood            smallint CHECK (mood BETWEEN 1 AND 5),
  energy          smallint CHECK (energy BETWEEN 1 AND 5),
  difficulty      smallint CHECK (difficulty BETWEEN 1 AND 5),
  comment         text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Broadcasts ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS broadcasts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id     uuid REFERENCES class_schedules(id) ON DELETE SET NULL,
  title           text NOT NULL,
  body            text NOT NULL,
  channel         text NOT NULL DEFAULT 'push' CHECK (channel IN ('push', 'email', 'sms', 'in_app')),
  target_audience text NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'class', 'belt', 'custom')),
  target_filter   jsonb,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER broadcasts_updated_at
  BEFORE UPDATE ON broadcasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_lesson_plans_academy ON lesson_plans(academy_id);
CREATE INDEX idx_lesson_plans_professor ON lesson_plans(professor_id);
CREATE INDEX idx_lesson_plans_date ON lesson_plans(planned_date);

CREATE INDEX idx_daily_feedback_academy ON daily_feedback(academy_id);
CREATE INDEX idx_daily_feedback_membership ON daily_feedback(membership_id);
CREATE INDEX idx_daily_feedback_session ON daily_feedback(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX idx_broadcasts_academy ON broadcasts(academy_id);
CREATE INDEX idx_broadcasts_sent ON broadcasts(sent_at DESC) WHERE sent_at IS NOT NULL;

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Lesson plans: professors see their own, admins see all
CREATE POLICY lesson_plans_select ON lesson_plans FOR SELECT USING (
  professor_id = auth.uid()
  OR is_academy_admin(academy_id)
);

CREATE POLICY lesson_plans_insert ON lesson_plans FOR INSERT WITH CHECK (
  professor_id = auth.uid()
  AND academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY lesson_plans_update ON lesson_plans FOR UPDATE USING (
  professor_id = auth.uid()
  OR is_academy_admin(academy_id)
);

CREATE POLICY lesson_plans_delete ON lesson_plans FOR DELETE USING (
  professor_id = auth.uid()
  OR is_academy_admin(academy_id)
);

-- Daily feedback: students submit their own, professors/admins see all in academy
CREATE POLICY daily_feedback_select ON daily_feedback FOR SELECT USING (
  membership_id IN (SELECT id FROM memberships WHERE profile_id = auth.uid())
  OR academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY daily_feedback_insert ON daily_feedback FOR INSERT WITH CHECK (
  membership_id IN (SELECT id FROM memberships WHERE profile_id = auth.uid())
);

-- Broadcasts: admins and professors can manage
CREATE POLICY broadcasts_select ON broadcasts FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY broadcasts_insert ON broadcasts FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY broadcasts_update ON broadcasts FOR UPDATE USING (
  sender_id = auth.uid()
  OR is_academy_admin(academy_id)
);
