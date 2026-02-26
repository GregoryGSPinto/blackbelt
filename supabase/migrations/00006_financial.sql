-- 00006_financial.sql
-- Plans, subscriptions, invoices, payments

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  price_cents     int NOT NULL CHECK (price_cents >= 0),
  interval_months smallint NOT NULL DEFAULT 1,
  features        jsonb,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id         uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  plan_id               uuid NOT NULL REFERENCES plans(id),
  academy_id            uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'suspended', 'past_due')),
  current_period_start  timestamptz NOT NULL,
  current_period_end    timestamptz NOT NULL,
  canceled_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  amount_cents    int NOT NULL CHECK (amount_cents >= 0),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'canceled')),
  due_date        date NOT NULL,
  paid_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  amount_cents    int NOT NULL CHECK (amount_cents >= 0),
  method          text NOT NULL,
  external_id     text,
  paid_at         timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_plans_academy ON plans(academy_id);
CREATE INDEX idx_subscriptions_membership ON subscriptions(membership_id);
CREATE INDEX idx_subscriptions_academy ON subscriptions(academy_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(academy_id, status);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_academy_status ON invoices(academy_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_academy ON payments(academy_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Plans: viewable by academy members, managed by admins
CREATE POLICY plans_select ON plans FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY plans_insert ON plans FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);

CREATE POLICY plans_update ON plans FOR UPDATE USING (
  is_academy_admin(academy_id)
);

CREATE POLICY plans_delete ON plans FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- Subscriptions: members see own, admins see all in academy
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (
  membership_id IN (SELECT id FROM memberships WHERE profile_id = auth.uid())
  OR is_academy_admin(academy_id)
);

CREATE POLICY subscriptions_insert ON subscriptions FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);

CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE USING (
  is_academy_admin(academy_id)
);

-- Invoices: members see own, admins see all in academy
CREATE POLICY invoices_select ON invoices FOR SELECT USING (
  subscription_id IN (
    SELECT id FROM subscriptions
    WHERE membership_id IN (SELECT id FROM memberships WHERE profile_id = auth.uid())
  )
  OR is_academy_admin(academy_id)
);

CREATE POLICY invoices_insert ON invoices FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);

CREATE POLICY invoices_update ON invoices FOR UPDATE USING (
  is_academy_admin(academy_id)
);

-- Payments: members see own, admins see all in academy
CREATE POLICY payments_select ON payments FOR SELECT USING (
  invoice_id IN (
    SELECT i.id FROM invoices i
    JOIN subscriptions s ON s.id = i.subscription_id
    WHERE s.membership_id IN (SELECT id FROM memberships WHERE profile_id = auth.uid())
  )
  OR is_academy_admin(academy_id)
);

CREATE POLICY payments_insert ON payments FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);
