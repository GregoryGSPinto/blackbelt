-- 00016_evaluations.sql
-- Student evaluations (belt exams, skill assessments)

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS evaluations (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  academy_id              uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  type                    text NOT NULL CHECK (type IN ('belt_exam', 'skill_assessment', 'general')),
  status                  text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
  score                   jsonb,
  notes                   text,
  evaluated_at            timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_evaluations_academy ON evaluations(academy_id);
CREATE INDEX idx_evaluations_student ON evaluations(student_membership_id);
CREATE INDEX idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX idx_evaluations_status ON evaluations(academy_id, status);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Students see their own evaluations; professors and admins see all in academy
CREATE POLICY evaluations_select ON evaluations FOR SELECT USING (
  student_membership_id IN (SELECT id FROM memberships WHERE profile_id = auth.uid())
  OR evaluator_id = auth.uid()
  OR is_academy_admin(academy_id)
);

-- Professors and admins can create evaluations
CREATE POLICY evaluations_insert ON evaluations FOR INSERT WITH CHECK (
  evaluator_id = auth.uid()
  AND academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

-- Evaluator and admins can update
CREATE POLICY evaluations_update ON evaluations FOR UPDATE USING (
  evaluator_id = auth.uid()
  OR is_academy_admin(academy_id)
);
