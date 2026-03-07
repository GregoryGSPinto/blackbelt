-- ============================================================
-- Migration: Subscription Pricing System
-- Description: Planos por níveis (Start/Medium/Pro/Business/Enterprise/Custom)
-- ============================================================

-- 1. Tabela de Planos Base
CREATE TABLE IF NOT EXISTS subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) NOT NULL UNIQUE, -- Start, Medium, Pro, Business, Enterprise, Custom
    display_name varchar(100) NOT NULL,
    student_limit integer, -- null para Custom (ilimitado)
    base_price_monthly decimal(10,2) NOT NULL,
    base_price_annual decimal(10,2) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    
    -- Features (todas true para todos os planos neste modelo)
    features jsonb NOT NULL DEFAULT '{
        "student_management": true,
        "mobile_app": true,
        "checkin_unlimited": true,
        "gamification": true,
        "parent_portal": true,
        "chat": true,
        "schedule": true,
        "intelligence_basic": true,
        "api": true,
        "standard_reports": true,
        "support_chat_email": true
    }'::jsonb,
    
    -- Quotas inclusas por padrão
    default_quotas jsonb NOT NULL DEFAULT '{
        "custom_reports": 10,
        "api_requests": 1000,
        "storage_gb": 10,
        "staff_users": 5,
        "history_months": 12
    }'::jsonb,
    
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabela de Assinaturas das Academias
CREATE TABLE IF NOT EXISTS academy_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES subscription_plans(id),
    
    -- Limites e status
    student_limit_current integer NOT NULL, -- pode ser maior que o plano base (Custom)
    billing_cycle varchar(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'paused', 'cancelled', 'past_due')),
    
    -- Datas importantes
    trial_ends_at timestamptz,
    current_period_starts_at timestamptz NOT NULL DEFAULT now(),
    current_period_ends_at timestamptz NOT NULL,
    
    -- Configurações
    auto_upgrade_enabled boolean NOT NULL DEFAULT true,
    auto_downgrade_enabled boolean NOT NULL DEFAULT false, -- downgrade manual por padrão
    
    -- Dados de faturamento
    stripe_subscription_id varchar(255),
    stripe_customer_id varchar(255),
    
    -- Metadados
    metadata jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(academy_id)
);

-- 3. Tabela de Quotas de Uso (rastreamento em tempo real)
CREATE TABLE IF NOT EXISTS usage_quotas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    metric_type varchar(50) NOT NULL CHECK (metric_type IN ('custom_reports', 'api_requests', 'storage_gb', 'staff_users', 'history_months')),
    
    -- Quantidades
    included_amount integer NOT NULL, -- incluso no plano
    used_amount integer NOT NULL DEFAULT 0, -- usado no ciclo atual
    overage_amount integer NOT NULL DEFAULT 0, -- excedente
    
    -- Preços e cobranças
    overage_rate decimal(10,4) NOT NULL, -- preço por unidade excedente
    overage_charges decimal(10,2) NOT NULL DEFAULT 0, -- valor calculado de overage
    
    -- Ciclo
    reset_date date NOT NULL, -- quando reseta (fim do período)
    
    -- Alertas
    alert_80_sent_at timestamptz,
    alert_95_sent_at timestamptz,
    alert_100_sent_at timestamptz,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(academy_id, metric_type, reset_date)
);

