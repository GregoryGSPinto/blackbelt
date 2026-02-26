import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  const { data, error } = await supabase
    .from('class_schedules')
    .select('*')
    .eq('academy_id', membership!.academy_id)
    .eq('active', true)
    .order('day_of_week')
    .order('start_time');

  if (error) throw error;
  return apiOk(data || []);
});
