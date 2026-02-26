-- ============================================================
-- BLACKBELT — Row-Level Security (RLS) Migration
-- Fase 2: Fortalecimento
-- 
-- Execução: psql -U blackbelt_admin -d blackbelt -f 001_rls_policies.sql
--
-- REGRA: Todo SELECT/INSERT/UPDATE/DELETE em tabela com unit_id
--        é filtrado automaticamente pelo PostgreSQL.
--        Aplicação NUNCA controla tenant isolation sozinha.
-- ============================================================

BEGIN;

-- ─── 1. App roles com privilégio mínimo ───

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'blackbelt_app') THEN
    CREATE ROLE blackbelt_app LOGIN PASSWORD 'CHANGE_ME_USE_SECRETS_MANAGER';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'blackbelt_readonly') THEN
    CREATE ROLE blackbelt_readonly LOGIN PASSWORD 'CHANGE_ME_USE_SECRETS_MANAGER';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'blackbelt_admin') THEN
    CREATE ROLE blackbelt_admin LOGIN PASSWORD 'CHANGE_ME_USE_SECRETS_MANAGER';
  END IF;
END $$;

-- Permissões base
GRANT USAGE ON SCHEMA public TO blackbelt_app, blackbelt_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO blackbelt_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO blackbelt_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO blackbelt_app;

-- Admin bypassa RLS
ALTER ROLE blackbelt_admin BYPASSRLS;

-- ─── 2. Variável de sessão para unit_id ───
-- A aplicação DEVE executar SET antes de qualquer query:
--   SET app.current_unit_id = 'unit_001';
--   SET app.current_role = 'INSTRUTOR';

-- Função helper para ler unit_id da sessão
CREATE OR REPLACE FUNCTION current_unit_id() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_unit_id', true), '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_role() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_role', true), '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Função para verificar se é admin (bypassa tenant filter)
CREATE OR REPLACE FUNCTION is_admin_session() RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_app_role() IN ('ADMIN', 'SUPER_ADMIN');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ─── 3. Tabelas com RLS ───
-- Cada tabela com unit_id recebe:
--   (a) ENABLE RLS
--   (b) Policy SELECT: unit_id = current_unit_id() OR is_admin
--   (c) Policy INSERT: unit_id = current_unit_id() (admin também respeita)
--   (d) Policy UPDATE: unit_id = current_unit_id() OR is_admin
--   (e) Policy DELETE: unit_id = current_unit_id() OR is_admin

-- Macro para aplicar RLS em qualquer tabela com unit_id
CREATE OR REPLACE FUNCTION apply_rls_to_table(table_name TEXT) RETURNS VOID AS $$
BEGIN
  -- Enable RLS (noop se já ativo)
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);

  -- Drop existing policies (idempotente)
  EXECUTE format('DROP POLICY IF EXISTS tenant_select ON %I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS tenant_insert ON %I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS tenant_update ON %I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS tenant_delete ON %I', table_name);

  -- SELECT: ver apenas dados da própria unidade (admin vê tudo)
  EXECUTE format(
    'CREATE POLICY tenant_select ON %I FOR SELECT USING (
      unit_id = current_unit_id() OR is_admin_session()
    )', table_name);

  -- INSERT: só pode inserir na própria unidade
  EXECUTE format(
    'CREATE POLICY tenant_insert ON %I FOR INSERT WITH CHECK (
      unit_id = current_unit_id()
    )', table_name);

  -- UPDATE: só dados da própria unidade (admin pode cross-unit)
  EXECUTE format(
    'CREATE POLICY tenant_update ON %I FOR UPDATE USING (
      unit_id = current_unit_id() OR is_admin_session()
    ) WITH CHECK (
      unit_id = current_unit_id() OR is_admin_session()
    )', table_name);

  -- DELETE: só dados da própria unidade (admin pode cross-unit)
  EXECUTE format(
    'CREATE POLICY tenant_delete ON %I FOR DELETE USING (
      unit_id = current_unit_id() OR is_admin_session()
    )', table_name);

  RAISE NOTICE 'RLS applied to table: %', table_name;
END;
$$ LANGUAGE plpgsql;

-- ─── 4. Aplicar a todas as tabelas do domínio ───

