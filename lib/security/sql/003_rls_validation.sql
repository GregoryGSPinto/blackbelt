-- ============================================================
-- BLACKBELT — RLS Validation Test Suite
-- 
-- Execução:
--   psql -U blackbelt_app -d blackbelt -f 003_rls_validation.sql
--
-- NOTA: Executar como blackbelt_app (não admin), senão RLS é bypassed.
-- Cada teste é SELECT/INSERT/UPDATE/DELETE que verifica o comportamento.
-- Resultado esperado: todos os counts e erros conforme comentários.
-- ============================================================

\echo '════════════════════════════════════════════════════'
\echo ' BLACKBELT — RLS Validation Test Suite'
\echo ' Executando como: ' :USER
\echo '════════════════════════════════════════════════════'
\echo ''

-- ─── SETUP: Seed data para testes ───

\echo '── SETUP: Criando dados de teste ──'

-- Rodar como admin para inserir seed data
-- Se executando como blackbelt_app, precisa SET primeiro
SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';

INSERT INTO students (id, name, email, unit_id, status, created_at)
VALUES
  ('stu_001', 'João Silva', 'joao@unit1.com', 'unit_001', 'ACTIVE', now()),
  ('stu_002', 'Maria Santos', 'maria@unit1.com', 'unit_001', 'ACTIVE', now())
ON CONFLICT (id) DO NOTHING;

SET app.current_unit_id = 'unit_002';

INSERT INTO students (id, name, email, unit_id, status, created_at)
VALUES
  ('stu_003', 'Pedro Costa', 'pedro@unit2.com', 'unit_002', 'ACTIVE', now()),
  ('stu_004', 'Ana Lima', 'ana@unit2.com', 'unit_002', 'ACTIVE', now())
ON CONFLICT (id) DO NOTHING;

RESET app.current_unit_id;
RESET app.current_role;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 1: Verificação de setup (verify_rls_setup)'
\echo '════════════════════════════════════════════════════'

-- Precisa executar como admin para ver pg_roles
-- Se como blackbelt_app, este teste pode falhar parcialmente
SET app.current_role = 'ADMIN';
SELECT * FROM verify_rls_setup();
RESET app.current_role;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 2: Sessão sem SET → 0 linhas (default-deny)'
\echo '════════════════════════════════════════════════════'

-- Sem SET: current_unit_id() = '' → nenhuma row match
RESET app.current_unit_id;
RESET app.current_role;

SELECT count(*) AS "expect_0_no_session" FROM students;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 3: SET unit_001 → apenas unit_001'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';

SELECT count(*) AS "expect_2_unit001" FROM students;
SELECT id, name, unit_id FROM students ORDER BY id;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 4: SET unit_002 → apenas unit_002'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_002';
SET app.current_role = 'INSTRUTOR';

SELECT count(*) AS "expect_2_unit002" FROM students;
SELECT id, name, unit_id FROM students ORDER BY id;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 5: ADMIN → vê TODAS as unidades'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'ADMIN';

SELECT count(*) AS "expect_4_admin_sees_all" FROM students;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 6: Cross-unit INSERT → BLOQUEADO'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';

-- Tentar inserir com unit_id diferente do SET → deve falhar
\echo 'Tentando INSERT com unit_id=unit_002 enquanto sessão é unit_001...'
\echo '(Esperado: ERROR - new row violates row-level security policy)'

DO $$ BEGIN
  INSERT INTO students (id, name, email, unit_id, status, created_at)
  VALUES ('stu_hack', 'Hacker', 'hack@evil.com', 'unit_002', 'ACTIVE', now());
  RAISE NOTICE 'FAIL: Insert should have been blocked!';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: Cross-unit INSERT correctly blocked by RLS';
END $$;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 7: Cross-unit UPDATE → BLOQUEADO'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';

-- Tentar atualizar student de unit_002 → deve afetar 0 rows
UPDATE students SET name = 'Hacked' WHERE id = 'stu_003';
-- stu_003 é unit_002, sessão é unit_001 → 0 rows affected

\echo 'UPDATE de stu_003 (unit_002) com sessão unit_001:'
SELECT name AS "expect_Pedro_Costa_unchanged" FROM students WHERE id = 'stu_003';

