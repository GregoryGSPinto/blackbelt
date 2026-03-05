/**
 * BlackBelt Seed — Shared helpers and constants
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || SUPABASE_URL.includes('your-')) {
    console.error('NEXT_PUBLIC_SUPABASE_URL not configured');
    process.exit(1);
  }
  if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('your-')) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
    process.exit(1);
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Fixed IDs for idempotency
export const ACADEMY_ID = '00000000-0000-0000-0000-000000000001';
export const SEED_PASSWORD = 'BlackBelt@2026!';

export const SEED_USERS = [
  { email: 'admin@blackbelt.app', fullName: 'Carlos Silva', displayName: 'Carlos', role: 'owner' as const, beltRank: 'Preta' },
  { email: 'professor@blackbelt.app', fullName: 'João Santos', displayName: 'João', role: 'professor' as const, beltRank: 'Preta' },
  { email: 'adulto@blackbelt.app', fullName: 'Maria Oliveira', displayName: 'Maria', role: 'student' as const, beltRank: 'Azul' },
  { email: 'teen@blackbelt.app', fullName: 'Miguel Costa', displayName: 'Miguel', role: 'student' as const, beltRank: 'Amarela' },
  { email: 'kids@blackbelt.app', fullName: 'Ana Souza', displayName: 'Ana', role: 'student' as const, beltRank: 'Branca' },
  { email: 'parent@blackbelt.app', fullName: 'Roberto Costa', displayName: 'Roberto', role: 'parent' as const, beltRank: undefined },
] as const;

export type SeedUserInfo = {
  authId: string;
  membershipId: string;
  email: string;
  role: string;
};

export async function getSeedUserMap(supabase: SupabaseClient): Promise<Map<string, SeedUserInfo>> {
  const map = new Map<string, SeedUserInfo>();

  for (const user of SEED_USERS) {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find((u) => u.email === user.email);
    if (!authUser) continue;

    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('profile_id', authUser.id)
      .eq('academy_id', ACADEMY_ID)
      .single();

    map.set(user.email, {
      authId: authUser.id,
      membershipId: membership?.id ?? '',
      email: user.email,
      role: user.role,
    });
  }

  return map;
}

export function log(emoji: string, msg: string) {
  console.log(`  ${emoji} ${msg}`);
}

export function logSection(title: string) {
  console.log(`\n${title}`);
}
