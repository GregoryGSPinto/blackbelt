-- 00012_ai_intelligence_layer.sql
-- Intelligence layer — Tables for AI engines (DNA, Engagement, Social, Adaptive, etc.)
-- ORDER: tables → indexes → RLS → policies

-- ══════════════════════════════════════════════════════════════════
-- 1. TABLES
-- ══════════════════════════════════════════════════════════════════

-- ── ai_student_dna_cache ────────────────────────────────────────
-- Caches the computed StudentDNA for each member (refreshed daily or on event).

CREATE TABLE ai_student_dna_cache (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  dna             jsonb NOT NULL,
  data_points     integer NOT NULL,
  confidence      numeric(5,4) NOT NULL,
  computed_at     timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  UNIQUE (academy_id, membership_id)
);

-- ── ai_engagement_snapshots ─────────────────────────────────────
-- Daily snapshot of each member's engagement score and sub-dimensions.

CREATE TABLE ai_engagement_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  overall_score   numeric(5,2) NOT NULL,
  physical        numeric(5,2),
  pedagogical     numeric(5,2),
  social_score    numeric(5,2),
  financial       numeric(5,2),
  digital         numeric(5,2),
  tier            text NOT NULL,
  snapshot_date   date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (academy_id, membership_id, snapshot_date)
);

-- ── ai_social_connections ───────────────────────────────────────
-- Stores pairwise social bond strength between members of an academy.

CREATE TABLE ai_social_connections (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id              uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  member_a                uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  member_b                uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  strength                numeric(5,2) NOT NULL DEFAULT 0,
  shared_sessions         integer NOT NULL DEFAULT 0,
  shared_classes          integer NOT NULL DEFAULT 0,
  last_trained_together   timestamptz,
  updated_at              timestamptz DEFAULT now(),
  UNIQUE (academy_id, member_a, member_b),
  CHECK (member_a < member_b)
);

-- ── ai_question_bank ────────────────────────────────────────────
-- Question bank for adaptive tests, per academy.

CREATE TABLE ai_question_bank (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  segment         text NOT NULL,
  belt_level      text NOT NULL,
  competency      text NOT NULL,
  difficulty      numeric(5,2) NOT NULL,
  discrimination  numeric(5,2) NOT NULL,
  question_data   jsonb NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── ai_adaptive_tests ───────────────────────────────────────────
-- Adaptive tests generated for members.

CREATE TABLE ai_adaptive_tests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  config          jsonb NOT NULL,
  test_data       jsonb NOT NULL,
  status          text NOT NULL DEFAULT 'generated',
  created_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
);

-- ── ai_test_responses ───────────────────────────────────────────
-- Individual responses for questions within an adaptive test.

CREATE TABLE ai_test_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  test_id         uuid NOT NULL REFERENCES ai_adaptive_tests(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES ai_question_bank(id) ON DELETE CASCADE,
  response        jsonb NOT NULL,
  correct         boolean NOT NULL,
  response_time_ms integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── ai_instructor_briefings ─────────────────────────────────────
-- Daily AI-generated briefings for instructors.

CREATE TABLE ai_instructor_briefings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  instructor_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  briefing        jsonb NOT NULL,
  date            date NOT NULL DEFAULT CURRENT_DATE,
  confidence      numeric(5,4) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academy_id, instructor_id, date)
);

-- ══════════════════════════════════════════════════════════════════
-- 2. INDEXES
-- ══════════════════════════════════════════════════════════════════

-- ai_student_dna_cache
CREATE INDEX idx_ai_student_dna_cache_academy ON ai_student_dna_cache(academy_id);
CREATE INDEX idx_ai_student_dna_cache_membership ON ai_student_dna_cache(membership_id);
CREATE INDEX idx_ai_student_dna_cache_expires ON ai_student_dna_cache(expires_at);

-- ai_engagement_snapshots
CREATE INDEX idx_ai_engagement_snapshots_academy ON ai_engagement_snapshots(academy_id);
CREATE INDEX idx_ai_engagement_snapshots_membership ON ai_engagement_snapshots(membership_id);
CREATE INDEX idx_ai_engagement_snapshots_date ON ai_engagement_snapshots(snapshot_date DESC);
CREATE INDEX idx_ai_engagement_snapshots_tier ON ai_engagement_snapshots(tier) WHERE tier IN ('drifting', 'disconnected');

-- ai_social_connections
CREATE INDEX idx_ai_social_connections_academy ON ai_social_connections(academy_id);
CREATE INDEX idx_ai_social_connections_member_a ON ai_social_connections(member_a);
CREATE INDEX idx_ai_social_connections_member_b ON ai_social_connections(member_b);
CREATE INDEX idx_ai_social_connections_strength ON ai_social_connections(strength DESC) WHERE strength > 30;

-- ai_question_bank
CREATE INDEX idx_ai_question_bank_academy ON ai_question_bank(academy_id);
CREATE INDEX idx_ai_question_bank_segment_belt ON ai_question_bank(academy_id, segment, belt_level);
CREATE INDEX idx_ai_question_bank_competency ON ai_question_bank(competency);
CREATE INDEX idx_ai_question_bank_active ON ai_question_bank(active) WHERE active = true;