-- Mudar para unit_002 para verificar que não mudou
SET app.current_unit_id = 'unit_002';
SELECT name AS "confirm_unchanged" FROM students WHERE id = 'stu_003';

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 8: Cross-unit DELETE → BLOQUEADO'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';

-- Tentar deletar student de unit_002 → 0 rows affected
DELETE FROM students WHERE id = 'stu_003';

-- Verificar que stu_003 ainda existe
SET app.current_unit_id = 'unit_002';
SELECT count(*) AS "expect_1_still_exists" FROM students WHERE id = 'stu_003';

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 9: Audit log imutável'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';

-- INSERT deve funcionar
INSERT INTO security_audit_logs (id, action, unit_id, created_at)
VALUES ('audit_test_001', 'RLS_VALIDATION', 'unit_001', now())
ON CONFLICT (id) DO NOTHING;

\echo 'INSERT em audit log: OK'

-- UPDATE deve falhar
\echo 'Tentando UPDATE em audit log...'
\echo '(Esperado: ERROR - new row violates row-level security policy)'

DO $$ BEGIN
  UPDATE security_audit_logs SET action = 'HACKED' WHERE id = 'audit_test_001';
  RAISE NOTICE 'FAIL: Audit UPDATE should have been blocked!';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: Audit UPDATE correctly blocked (immutable)';
END $$;

-- DELETE deve falhar
\echo 'Tentando DELETE em audit log...'
\echo '(Esperado: ERROR - new row violates row-level security policy)'

DO $$ BEGIN
  DELETE FROM security_audit_logs WHERE id = 'audit_test_001';
  RAISE NOTICE 'FAIL: Audit DELETE should have been blocked!';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: Audit DELETE correctly blocked (immutable)';
END $$;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 10: SQL Injection via session variable'
\echo '════════════════════════════════════════════════════'

-- Tentar injetar SQL via SET
SET app.current_unit_id = ''' OR 1=1 --';
SET app.current_role = 'INSTRUTOR';

SELECT count(*) AS "expect_0_injection_blocked" FROM students;

\echo 'SQL injection via session var: count deve ser 0'

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 11: Invalid role → 0 linhas'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'HACKER_ROLE';

SELECT count(*) AS "expect_0_invalid_role" FROM students;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' TEST 12: EXPLAIN verifica uso de índice'
\echo '════════════════════════════════════════════════════'

SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';

EXPLAIN (COSTS OFF) SELECT * FROM students WHERE status = 'ACTIVE';

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' CLEANUP: Remover seed data'
\echo '════════════════════════════════════════════════════'

-- Precisa voltar para cada unit para deletar
SET app.current_unit_id = 'unit_001';
SET app.current_role = 'INSTRUTOR';
DELETE FROM security_audit_logs WHERE id = 'audit_test_001';
DELETE FROM students WHERE id IN ('stu_001', 'stu_002');

SET app.current_unit_id = 'unit_002';
DELETE FROM students WHERE id IN ('stu_003', 'stu_004');

-- Cleanup hacker attempt (should not exist but just in case)
DELETE FROM students WHERE id = 'stu_hack';

RESET app.current_unit_id;
RESET app.current_role;

\echo ''
\echo '════════════════════════════════════════════════════'
\echo ' RESULTADO'
\echo '════════════════════════════════════════════════════'
\echo ''
\echo '  Test 1:  verify_rls_setup()  → all PASS'
\echo '  Test 2:  No session          → 0 rows (default-deny)'
\echo '  Test 3:  unit_001            → 2 rows (own unit)'
\echo '  Test 4:  unit_002            → 2 rows (own unit)'
\echo '  Test 5:  ADMIN               → 4 rows (all units)'
\echo '  Test 6:  Cross-unit INSERT   → BLOCKED'
\echo '  Test 7:  Cross-unit UPDATE   → 0 rows affected'
\echo '  Test 8:  Cross-unit DELETE   → 0 rows affected'
\echo '  Test 9:  Audit immutability  → UPDATE/DELETE blocked'
\echo '  Test 10: SQL injection       → 0 rows (blocked)'
\echo '  Test 11: Invalid role        → 0 rows (blocked)'
\echo '  Test 12: Index usage         → Verify EXPLAIN output'
\echo ''
\echo '  Se todos passaram: RLS está pronto para produção.'
\echo '════════════════════════════════════════════════════'
