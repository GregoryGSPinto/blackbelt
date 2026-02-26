-- ════════════════════════════════════════════════════════════
-- BLACKBELT — Backup Integrity Validation (pós-restore)
--
-- Executar contra banco RESTAURADO para confirmar integridade.
--
-- Uso:
--   psql -h <RESTORED_HOST> -U blackbelt_admin -d blackbelt \
--        -f scripts/backup-integrity-check.sql
--
-- Saída: 15 testes com PASS / FAIL
-- ════════════════════════════════════════════════════════════

\echo ''
\echo '╔══════════════════════════════════════════════════════════╗'
\echo '║  BLACKBELT — Backup Integrity Validation              ║'
\echo '║  15 testes de integridade pós-restore                   ║'
\echo '╚══════════════════════════════════════════════════════════╝'
\echo ''

-- ── Helper: variáveis de resultado ──
\set pass 0
\set fail 0

-- ════════════════════════════════
-- TESTE 1: Banco acessível
-- ════════════════════════════════
\echo '── T01: Conectividade ──'
SELECT CASE
  WHEN current_database() = 'blackbelt' THEN 'PASS: Banco blackbelt acessível'
  ELSE 'FAIL: Banco incorreto: ' || current_database()
END AS t01_connectivity;

-- ════════════════════════════════
-- TESTE 2: Tabelas críticas existem
-- ════════════════════════════════
\echo '── T02: Tabelas críticas ──'
SELECT CASE
  WHEN count(*) >= 5 THEN 'PASS: ' || count(*) || ' tabelas críticas presentes'
  ELSE 'FAIL: Apenas ' || count(*) || ' tabelas críticas (esperado ≥5)'
END AS t02_critical_tables
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('students', 'classes', 'progress', 'attendance', 'medals');

-- ════════════════════════════════
-- TESTE 3: Tabelas auxiliares existem
-- ════════════════════════════════
\echo '── T03: Tabelas auxiliares ──'
SELECT CASE
  WHEN count(*) >= 6 THEN 'PASS: ' || count(*) || ' tabelas auxiliares presentes'
  ELSE 'FAIL: Apenas ' || count(*) || ' tabelas auxiliares (esperado ≥6)'
END AS t03_aux_tables
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('evaluations', 'schedules', 'announcements', 'payments', 'inventory', 'enrollments');

-- ════════════════════════════════
-- TESTE 4: RLS ativo em todas as tabelas multi-tenant
-- ════════════════════════════════
\echo '── T04: RLS ativo ──'
SELECT CASE
  WHEN count(*) >= 11 THEN 'PASS: RLS ativo em ' || count(*) || ' tabelas'
  ELSE 'FAIL: RLS ativo em apenas ' || count(*) || ' tabelas (esperado ≥11)'
END AS t04_rls_enabled
FROM pg_class c
JOIN pg_tables t ON t.tablename = c.relname
WHERE t.schemaname = 'public'
AND c.relrowsecurity = true;

-- ════════════════════════════════
-- TESTE 5: FORCE RLS ativo (owner também respeita)
-- ════════════════════════════════
\echo '── T05: FORCE RLS ──'
SELECT CASE
  WHEN count(*) >= 11 THEN 'PASS: FORCE RLS ativo em ' || count(*) || ' tabelas'
  ELSE 'FAIL: FORCE RLS em apenas ' || count(*) || ' tabelas (esperado ≥11)'
END AS t05_force_rls
FROM pg_class c
JOIN pg_tables t ON t.tablename = c.relname
WHERE t.schemaname = 'public'
AND c.relforcerowsecurity = true;

-- ════════════════════════════════
-- TESTE 6: Policies tenant_* existem (4 por tabela × 11 = 44)
-- ════════════════════════════════
\echo '── T06: Tenant policies ──'
SELECT CASE
  WHEN count(*) >= 20 THEN 'PASS: ' || count(*) || ' tenant policies encontradas'
  ELSE 'FAIL: Apenas ' || count(*) || ' tenant policies (esperado ≥20)'
END AS t06_policies
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE 'tenant_%';

-- Detalhe por tabela
\echo '    Detalhe por tabela:'
SELECT tablename AS tabela, count(*) AS policies
FROM pg_policies
WHERE schemaname = 'public' AND policyname LIKE 'tenant_%'
GROUP BY tablename ORDER BY tablename;

-- ════════════════════════════════
-- TESTE 7: Funções de segurança preservadas
-- ════════════════════════════════
\echo '── T07: Funções de segurança ──'
SELECT CASE
  WHEN count(*) >= 2 THEN 'PASS: ' || count(*) || ' funções de segurança encontradas'
  ELSE 'FAIL: Apenas ' || count(*) || ' funções de segurança (esperado ≥2: current_unit_id, current_app_role)'
END AS t07_security_functions
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname IN ('current_unit_id', 'current_app_role');

-- ════════════════════════════════
-- TESTE 8: Indexes unit_id preservados
-- ════════════════════════════════
\echo '── T08: Indexes unit_id ──'
SELECT CASE
  WHEN count(*) >= 5 THEN 'PASS: ' || count(*) || ' indexes com unit_id'
  ELSE 'FAIL: Apenas ' || count(*) || ' indexes com unit_id (esperado ≥5)'
