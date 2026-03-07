import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ conquistas: [], total: 0 });

  const { data, count } = await supabase
    .from('member_achievements')
    .select('id, achievement_type, title, description, icon, earned_at', { count: 'exact' })
    .eq('membership_id', membership.id)
    .order('earned_at', { ascending: false });

  return apiOk({
    conquistas: data || [],
    total: count || 0,
  });
});
