import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const [profileRes, membershipRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, phone, birth_date, gender, address, weight, height, avatar_url, created_at, updated_at').eq('id', user.id).single(),
    supabase.from('memberships').select('id, academy_id, role, status, belt_rank, stripes, joined_at, created_at').eq('profile_id', user.id).eq('status', 'active'),
  ]);

  return apiOk({
    profile: profileRes.data,
    memberships: membershipRes.data || [],
    currentMembership: membership,
  });
});
