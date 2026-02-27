-- 00011_ai_churn_labels.sql
-- Intelligence layer — Churn prediction labels for future ML training
-- ORDER: tables → indexes → RLS → trigger function → triggers

-- ── 1. Tables ─────────────────────────────────────────────

CREATE TABLE ai_churn_labels (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id          uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  membership_id       uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,

  -- Label: did the student actually churn?
  churned             boolean NOT NULL DEFAULT false,
  churned_at          timestamptz,
  churn_reason        text,

  -- Snapshot of prediction at label time (for model evaluation)
  prediction_snapshot jsonb,
  feature_snapshot    jsonb,
  predicted_score     smallint,

  -- How the label was created
  label_source        text NOT NULL DEFAULT 'auto',  -- 'auto' | 'manual'

  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Indexes ────────────────────────────────────────────

CREATE INDEX idx_ai_churn_labels_academy ON ai_churn_labels(academy_id);
CREATE INDEX idx_ai_churn_labels_membership ON ai_churn_labels(membership_id);
CREATE INDEX idx_ai_churn_labels_churned ON ai_churn_labels(churned) WHERE churned = true;

-- ── 3. RLS ────────────────────────────────────────────────

ALTER TABLE ai_churn_labels ENABLE ROW LEVEL SECURITY;

-- Admin-only: read own academy's labels
CREATE POLICY ai_churn_labels_select ON ai_churn_labels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.profile_id = auth.uid()
        AND m.academy_id = ai_churn_labels.academy_id
        AND m.role IN ('owner', 'admin')
        AND m.status = 'active'
    )
  );

-- Insert: service role only (triggers/API)
CREATE POLICY ai_churn_labels_insert ON ai_churn_labels
  FOR INSERT WITH CHECK (true);

-- No update/delete from client — managed by system
CREATE POLICY ai_churn_labels_no_update ON ai_churn_labels
  FOR UPDATE USING (false);
CREATE POLICY ai_churn_labels_no_delete ON ai_churn_labels
  FOR DELETE USING (false);

-- ── 4. Auto-label trigger ─────────────────────────────────
-- When a membership transitions to inactive/suspended, auto-create a churn label

CREATE OR REPLACE FUNCTION auto_label_churn()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when status changes TO inactive or suspended FROM active
  IF OLD.status = 'active' AND NEW.status IN ('inactive', 'suspended') THEN
    INSERT INTO ai_churn_labels (
      academy_id,
      membership_id,
      churned,
      churned_at,
      churn_reason,
      label_source
    ) VALUES (
      NEW.academy_id,
      NEW.id,
      true,
      now(),
      'status_change_to_' || NEW.status,
      'auto'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. Attach trigger to memberships ──────────────────────

CREATE TRIGGER trg_auto_label_churn
  AFTER UPDATE OF status ON memberships
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION auto_label_churn();
