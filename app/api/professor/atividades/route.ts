import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  const { data } = await supabase.from('audit_log')
    .select('*')
    .eq('user_id', membership!.id)
    .order('created_at', { ascending: false })
    .limit(20);
  return apiOk(data || []);
});
