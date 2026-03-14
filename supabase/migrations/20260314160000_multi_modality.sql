-- 20260314160000_multi_modality.sql
-- Multi-modality support: academy modalities, membership modalities, class linkage
-- Preserves existing martial_art ENUM and memberships.belt_rank as legacy/global

-- ══════════════════════════════════════════════════════════
-- 1. Academy Modalities — what each academy offers
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS academy_modalities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  slug            text NOT NULL,
  description     text,
  icon            text,
  belt_system_id  uuid REFERENCES belt_systems(id),
  enrollment_mode text NOT NULL DEFAULT 'direct' CHECK (enrollment_mode IN ('direct', 'approval_required')),
  is_active       boolean NOT NULL DEFAULT true,
  display_order   smallint NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (academy_id, slug)
);

CREATE TRIGGER academy_modalities_updated_at
  BEFORE UPDATE ON academy_modalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════════════════════════════════════════════
-- 2. Membership Modalities — member enrollment per modality
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS membership_modalities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  modality_id     uuid NOT NULL REFERENCES academy_modalities(id) ON DELETE CASCADE,
  belt_rank       text DEFAULT 'branca',
  stripes         smallint NOT NULL DEFAULT 0 CHECK (stripes BETWEEN 0 AND 6),
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'graduated', 'transferred')),
  started_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (membership_id, modality_id)
);

CREATE TRIGGER membership_modalities_updated_at
  BEFORE UPDATE ON membership_modalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ══════════════════════════════════════════════════════════
-- 3. Modality Events — belt promotions, enrollment, etc.
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS modality_events (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_modality_id  uuid NOT NULL REFERENCES membership_modalities(id) ON DELETE CASCADE,
  academy_id              uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  event_type              text NOT NULL CHECK (event_type IN ('enrollment', 'belt_promotion', 'transfer', 'graduation', 'inactivation', 'reactivation')),
  payload                 jsonb NOT NULL DEFAULT '{}',
  performed_by            uuid REFERENCES memberships(id),
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════════════════
-- 4. Link class_schedules to modality (optional, additive)
-- ══════════════════════════════════════════════════════════

ALTER TABLE class_schedules
  ADD COLUMN IF NOT EXISTS modality_id uuid REFERENCES academy_modalities(id);

-- ══════════════════════════════════════════════════════════
-- 5. Indexes
-- ══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_academy_modalities_academy ON academy_modalities(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_modalities_active ON academy_modalities(academy_id, is_active);
CREATE INDEX IF NOT EXISTS idx_membership_modalities_membership ON membership_modalities(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_modalities_modality ON membership_modalities(modality_id);
CREATE INDEX IF NOT EXISTS idx_membership_modalities_status ON membership_modalities(modality_id, status);
CREATE INDEX IF NOT EXISTS idx_modality_events_membership_modality ON modality_events(membership_modality_id);
CREATE INDEX IF NOT EXISTS idx_modality_events_academy ON modality_events(academy_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_modality ON class_schedules(modality_id);

-- ══════════════════════════════════════════════════════════
-- 6. Cross-tenant protection function
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_membership_modality_tenant()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM memberships m
    JOIN academy_modalities am ON am.academy_id = m.academy_id
    WHERE m.id = NEW.membership_id
      AND am.id = NEW.modality_id
  ) THEN
    RAISE EXCEPTION 'Cross-tenant violation: membership and modality belong to different academies';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_membership_modalities_tenant_check
  BEFORE INSERT OR UPDATE ON membership_modalities
  FOR EACH ROW EXECUTE FUNCTION check_membership_modality_tenant();

-- ══════════════════════════════════════════════════════════
-- 7. RLS Policies
-- ══════════════════════════════════════════════════════════

ALTER TABLE academy_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE modality_events ENABLE ROW LEVEL SECURITY;

-- academy_modalities: viewable by academy members
CREATE POLICY academy_modalities_select ON academy_modalities FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY academy_modalities_insert ON academy_modalities FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY academy_modalities_update ON academy_modalities FOR UPDATE USING (
  academy_id IN (SELECT get_user_academy_ids())
) WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY academy_modalities_delete ON academy_modalities FOR DELETE USING (
  academy_id IN (SELECT get_user_academy_ids())
);

-- membership_modalities: viewable by academy members (via membership → academy)
CREATE POLICY membership_modalities_select ON membership_modalities FOR SELECT USING (
  membership_id IN (
    SELECT id FROM memberships WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

CREATE POLICY membership_modalities_insert ON membership_modalities FOR INSERT WITH CHECK (
  membership_id IN (
    SELECT id FROM memberships WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

CREATE POLICY membership_modalities_update ON membership_modalities FOR UPDATE USING (
  membership_id IN (
    SELECT id FROM memberships WHERE academy_id IN (SELECT get_user_academy_ids())
  )
) WITH CHECK (
  membership_id IN (
    SELECT id FROM memberships WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

CREATE POLICY membership_modalities_delete ON membership_modalities FOR DELETE USING (
  membership_id IN (
    SELECT id FROM memberships WHERE academy_id IN (SELECT get_user_academy_ids())
  )
);

-- modality_events: append-only audit log — no UPDATE/DELETE policies by design
CREATE POLICY modality_events_select ON modality_events FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY modality_events_insert ON modality_events FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);
