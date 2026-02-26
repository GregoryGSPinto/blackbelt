-- ================================================================
-- BlackBelt — Comprehensive Seed Data
-- ================================================================
-- Run AFTER migrations and create-test-user.ts
-- Static data that doesn't depend on auth.users UUIDs
-- ================================================================

-- ── Belt Systems ────────────────────────────────────────────────
INSERT INTO belt_systems (id, martial_art, name, ranks) VALUES
  ('b0000000-0001-0000-0000-000000000001', 'bjj', 'BJJ Adulto IBJJF', '["Branca","Azul","Roxa","Marrom","Preta","Coral","Vermelha"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000002', 'bjj', 'BJJ Infantil IBJJF', '["Branca","Cinza","Amarela","Laranja","Verde"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000003', 'judo', 'Judô Kodokan', '["Branca (6º kyu)","Amarela (5º kyu)","Laranja (4º kyu)","Verde (3º kyu)","Azul (2º kyu)","Marrom (1º kyu)","Preta (1º dan)","Preta (2º dan)","Preta (3º dan)"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000004', 'muay_thai', 'Muay Thai Tradicional', '["Sem graduação","Prajied Branca","Prajied Amarela","Prajied Verde","Prajied Azul","Prajied Vermelha","Khan Kru"]'::jsonb),
  ('b0000000-0001-0000-0000-000000000005', 'karate', 'Karatê Shotokan', '["Branca (9º kyu)","Amarela (8º kyu)","Vermelha (7º kyu)","Laranja (6º kyu)","Verde (5º kyu)","Azul (4º kyu)","Roxa (3º kyu)","Marrom (2º kyu)","Marrom (1º kyu)","Preta (1º dan)"]'::jsonb)
ON CONFLICT (martial_art, name) DO NOTHING;

-- ── Achievements ────────────────────────────────────────────────
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
