-- ============================================================
-- Lead Acquisition & Sales Intelligence System
-- Production-grade upgrade for the Super Admin growth engine
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'lead_email_templates'
  ) THEN
    ALTER TABLE public.lead_email_templates ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.leads
  ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS suggested_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS proposed_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS closed_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS converted_academy_id UUID REFERENCES public.academies(id),
  ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_status_changed_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS loss_reason TEXT,
  ADD COLUMN IF NOT EXISTS enrichment_payload JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS enrichment_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE public.leads
SET lead_source = COALESCE(NULLIF(lead_source, ''), source, 'manual')
WHERE TRUE;

UPDATE public.leads
SET converted_academy_id = COALESCE(converted_academy_id, converted_to_academy_id)
WHERE converted_to_academy_id IS NOT NULL
  AND converted_academy_id IS NULL;

ALTER TABLE IF EXISTS public.leads
  DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE IF EXISTS public.leads
  DROP CONSTRAINT IF EXISTS leads_loss_reason_check;

UPDATE public.leads
SET status = CASE status
  WHEN 'new' THEN 'NEW'
  WHEN 'qualified' THEN 'QUALIFIED'
  WHEN 'contacted' THEN 'OUTREACH_STARTED'
  WHEN 'approved' THEN 'PROPOSAL_SENT'
  WHEN 'rejected' THEN 'LOST'
  WHEN 'converted' THEN 'WON'
  WHEN 'enriching' THEN 'ENRICHING'
  WHEN 'meeting_scheduled' THEN 'MEETING_SCHEDULED'
  WHEN 'negotiating' THEN 'NEGOTIATING'
  ELSE UPPER(COALESCE(status, 'NEW'))
END;

ALTER TABLE IF EXISTS public.leads
  ALTER COLUMN status SET DEFAULT 'NEW';

ALTER TABLE IF EXISTS public.leads
  ADD CONSTRAINT leads_status_check
  CHECK (
    status IN (
      'NEW',
      'ENRICHING',
      'QUALIFIED',
      'OUTREACH_STARTED',
      'MEETING_SCHEDULED',
      'PROPOSAL_SENT',
      'NEGOTIATING',
      'WON',
      'LOST'
    )
  );

ALTER TABLE IF EXISTS public.leads
  ADD CONSTRAINT leads_loss_reason_check
  CHECK (
    loss_reason IS NULL OR loss_reason IN (
      'PRICE_TOO_HIGH',
      'NO_RESPONSE',
      'SMALL_ACADEMY',
      'USING_COMPETITOR',
      'NOT_INTERESTED',
      'DELAYED'
    )
  );

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_city_state ON public.leads(city, state);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_converted_academy_id ON public.leads(converted_academy_id);

CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id ON public.lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_status_due_at ON public.lead_tasks(status, due_at);

