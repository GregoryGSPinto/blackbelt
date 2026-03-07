import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ medals: [] });

  const { data } = await supabase
    .from('member_achievements')
    .select('id, title, description, icon, earned_at, achievement_type')
    .eq('membership_id', membership.id)
    .order('earned_at', { ascending: false });

  return apiOk({ medals: data || [] });
});
