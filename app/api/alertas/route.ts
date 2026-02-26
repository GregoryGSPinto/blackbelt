import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  const { data } = await supabase.from('notifications')
    .select('*').eq('academy_id', membership!.academy_id).eq('type', 'alert')
    .eq('read', false).order('created_at', { ascending: false }).limit(20);
  return apiOk(data || []);
});
