-- ============================================================
-- Migration: BlackBelt Pricing v3.0
-- Description: Modelo otimizado com trial, setup e funcionalidades diferenciadas
-- ============================================================

-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS trial_tracking CASCADE;
DROP TABLE IF EXISTS subscription_addons CASCADE;
DROP TABLE IF EXISTS usage_quotas CASCADE;
DROP TABLE IF EXISTS academy_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- 1. Tabela de Planos Base (v3.0)
CREATE TABLE subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) NOT NULL UNIQUE, -- Start, Medium, Pro, Business, Enterprise, Custom
    display_name varchar(100) NOT NULL,
    student_limit integer, -- null para Custom
    
    -- Preços
    base_price_monthly integer NOT NULL, -- em centavos (R$ 149 = 14900)
    base_price_annual integer NOT NULL, -- em centavos
    setup_price integer NOT NULL DEFAULT 0, -- em centavos (0 = grátis)
    
    -- Trial
    trial_days integer NOT NULL DEFAULT 14,
    
    -- Features por plano (limites)
    features jsonb NOT NULL DEFAULT '{
        "ml_level": "basic",
        "reports_limit": 10,
        "storage_gb": 5,
        "staff_limit": 3,
        "api_limit": 1000,
        "support_level": "email",
        "white_label": false,
        "store_enabled": false,
        "advanced_reports": false,
        "priority_support": false
    }'::jsonb,
    
    -- Ordenação
    sort_order integer NOT NULL DEFAULT 0,
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    is_public boolean NOT NULL DEFAULT true, -- false = Custom (apenas sob consulta)
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabela de Assinaturas das Academias
CREATE TABLE academy_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL UNIQUE REFERENCES academias(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES subscription_plans(id),
    
    -- Status da assinatura
    status varchar(20) NOT NULL DEFAULT 'trialing' 
        CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'suspended')),
    
    -- Ciclo de faturamento
    billing_cycle varchar(20) NOT NULL DEFAULT 'monthly' 
        CHECK (billing_cycle IN ('monthly', 'annual')),
    
    -- Trial
    trial_starts_at timestamptz,
    trial_ends_at timestamptz,
    trial_converted boolean NOT NULL DEFAULT false,
    trial_converted_at timestamptz,
    
    -- Setup
    setup_paid boolean NOT NULL DEFAULT false,
    setup_paid_at timestamptz,
    setup_amount integer, -- valor pago (pode ser 0 se grátis)
    
    -- Período atual
    current_period_starts_at timestamptz,
    current_period_ends_at timestamptz,
    
    -- Stripe
    stripe_customer_id varchar(255),
    stripe_subscription_id varchar(255),
    
    -- Configurações
    auto_upgrade_enabled boolean NOT NULL DEFAULT true,
    auto_renew boolean NOT NULL DEFAULT true,
    
    -- Metadados
    metadata jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tabela de Rastreamento de Trial (histórico detalhado)
CREATE TABLE trial_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    -- Plano do trial
    trial_plan_id uuid NOT NULL REFERENCES subscription_plans(id),
    trial_plan_name varchar(50) NOT NULL,
    
    -- Datas
    trial_started_at timestamptz NOT NULL DEFAULT now(),
    trial_ends_at timestamptz NOT NULL,
    
    -- Conversão
    converted boolean NOT NULL DEFAULT false,
    converted_at timestamptz,
    converted_plan_id uuid REFERENCES subscription_plans(id),
    converted_billing_cycle varchar(20) CHECK (converted_billing_cycle IN ('monthly', 'annual')),
    
    -- Setup
    setup_collected boolean NOT NULL DEFAULT false,
    setup_amount integer,
    
    -- Alertas enviados
    alerts_sent jsonb NOT NULL DEFAULT '[]'::jsonb, -- [11, 13, 14] dias
    
    -- Origem
    source varchar(50) DEFAULT 'website', -- website, referral, sales
    referrer_academy_id uuid, -- para programa de indicação
    
    -- Motivo de não conversão (se cancelado)
    cancellation_reason varchar(255),
    cancellation_feedback text,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Tabela de Quotas de Uso (por período)
