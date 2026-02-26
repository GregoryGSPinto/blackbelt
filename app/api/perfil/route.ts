import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const [profileRes, membershipRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('memberships').select('*').eq('profile_id', user.id).eq('status', 'active'),
  ]);

  return apiOk({
    profile: profileRes.data,
    memberships: membershipRes.data || [],
    currentMembership: membership,
  });
});
