-- 00007_gamification.sql
-- Points, streaks, achievements, leaderboard

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE points_ledger (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  points          int NOT NULL,
  reason          text NOT NULL,
  reference_type  text,
  reference_id    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE streaks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id       uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  academy_id          uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  current_streak      int NOT NULL DEFAULT 0,
  longest_streak      int NOT NULL DEFAULT 0,
  last_activity_date  date NOT NULL,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (membership_id, academy_id)
);

CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE achievements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text NOT NULL,
  icon        text,
  category    text NOT NULL,
  threshold   int NOT NULL DEFAULT 1,
  points      int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE member_achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  achievement_id  uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (membership_id, achievement_id)
);

-- ── Leaderboard View ────────────────────────────────────

CREATE VIEW leaderboard_view AS
SELECT
  m.id AS membership_id,
  m.academy_id,
  COALESCE(p.total_points, 0) AS total_points,
  COALESCE(s.current_streak, 0) AS current_streak,
  COALESCE(a.achievement_count, 0) AS achievement_count
FROM memberships m
LEFT JOIN (
  SELECT membership_id, SUM(points) AS total_points
  FROM points_ledger
  GROUP BY membership_id
) p ON p.membership_id = m.id
LEFT JOIN streaks s ON s.membership_id = m.id
LEFT JOIN (
  SELECT membership_id, COUNT(*) AS achievement_count
  FROM member_achievements
  GROUP BY membership_id
) a ON a.membership_id = m.id
WHERE m.role = 'student' AND m.status = 'active';

-- ── Trigger: award points on attendance ──────────────────

CREATE OR REPLACE FUNCTION on_attendance_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 10 points for attendance
  INSERT INTO points_ledger (membership_id, academy_id, points, reason, reference_type, reference_id)
  VALUES (NEW.membership_id, NEW.academy_id, 10, 'Presença em aula', 'attendance', NEW.id::text);

  -- Update streak
  INSERT INTO streaks (membership_id, academy_id, current_streak, longest_streak, last_activity_date)
  VALUES (NEW.membership_id, NEW.academy_id, 1, 1, CURRENT_DATE)
  ON CONFLICT (membership_id, academy_id) DO UPDATE SET
    current_streak = CASE
      WHEN streaks.last_activity_date = CURRENT_DATE - interval '1 day'
        THEN streaks.current_streak + 1
      WHEN streaks.last_activity_date = CURRENT_DATE
        THEN streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      streaks.longest_streak,
      CASE
        WHEN streaks.last_activity_date = CURRENT_DATE - interval '1 day'
          THEN streaks.current_streak + 1
        WHEN streaks.last_activity_date = CURRENT_DATE
          THEN streaks.current_streak
        ELSE 1
      END
    ),
    last_activity_date = CURRENT_DATE,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER attendance_gamification
  AFTER INSERT ON attendances
  FOR EACH ROW EXECUTE FUNCTION on_attendance_insert();

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_points_ledger_member ON points_ledger(membership_id);
CREATE INDEX idx_points_ledger_academy ON points_ledger(academy_id);
CREATE INDEX idx_streaks_member ON streaks(membership_id);
CREATE INDEX idx_streaks_academy ON streaks(academy_id);
CREATE INDEX idx_member_achievements_member ON member_achievements(membership_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;

-- Points: members see own, admins see all
CREATE POLICY points_ledger_select ON points_ledger FOR SELECT USING (
  membership_id IN (SELECT id FROM memberships WHERE profile_id = auth.uid())
  OR academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY points_ledger_insert ON points_ledger FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

-- Streaks: members see own and academy members
CREATE POLICY streaks_select ON streaks FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

-- Achievements: public read
CREATE POLICY achievements_select ON achievements FOR SELECT USING (true);

-- Member achievements: academy members can view
CREATE POLICY member_achievements_select ON member_achievements FOR SELECT USING (
  membership_id IN (
    SELECT id FROM memberships WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

CREATE POLICY member_achievements_insert ON member_achievements FOR INSERT WITH CHECK (
  membership_id IN (
    SELECT id FROM memberships WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

-- ── Seed: Default Achievements ──────────────────────────

INSERT INTO achievements (key, name, description, category, threshold, points) VALUES
('first_class', 'Primeira Aula', 'Participou da primeira aula', 'attendance', 1, 50),
('streak_7', 'Semana Perfeita', '7 dias consecutivos de treino', 'streak', 7, 100),
('streak_30', 'Mês de Ferro', '30 dias consecutivos de treino', 'streak', 30, 500),
('streak_100', 'Centurião', '100 dias consecutivos de treino', 'streak', 100, 2000),
('classes_10', '10 Aulas', 'Participou de 10 aulas', 'attendance', 10, 100),
('classes_50', '50 Aulas', 'Participou de 50 aulas', 'attendance', 50, 300),
('classes_100', 'Centenário', 'Participou de 100 aulas', 'attendance', 100, 500),
('classes_500', 'Veterano', 'Participou de 500 aulas', 'attendance', 500, 2000),
('first_promotion', 'Primeira Graduação', 'Recebeu a primeira promoção de faixa', 'progression', 1, 200),
('skill_master', 'Mestre de Técnica', 'Atingiu nota máxima em uma habilidade', 'progression', 1, 300);
