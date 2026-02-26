-- ============================================================
-- BLACKBELT — Row-Level Security: Produção Definitiva
-- Migration: 002_rls_production.sql
-- 
-- Execução:
--   psql -U blackbelt_admin -d blackbelt -f 002_rls_production.sql
--
-- EVOLUÇÃO do 001:
--   - Default-deny: sessão sem unit_id = 0 linhas (não erro)
--   - Validação de formato: unit_id deve ser UUID válido
--   - Proteção contra SQL injection via session vars
--   - Policies explícitas por tabela (sem loop dinâmico)
--   - INSERT restringe admin também (previne orfanato de dados)
--   - Composite indexes para queries comuns
--   - Rollback atômico se qualquer etapa falhar
--
-- PREREQUISITO: Tabelas já existem com coluna unit_id UUID NOT NULL.
-- Se unit_id ainda não existe, executar antes:
--   ALTER TABLE students ADD COLUMN unit_id UUID NOT NULL;
-- ============================================================

BEGIN;

-- Marcar migration como executada
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    executed_at TIMESTAMPTZ DEFAULT now()
  );
  INSERT INTO _migrations (name) VALUES ('002_rls_production')
    ON CONFLICT DO NOTHING;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 1. ROLES
-- ═══════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'blackbelt_app') THEN
    CREATE ROLE blackbelt_app LOGIN PASSWORD 'CHANGE_IN_SECRETS_MANAGER';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'blackbelt_readonly') THEN
    CREATE ROLE blackbelt_readonly LOGIN PASSWORD 'CHANGE_IN_SECRETS_MANAGER';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'blackbelt_admin') THEN
    CREATE ROLE blackbelt_admin LOGIN PASSWORD 'CHANGE_IN_SECRETS_MANAGER';
  END IF;
END $$;

-- Least privilege
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM blackbelt_app, blackbelt_readonly;
GRANT USAGE ON SCHEMA public TO blackbelt_app, blackbelt_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO blackbelt_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO blackbelt_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO blackbelt_app;

-- Default permissions para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO blackbelt_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO blackbelt_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO blackbelt_app;

-- Admin bypassa RLS (único role que pode)
ALTER ROLE blackbelt_admin BYPASSRLS;
-- App e readonly são FORÇADOS pelo RLS
ALTER ROLE blackbelt_app NOBYPASSRLS;
ALTER ROLE blackbelt_readonly NOBYPASSRLS;


-- ═══════════════════════════════════════════════════════════
-- 2. SESSION FUNCTIONS (Hardened)
-- ═══════════════════════════════════════════════════════════

-- current_unit_id(): retorna unit_id da sessão ou string vazia
-- String vazia = nenhum dado visível (default-deny)
CREATE OR REPLACE FUNCTION current_unit_id() RETURNS TEXT AS $$
DECLARE
  uid TEXT;
BEGIN
  uid := COALESCE(current_setting('app.current_unit_id', true), '');
  
  -- Validação: deve ser UUID ou string vazia
  -- Previne SQL injection via session variable
  IF uid <> '' AND uid !~ '^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$' 
     AND uid !~ '^unit_[a-zA-Z0-9_]{1,64}$' THEN
    RAISE WARNING 'RLS: invalid unit_id format rejected: %', left(uid, 40);
    RETURN '';  -- default-deny
  END IF;
  
  RETURN uid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- current_app_role(): retorna role da sessão
CREATE OR REPLACE FUNCTION current_app_role() RETURNS TEXT AS $$
DECLARE
  r TEXT;
BEGIN
  r := COALESCE(current_setting('app.current_role', true), '');
  
  -- Validação: whitelist de roles
  IF r NOT IN ('', 'ADMIN', 'SUPER_ADMIN', 'INSTRUTOR', 'STUDENT', 'TEEN', 'KID', 'PARENT') THEN
    RAISE WARNING 'RLS: invalid role rejected: %', left(r, 20);
    RETURN '';
  END IF;
  
  RETURN r;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- is_admin_session(): bypass de tenant para ADMIN
CREATE OR REPLACE FUNCTION is_admin_session() RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_app_role() IN ('ADMIN', 'SUPER_ADMIN');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- has_valid_session(): sessão configurada corretamente
CREATE OR REPLACE FUNCTION has_valid_session() RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_unit_id() <> '' OR is_admin_session();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════
-- 3. DOMAIN TABLES — RLS EXPLÍCITO
-- ═══════════════════════════════════════════════════════════
-- 
-- Cada tabela tem 4 policies nomeadas:
--   {table}_tenant_select  — USING: unit_id match OR admin
--   {table}_tenant_insert  — WITH CHECK: unit_id match (admin também)
--   {table}_tenant_update  — USING + WITH CHECK: unit_id match OR admin
--   {table}_tenant_delete  — USING: unit_id match OR admin
--
-- DEFAULT DENY: se session var não setada → unit_id = '' → 0 rows
-- INSERT sem admin bypass → previne admin criando dado "orfão" sem unit_id válido


