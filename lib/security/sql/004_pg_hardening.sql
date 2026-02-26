-- ============================================================
-- BLACKBELT — PostgreSQL Production Hardening
-- Migration: 004_pg_hardening.sql
--
-- Execução: psql -U blackbelt_admin -d blackbelt -f 004_pg_hardening.sql
--
-- NOTA: Algumas configs requerem ALTER SYSTEM (superuser) 
--       ou edição do postgresql.conf. Marcadas com [CONF].
-- ============================================================

BEGIN;

INSERT INTO _migrations (name) VALUES ('004_pg_hardening')
  ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 1. QUERY TIMEOUTS (previne queries runaway)
-- ═══════════════════════════════════════════════════════════

-- Statement timeout: 30 segundos por query
-- Queries lentas abortam automaticamente
ALTER DATABASE blackbelt SET statement_timeout = '30s';

-- Idle transaction: 60 segundos
-- Transações abertas sem atividade são abortadas
ALTER DATABASE blackbelt SET idle_in_transaction_session_timeout = '60s';

-- Lock timeout: 10 segundos
-- Evita wait indefinido por locks
ALTER DATABASE blackbelt SET lock_timeout = '10s';

-- ═══════════════════════════════════════════════════════════
-- 2. CONNECTION SECURITY
-- ═══════════════════════════════════════════════════════════

-- [CONF] postgresql.conf — SSL obrigatório
-- ssl = on
-- ssl_cert_file = '/var/lib/postgresql/server.crt'
-- ssl_key_file = '/var/lib/postgresql/server.key'
-- ssl_min_protocol_version = 'TLSv1.2'

-- [CONF] pg_hba.conf — Forçar SSL para blackbelt_app
-- hostssl blackbelt blackbelt_app 10.0.0.0/8 scram-sha-256
-- hostssl blackbelt blackbelt_readonly 10.0.0.0/8 scram-sha-256
-- host    all    all          0.0.0.0/0  reject

-- Password encryption (SCRAM-SHA-256 instead of MD5)
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- ═══════════════════════════════════════════════════════════
-- 3. CONNECTION LIMITS
-- ═══════════════════════════════════════════════════════════

-- Limitar conexões por role
ALTER ROLE blackbelt_app CONNECTION LIMIT 100;
ALTER ROLE blackbelt_readonly CONNECTION LIMIT 20;
ALTER ROLE blackbelt_admin CONNECTION LIMIT 5;

-- [CONF] postgresql.conf
-- max_connections = 200
-- superuser_reserved_connections = 3

-- ═══════════════════════════════════════════════════════════
-- 4. LOGGING (para SIEM e auditoria)
-- ═══════════════════════════════════════════════════════════

-- Log all DDL and DML statements
ALTER DATABASE blackbelt SET log_statement = 'all';

-- Log queries lentas (> 1 segundo)
ALTER DATABASE blackbelt SET log_min_duration_statement = 1000;

-- Log conexões e desconexões
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';

-- Log lock waits
ALTER SYSTEM SET log_lock_waits = 'on';
ALTER SYSTEM SET deadlock_timeout = '1s';

-- Formato de log para parsing SIEM
ALTER SYSTEM SET log_line_prefix = '%m [%p] %u@%d [%h] ';

-- Log checkpoints para performance
ALTER SYSTEM SET log_checkpoints = 'on';

-- ═══════════════════════════════════════════════════════════
-- 5. EXTENSIONS
-- ═══════════════════════════════════════════════════════════

-- Monitoramento de queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Criptografia de dados (para AES-256 de PII)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- 6. pg_stat_statements CONFIG
-- ═══════════════════════════════════════════════════════════

-- [CONF] postgresql.conf — adicionar ao shared_preload_libraries
-- shared_preload_libraries = 'pg_stat_statements'
-- pg_stat_statements.max = 5000
-- pg_stat_statements.track = 'all'
-- pg_stat_statements.track_utility = on

-- Permitir que blackbelt_app veja suas stats
GRANT EXECUTE ON FUNCTION pg_stat_statements_reset() TO blackbelt_admin;

-- ═══════════════════════════════════════════════════════════
-- 7. REVOKE DANGEROUS PERMISSIONS
-- ═══════════════════════════════════════════════════════════

-- Revogar acesso a pg_catalog para app (previne metadata leak)
-- NOTA: Cuidado — Prisma pode precisar de pg_catalog para introspecção
-- Aplicar apenas se usando Prisma Client (não Prisma Migrate)
-- REVOKE SELECT ON ALL TABLES IN SCHEMA pg_catalog FROM blackbelt_app;

-- Revogar criação de tabelas pelo app
REVOKE CREATE ON SCHEMA public FROM blackbelt_app;
REVOKE CREATE ON SCHEMA public FROM blackbelt_readonly;

-- Revogar acesso a outras databases
REVOKE CONNECT ON DATABASE postgres FROM blackbelt_app;
REVOKE CONNECT ON DATABASE template0 FROM blackbelt_app;
REVOKE CONNECT ON DATABASE template1 FROM blackbelt_app;

-- ═══════════════════════════════════════════════════════════
-- 8. ENCRYPTION HELPERS (para PII)
-- ═══════════════════════════════════════════════════════════

