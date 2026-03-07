-- ============================================================================
-- Migration: Fail-Safe Tables
-- Description: Tabelas para suportar os services principais com dados seguros
-- ============================================================================

-- ============================================================================
-- 1. TABELA: academy_stats (Dashboard Estatísticas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS academy_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    -- Métricas principais
    total_students integer NOT NULL DEFAULT 0,
    active_students integer NOT NULL DEFAULT 0,
    monthly_revenue integer NOT NULL DEFAULT 0, -- em centavos
    total_checkins integer NOT NULL DEFAULT 0,
    
    -- Dados de check-ins recentes (JSONB para flexibilidade)
    recent_checkins jsonb NOT NULL DEFAULT '[]'::jsonb,
    
    -- Dados para gráficos
    charts jsonb NOT NULL DEFAULT '{
        "studentsByBelt": [],
        "checkinsByDay": [],
        "revenueByMonth": []
    }'::jsonb,
    
    -- Metadados
    calculated_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(academy_id)
);

-- Índices para academy_stats
CREATE INDEX IF NOT EXISTS idx_academy_stats_academy ON academy_stats(academy_id);
CREATE INDEX IF NOT EXISTS idx_academy_stats_updated ON academy_stats(updated_at);

-- Trigger para updated_at
CREATE TRIGGER update_academy_stats_updated_at
    BEFORE UPDATE ON academy_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TABELA: check_ins (Registro de Presença)
-- ============================================================================

CREATE TABLE IF NOT EXISTS check_ins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    aluno_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    turma_id uuid REFERENCES turmas(id) ON DELETE SET NULL,
    
    -- Dados do check-in
    data_hora timestamptz NOT NULL DEFAULT now(),
    status varchar(20) NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
    method varchar(20) NOT NULL DEFAULT 'MANUAL' CHECK (method IN ('MANUAL', 'QR', 'APP', 'BIOMETRIA')),
    
    -- Metadados
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Restrição única: um aluno só pode ter um check-in por dia
    UNIQUE(aluno_id, DATE(data_hora))
);

-- Índices para check-ins
CREATE INDEX IF NOT EXISTS idx_checkins_academy ON check_ins(academy_id);
CREATE INDEX IF NOT EXISTS idx_checkins_aluno ON check_ins(aluno_id);
CREATE INDEX IF NOT EXISTS idx_checkins_data ON check_ins(data_hora);
CREATE INDEX IF NOT EXISTS idx_checkins_turma ON check_ins(turma_id);