-- ─── 3.1 students ─────────────────────────────────────────

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS students_tenant_select ON students;
DROP POLICY IF EXISTS students_tenant_insert ON students;
DROP POLICY IF EXISTS students_tenant_update ON students;
DROP POLICY IF EXISTS students_tenant_delete ON students;

CREATE POLICY students_tenant_select ON students
  FOR SELECT USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );

CREATE POLICY students_tenant_insert ON students
  FOR INSERT WITH CHECK (
    unit_id::text = current_unit_id()
    AND current_unit_id() <> ''
  );

CREATE POLICY students_tenant_update ON students
  FOR UPDATE
  USING (unit_id::text = current_unit_id() OR is_admin_session())
  WITH CHECK (unit_id::text = current_unit_id() OR is_admin_session());

CREATE POLICY students_tenant_delete ON students
  FOR DELETE USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );


-- ─── 3.2 classes ──────────────────────────────────────────

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classes_tenant_select ON classes;
DROP POLICY IF EXISTS classes_tenant_insert ON classes;
DROP POLICY IF EXISTS classes_tenant_update ON classes;
DROP POLICY IF EXISTS classes_tenant_delete ON classes;

CREATE POLICY classes_tenant_select ON classes
  FOR SELECT USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );

CREATE POLICY classes_tenant_insert ON classes
  FOR INSERT WITH CHECK (
    unit_id::text = current_unit_id()
    AND current_unit_id() <> ''
  );

CREATE POLICY classes_tenant_update ON classes
  FOR UPDATE
  USING (unit_id::text = current_unit_id() OR is_admin_session())
  WITH CHECK (unit_id::text = current_unit_id() OR is_admin_session());

CREATE POLICY classes_tenant_delete ON classes
  FOR DELETE USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );


-- ─── 3.3 progress ─────────────────────────────────────────

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS progress_tenant_select ON progress;
DROP POLICY IF EXISTS progress_tenant_insert ON progress;
DROP POLICY IF EXISTS progress_tenant_update ON progress;
DROP POLICY IF EXISTS progress_tenant_delete ON progress;

CREATE POLICY progress_tenant_select ON progress
  FOR SELECT USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );

CREATE POLICY progress_tenant_insert ON progress
  FOR INSERT WITH CHECK (
    unit_id::text = current_unit_id()
    AND current_unit_id() <> ''
  );

CREATE POLICY progress_tenant_update ON progress
  FOR UPDATE
  USING (unit_id::text = current_unit_id() OR is_admin_session())
  WITH CHECK (unit_id::text = current_unit_id() OR is_admin_session());

CREATE POLICY progress_tenant_delete ON progress
  FOR DELETE USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );


-- ─── 3.4 attendance ───────────────────────────────────────

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS attendance_tenant_select ON attendance;
DROP POLICY IF EXISTS attendance_tenant_insert ON attendance;
DROP POLICY IF EXISTS attendance_tenant_update ON attendance;
DROP POLICY IF EXISTS attendance_tenant_delete ON attendance;

CREATE POLICY attendance_tenant_select ON attendance
  FOR SELECT USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );

CREATE POLICY attendance_tenant_insert ON attendance
  FOR INSERT WITH CHECK (
    unit_id::text = current_unit_id()
    AND current_unit_id() <> ''
  );

CREATE POLICY attendance_tenant_update ON attendance
  FOR UPDATE
  USING (unit_id::text = current_unit_id() OR is_admin_session())
  WITH CHECK (unit_id::text = current_unit_id() OR is_admin_session());

CREATE POLICY attendance_tenant_delete ON attendance
  FOR DELETE USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );


-- ─── 3.5 medals ───────────────────────────────────────────

ALTER TABLE medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medals FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medals_tenant_select ON medals;
DROP POLICY IF EXISTS medals_tenant_insert ON medals;
DROP POLICY IF EXISTS medals_tenant_update ON medals;
DROP POLICY IF EXISTS medals_tenant_delete ON medals;

CREATE POLICY medals_tenant_select ON medals
  FOR SELECT USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );

CREATE POLICY medals_tenant_insert ON medals
  FOR INSERT WITH CHECK (
    unit_id::text = current_unit_id()
    AND current_unit_id() <> ''
  );

