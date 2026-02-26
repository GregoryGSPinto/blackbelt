import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  const { data } = await supabase.from('skill_assessments')
    .select('*, skill_tracks!inner(name)')
    .eq('assessed_by', membership!.id)
    .order('assessed_at', { ascending: false });
  return apiOk(data || []);
});