-- Trigger para updated_at
CREATE TRIGGER update_checkins_updated_at
    BEFORE UPDATE ON check_ins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. TABELA: documentos_assinatura (Contratos e Termos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS documentos_assinatura (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    aluno_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Dados do documento
    titulo varchar(255) NOT NULL,
    tipo varchar(50) NOT NULL CHECK (tipo IN ('CONTRATO', 'TERMO', 'POLITICA', 'DECLARACAO')),
    status varchar(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ASSINADO', 'CANCELADO', 'EXPIRADO')),
    
    -- Conteúdo
    url varchar(500) NOT NULL,
    hash_conteudo varchar(64), -- SHA-256 do conteúdo
    
    -- Dados de assinatura
    data_assinatura timestamptz,
    hash_assinatura varchar(64),
    ip_assinatura varchar(45),
    user_agent text,
    
    -- Metadados
    data_criacao timestamptz NOT NULL DEFAULT now(),
    data_expiracao timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para documentos
CREATE INDEX IF NOT EXISTS idx_documentos_academy ON documentos_assinatura(academy_id);
CREATE INDEX IF NOT EXISTS idx_documentos_aluno ON documentos_assinatura(aluno_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos_assinatura(status);

-- Trigger para updated_at
CREATE TRIGGER update_documentos_updated_at
    BEFORE UPDATE ON documentos_assinatura
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TABELA: consentimentos_lgpd (Consentimentos de Dados)
-- ============================================================================

CREATE TABLE IF NOT EXISTS consentimentos_lgpd (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    
    -- Dados do consentimento
    titulo varchar(255) NOT NULL,
    descricao text NOT NULL,
    obrigatorio boolean NOT NULL DEFAULT false,
    versao varchar(10) NOT NULL DEFAULT '1.0',
    
    -- Conteúdo
    termos text NOT NULL,
    
    -- Metadados
    ativo boolean NOT NULL DEFAULT true,
    data_criacao timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para consentimentos
CREATE INDEX IF NOT EXISTS idx_consentimentos_academy ON consentimentos_lgpd(academy_id);
CREATE INDEX IF NOT EXISTS idx_consentimentos_ativo ON consentimentos_lgpd(ativo);

-- Trigger para updated_at
CREATE TRIGGER update_consentimentos_updated_at
    BEFORE UPDATE ON consentimentos_lgpd
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. TABELA: aluno_consentimentos (Vínculo Aluno x Consentimento)
-- ============================================================================

CREATE TABLE IF NOT EXISTS aluno_consentimentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consentimento_id uuid NOT NULL REFERENCES consentimentos_lgpd(id) ON DELETE CASCADE,
    
    -- Estado
    aceito boolean NOT NULL DEFAULT false,
    data_aceite date,
    ip_aceite varchar(45),
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    UNIQUE(aluno_id, consentimento_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_aluno_consentimentos_aluno ON aluno_consentimentos(aluno_id);

-- Trigger para updated_at
CREATE TRIGGER update_aluno_consentimentos_updated_at
    BEFORE UPDATE ON aluno_consentimentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. TABELA: faturas (Financeiro)
-- ============================================================================

CREATE TABLE IF NOT EXISTS faturas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
    aluno_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Dados da fatura
    descricao varchar(255) NOT NULL,
    valor integer NOT NULL DEFAULT 0, -- em centavos
    vencimento date NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    
    -- Dados de pagamento
    data_pagamento date,
    metodo_pagamento varchar(20) CHECK (metodo_pagamento IN ('cartao', 'pix', 'boleto', 'dinheiro')),
    
    -- Metadados
    observacoes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para faturas
CREATE INDEX IF NOT EXISTS idx_faturas_academy ON faturas(academy_id);
CREATE INDEX IF NOT EXISTS idx_faturas_aluno ON faturas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE INDEX IF NOT EXISTS idx_faturas_vencimento ON faturas(vencimento);

-- Trigger para updated_at
CREATE TRIGGER update_faturas_updated_at
    BEFORE UPDATE ON faturas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. TABELA: planos_assinatura (Planos Disponíveis)
-- ============================================================================

CREATE TABLE IF NOT EXISTS planos_assinatura (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados do plano
    nome varchar(100) NOT NULL,
    descricao text NOT NULL,
    preco_mensal integer NOT NULL DEFAULT 0, -- em centavos
    preco_anual integer NOT NULL DEFAULT 0, -- em centavos
    recursos jsonb NOT NULL DEFAULT '[]'::jsonb,
    
    -- Configurações
    ativo boolean NOT NULL DEFAULT true,
    popular boolean NOT NULL DEFAULT false,
    ordem integer NOT NULL DEFAULT 0,
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planos_ativo ON planos_assinatura(ativo);

-- Trigger para updated_at
CREATE TRIGGER update_planos_updated_at
    BEFORE UPDATE ON planos_assinatura
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. DADOS INICIAIS (Seed)
-- ============================================================================

-- Inserir planos padrão se não existirem
INSERT INTO planos_assinatura (nome, descricao, preco_mensal, preco_anual, recursos, ordem)
VALUES 
    ('Start', 'Plano inicial para academias em crescimento', 14900, 149000, '["Até 50 alunos","Relatórios básicos","App mobile"]', 1),
    ('Medium', 'Plano intermediário com mais recursos', 19900, 199000, '["Até 100 alunos","Relatórios avançados","Suporte prioritário"]', 2),
    ('Pro', 'Plano profissional completo', 27900, 279000, '["Até 200 alunos","Inteligência artificial","API access"]', 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. RLS POLICIES (Segurança)
-- ============================================================================

ALTER TABLE academy_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_assinatura ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimentos_lgpd ENABLE ROW LEVEL SECURITY;
ALTER TABLE aluno_consentimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_assinatura ENABLE ROW LEVEL SECURITY;

-- Academy Stats: só a própria academia
CREATE POLICY academy_stats_own ON academy_stats
    FOR ALL TO authenticated
    USING (academy_id IN (SELECT academia_id FROM usuarios_academia WHERE usuario_id = auth.uid()));

-- Check-ins: só a própria academia
CREATE POLICY checkins_own ON check_ins
    FOR ALL TO authenticated
    USING (academy_id IN (SELECT academia_id FROM usuarios_academia WHERE usuario_id = auth.uid()));

-- Documentos: só a própria academia
CREATE POLICY documentos_own ON documentos_assinatura
    FOR ALL TO authenticated
    USING (academy_id IN (SELECT academia_id FROM usuarios_academia WHERE usuario_id = auth.uid()));

-- Consentimentos: só a própria academia
CREATE POLICY consentimentos_own ON consentimentos_lgpd
    FOR ALL TO authenticated
    USING (academy_id IN (SELECT academia_id FROM usuarios_academia WHERE usuario_id = auth.uid()));

-- Aluno Consentimentos: o próprio aluno ou admin da academia
CREATE POLICY aluno_consentimentos_own ON aluno_consentimentos
    FOR ALL TO authenticated
    USING (
        aluno_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM usuarios_academia ua
            JOIN consentimentos_lgpd cl ON cl.academy_id = ua.academia_id
            WHERE ua.usuario_id = auth.uid()
            AND cl.id = aluno_consentimentos.consentimento_id
        )
    );

-- Faturas: só a própria academia
CREATE POLICY faturas_own ON faturas
    FOR ALL TO authenticated
    USING (academy_id IN (SELECT academia_id FROM usuarios_academia WHERE usuario_id = auth.uid()));

-- Planos: leitura pública
CREATE POLICY planos_read ON planos_assinatura
    FOR SELECT TO authenticated
    USING (ativo = true);

-- Super admin pode tudo
CREATE POLICY super_admin_stats ON academy_stats
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM usuarios_academia WHERE usuario_id = auth.uid() AND perfil = 'SUPER_ADMIN'));

CREATE POLICY super_admin_checkins ON check_ins
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM usuarios_academia WHERE usuario_id = auth.uid() AND perfil = 'SUPER_ADMIN'));

CREATE POLICY super_admin_documentos ON documentos_assinatura
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM usuarios_academia WHERE usuario_id = auth.uid() AND perfil = 'SUPER_ADMIN'));

CREATE POLICY super_admin_consentimentos ON consentimentos_lgpd
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM usuarios_academia WHERE usuario_id = auth.uid() AND perfil = 'SUPER_ADMIN'));

CREATE POLICY super_admin_faturas ON faturas
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM usuarios_academia WHERE usuario_id = auth.uid() AND perfil = 'SUPER_ADMIN'));

CREATE POLICY super_admin_planos ON planos_assinatura
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM usuarios_academia WHERE usuario_id = auth.uid() AND perfil = 'SUPER_ADMIN'));

-- ============================================================================
-- 10. REALTIME (Atualizações em tempo real)
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE faturas;
