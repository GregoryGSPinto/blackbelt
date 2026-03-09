-- ============================================================
-- Lead Capture System - BlackBelt
-- Tabelas para captação, qualificação e gestão de leads
-- ============================================================

-- 1. Tabela de Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_name TEXT NOT NULL,
  responsible_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  modalities TEXT[] DEFAULT '{}',
  current_students INTEGER DEFAULT 0,
  monthly_revenue DECIMAL(10,2),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'approved', 'rejected', 'converted')),
  rejection_reason TEXT,
  notes TEXT,
  custom_price DECIMAL(10,2),
  source TEXT DEFAULT 'website',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  converted_to_academy_id UUID REFERENCES academies(id)
);

-- 2. Tabela de Interações
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'whatsapp', 'note', 'status_change')),
  content TEXT NOT NULL,
  sent_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Templates de Email
CREATE TABLE IF NOT EXISTS lead_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  trigger_event TEXT CHECK (trigger_event IN ('welcome', 'presentation', 'case_study', 'proposal', 'follow_up', 'custom')),
  delay_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Sequências de Automação
CREATE TABLE IF NOT EXISTS lead_automation_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES lead_email_templates(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_automation_sequences ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Leads
CREATE POLICY "Leads viewable by super admin"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE profile_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Leads editable by super admin"
  ON leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE profile_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 7. RLS Policies for Interactions
CREATE POLICY "Interactions viewable by super admin"
  ON lead_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE profile_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Interactions editable by super admin"
  ON lead_interactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE profile_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 8. Function to update updated_at
CREATE OR REPLACE FUNCTION update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_updated_at();

-- 9. Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(
  p_students INTEGER,
  p_revenue DECIMAL,
  p_modalities TEXT[],
  p_city TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
BEGIN
  -- Score baseado em alunos (0-30)
  IF p_students > 200 THEN
    v_score := v_score + 30;
  ELSIF p_students > 100 THEN
    v_score := v_score + 20;
  ELSIF p_students > 50 THEN
    v_score := v_score + 10;
  END IF;
  
  -- Score baseado em faturamento (0-25)
  IF p_revenue > 50000 THEN
    v_score := v_score + 25;
  ELSIF p_revenue > 20000 THEN
    v_score := v_score + 15;
  ELSIF p_revenue > 10000 THEN
    v_score := v_score + 10;
  END IF;
  
  -- Score baseado em modalidades (0-20)
  IF p_modalities && ARRAY['bjj', 'muay_thai', 'mma'] THEN
    v_score := v_score + 20;
  ELSE
    v_score := v_score + 10;
  END IF;
  
  -- Score baseado em cidade (0-15)
  IF p_city IN ('São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre') THEN
    v_score := v_score + 15;
  ELSE
    v_score := v_score + 5;
  END IF;
  
  -- Completude (0-10) - assumindo sempre completo para simplificar
  v_score := v_score + 10;
  
  RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- 10. Function to auto-calculate score on insert/update
CREATE OR REPLACE FUNCTION auto_calculate_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := calculate_lead_score(
    NEW.current_students,
    NEW.monthly_revenue,
    NEW.modalities,
    NEW.city
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_auto_score
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_lead_score();

-- 11. Insert default email templates
INSERT INTO lead_email_templates (name, subject, body, trigger_event, delay_days) VALUES
(
  'Boas-vindas',
  'Bem-vindo ao BlackBelt - Vamos revolucionar sua academia!',
  'Olá {{responsible_name}},

Obrigado pelo interesse no BlackBelt! Somos a plataforma completa para gestão de academias de artes marciais.

Com o BlackBelt você pode:
✓ Gerenciar matrículas e pagamentos
✓ Controlar frequência com QR Code
✓ Acompanhar progresso dos alunos
✓ Comunicar-se com pais e responsáveis

Em breve nossa equipe entrará em contato para apresentar uma proposta personalizada para {{academy_name}}.

Atenciosamente,
Equipe BlackBelt',
  'welcome',
  0
),
(
  'Apresentação',
  'Conheça todos os recursos do BlackBelt',
  'Olá {{responsible_name}},

Gostaríamos de mostrar como o BlackBelt pode transformar a gestão da {{academy_name}}.

Nossos diferenciais:
• Sistema de check-in por QR Code
• App white-label para seus alunos
• Relatórios financeiros detalhados
• Gestão de graduações
• Comunicação integrada

Podemos agendar uma demonstração?

Atenciosamente,
Equipe BlackBelt',
  'presentation',
  1
),
(
  'Case de Sucesso',
  'Como a Academia Campeã aumentou em 30% sua retenção',
  'Olá {{responsible_name}},

Queremos compartilhar um case de sucesso que pode inspirar a {{academy_name}}.

A Academia Campeão, com características similares às da sua, implementou o BlackBelt e conseguiu:

📈 Aumento de 30% na retenção de alunos
⏱️ Redução de 50% no tempo de administração
💰 Crescimento de 25% no faturamento

Gostaria de saber como replicar esses resultados?

Atenciosamente,
Equipe BlackBelt',
  'case_study',
  3
),
(
  'Proposta',
  'Sua proposta personalizada está pronta!',
  'Olá {{responsible_name}},

Preparamos uma proposta exclusiva para a {{academy_name}}.

Plano recomendado: Growth
Investimento: R$ {{custom_price}}/mês

Benefícios incluídos:
✓ Até 150 alunos
✓ Todas as modalidades
✓ App personalizado
✓ Suporte prioritário

Clique no link abaixo para aceitar a proposta:
{{proposal_link}}

Dúvidas? Estamos à disposição!

Atenciosamente,
Equipe BlackBelt',
  'proposal',
  7
),
(
  'Follow-up',
  'Último contato - Não deixe sua academia para trás',
  'Olá {{responsible_name}},

Notamos que você ainda não deu continuidade à proposta para {{academy_name}}.

Entendemos que a decisão leva tempo, mas não queremos que sua academia perca a oportunidade de:

🚀 Modernizar a gestão
📱 Oferecer app aos alunos
💪 Focar no crescimento

Estamos disponíveis para tirar qualquer dúvida.

Atenciosamente,
Equipe BlackBelt',
  'follow_up',
  14
);

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_automation_sequences_lead_id ON lead_automation_sequences(lead_id);