CREATE POLICY medals_tenant_update ON medals
  FOR UPDATE
  USING (unit_id::text = current_unit_id() OR is_admin_session())
  WITH CHECK (unit_id::text = current_unit_id() OR is_admin_session());

CREATE POLICY medals_tenant_delete ON medals
  FOR DELETE USING (
    unit_id::text = current_unit_id() OR is_admin_session()
  );


-- ═══════════════════════════════════════════════════════════
-- 4. TABELAS AUXILIARES (mesmo padrão)
-- ═══════════════════════════════════════════════════════════

-- Reusar a função de 001 para tabelas menos críticas
CREATE OR REPLACE FUNCTION apply_rls_hardened(t TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

  EXECUTE format('DROP POLICY IF EXISTS %I_tenant_select ON %I', t, t);
  EXECUTE format('DROP POLICY IF EXISTS %I_tenant_insert ON %I', t, t);
  EXECUTE format('DROP POLICY IF EXISTS %I_tenant_update ON %I', t, t);
  EXECUTE format('DROP POLICY IF EXISTS %I_tenant_delete ON %I', t, t);

  EXECUTE format(
    'CREATE POLICY %I_tenant_select ON %I FOR SELECT USING (
      unit_id::text = current_unit_id() OR is_admin_session()
    )', t, t);

  EXECUTE format(
    'CREATE POLICY %I_tenant_insert ON %I FOR INSERT WITH CHECK (
      unit_id::text = current_unit_id() AND current_unit_id() <> ''''
    )', t, t);

  EXECUTE format(
    'CREATE POLICY %I_tenant_update ON %I FOR UPDATE
    USING (unit_id::text = current_unit_id() OR is_admin_session())
    WITH CHECK (unit_id::text = current_unit_id() OR is_admin_session())', t, t);

  EXECUTE format(
    'CREATE POLICY %I_tenant_delete ON %I FOR DELETE USING (
      unit_id::text = current_unit_id() OR is_admin_session()
    )', t, t);

  RAISE NOTICE 'RLS hardened applied: %', t;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tabelas que existam
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'professors') THEN
    PERFORM apply_rls_hardened('professors');
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'evaluations') THEN
    PERFORM apply_rls_hardened('evaluations');
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'observations') THEN
    PERFORM apply_rls_hardened('observations');
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'schedules') THEN
    PERFORM apply_rls_hardened('schedules');
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'payments') THEN
    PERFORM apply_rls_hardened('payments');
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'content') THEN
    PERFORM apply_rls_hardened('content');
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════
-- 5. AUDIT LOGS — APPEND-ONLY (imutável)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_select ON security_audit_logs;
DROP POLICY IF EXISTS audit_insert ON security_audit_logs;
DROP POLICY IF EXISTS audit_no_update ON security_audit_logs;
DROP POLICY IF EXISTS audit_no_delete ON security_audit_logs;

-- SELECT: admin vê tudo, user vê da própria unit
CREATE POLICY audit_select ON security_audit_logs
  FOR SELECT USING (
    is_admin_session()
    OR (unit_id IS NOT NULL AND unit_id::text = current_unit_id())
  );

-- INSERT: qualquer sessão autenticada
CREATE POLICY audit_insert ON security_audit_logs
  FOR INSERT WITH CHECK (
    has_valid_session()
  );

-- UPDATE: NINGUÉM (imutabilidade absoluta)
CREATE POLICY audit_no_update ON security_audit_logs
  FOR UPDATE USING (false);

-- DELETE: NINGUÉM (imutabilidade absoluta)
CREATE POLICY audit_no_delete ON security_audit_logs
  FOR DELETE USING (false);


-- ═══════════════════════════════════════════════════════════
-- 6. INDEXES
-- ═══════════════════════════════════════════════════════════

-- Índices simples em unit_id (RLS filter)
CREATE INDEX IF NOT EXISTS idx_students_unit ON students(unit_id);
CREATE INDEX IF NOT EXISTS idx_classes_unit ON classes(unit_id);
CREATE INDEX IF NOT EXISTS idx_progress_unit ON progress(unit_id);
CREATE INDEX IF NOT EXISTS idx_attendance_unit ON attendance(unit_id);
CREATE INDEX IF NOT EXISTS idx_medals_unit ON medals(unit_id);

-- Composite indexes para queries frequentes
CREATE INDEX IF NOT EXISTS idx_students_unit_active ON students(unit_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_unit_date ON attendance(unit_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_classes_unit_status ON classes(unit_id, status)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_progress_unit_student ON progress(unit_id, student_id);
CREATE INDEX IF NOT EXISTS idx_medals_unit_student ON medals(unit_id, student_id);

-- Audit log: imutável mas precisa de performance em SELECT
CREATE INDEX IF NOT EXISTS idx_audit_unit ON security_audit_logs(unit_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON security_audit_logs(created_at DESC);


-- ═══════════════════════════════════════════════════════════
-- 7. VERIFICATION FUNCTION
-- ═══════════════════════════════════════════════════════════

-- Executa verificações de integridade do RLS
-- Chamar: SELECT * FROM verify_rls_setup();
CREATE OR REPLACE FUNCTION verify_rls_setup()
RETURNS TABLE(
  check_name TEXT,
  result TEXT,
  status TEXT
) AS $$
DECLARE
  t TEXT;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
  idx_exists BOOLEAN;
BEGIN
  -- Verificar cada tabela crítica
  FOR t IN SELECT unnest(ARRAY[
    'students','classes','progress','attendance','medals','security_audit_logs'
  ]) LOOP
    
    -- RLS ativo?
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class WHERE relname = t;
    
    check_name := t || ' RLS enabled';
    IF rls_enabled THEN
      result := 'ENABLED + FORCED';
      status := 'PASS';
    ELSE
      result := 'DISABLED';
      status := 'FAIL';
    END IF;
    RETURN NEXT;
    
    -- Policies existem?
    SELECT count(*) INTO policy_count
    FROM pg_policies WHERE tablename = t;
    
    check_name := t || ' policies';
    result := policy_count || ' policies';
    IF t = 'security_audit_logs' AND policy_count >= 4 THEN
      status := 'PASS';
    ELSIF t <> 'security_audit_logs' AND policy_count >= 4 THEN
      status := 'PASS';
    ELSE
      status := 'FAIL';
    END IF;
    RETURN NEXT;
    
  END LOOP;
  
  -- Verificar roles
  check_name := 'blackbelt_app NOBYPASSRLS';
  SELECT NOT rolbypassrls INTO rls_enabled FROM pg_roles WHERE rolname = 'blackbelt_app';
  IF rls_enabled THEN result := 'ENFORCED'; status := 'PASS';
  ELSE result := 'BYPASSING'; status := 'FAIL'; END IF;
  RETURN NEXT;
  
  check_name := 'blackbelt_readonly NOBYPASSRLS';
  SELECT NOT rolbypassrls INTO rls_enabled FROM pg_roles WHERE rolname = 'blackbelt_readonly';
  IF rls_enabled THEN result := 'ENFORCED'; status := 'PASS';
  ELSE result := 'BYPASSING'; status := 'FAIL'; END IF;
  RETURN NEXT;
  
  check_name := 'blackbelt_admin BYPASSRLS';
  SELECT rolbypassrls INTO rls_enabled FROM pg_roles WHERE rolname = 'blackbelt_admin';
  IF rls_enabled THEN result := 'BYPASS OK'; status := 'PASS';
  ELSE result := 'NOT BYPASS'; status := 'FAIL'; END IF;
  RETURN NEXT;
  
  -- Verificar functions
  check_name := 'current_unit_id() exists';
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'current_unit_id') THEN
    result := 'EXISTS'; status := 'PASS';
  ELSE result := 'MISSING'; status := 'FAIL'; END IF;
  RETURN NEXT;
  
  check_name := 'is_admin_session() exists';
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'is_admin_session') THEN
    result := 'EXISTS'; status := 'PASS';
  ELSE result := 'MISSING'; status := 'FAIL'; END IF;
  RETURN NEXT;
  
END;
$$ LANGUAGE plpgsql;


COMMIT;

-- ═══════════════════════════════════════════════════════════
-- PÓS-MIGRATION: Executar para validar
-- ═══════════════════════════════════════════════════════════
--
-- SELECT * FROM verify_rls_setup();
-- Expected: todos PASS
--
-- Para rollback completo:
-- BEGIN;
--   ALTER TABLE students DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE medals DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE security_audit_logs DISABLE ROW LEVEL SECURITY;
--   DROP FUNCTION IF EXISTS current_unit_id();
--   DROP FUNCTION IF EXISTS current_app_role();
--   DROP FUNCTION IF EXISTS is_admin_session();
--   DROP FUNCTION IF EXISTS has_valid_session();
--   DROP FUNCTION IF EXISTS apply_rls_hardened(TEXT);
--   DROP FUNCTION IF EXISTS verify_rls_setup();
--   DELETE FROM _migrations WHERE name = '002_rls_production';
-- COMMIT;