-- 4. Tabela de Add-ons
CREATE TABLE IF NOT EXISTS usage_addons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    addon_type varchar(50) NOT NULL CHECK (addon_type IN (
        'deep_analytics',      -- relatórios ilimitados: R$ 49/mês
        'api_10k',            -- 10k requisições API: R$ 79/mês
        'storage_100gb',      -- 100 GB storage: R$ 99/mês
        'unlimited_staff',    -- usuários ilimitados: R$ 99/mês
        'history_24m',        -- histórico 24 meses: R$ 29/mês
        'history_36m',        -- histórico 36 meses: R$ 49/mês
        'white_label',        -- white label: R$ 79/mês
        'custom_domain',      -- domínio próprio: R$ 20/mês
        'dedicated_support',  -- suporte dedicado: R$ 99/mês
        'account_manager',    -- account manager: R$ 299/mês
        'onboarding'          -- onboarding presencial: R$ 497 (único)
    )),
    
    display_name varchar(100) NOT NULL,
    price decimal(10,2) NOT NULL, -- preço mensal (ou único)
    billing_cycle varchar(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual', 'one_time')),
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    active_since timestamptz NOT NULL DEFAULT now(),
    active_until timestamptz, -- null = até cancelar
    
    -- Metadados específicos do add-on
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Controle
    stripe_price_id varchar(255),
    stripe_subscription_item_id varchar(255),
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Tabela de Transações da Loja Virtual (Revenue Share)
CREATE TABLE IF NOT EXISTS store_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    -- Dados da venda
    order_id varchar(255) NOT NULL,
    transaction_amount decimal(10,2) NOT NULL, -- valor total da venda
    
    -- Revenue share
    platform_fee_percent decimal(5,2) NOT NULL DEFAULT 3.00, -- 3% padrão
    platform_fee_amount decimal(10,2) NOT NULL, -- valor retido
    net_amount decimal(10,2) NOT NULL, -- valor líquido para academia
    
    -- Status
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid_out', 'refunded', 'cancelled')),
    
    -- Datas
    transaction_date date NOT NULL,
    processed_at timestamptz,
    paid_out_at timestamptz,
    
    -- Metadados
    metadata jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(academy_id, order_id)
);

-- 6. Tabela de Créditos Pré-pagos (Overage)
CREATE TABLE IF NOT EXISTS prepaid_credits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    credit_type varchar(50) NOT NULL CHECK (credit_type IN ('api_requests', 'storage_gb', 'custom_reports', 'staff_users')),
    amount integer NOT NULL, -- quantidade comprada
    amount_used integer NOT NULL DEFAULT 0,
    amount_remaining integer NOT NULL, -- calculado: amount - amount_used
    
    -- Preço (com desconto de 20% sobre overage rate)
    price_paid decimal(10,2) NOT NULL,
    effective_rate decimal(10,4) NOT NULL, -- rate efetivo com desconto
    
    -- Validade
    valid_until timestamptz, -- null = não expira
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    
    -- Metadados
    stripe_payment_intent_id varchar(255),
    metadata jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Tabela de Histórico de Upgrades/Downgrades
CREATE TABLE IF NOT EXISTS subscription_changes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    -- Mudança
    previous_plan_id uuid REFERENCES subscription_plans(id),
    new_plan_id uuid REFERENCES subscription_plans(id),
    change_type varchar(20) NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancellation', 'reactivation')),
    
    -- Motivo
    reason varchar(50) CHECK (reason IN ('manual', 'auto_limit', 'billing_issue', 'business_rule')),
    
    -- Valores
    previous_price decimal(10,2),
    new_price decimal(10,2),
    prorated_amount decimal(10,2), -- ajuste pró-rata
    
    -- Datas
    effective_at timestamptz NOT NULL,
    applied_at timestamptz, -- quando foi efetivamente aplicado
    
    -- Metadados
    metadata jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Tabela de Invoices de Overages
CREATE TABLE IF NOT EXISTS overage_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    -- Período
    period_start date NOT NULL,
    period_end date NOT NULL,
    
    -- Detalhamento
    subscription_amount decimal(10,2) NOT NULL, -- valor base da assinatura
    overages_breakdown jsonb NOT NULL, -- detalhamento por métrica
    total_overage decimal(10,2) NOT NULL DEFAULT 0,
    addons_amount decimal(10,2) NOT NULL DEFAULT 0,
    discounts_amount decimal(10,2) NOT NULL DEFAULT 0,
    
    -- Totais
    subtotal decimal(10,2) NOT NULL,
    tax_amount decimal(10,2) NOT NULL DEFAULT 0,
    total_amount decimal(10,2) NOT NULL,
    
    -- Status
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    
    -- Stripe
    stripe_invoice_id varchar(255),
    stripe_payment_intent_id varchar(255),
    
    -- Datas
    paid_at timestamptz,
    failed_at timestamptz,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX idx_academy_subscriptions_academy ON academy_subscriptions(academy_id);
