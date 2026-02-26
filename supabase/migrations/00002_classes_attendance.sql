-- 00002_classes_attendance.sql
-- Classes, sessions, enrollments, and attendance tracking

-- ── ENUMs ───────────────────────────────────────────────

CREATE TYPE martial_art AS ENUM (
  'bjj', 'judo', 'karate', 'muay_thai', 'taekwondo', 'boxing', 'wrestling', 'mma', 'other'
);

CREATE TYPE class_level AS ENUM (
  'beginner', 'intermediate', 'advanced', 'all_levels', 'kids', 'teens'
);

CREATE TYPE session_status AS ENUM (
  'scheduled', 'in_progress', 'completed', 'cancelled'
);

CREATE TYPE enrollment_status AS ENUM (
  'active', 'inactive', 'waitlisted'
);

CREATE TYPE checkin_method AS ENUM (
  'qr', 'manual', 'biometric', 'app', 'parent'
);

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE class_schedules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  martial_art     martial_art NOT NULL,
  level           class_level NOT NULL DEFAULT 'all_levels',
  instructor_id   uuid NOT NULL REFERENCES memberships(id),
  day_of_week     smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time      time NOT NULL,
  end_time        time NOT NULL,
  max_capacity    int NOT NULL DEFAULT 30,
  location        text,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER class_schedules_updated_at
  BEFORE UPDATE ON class_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE class_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id     uuid NOT NULL REFERENCES class_schedules(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  date            date NOT NULL,
  status          session_status NOT NULL DEFAULT 'scheduled',
  instructor_id   uuid NOT NULL REFERENCES memberships(id),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schedule_id, date)
);

CREATE TRIGGER class_sessions_updated_at
  BEFORE UPDATE ON class_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE class_enrollments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id     uuid NOT NULL REFERENCES class_schedules(id) ON DELETE CASCADE,
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  status          enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schedule_id, membership_id)
);

CREATE TABLE attendances (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  checked_in_at   timestamptz NOT NULL DEFAULT now(),
  checked_in_by   uuid REFERENCES memberships(id),
  checkin_method  checkin_method NOT NULL DEFAULT 'manual',
  notes           text,
  UNIQUE (session_id, membership_id)
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_class_schedules_academy ON class_schedules(academy_id);
CREATE INDEX idx_class_schedules_instructor ON class_schedules(instructor_id);
CREATE INDEX idx_class_sessions_academy_date ON class_sessions(academy_id, date);
CREATE INDEX idx_class_sessions_schedule ON class_sessions(schedule_id);
CREATE INDEX idx_class_enrollments_schedule ON class_enrollments(schedule_id);
CREATE INDEX idx_class_enrollments_member ON class_enrollments(membership_id);
CREATE INDEX idx_attendances_session ON attendances(session_id);
CREATE INDEX idx_attendances_member_date ON attendances(membership_id, checked_in_at);
CREATE INDEX idx_attendances_academy ON attendances(academy_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- Class schedules: viewable by academy members
CREATE POLICY class_schedules_select ON class_schedules FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY class_schedules_insert ON class_schedules FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY class_schedules_update ON class_schedules FOR UPDATE USING (
  academy_id IN (SELECT get_user_academy_ids())
);

-- Class sessions: viewable by academy members
CREATE POLICY class_sessions_select ON class_sessions FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY class_sessions_insert ON class_sessions FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY class_sessions_update ON class_sessions FOR UPDATE USING (
  academy_id IN (SELECT get_user_academy_ids())
);

-- Enrollments: viewable by academy members
CREATE POLICY class_enrollments_select ON class_enrollments FOR SELECT USING (
  schedule_id IN (
    SELECT id FROM class_schedules WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

CREATE POLICY class_enrollments_insert ON class_enrollments FOR INSERT WITH CHECK (
  schedule_id IN (
    SELECT id FROM class_schedules WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

-- Attendances: viewable by academy members
CREATE POLICY attendances_select ON attendances FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY attendances_insert ON attendances FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);