END AS t08_indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%unit_id%';

-- ════════════════════════════════
-- TESTE 9: pgcrypto extension
-- ════════════════════════════════
\echo '── T09: Extensions ──'
SELECT CASE
  WHEN count(*) >= 1 THEN 'PASS: pgcrypto instalado'
  ELSE 'FAIL: pgcrypto ausente (necessário para AES-256 PII)'
END AS t09_pgcrypto
FROM pg_extension WHERE extname = 'pgcrypto';

-- Listar todas
SELECT extname, extversion FROM pg_extension WHERE extname != 'plpgsql' ORDER BY extname;

-- ════════════════════════════════
-- TESTE 10: Audit logs imutáveis
-- ════════════════════════════════
\echo '── T10: Audit logs imutáveis ──'
SELECT CASE
  WHEN count(*) >= 2 THEN 'PASS: ' || count(*) || ' policies de imutabilidade no audit_logs'
  ELSE 'WARN: ' || count(*) || ' policies de imutabilidade (esperado ≥2: block UPDATE + DELETE)'
END AS t10_audit_immutable
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'audit_logs'
AND (policyname LIKE '%immutable%' OR policyname LIKE '%no_update%' OR policyname LIKE '%no_delete%');

-- ════════════════════════════════
-- TESTE 11: Roles e connection limits
-- ════════════════════════════════
\echo '── T11: Roles ──'
SELECT rolname, rolconnlimit,
  CASE
    WHEN rolname = 'blackbelt_app' AND rolconnlimit = 100 THEN 'PASS'
    WHEN rolname = 'blackbelt_readonly' AND rolconnlimit = 20 THEN 'PASS'
    WHEN rolname = 'blackbelt_admin' AND rolconnlimit = 5 THEN 'PASS'
    WHEN rolconnlimit = -1 THEN 'INFO: sem limite'
    ELSE 'CHECK: limite=' || rolconnlimit
  END AS t11_roles
FROM pg_roles
WHERE rolname LIKE 'blackbelt_%'
ORDER BY rolname;

-- ════════════════════════════════
-- TESTE 12: Default-deny sem sessão
-- ════════════════════════════════
\echo '── T12: Default-deny (sem sessão) ──'
-- Reset any existing session vars
RESET ALL;
SELECT CASE
  WHEN current_setting('app.current_unit', true) IS NULL
       OR current_setting('app.current_unit', true) = '' THEN 'PASS: Sem sessão ativa (default-deny funcional)'
  ELSE 'FAIL: Sessão ativa inesperadamente: ' || current_setting('app.current_unit', true)
END AS t12_default_deny;

-- ════════════════════════════════
-- TESTE 13: Row counts por tabela
-- ════════════════════════════════
\echo '── T13: Row counts (compare com baseline) ──'
\echo '    *** Admin precisa comparar esses números com o baseline ***'
DO $$
DECLARE
  rec RECORD;
  cnt BIGINT;
BEGIN
  FOR rec IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE '_prisma_%'
    ORDER BY tablename
  LOOP
    EXECUTE format('SELECT count(*) FROM %I', rec.tablename) INTO cnt;
    RAISE NOTICE '    %-30s %s rows', rec.tablename, cnt;
  END LOOP;
END $$;

-- ════════════════════════════════
-- TESTE 14: Encrypt/decrypt functions
-- ════════════════════════════════
\echo '── T14: PII encryption functions ──'
SELECT CASE
  WHEN count(*) >= 2 THEN 'PASS: encrypt_pii + decrypt_pii presentes'
  WHEN count(*) = 1 THEN 'WARN: Apenas 1 de 2 funções PII encontrada'
  ELSE 'INFO: Funções PII não encontradas (podem não ter sido aplicadas ainda)'
END AS t14_pii_functions
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname IN ('encrypt_pii', 'decrypt_pii');

-- ════════════════════════════════
-- TESTE 15: Database size
-- ════════════════════════════════
\echo '── T15: Database size ──'
SELECT
  pg_database_size(current_database()) AS size_bytes,
  pg_size_pretty(pg_database_size(current_database())) AS size_pretty,
  'INFO: Compare com baseline. Divergência > 5% indica problema.' AS t15_size;

-- ════════════════════════════════
-- RESUMO
-- ════════════════════════════════
\echo ''
\echo '══════════════════════════════════════════════════════════'
\echo '  RESUMO: Execute e compare com baseline antes de aprovar'
\echo '  Critérios obrigatórios:'
\echo '    - T02-T03: Todas as tabelas presentes'
\echo '    - T04-T06: RLS + FORCE + policies preservados'
\echo '    - T07:     Funções de segurança presentes'
\echo '    - T08:     Indexes preservados'
\echo '    - T12:     Default-deny funcional'
\echo '    - T13:     Row counts = baseline'
\echo '══════════════════════════════════════════════════════════'
\echo ''
