import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk([]);

  const { data, error } = await supabase
    .from('knowledge_areas')
    .select('*')
    .eq('academy_id', membership.academy_id)
    .eq('active', true);

  // If knowledge_areas table doesn't exist yet, return empty gracefully
  if (error) return apiOk([]);

  return apiOk(data || []);
});