CREATE TABLE usage_quotas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    metric_type varchar(50) NOT NULL 
        CHECK (metric_type IN ('reports', 'storage', 'api_calls', 'staff_users', 'exports')),
    
    -- Período
    period_start date NOT NULL,
    period_end date NOT NULL,
    
    -- Quantidades
    included_amount integer NOT NULL, -- incluso no plano
    used_amount integer NOT NULL DEFAULT 0,
    overage_amount integer NOT NULL DEFAULT 0,
    
    -- Cobranças
    overage_charges integer NOT NULL DEFAULT 0, -- em centavos
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(academy_id, metric_type, period_start)
);

-- 5. Tabela de Add-ons
CREATE TABLE subscription_addons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    addon_type varchar(50) NOT NULL 
        CHECK (addon_type IN ('white_label', 'store', 'dedicated_support', 'marketing_automation', 'financial_module')),
    
    display_name varchar(100) NOT NULL,
    price_monthly integer NOT NULL, -- em centavos
    
    -- Configuração específica do add-on
    config jsonb DEFAULT '{}'::jsonb,
    
    -- Status
    is_active boolean NOT NULL DEFAULT true,
    active_since timestamptz NOT NULL DEFAULT now(),
    active_until timestamptz,
    
    -- Stripe
    stripe_price_id varchar(255),
    stripe_subscription_item_id varchar(255),
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Tabela de Invoices
CREATE TABLE subscription_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    -- Período
    period_start date NOT NULL,
    period_end date NOT NULL,
    
    -- Itens
    subscription_amount integer NOT NULL, -- em centavos
    setup_amount integer NOT NULL DEFAULT 0,
    overages_amount integer NOT NULL DEFAULT 0,
    addons_amount integer NOT NULL DEFAULT 0,
    discounts_amount integer NOT NULL DEFAULT 0,
    
    -- Totais
    subtotal integer NOT NULL,
    tax_amount integer NOT NULL DEFAULT 0,
    total_amount integer NOT NULL,
    
    -- Status
    status varchar(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'void')),
    
    -- Stripe
    stripe_invoice_id varchar(255),
    stripe_payment_intent_id varchar(255),
    
    -- Datas
    paid_at timestamptz,
    failed_at timestamptz,
    refunded_at timestamptz,
    
    -- Metadados
    metadata jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Tabela de Créditos Pré-pagos (Overage)
CREATE TABLE prepaid_credits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    credit_type varchar(50) NOT NULL 
        CHECK (credit_type IN ('reports', 'storage', 'api_calls', 'staff_users')),
    
    amount integer NOT NULL,
    amount_used integer NOT NULL DEFAULT 0,
    amount_remaining integer NOT NULL,
    
    price_paid integer NOT NULL, -- em centavos
    
    valid_until timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    
    stripe_payment_intent_id varchar(255),
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX idx_subscriptions_academy ON academy_subscriptions(academy_id);
CREATE INDEX idx_subscriptions_plan ON academy_subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON academy_subscriptions(status);
CREATE INDEX idx_subscriptions_trial_end ON academy_subscriptions(trial_ends_at);

CREATE INDEX idx_trial_tracking_academy ON trial_tracking(academy_id);
CREATE INDEX idx_trial_tracking_converted ON trial_tracking(converted);
CREATE INDEX idx_trial_tracking_ends_at ON trial_tracking(trial_ends_at);

CREATE INDEX idx_usage_quotas_academy ON usage_quotas(academy_id);
CREATE INDEX idx_usage_quotas_period ON usage_quotas(period_start, period_end);

CREATE INDEX idx_addons_academy ON subscription_addons(academy_id);
CREATE INDEX idx_addons_active ON subscription_addons(academy_id, is_active);

CREATE INDEX idx_invoices_academy ON subscription_invoices(academy_id);
CREATE INDEX idx_invoices_status ON subscription_invoices(status);

