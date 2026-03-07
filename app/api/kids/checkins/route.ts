import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ checkins: [] });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('attendances')
    .select('id, checked_in_at, checkin_method, session_id')
    .eq('membership_id', membership.id)
    .gte('checked_in_at', thirtyDaysAgo)
    .order('checked_in_at', { ascending: false });

  return apiOk({ checkins: data || [] });
});