-- Função para cifrar PII com AES-256-CBC
-- Chave vem do Secrets Manager via session variable
CREATE OR REPLACE FUNCTION encrypt_pii(plaintext TEXT) RETURNS TEXT AS $$
DECLARE
  key TEXT;
BEGIN
  key := current_setting('app.encryption_key', true);
  IF key IS NULL OR length(key) < 32 THEN
    RAISE EXCEPTION 'Encryption key not configured or too short';
  END IF;
  RETURN encode(
    pgp_sym_encrypt(plaintext, key, 'cipher-algo=aes256'),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decifrar PII
CREATE OR REPLACE FUNCTION decrypt_pii(ciphertext TEXT) RETURNS TEXT AS $$
DECLARE
  key TEXT;
BEGIN
  key := current_setting('app.encryption_key', true);
  IF key IS NULL OR length(key) < 32 THEN
    RAISE EXCEPTION 'Encryption key not configured or too short';
  END IF;
  RETURN pgp_sym_decrypt(
    decode(ciphertext, 'base64'),
    key
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Decryption failed: %', SQLERRM;
    RETURN '[DECRYPTION_ERROR]';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissões: apenas blackbelt_app pode cifrar/decifrar
REVOKE ALL ON FUNCTION encrypt_pii(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION decrypt_pii(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION encrypt_pii(TEXT) TO blackbelt_app;
GRANT EXECUTE ON FUNCTION decrypt_pii(TEXT) TO blackbelt_app;
GRANT EXECUTE ON FUNCTION encrypt_pii(TEXT) TO blackbelt_admin;
GRANT EXECUTE ON FUNCTION decrypt_pii(TEXT) TO blackbelt_admin;

-- ═══════════════════════════════════════════════════════════
-- 9. VERIFICATION
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION verify_pg_hardening()
RETURNS TABLE(check_name TEXT, current_value TEXT, expected TEXT, status TEXT)
AS $$
BEGIN
  -- statement_timeout
  check_name := 'statement_timeout';
  current_value := current_setting('statement_timeout');
  expected := '30s';
  status := CASE WHEN current_value <> '0' THEN 'PASS' ELSE 'FAIL' END;
  RETURN NEXT;

  -- idle_in_transaction
  check_name := 'idle_in_transaction_session_timeout';
  current_value := current_setting('idle_in_transaction_session_timeout');
  expected := '60s';
  status := CASE WHEN current_value <> '0' THEN 'PASS' ELSE 'FAIL' END;
  RETURN NEXT;

  -- lock_timeout
  check_name := 'lock_timeout';
  current_value := current_setting('lock_timeout');
  expected := '10s';
  status := CASE WHEN current_value <> '0' THEN 'PASS' ELSE 'FAIL' END;
  RETURN NEXT;

  -- ssl
  check_name := 'ssl';
  current_value := current_setting('ssl', true);
  expected := 'on';
  status := CASE WHEN current_value = 'on' THEN 'PASS' ELSE 'WARN' END;
  RETURN NEXT;

  -- password_encryption
  check_name := 'password_encryption';
  current_value := current_setting('password_encryption');
  expected := 'scram-sha-256';
  status := CASE WHEN current_value = 'scram-sha-256' THEN 'PASS' ELSE 'FAIL' END;
  RETURN NEXT;

  -- log_statement
  check_name := 'log_statement';
  current_value := current_setting('log_statement');
  expected := 'all';
  status := CASE WHEN current_value = 'all' THEN 'PASS' ELSE 'WARN' END;
  RETURN NEXT;

  -- pg_stat_statements
  check_name := 'pg_stat_statements';
  SELECT CASE WHEN count(*) > 0 THEN 'installed' ELSE 'missing' END
  INTO current_value FROM pg_extension WHERE extname = 'pg_stat_statements';
  expected := 'installed';
  status := CASE WHEN current_value = 'installed' THEN 'PASS' ELSE 'WARN' END;
  RETURN NEXT;

  -- pgcrypto
  check_name := 'pgcrypto';
  SELECT CASE WHEN count(*) > 0 THEN 'installed' ELSE 'missing' END
  INTO current_value FROM pg_extension WHERE extname = 'pgcrypto';
  expected := 'installed';
  status := CASE WHEN current_value = 'installed' THEN 'PASS' ELSE 'FAIL' END;
  RETURN NEXT;

  -- blackbelt_app connection limit
  check_name := 'blackbelt_app conn_limit';
  SELECT COALESCE(rolconnlimit::text, '-1') INTO current_value FROM pg_roles WHERE rolname = 'blackbelt_app';
  expected := '100';
  status := CASE WHEN current_value::int > 0 THEN 'PASS' ELSE 'WARN' END;
  RETURN NEXT;

END;
$$ LANGUAGE plpgsql;


COMMIT;

-- ═══════════════════════════════════════════════════════════
-- PÓS-MIGRATION:
--   SELECT * FROM verify_pg_hardening();
--
-- RELOAD configs que usam ALTER SYSTEM:
--   SELECT pg_reload_conf();
--
-- VERIFICAR postgresql.conf manualmente:
--   SHOW ssl;
--   SHOW shared_preload_libraries;
--   SHOW max_connections;
-- ═══════════════════════════════════════════════════════════