-- ============================================================
-- Triggers
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
CREATE TRIGGER update_trial_tracking_updated_at BEFORE UPDATE ON trial_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_quotas_updated_at BEFORE UPDATE ON usage_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_addons_updated_at BEFORE UPDATE ON subscription_addons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_invoices_updated_at BEFORE UPDATE ON subscription_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prepaid_credits_updated_at BEFORE UPDATE ON prepaid_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Dados Iniciais: Planos v3.0
-- ============================================================
INSERT INTO subscription_plans (name, display_name, student_limit, base_price_monthly, base_price_annual, setup_price, trial_days, features, sort_order, is_public) VALUES
    ('Start', 'Start', 50, 14900, 149000, 29700, 14, '{
        "ml_level": "basic",
        "reports_limit": 10,
        "storage_gb": 5,
        "staff_limit": 3,
        "api_limit": 1000,
        "support_level": "email",
        "white_label": false,
        "store_enabled": false,
        "advanced_reports": false,
        "priority_support": false
    }'::jsonb, 1, true),
    
    ('Medium', 'Medium', 100, 19900, 199000, 19700, 14, '{
        "ml_level": "basic",
        "reports_limit": 25,
        "storage_gb": 10,
        "staff_limit": 5,
        "api_limit": 5000,
        "support_level": "chat",
        "white_label": false,
        "store_enabled": false,
        "advanced_reports": false,
        "priority_support": false
    }'::jsonb, 2, true),
    
    ('Pro', 'Pro', 150, 27900, 279000, 0, 30, '{
        "ml_level": "full",
        "reports_limit": 100,
        "storage_gb": 20,
        "staff_limit": 10,
        "api_limit": 50000,
        "support_level": "priority",
        "white_label": false,
        "store_enabled": true,
        "advanced_reports": true,
        "priority_support": true
    }'::jsonb, 3, true),
    
    ('Business', 'Business', 300, 44900, 449000, 0, 30, '{
        "ml_level": "full",
        "reports_limit": null,
        "storage_gb": 50,
        "staff_limit": 20,
        "api_limit": 200000,
        "support_level": "dedicated",
        "white_label": true,
        "store_enabled": true,
        "advanced_reports": true,
        "priority_support": true
    }'::jsonb, 4, true),
    
    ('Enterprise', 'Enterprise', 500, 69900, 699000, 0, 60, '{
        "ml_level": "full",
        "reports_limit": null,
        "storage_gb": 100,
        "staff_limit": null,
        "api_limit": null,
        "support_level": "dedicated_sla",
        "white_label": true,
        "store_enabled": true,
        "advanced_reports": true,
        "priority_support": true
    }'::jsonb, 5, true),
    
    ('Custom', 'Custom', null, 0, 0, 0, 14, '{
        "ml_level": "full",
        "reports_limit": null,
        "storage_gb": null,
        "staff_limit": null,
        "api_limit": null,
        "support_level": "dedicated_sla",
        "white_label": true,
        "store_enabled": true,
        "advanced_reports": true,
        "priority_support": true
    }'::jsonb, 6, false)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    student_limit = EXCLUDED.student_limit,
    base_price_monthly = EXCLUDED.base_price_monthly,
    base_price_annual = EXCLUDED.base_price_annual,
    setup_price = EXCLUDED.setup_price,
    trial_days = EXCLUDED.trial_days,
    features = EXCLUDED.features;

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepaid_credits ENABLE ROW LEVEL SECURITY;

-- Planos: leitura pública
CREATE POLICY subscription_plans_select ON subscription_plans
    FOR SELECT USING (true);

-- Assinaturas: academia só vê a própria
CREATE POLICY academy_subscriptions_select_own ON academy_subscriptions
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

-- Trial tracking
CREATE POLICY trial_tracking_select_own ON trial_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = trial_tracking.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Usage quotas
CREATE POLICY usage_quotas_select_own ON usage_quotas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = usage_quotas.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Add-ons
CREATE POLICY addons_select_own ON subscription_addons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = subscription_addons.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Invoices
CREATE POLICY invoices_select_own ON subscription_invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = subscription_invoices.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );

-- Credits
CREATE POLICY credits_select_own ON prepaid_credits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua 
            WHERE ua.academia_id = prepaid_credits.academy_id 
            AND ua.usuario_id = auth.uid()
        )
    );
