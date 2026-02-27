-- seed-test.sql
-- Dados de teste para o BlackBelt Demo
-- NOTA: Usuários são criados via Supabase Auth (scripts/create-test-user.ts)
--       Este SQL cria apenas a academy demo.

INSERT INTO academies (id, name, slug, owner_id, settings, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Academia BlackBelt Demo',
  'blackbelt-demo',
  -- owner_id será atualizado pelo script create-test-user.ts
  -- Usando placeholder que será substituído
  '00000000-0000-0000-0000-000000000000',
  '{"plan": "pro", "features": ["checkin", "gamification", "financial", "progression"]}'::jsonb,
  'active'
);