-- ai_adaptive_tests
CREATE INDEX idx_ai_adaptive_tests_academy ON ai_adaptive_tests(academy_id);
CREATE INDEX idx_ai_adaptive_tests_membership ON ai_adaptive_tests(membership_id);
CREATE INDEX idx_ai_adaptive_tests_status ON ai_adaptive_tests(status) WHERE status != 'completed';

-- ai_test_responses
CREATE INDEX idx_ai_test_responses_academy ON ai_test_responses(academy_id);
CREATE INDEX idx_ai_test_responses_test ON ai_test_responses(test_id);
CREATE INDEX idx_ai_test_responses_question ON ai_test_responses(question_id);
CREATE INDEX idx_ai_test_responses_membership ON ai_test_responses(membership_id);

-- ai_instructor_briefings
CREATE INDEX idx_ai_instructor_briefings_academy ON ai_instructor_briefings(academy_id);
CREATE INDEX idx_ai_instructor_briefings_instructor ON ai_instructor_briefings(instructor_id);
CREATE INDEX idx_ai_instructor_briefings_date ON ai_instructor_briefings(date DESC);

-- ══════════════════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE ai_student_dna_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_engagement_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_adaptive_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_instructor_briefings ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════
-- 4. RLS POLICIES — READ (academy members can read own academy data)
-- ══════════════════════════════════════════════════════════════════

-- ai_student_dna_cache — read
CREATE POLICY ai_student_dna_cache_select ON ai_student_dna_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_student_dna_cache.academy_id
        AND m.status = 'active'
    )
  );

-- ai_engagement_snapshots — read
CREATE POLICY ai_engagement_snapshots_select ON ai_engagement_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_engagement_snapshots.academy_id
        AND m.status = 'active'
    )
  );

-- ai_social_connections — read
CREATE POLICY ai_social_connections_select ON ai_social_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_social_connections.academy_id
        AND m.status = 'active'
    )
  );

-- ai_question_bank — read
CREATE POLICY ai_question_bank_select ON ai_question_bank
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_question_bank.academy_id
        AND m.status = 'active'
    )
  );

-- ai_adaptive_tests — read
CREATE POLICY ai_adaptive_tests_select ON ai_adaptive_tests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_adaptive_tests.academy_id
        AND m.status = 'active'
    )
  );

-- ai_test_responses — read
CREATE POLICY ai_test_responses_select ON ai_test_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_test_responses.academy_id
        AND m.status = 'active'
    )
  );

-- ai_instructor_briefings — read
CREATE POLICY ai_instructor_briefings_select ON ai_instructor_briefings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_instructor_briefings.academy_id
        AND m.status = 'active'
    )
  );

-- ══════════════════════════════════════════════════════════════════
-- 5. RLS POLICIES — WRITE (admin/owner only)
-- ══════════════════════════════════════════════════════════════════

-- ai_student_dna_cache — insert
CREATE POLICY ai_student_dna_cache_insert ON ai_student_dna_cache
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_student_dna_cache.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_student_dna_cache — update
CREATE POLICY ai_student_dna_cache_update ON ai_student_dna_cache
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_student_dna_cache.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_student_dna_cache — delete
CREATE POLICY ai_student_dna_cache_delete ON ai_student_dna_cache
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_student_dna_cache.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_engagement_snapshots — insert
CREATE POLICY ai_engagement_snapshots_insert ON ai_engagement_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_engagement_snapshots.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_engagement_snapshots — update
CREATE POLICY ai_engagement_snapshots_update ON ai_engagement_snapshots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_engagement_snapshots.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_engagement_snapshots — delete
CREATE POLICY ai_engagement_snapshots_delete ON ai_engagement_snapshots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_engagement_snapshots.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_social_connections — insert
CREATE POLICY ai_social_connections_insert ON ai_social_connections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_social_connections.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_social_connections — update
CREATE POLICY ai_social_connections_update ON ai_social_connections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_social_connections.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_social_connections — delete
CREATE POLICY ai_social_connections_delete ON ai_social_connections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_social_connections.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_question_bank — insert
CREATE POLICY ai_question_bank_insert ON ai_question_bank
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_question_bank.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_question_bank — update
CREATE POLICY ai_question_bank_update ON ai_question_bank
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_question_bank.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_question_bank — delete
CREATE POLICY ai_question_bank_delete ON ai_question_bank
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_question_bank.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_adaptive_tests — insert
CREATE POLICY ai_adaptive_tests_insert ON ai_adaptive_tests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_adaptive_tests.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_adaptive_tests — update
CREATE POLICY ai_adaptive_tests_update ON ai_adaptive_tests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_adaptive_tests.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_adaptive_tests — delete
CREATE POLICY ai_adaptive_tests_delete ON ai_adaptive_tests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_adaptive_tests.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_test_responses — insert
CREATE POLICY ai_test_responses_insert ON ai_test_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_test_responses.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_test_responses — update
CREATE POLICY ai_test_responses_update ON ai_test_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_test_responses.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_test_responses — delete
CREATE POLICY ai_test_responses_delete ON ai_test_responses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_test_responses.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_instructor_briefings — insert
CREATE POLICY ai_instructor_briefings_insert ON ai_instructor_briefings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_instructor_briefings.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_instructor_briefings — update
CREATE POLICY ai_instructor_briefings_update ON ai_instructor_briefings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_instructor_briefings.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- ai_instructor_briefings — delete
CREATE POLICY ai_instructor_briefings_delete ON ai_instructor_briefings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_instructor_briefings.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );
