-- ================================================================
-- BlackBelt — Comprehensive Seed Data
-- ================================================================
-- Run AFTER migrations
-- This seed creates a complete demo environment with:
-- - 1 Academy (BlackBelt Demo)
-- - 9 User profiles across different roles
-- - 2 Families (Oliveira and Ferreira)
-- - Class schedules for different martial arts
-- - Belt systems for multiple martial arts
-- - Achievement definitions
-- ================================================================

-- ================================================================
-- 1. ACADEMY
-- ================================================================
INSERT INTO academies (id, name, slug, owner_id, settings, address, phone, email, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Academia BlackBelt Demo',
  'blackbelt-demo',
  '00000000-0000-0000-0000-000000000002', -- Will be updated to real admin UUID
  '{
    "plan": "enterprise",
    "features": ["checkin", "gamification", "financial", "progression", "videos", "shop"],
    "theme": {
      "primary": "#DC2626",
      "secondary": "#0d0d1a"
    },
    "settings": {
      "checkinEnabled": true,
      "qrCheckin": true,
      "allowManualCheckin": true
    }
  }'::jsonb,
  '{
    "street": "Rua das Artes Marciais, 100",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01000-000",
    "country": "Brasil"
  }'::jsonb,
  '+55 11 99999-9999',
  'contato@blackbelt-demo.com',
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings;

-- ================================================================
-- 2. BELT SYSTEMS
-- ================================================================
INSERT INTO belt_systems (id, martial_art, name, ranks) VALUES
  ('b0000000-0001-0000-0000-000000000001', 'bjj', 'BJJ Adulto IBJJF', '["Branca","Azul","Roxa","Marrom","Preta","Coral","Vermelha"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000002', 'bjj', 'BJJ Infantil IBJJF', '["Branca","Cinza","Amarela","Laranja","Verde"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000003', 'judo', 'Judô Kodokan', '["Branca (6º kyu)","Amarela (5º kyu)","Laranja (4º kyu)","Verde (3º kyu)","Azul (2º kyu)","Marrom (1º kyu)","Preta (1º dan)","Preta (2º dan)","Preta (3º dan)"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000004', 'muay_thai', 'Muay Thai Tradicional', '["Sem graduação","Prajied Branca","Prajied Amarela","Prajied Verde","Prajied Azul","Prajied Vermelha","Khan Kru"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000005', 'karate', 'Karatê Shotokan', '["Branca (9º kyu)","Amarela (8º kyu)","Vermelha (7º kyu)","Laranja (6º kyu)","Verde (5º kyu)","Azul (4º kyu)","Roxa (3º kyu)","Marrom (2º kyu)","Marrom (1º kyu)","Preta (1º dan)"]'::jsonb)
ON CONFLICT (martial_art, name) DO NOTHING;

-- ================================================================
-- 3. ACHIEVEMENTS
-- ================================================================
INSERT INTO achievements (id, key, name, description, icon, category, threshold, points) VALUES
  -- Attendance achievements
  ('a0000000-0001-0000-0000-000000000001', 'first_checkin',       'Primeiro Passo',       'Realize seu primeiro check-in',                     '🥋', 'attendance', 1,   10),
  ('a0000000-0001-0000-0000-000000000002', 'checkin_10',          'Dedicado',              'Complete 10 check-ins',                              '💪', 'attendance', 10,  50),
  ('a0000000-0001-0000-0000-000000000003', 'checkin_50',          'Guerreiro',             'Complete 50 check-ins',                              '⚔️', 'attendance', 50,  200),
  ('a0000000-0001-0000-0000-000000000004', 'checkin_100',         'Centurião',             'Complete 100 check-ins',                             '🏛️', 'attendance', 100, 500),
  ('a0000000-0001-0000-0000-000000000005', 'checkin_365',         'Lenda',                 'Complete 365 check-ins',                             '👑', 'attendance', 365, 2000),
  -- Streak achievements
  ('a0000000-0002-0000-0000-000000000001', 'streak_7',            'Semana Perfeita',       'Mantenha um streak de 7 dias',                      '🔥', 'streak',     7,   100),
  ('a0000000-0002-0000-0000-000000000002', 'streak_30',           'Mês de Ferro',          'Mantenha um streak de 30 dias',                     '🏆', 'streak',     30,  500),
  ('a0000000-0002-0000-0000-000000000003', 'streak_90',           'Trimestre Implacável',  'Mantenha um streak de 90 dias',                     '💎', 'streak',     90,  1500),
  -- Belt achievements
  ('a0000000-0003-0000-0000-000000000001', 'first_promotion',     'Nova Faixa',            'Receba sua primeira promoção de faixa',              '🎖️', 'belt',       1,   200),
  ('a0000000-0003-0000-0000-000000000002', 'blue_belt',           'Faixa Azul',            'Alcance a faixa azul',                               '🔵', 'belt',       1,   500),
  ('a0000000-0003-0000-0000-000000000003', 'purple_belt',         'Faixa Roxa',            'Alcance a faixa roxa',                               '🟣', 'belt',       1,   1000),
  ('a0000000-0003-0000-0000-000000000004', 'brown_belt',          'Faixa Marrom',          'Alcance a faixa marrom',                             '🟤', 'belt',       1,   2000),
  ('a0000000-0003-0000-0000-000000000005', 'black_belt',          'Faixa Preta',           'Alcance a faixa preta',                              '⚫', 'belt',       1,   5000),
  -- Social achievements
  ('a0000000-0004-0000-0000-000000000001', 'social_butterfly',    'Sociável',              'Participe de 5 turmas diferentes',                   '🦋', 'social',     5,   100),
  ('a0000000-0004-0000-0000-000000000002', 'early_bird',          'Madrugador',            'Faça check-in antes das 7h',                         '🌅', 'social',     1,   50),
  ('a0000000-0004-0000-0000-000000000003', 'night_owl',           'Coruja',                'Faça check-in após as 21h',                          '🦉', 'social',     1,   50)
ON CONFLICT (key) DO NOTHING;

-- ================================================================
-- 4. CLASS SCHEDULES (Turmas)
-- ================================================================
-- Note: These reference memberships which will be created after profiles
-- We'll insert these after memberships are created

-- ================================================================
-- 5. DEMO CONTENT (Planos, Produtos, etc)
-- ================================================================

-- Plans/Subscriptions
INSERT INTO plans (id, academy_id, name, description, price, interval, features, status)
VALUES 
  ('p0000000-0001-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Starter', 'Plano básico para iniciantes', 197.00, 'month', '["1x por semana", "Acesso à área comum", "App mobile"]'::jsonb, 'active'),
  ('p0000000-0001-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Professional', 'Plano completo para praticantes', 497.00, 'month', '["Ilimitado", "Todas as modalidades", "App mobile", "Vídeos exclusivos"]'::jsonb, 'active'),
  ('p0000000-0001-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Enterprise', 'Plano premium com benefícios exclusivos', 997.00, 'month', '["Ilimitado", "Todas as modalidades", "App mobile", "Vídeos exclusivos", "Aulas particulares", "Nutricionista"]'::jsonb, 'active')
ON CONFLICT (id) DO NOTHING;

-- Shop Categories
INSERT INTO shop_categories (id, academy_id, name, description, sort_order)
VALUES
  ('c0000000-0001-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Kimonos', 'Kimonos para todas as modalidades', 1),
  ('c0000000-0001-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Luvas', 'Luvas de boxe e MMA', 2),
  ('c0000000-0001-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Protetores', 'Protetores bucais, cabeça, canela', 3),
  ('c0000000-0001-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Acessórios', 'Bolsas, cordas, acessórios diversos', 4)
ON CONFLICT (id) DO NOTHING;

-- Shop Products
INSERT INTO shop_products (id, academy_id, category_id, name, description, price, stock, status)
VALUES
  ('prod-0001', '00000000-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001', 'Kimono JIU JITSU BlackBelt', 'Kimono premium 450g', 389.90, 50, 'active'),
  ('prod-0002', '00000000-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001', 'Kimono Judô Tradicional', 'Kimono judô 750g', 299.90, 30, 'active'),
  ('prod-0003', '00000000-0000-0000-0000-000000000001', 'c0000000-0002-0000-0000-000000000002', 'Luvas Boxe 12oz', 'Luvas de couro sintético', 149.90, 40, 'active'),
  ('prod-0004', '00000000-0000-0000-0000-000000000001', 'c0000000-0003-0000-0000-000000000003', 'Protetor Bucal', 'Protetor bucal moldável', 29.90, 100, 'active'),
  ('prod-0005', '00000000-0000-0000-0000-000000000001', 'c0000000-0004-0000-0000-000000000004', 'Bolsa Mochila BlackBelt', 'Mochila com compartimento para kimono', 199.90, 25, 'active')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 6. KNOWLEDGE AREAS (For Teen learning)
-- ================================================================
INSERT INTO knowledge_areas (id, academy_id, name, description, icon, sort_order)
VALUES
  ('ka-0001', '00000000-0000-0000-0000-000000000001', 'História do Jiu-Jitsu', 'Origens e evolução do Jiu-Jitsu brasileiro', '📚', 1),
  ('ka-0002', '00000000-0000-0000-0000-000000000001', 'Filosofia Marcial', 'Princípios e valores das artes marciais', '🧠', 2),
  ('ka-0003', '00000000-0000-0000-0000-000000000001', 'Regras de Competição', 'Regras IBJJF e outras federações', '📋', 3),
  ('ka-0004', '00000000-0000-0000-0000-000000000001', 'Nutrição para Atletas', 'Alimentação e suplementação', '🥗', 4),
  ('ka-0005', '00000000-0000-0000-0000-000000000001', 'Preparação Física', 'Condicionamento e prevenção de lesões', '💪', 5)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 7. CONTENT (Videos)
-- ================================================================
INSERT INTO video_series (id, academy_id, title, description, thumbnail_url, difficulty, sort_order, status)
VALUES
  ('vs-0001', '00000000-0000-0000-0000-000000000001', 'Fundamentos do Jiu-Jitsu', 'Série completa para iniciantes', 'https://placehold.co/600x400/DC2626/white?text=Fundamentos', 'beginner', 1, 'published'),
  ('vs-0002', '00000000-0000-0000-0000-000000000001', 'Passagem de Guarda', 'Técnicas avançadas de passagem', 'https://placehold.co/600x400/2563EB/white?text=Passagem', 'advanced', 2, 'published'),
  ('vs-0003', '00000000-0000-0000-0000-000000000001', 'Finalizações da Montada', 'As melhores finalizações', 'https://placehold.co/600x400/16A34A/white?text=Finalizações', 'intermediate', 3, 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO videos (id, academy_id, series_id, title, description, video_url, thumbnail_url, duration, sort_order, status)
VALUES
  ('vid-0001', '00000000-0000-0000-0000-000000000001', 'vs-0001', 'Postura Base', 'Como manter uma postura defensiva sólida', 'https://example.com/video1.mp4', 'https://placehold.co/600x400/DC2626/white?text=Postura', 420, 1, 'published'),
  ('vid-0002', '00000000-0000-0000-0000-000000000001', 'vs-0001', 'Quebra de Postura', 'Técnicas para quebrar a postura do oponente', 'https://example.com/video2.mp4', 'https://placehold.co/600x400/DC2626/white?text=Quebra', 380, 2, 'published'),
  ('vid-0003', '00000000-0000-0000-0000-000000000001', 'vs-0002', 'Torreana', 'Passagem clássica da torreana', 'https://example.com/video3.mp4', 'https://placehold.co/600x400/2563EB/white?text=Torreana', 520, 1, 'published'),
  ('vid-0004', '00000000-0000-0000-0000-000000000001', 'vs-0003', 'Estrangulamento', 'Estrangulamento montada tradicional', 'https://example.com/video4.mp4', 'https://placehold.co/600x400/16A34A/white?text=Estrangulamento', 340, 1, 'published')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 8. EVENTS
-- ================================================================
INSERT INTO events (id, academy_id, title, description, event_type, start_date, end_date, location, max_participants, status)
VALUES
  ('evt-0001', '00000000-0000-0000-0000-000000000001', 'Seminário de Finalizações', 'Seminário especial com faixa preta', 'seminar', '2026-03-15 10:00:00', '2026-03-15 14:00:00', 'Academia BlackBelt Centro', 50, 'published'),
  ('evt-0002', '00000000-0000-0000-0000-000000000001', 'Campeonato Interno', 'Campeonato entre alunos da academia', 'competition', '2026-04-20 09:00:00', '2026-04-20 18:00:00', 'Ginásio Municipal', 100, 'published'),
  ('evt-0003', '00000000-0000-0000-0000-000000000001', 'Graduação 2026.1', 'Cerimônia de troca de faixas', 'graduation', '2026-06-15 19:00:00', '2026-06-15 22:00:00', 'Academia BlackBelt Centro', 80, 'draft')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 9. CRM/LEADS
-- ================================================================
INSERT INTO leads (id, academy_id, name, email, phone, source, status, notes, created_at)
VALUES
  ('lead-0001', '00000000-0000-0000-0000-000000000001', 'João Pereira', 'joao.pereira@email.com', '+55 11 98888-1111', 'website', 'new', 'Interessado em Jiu-Jitsu', now() - interval '2 days'),
  ('lead-0002', '00000000-0000-0000-0000-000000000001', 'Maria Souza', 'maria.souza@email.com', '+55 11 98888-2222', 'referral', 'contacted', 'Indicada pelo professor Ricardo', now() - interval '5 days'),
  ('lead-0003', '00000000-0000-0000-0000-000000000001', 'Pedro Costa', 'pedro.costa@email.com', '+55 11 98888-3333', 'instagram', 'qualified', 'Quer aula experimental', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- NOTE: Profiles and Memberships are created via Supabase Auth
-- The script scripts/create-demo-users.ts should be run after this seed
-- to create the auth.users and corresponding profiles/memberships
-- ================================================================