SELECT apply_rls_to_table('students');
SELECT apply_rls_to_table('professors');
SELECT apply_rls_to_table('classes');
SELECT apply_rls_to_table('attendance');
SELECT apply_rls_to_table('progress');
SELECT apply_rls_to_table('evaluations');
SELECT apply_rls_to_table('observations');
SELECT apply_rls_to_table('medals');
SELECT apply_rls_to_table('schedules');
SELECT apply_rls_to_table('payments');
SELECT apply_rls_to_table('units');  -- admin-only na prática
SELECT apply_rls_to_table('content');

-- ─── 5. Audit logs: RLS especial (append-only, sem delete) ───

ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_select ON security_audit_logs;
DROP POLICY IF EXISTS audit_insert ON security_audit_logs;
DROP POLICY IF EXISTS audit_no_update ON security_audit_logs;
DROP POLICY IF EXISTS audit_no_delete ON security_audit_logs;

-- Leitura: admin only
CREATE POLICY audit_select ON security_audit_logs
  FOR SELECT USING (is_admin_session());

-- Insert: qualquer sessão autenticada
CREATE POLICY audit_insert ON security_audit_logs
  FOR INSERT WITH CHECK (current_unit_id() <> '');

-- UPDATE/DELETE bloqueados para TODOS (imutabilidade)
CREATE POLICY audit_no_update ON security_audit_logs
  FOR UPDATE USING (false);
CREATE POLICY audit_no_delete ON security_audit_logs
  FOR DELETE USING (false);

-- ─── 6. Prisma middleware para SET automático ───
-- Comentário: implementar no backend como Prisma middleware:
--
-- prisma.$use(async (params, next) => {
--   const unitId = getUnitIdFromJWT(req);
--   const role = getRoleFromJWT(req);
--   await prisma.$executeRawUnsafe(`SET app.current_unit_id = '${unitId}'`);
--   await prisma.$executeRawUnsafe(`SET app.current_role = '${role}'`);
--   return next(params);
-- });

-- ─── 7. Índice para performance do RLS ───

CREATE INDEX IF NOT EXISTS idx_students_unit_id ON students(unit_id);
CREATE INDEX IF NOT EXISTS idx_professors_unit_id ON professors(unit_id);
CREATE INDEX IF NOT EXISTS idx_classes_unit_id ON classes(unit_id);
CREATE INDEX IF NOT EXISTS idx_attendance_unit_id ON attendance(unit_id);
CREATE INDEX IF NOT EXISTS idx_progress_unit_id ON progress(unit_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_unit_id ON evaluations(unit_id);
CREATE INDEX IF NOT EXISTS idx_observations_unit_id ON observations(unit_id);
CREATE INDEX IF NOT EXISTS idx_medals_unit_id ON medals(unit_id);
CREATE INDEX IF NOT EXISTS idx_schedules_unit_id ON schedules(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_unit_id ON payments(unit_id);
CREATE INDEX IF NOT EXISTS idx_content_unit_id ON content(unit_id);

-- ─── 8. Teste de validação ───

-- Para validar após execução:
-- SET app.current_unit_id = 'unit_001';
-- SET app.current_role = 'INSTRUTOR';
-- SELECT * FROM students;  -- Deve retornar APENAS unit_001
--
-- SET app.current_unit_id = 'unit_002';
-- SELECT * FROM students;  -- Deve retornar APENAS unit_002
--
-- SET app.current_role = 'ADMIN';
-- SELECT * FROM students;  -- Deve retornar TODAS as unidades
--
-- INSERT INTO security_audit_logs (...) VALUES (...);  -- OK
-- UPDATE security_audit_logs SET action = 'x';         -- ERRO (imutável)
-- DELETE FROM security_audit_logs;                     -- ERRO (imutável)

COMMIT;

-- ============================================================
-- ROLLBACK (em caso de problema):
-- ALTER TABLE students DISABLE ROW LEVEL SECURITY;
-- ... (repetir para cada tabela)
-- DROP FUNCTION IF EXISTS current_unit_id();
-- DROP FUNCTION IF EXISTS current_app_role();
-- DROP FUNCTION IF EXISTS is_admin_session();
-- DROP FUNCTION IF EXISTS apply_rls_to_table(TEXT);
-- ============================================================