CREATE INDEX idx_academy_subscriptions_plan ON academy_subscriptions(plan_id);
CREATE INDEX idx_academy_subscriptions_status ON academy_subscriptions(status);
CREATE INDEX idx_academy_subscriptions_period_end ON academy_subscriptions(current_period_ends_at);

CREATE INDEX idx_usage_quotas_academy ON usage_quotas(academy_id);
CREATE INDEX idx_usage_quotas_metric ON usage_quotas(metric_type);
CREATE INDEX idx_usage_quotas_reset ON usage_quotas(reset_date);
CREATE INDEX idx_usage_quotas_academy_metric_date ON usage_quotas(academy_id, metric_type, reset_date);

CREATE INDEX idx_usage_addons_academy ON usage_addons(academy_id);
CREATE INDEX idx_usage_addons_type ON usage_addons(addon_type);
CREATE INDEX idx_usage_addons_active ON usage_addons(academy_id, is_active);

CREATE INDEX idx_store_transactions_academy ON store_transactions(academy_id);
CREATE INDEX idx_store_transactions_date ON store_transactions(transaction_date);
CREATE INDEX idx_store_transactions_status ON store_transactions(status);

CREATE INDEX idx_prepaid_credits_academy ON prepaid_credits(academy_id);
CREATE INDEX idx_prepaid_credits_type_active ON prepaid_credits(academy_id, credit_type, is_active);

CREATE INDEX idx_subscription_changes_academy ON subscription_changes(academy_id);
CREATE INDEX idx_subscription_changes_effective ON subscription_changes(effective_at);

CREATE INDEX idx_overage_invoices_academy ON overage_invoices(academy_id);
CREATE INDEX idx_overage_invoices_period ON overage_invoices(period_start, period_end);
CREATE INDEX idx_overage_invoices_status ON overage_invoices(status);

-- ============================================================
-- Triggers para updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_subscriptions_updated_at BEFORE UPDATE ON academy_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_quotas_updated_at BEFORE UPDATE ON usage_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_addons_updated_at BEFORE UPDATE ON usage_addons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_transactions_updated_at BEFORE UPDATE ON store_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prepaid_credits_updated_at BEFORE UPDATE ON prepaid_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_overage_invoices_updated_at BEFORE UPDATE ON overage_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Dados Iniciais: Planos Base
-- ============================================================
INSERT INTO subscription_plans (name, display_name, student_limit, base_price_monthly, base_price_annual, sort_order)
VALUES 
    ('Start', 'Start', 50, 89.00, 890.00, 1),
    ('Medium', 'Medium', 100, 139.00, 1390.00, 2),
    ('Pro', 'Pro', 150, 179.00, 1790.00, 3),
    ('Business', 'Business', 300, 279.00, 2790.00, 4),
    ('Enterprise', 'Enterprise', 500, 369.00, 3690.00, 5),
    ('Custom', 'Custom', NULL, 0.00, 0.00, 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepaid_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE overage_invoices ENABLE ROW LEVEL SECURITY;

-- Planos: leitura pública
CREATE POLICY subscription_plans_select ON subscription_plans
    FOR SELECT USING (true);

-- Assinaturas: academia só vê a própria
CREATE POLICY academy_subscriptions_select ON academy_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = academy_subscriptions.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

CREATE POLICY academy_subscriptions_admin ON academy_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = academy_subscriptions.academy_id 
            AND ua.usuario_id = auth.uid()
            AND ua.perfil IN ('ADMINISTRADOR', 'OWNER', 'SUPER_ADMIN')
        )
    );

-- Quotas: academia só vê a própria
CREATE POLICY usage_quotas_select ON usage_quotas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = usage_quotas.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Add-ons: academia só vê a própria
CREATE POLICY usage_addons_select ON usage_addons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = usage_addons.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Store transactions: academia só vê a própria
CREATE POLICY store_transactions_select ON store_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = store_transactions.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Créditos pré-pagos: academia só vê a própria
CREATE POLICY prepaid_credits_select ON prepaid_credits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = prepaid_credits.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Subscription changes: academia só vê a própria
CREATE POLICY subscription_changes_select ON subscription_changes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = subscription_changes.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Overage invoices: academia só vê a própria
CREATE POLICY overage_invoices_select ON overage_invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = overage_invoices.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );
