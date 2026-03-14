import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  const [profileRes, streakRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, phone, birth_date, gender, avatar_url').eq('id', user.id).single(),
    supabase.from('streaks').select('*').eq('membership_id', membership!.id).single(),
    supabase.from('member_achievements').select('*, achievements!inner(*)')
      .eq('membership_id', membership!.id),
  ]);

  return apiOk({
    profile: profileRes.data,
    streak: streakRes.data,
    achievements: achievementsRes.data || [],
  });
});
