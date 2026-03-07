/**
 * Seed de produção — cria academia demo + 9 usuários demo no Supabase.
 *
 * Uso: npx tsx scripts/seed-production.ts
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Demo Users (match login page DEMO_USERS + auth.mock.ts) ────────

type UserRole = 'student' | 'professor' | 'admin' | 'owner' | 'parent';

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  belt_rank?: string;
  display_name?: string;
}

const DEMO_USERS: DemoUser[] = [
  { email: 'superadmin@blackbelt.com', password: 'blackbelt123', full_name: 'Gregory Pinto',     role: 'admin',     belt_rank: 'Faixa Preta',     display_name: 'Super Admin' },
  { email: 'admin@blackbelt.com',      password: 'blackbelt123', full_name: 'Marcos Costa',       role: 'admin',     belt_rank: 'Faixa Preta',     display_name: 'Admin' },
  { email: 'professor@blackbelt.com',  password: 'blackbelt123', full_name: 'Ricardo Almeida',    role: 'professor', belt_rank: 'Faixa Preta 3º Grau' },
  { email: 'adulto@blackbelt.com',     password: 'blackbelt123', full_name: 'Carlos Silva',       role: 'student',   belt_rank: 'Faixa Branca' },
  { email: 'miguel@blackbelt.com',     password: 'blackbelt123', full_name: 'Miguel Oliveira',    role: 'student',   belt_rank: 'Faixa Cinza' },
  { email: 'kid@blackbelt.com',        password: 'blackbelt123', full_name: 'Pedro Ferreira',     role: 'student',   belt_rank: 'Faixa Branca' },
  { email: 'paiteen@blackbelt.com',    password: 'blackbelt123', full_name: 'Roberto Oliveira',   role: 'parent' },
  { email: 'support@blackbelt.com',    password: 'blackbelt123', full_name: 'Suporte Técnico',    role: 'admin',     display_name: 'Support' },
  { email: 'owner@blackbelt.com',      password: 'blackbelt123', full_name: 'Rafael BlackBelt',   role: 'owner',     belt_rank: 'Faixa Preta 3º Grau' },
];

async function main() {
  console.log('🚀 Iniciando seed de produção...\n');

  // ─── 1. Criar o primeiro usuário (owner) para ser owner_id da academy ───
  const ownerUser = DEMO_USERS.find(u => u.email === 'owner@blackbelt.com')!;
  const ownerAuthId = await createAuthUser(ownerUser);
  if (!ownerAuthId) {
    console.error('Falha ao criar owner — abortando.');
    process.exit(1);
  }

  // ─── 2. Criar profile do owner primeiro (academy FK precisa dele) ───
  await upsertProfile(ownerAuthId, ownerUser);

  // ─── 3. Criar academia demo ───
  const academyId = await createAcademy(ownerAuthId);

  // ─── 4. Criar membership do owner ───
  await createMembership(ownerAuthId, academyId, ownerUser.role, ownerUser.belt_rank);

  // ─── 5. Criar demais usuários ───
  for (const user of DEMO_USERS) {
    if (user.email === 'owner@blackbelt.com') continue; // já criado

    const authId = await createAuthUser(user);
    if (!authId) continue;

    await upsertProfile(authId, user);
    await createMembership(authId, academyId, user.role, user.belt_rank);
  }

  console.log('\n✅ Seed concluído com sucesso!');
  console.log(`   Academia: BlackBelt Academy Demo`);
  console.log(`   Usuários criados: ${DEMO_USERS.length}`);
}

async function createAuthUser(user: DemoUser): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name },
  });

  if (error) {
    if (error.message?.includes('already been registered') || error.message?.includes('already exists')) {
      console.log(`  ⚠️  ${user.email} já existe — buscando ID...`);
      // Fetch existing user
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find(u => u.email === user.email);
      if (existing) {
        console.log(`  ✓  ${user.email} (existente: ${existing.id})`);
        return existing.id;
      }
      console.error(`  ✗  Não encontrou ${user.email} existente`);
      return null;
    }
    console.error(`  ✗  Erro ao criar ${user.email}: ${error.message}`);
    return null;
  }

  console.log(`  ✓  ${user.email} → ${data.user.id}`);
  return data.user.id;
}

async function upsertProfile(userId: string, user: DemoUser) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: user.full_name,
    display_name: user.display_name || null,
  }, { onConflict: 'id' });

  if (error) {
    console.error(`  ✗  Profile ${user.email}: ${error.message}`);
  }
}

async function createAcademy(ownerId: string): Promise<string> {
  // Check if academy already exists
  const { data: existing } = await supabase
    .from('academies')
    .select('id')
    .eq('slug', 'blackbelt-demo')
    .single();

  if (existing) {
    console.log(`\n📍 Academia já existe: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase.from('academies').insert({
    name: 'BlackBelt Academy Demo',
    slug: 'blackbelt-demo',
    owner_id: ownerId,
    email: 'contato@blackbelt.com',
    phone: '(11) 99999-0000',
    settings: {
      timezone: 'America/Sao_Paulo',
      locale: 'pt-BR',
      features: ['checkin', 'gamification', 'messaging', 'videos'],
    },
    address: {
      street: 'Rua das Artes Marciais, 100',
      city: 'São Paulo',
      state: 'SP',
      zip: '01001-000',
      country: 'BR',
    },
  }).select('id').single();

  if (error) {
    console.error(`✗ Erro ao criar academia: ${error.message}`);
    process.exit(1);
  }

  console.log(`\n📍 Academia criada: ${data.id}`);
  return data.id;
}

async function createMembership(profileId: string, academyId: string, role: UserRole, beltRank?: string) {
  const { error } = await supabase.from('memberships').upsert({
    profile_id: profileId,
    academy_id: academyId,
    role,
    status: 'active',
    belt_rank: beltRank || null,
  }, { onConflict: 'profile_id,academy_id,role' });

  if (error) {
    console.error(`  ✗  Membership ${profileId}: ${error.message}`);
  }
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
