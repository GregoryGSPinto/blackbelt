import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ challenges: [] });

  const { data } = await supabase
    .from('challenges')
    .select('id, title, description, xp_reward, category, status, due_date')
    .eq('academy_id', membership.academy_id)
    .in('age_group', ['kids', 'all'])
    .order('created_at', { ascending: false });

  return apiOk({ challenges: data || [] });
});