CREATE TABLE IF NOT EXISTS public.lead_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  proposal_value NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  pdf_url TEXT,
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_proposals_lead_id ON public.lead_proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_proposals_status ON public.lead_proposals(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_proposals_lead_version ON public.lead_proposals(lead_id, version);

CREATE TABLE IF NOT EXISTS public.lead_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  category TEXT NOT NULL CHECK (category IN ('HOT', 'WARM', 'COLD')),
  reason TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  changed_by UUID REFERENCES public.profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_score_history_lead_id ON public.lead_score_history(lead_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_id ON public.lead_status_history(lead_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_status_history_to_status ON public.lead_status_history(to_status);

ALTER TABLE IF EXISTS public.lead_status_history
  DROP CONSTRAINT IF EXISTS lead_status_history_to_status_check;

ALTER TABLE IF EXISTS public.lead_status_history
  ADD CONSTRAINT lead_status_history_to_status_check
  CHECK (
    to_status IN (
      'NEW',
      'ENRICHING',
      'QUALIFIED',
      'OUTREACH_STARTED',
      'MEETING_SCHEDULED',
      'PROPOSAL_SENT',
      'NEGOTIATING',
      'WON',
      'LOST'
    )
  );

ALTER TABLE IF EXISTS public.lead_interactions
  DROP CONSTRAINT IF EXISTS lead_interactions_type_check;

ALTER TABLE IF EXISTS public.lead_interactions
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.lead_interactions
SET created_by = COALESCE(created_by, sent_by)
WHERE created_by IS NULL;

UPDATE public.leads
SET loss_reason = 'USING_COMPETITOR'
WHERE loss_reason = 'ALREADY_USING_COMPETITOR';

ALTER TABLE IF EXISTS public.lead_interactions
  ADD CONSTRAINT lead_interactions_type_check
  CHECK (
    type IN (
      'email',
      'call',
      'whatsapp',
      'note',
      'meeting',
      'proposal_sent',
      'status_change'
    )
  );

CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON public.lead_interactions(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_type ON public.lead_interactions(type);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_created_by ON public.lead_interactions(created_by);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_automation_sequences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS leads_select ON public.leads;
  DROP POLICY IF EXISTS leads_insert ON public.leads;
  DROP POLICY IF EXISTS leads_update ON public.leads;
  DROP POLICY IF EXISTS leads_delete ON public.leads;
  DROP POLICY IF EXISTS "Leads viewable by super admin" ON public.leads;
  DROP POLICY IF EXISTS "Leads editable by super admin" ON public.leads;
  DROP POLICY IF EXISTS "Interactions viewable by super admin" ON public.lead_interactions;
  DROP POLICY IF EXISTS "Interactions editable by super admin" ON public.lead_interactions;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'leads'
      AND policyname = 'Leads super admin only'
  ) THEN
    CREATE POLICY "Leads super admin only"
      ON public.leads
      FOR ALL
      USING (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_interactions'
      AND policyname = 'Lead interactions super admin only'
  ) THEN
    CREATE POLICY "Lead interactions super admin only"
      ON public.lead_interactions
      FOR ALL
      USING (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_tasks'
      AND policyname = 'Lead tasks super admin only'
  ) THEN
    CREATE POLICY "Lead tasks super admin only"
      ON public.lead_tasks
      FOR ALL
      USING (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_proposals'
      AND policyname = 'Lead proposals super admin only'
  ) THEN
    CREATE POLICY "Lead proposals super admin only"
      ON public.lead_proposals
      FOR ALL
      USING (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_score_history'
      AND policyname = 'Lead score history super admin only'
  ) THEN
    CREATE POLICY "Lead score history super admin only"
      ON public.lead_score_history
      FOR ALL
      USING (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_status_history'
      AND policyname = 'Lead status history super admin only'
  ) THEN
    CREATE POLICY "Lead status history super admin only"
      ON public.lead_status_history
      FOR ALL
      USING (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1
        FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'lead_email_templates'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_email_templates'
      AND policyname = 'Lead email templates super admin only'
  ) THEN
    CREATE POLICY "Lead email templates super admin only"
      ON public.lead_email_templates
      FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'lead_automation_sequences'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lead_automation_sequences'
      AND policyname = 'Lead automation sequences super admin only'
  ) THEN
    CREATE POLICY "Lead automation sequences super admin only"
      ON public.lead_automation_sequences
      FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.usuarios_academia ua
        WHERE ua.usuario_id = auth.uid()
          AND ua.perfil = 'SUPER_ADMIN'
      ));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.lead_score_category(p_score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_score >= 75 THEN
    RETURN 'HOT';
  ELSIF p_score >= 45 THEN
    RETURN 'WARM';
  END IF;
  RETURN 'COLD';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.calculate_lead_score_v2(
  p_students INTEGER,
  p_revenue NUMERIC,
  p_modalities TEXT[],
  p_city TEXT,
  p_state TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_website TEXT,
  p_instagram TEXT,
  p_address TEXT,
  p_responsible TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_modality_points INTEGER := 0;
  v_completeness_points INTEGER := 0;
BEGIN
  IF COALESCE(p_students, 0) >= 300 THEN
    v_score := v_score + 30;
  ELSIF COALESCE(p_students, 0) >= 180 THEN
    v_score := v_score + 24;
  ELSIF COALESCE(p_students, 0) >= 90 THEN
    v_score := v_score + 18;
  ELSIF COALESCE(p_students, 0) >= 40 THEN
    v_score := v_score + 10;
  ELSE
    v_score := v_score + 4;
  END IF;

  IF COALESCE(p_revenue, 0) >= 80000 THEN
    v_score := v_score + 25;
  ELSIF COALESCE(p_revenue, 0) >= 40000 THEN
    v_score := v_score + 20;
  ELSIF COALESCE(p_revenue, 0) >= 20000 THEN
    v_score := v_score + 14;
  ELSIF COALESCE(p_revenue, 0) >= 10000 THEN
    v_score := v_score + 8;
  ELSE
    v_score := v_score + 3;
  END IF;

  IF COALESCE(array_length(p_modalities, 1), 0) >= 4 THEN
    v_modality_points := 15;
  ELSIF COALESCE(array_length(p_modalities, 1), 0) >= 2 THEN
    v_modality_points := 11;
  ELSIF COALESCE(array_length(p_modalities, 1), 0) = 1 THEN
    v_modality_points := 7;
  END IF;

  IF p_modalities && ARRAY['BJJ', 'Jiu-Jitsu', 'Muay Thai', 'MMA', 'Boxe'] THEN
    v_modality_points := LEAST(v_modality_points + 5, 15);
  END IF;
  v_score := v_score + v_modality_points;

  IF COALESCE(p_city, '') IN ('São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Curitiba', 'Porto Alegre', 'Salvador', 'Fortaleza', 'Recife', 'Campinas') THEN
    v_score := v_score + 15;
  ELSIF COALESCE(p_state, '') IN ('SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'DF') THEN
    v_score := v_score + 10;
  ELSE
    v_score := v_score + 5;
  END IF;

  IF COALESCE(p_email, '') <> '' THEN v_completeness_points := v_completeness_points + 2; END IF;
  IF COALESCE(p_phone, '') <> '' THEN v_completeness_points := v_completeness_points + 2; END IF;
  IF COALESCE(p_website, '') <> '' THEN v_completeness_points := v_completeness_points + 2; END IF;
  IF COALESCE(p_instagram, '') <> '' THEN v_completeness_points := v_completeness_points + 1; END IF;
  IF COALESCE(p_address, '') <> '' THEN v_completeness_points := v_completeness_points + 1; END IF;
  IF COALESCE(p_responsible, '') <> '' THEN v_completeness_points := v_completeness_points + 1; END IF;
  IF COALESCE(p_city, '') <> '' AND COALESCE(p_state, '') <> '' THEN v_completeness_points := v_completeness_points + 2; END IF;

  v_score := v_score + LEAST(v_completeness_points, 15);
  RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_tasks_updated_at ON public.lead_tasks;
CREATE TRIGGER lead_tasks_updated_at
  BEFORE UPDATE ON public.lead_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp_column();

DROP TRIGGER IF EXISTS lead_proposals_updated_at ON public.lead_proposals;
CREATE TRIGGER lead_proposals_updated_at
  BEFORE UPDATE ON public.lead_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp_column();

CREATE OR REPLACE FUNCTION public.capture_lead_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_status_history (lead_id, from_status, to_status, changed_at, metadata)
    VALUES (NEW.id, NULL, NEW.status, NOW(), jsonb_build_object('source', 'trigger'));
    NEW.last_status_changed_at = NOW();
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.lead_status_history (lead_id, from_status, to_status, changed_at, metadata)
    VALUES (NEW.id, OLD.status, NEW.status, NOW(), jsonb_build_object('source', 'trigger'));
    NEW.last_status_changed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_status_history_trigger ON public.leads;
CREATE TRIGGER leads_status_history_trigger
  BEFORE INSERT OR UPDATE OF status ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_lead_status_history();

CREATE OR REPLACE FUNCTION public.capture_lead_score_history()
RETURNS TRIGGER AS $$
DECLARE
  v_category TEXT;
BEGIN
  v_category := public.lead_score_category(NEW.score);

  IF TG_OP = 'INSERT' OR NEW.score IS DISTINCT FROM OLD.score THEN
    INSERT INTO public.lead_score_history (lead_id, score, category, changed_at, payload)
    VALUES (
      NEW.id,
      NEW.score,
      v_category,
      NOW(),
      jsonb_build_object(
        'students', NEW.current_students,
        'monthly_revenue', NEW.monthly_revenue,
        'modalities', NEW.modalities,
        'city', NEW.city,
        'state', NEW.state
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_score_history_trigger ON public.leads;
CREATE TRIGGER leads_score_history_trigger
  AFTER INSERT OR UPDATE OF score ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_lead_score_history();

CREATE OR REPLACE FUNCTION public.auto_calculate_lead_score_v2()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := public.calculate_lead_score_v2(
    NEW.current_students,
    NEW.monthly_revenue,
    NEW.modalities,
    NEW.city,
    NEW.state,
    NEW.email,
    NEW.phone,
    NEW.website,
    NEW.instagram,
    NEW.address,
    NEW.responsible_name
  );

  IF NEW.status = 'WON' AND NEW.converted_at IS NULL THEN
    NEW.converted_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_auto_score ON public.leads;
CREATE TRIGGER leads_auto_score
  BEFORE INSERT OR UPDATE OF current_students, monthly_revenue, modalities, city, state, email, phone, website, instagram, address, responsible_name, status
  ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_calculate_lead_score_v2();
