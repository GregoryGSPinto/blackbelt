-- 00019_crm.sql
-- Visitors and leads management

-- ── Visitors ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS visitors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  email           text,
  phone           text,
  source          text,
  notes           text,
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'trial', 'converted', 'lost')),
  visited_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Leads ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  visitor_id      uuid REFERENCES visitors(id) ON DELETE SET NULL,
  name            text NOT NULL,
  email           text,
  phone           text,
  source          text,
  interest        text,
  status          text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'trial', 'enrolled', 'lost')),
  assigned_to     uuid REFERENCES profiles(id),
  notes           text,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_visitors_academy ON visitors(academy_id);
CREATE INDEX idx_visitors_status ON visitors(academy_id, status);
CREATE INDEX idx_visitors_email ON visitors(email) WHERE email IS NOT NULL;

CREATE INDEX idx_leads_academy ON leads(academy_id);
CREATE INDEX idx_leads_status ON leads(academy_id, status);
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_assigned ON leads(assigned_to) WHERE assigned_to IS NOT NULL;

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Visitors: admins and professors can see
CREATE POLICY visitors_select ON visitors FOR SELECT USING (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY visitors_insert ON visitors FOR INSERT WITH CHECK (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY visitors_update ON visitors FOR UPDATE USING (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY visitors_delete ON visitors FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- Leads: admins and professors can manage
CREATE POLICY leads_select ON leads FOR SELECT USING (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY leads_insert ON leads FOR INSERT WITH CHECK (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY leads_update ON leads FOR UPDATE USING (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY leads_delete ON leads FOR DELETE USING (
  is_academy_admin(academy_id)
);
