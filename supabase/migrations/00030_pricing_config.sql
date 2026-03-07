-- ============================================================
-- Migration: Pricing Config v3.0
-- Description: Sistema centralizado de preços com histórico e realtime
-- ============================================================

-- Tabela central de preços
CREATE TABLE IF NOT EXISTS pricing_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key varchar(50) UNIQUE NOT NULL,
    config_value integer NOT NULL, -- em centavos (exceto trial_days)
    config_type varchar(20) NOT NULL CHECK (config_type IN ('monthly', 'annual', 'setup', 'trial', 'overage', 'addon')),
    plan_name varchar(20) CHECK (plan_name IN ('start', 'medium', 'pro', 'business', 'enterprise', 'custom')),
    display_name varchar(100) NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    effective_date timestamp with time zone DEFAULT NOW(),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Histórico de alterações
CREATE TABLE IF NOT EXISTS pricing_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key varchar(50) NOT NULL,
    old_value integer NOT NULL,
    new_value integer NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    changed_at timestamp with time zone DEFAULT NOW(),
    reason text
);

-- Dados iniciais dos planos
INSERT INTO pricing_config (config_key, config_value, config_type, plan_name, display_name, description, is_active) VALUES
-- Start
('start_monthly', 14900, 'monthly', 'start', 'Start - Mensal', 'Valor mensal do plano Start', true),
('start_annual', 149000, 'annual', 'start', 'Start - Anual', 'Valor anual do plano Start', true),
('start_setup', 29700, 'setup', 'start', 'Start - Setup', 'Taxa de setup do plano Start', true),
('start_trial_days', 14, 'trial', 'start', 'Start - Trial', 'Dias de trial do plano Start', true),

-- Medium
('medium_monthly', 19900, 'monthly', 'medium', 'Medium - Mensal', 'Valor mensal do plano Medium', true),
('medium_annual', 199000, 'annual', 'medium', 'Medium - Anual', 'Valor anual do plano Medium', true),
('medium_setup', 19700, 'setup', 'medium', 'Medium - Setup', 'Taxa de setup do plano Medium', true),
('medium_trial_days', 14, 'trial', 'medium', 'Medium - Trial', 'Dias de trial do plano Medium', true),

-- Pro
('pro_monthly', 27900, 'monthly', 'pro', 'Pro - Mensal', 'Valor mensal do plano Pro', true),
('pro_annual', 279000, 'annual', 'pro', 'Pro - Anual', 'Valor anual do plano Pro', true),
('pro_setup', 0, 'setup', 'pro', 'Pro - Setup', 'Taxa de setup do plano Pro (grátis)', true),
('pro_trial_days', 30, 'trial', 'pro', 'Pro - Trial', 'Dias de trial do plano Pro', true),

-- Business
('business_monthly', 44900, 'monthly', 'business', 'Business - Mensal', 'Valor mensal do plano Business', true),
('business_annual', 449000, 'annual', 'business', 'Business - Anual', 'Valor anual do plano Business', true),
('business_setup', 0, 'setup', 'business', 'Business - Setup', 'Taxa de setup do plano Business (grátis)', true),
('business_trial_days', 30, 'trial', 'business', 'Business - Trial', 'Dias de trial do plano Business', true),

-- Enterprise
('enterprise_monthly', 69900, 'monthly', 'enterprise', 'Enterprise - Mensal', 'Valor mensal do plano Enterprise', true),
('enterprise_annual', 699000, 'annual', 'enterprise', 'Enterprise - Anual', 'Valor anual do plano Enterprise', true),
('enterprise_setup', 0, 'setup', 'enterprise', 'Enterprise - Setup', 'Taxa de setup do plano Enterprise (grátis)', true),
('enterprise_trial_days', 60, 'trial', 'enterprise', 'Enterprise - Trial', 'Dias de trial do plano Enterprise', true),

-- Overages
('overage_reports_pack', 3900, 'overage', null, 'Relatórios - Pacote 10', 'Pacote de 10 relatórios extras', true),
('overage_reports_single', 900, 'overage', null, 'Relatórios - Avulso', 'Relatório avulso extra', true),
('overage_bi', 8900, 'overage', null, 'Deep Analytics', 'Deep Analytics (BI)', true),
('overage_storage', 3900, 'overage', null, 'Storage Extra', '10GB de storage adicional', true),
('overage_user', 2900, 'overage', null, 'Usuário Extra', 'Usuário staff adicional por mês', true),
('overage_api', 2500, 'overage', null, 'API Extra', '10k chamadas API adicionais', true),
('overage_history_24', 4900, 'overage', null, 'Histórico 24 meses', 'Extensão de histórico para 24 meses', true),
('overage_history_36', 7900, 'overage', null, 'Histórico 36 meses', 'Extensão de histórico para 36 meses', true),

-- Add-ons
('addon_whitelabel', 11900, 'addon', null, 'White Label', 'Remoção da marca BlackBelt', true),
('addon_support', 17900, 'addon', null, 'Suporte Dedicado', 'Suporte prioritário por telefone', true),
('addon_marketing', 4900, 'addon', null, 'Marketing Automation', 'Automação de campanhas', true),
('addon_financial', 5900, 'addon', null, 'Módulo Financeiro', 'Controle financeiro completo', true)

ON CONFLICT (config_key) DO UPDATE SET
    config_value = EXCLUDED.config_value,
    config_type = EXCLUDED.config_type,
    plan_name = EXCLUDED.plan_name,
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Trigger para histórico
CREATE OR REPLACE FUNCTION log_pricing_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.config_value != NEW.config_value THEN
        INSERT INTO pricing_history (config_key, old_value, new_value, changed_by, changed_at, reason)
        VALUES (OLD.config_key, OLD.config_value, NEW.config_value, NEW.created_by, NOW(), 'Atualização via admin');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pricing_change_trigger ON pricing_config;
CREATE TRIGGER pricing_change_trigger
    AFTER UPDATE ON pricing_config
    FOR EACH ROW
    EXECUTE FUNCTION log_pricing_change();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pricing_config_updated_at ON pricing_config;
CREATE TRIGGER pricing_config_updated_at
    BEFORE UPDATE ON pricing_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_pricing_config_key ON pricing_config(config_key);
CREATE INDEX IF NOT EXISTS idx_pricing_config_plan ON pricing_config(plan_name);
CREATE INDEX IF NOT EXISTS idx_pricing_config_type ON pricing_config(config_type);
CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_history_key ON pricing_history(config_key);
CREATE INDEX IF NOT EXISTS idx_pricing_history_changed ON pricing_history(changed_at);

-- RLS Policies
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;

-- Política: Super admin pode tudo
CREATE POLICY "Super admin full access" ON pricing_config
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua
            WHERE ua.usuario_id = auth.uid()
            AND ua.perfil = 'SUPER_ADMIN'
        )
    );

-- Política: Usuários autenticados podem ler preços ativos
CREATE POLICY "Authenticated users can read active pricing" ON pricing_config
    FOR SELECT TO authenticated
    USING (is_active = true);

-- Política: Super admin pode ver histórico
CREATE POLICY "Super admin can read history" ON pricing_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios_academia ua
            WHERE ua.usuario_id = auth.uid()
            AND ua.perfil = 'SUPER_ADMIN'
        )
    );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pricing_config;
