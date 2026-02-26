import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  const { data: enrollments, error } = await supabase
    .from('class_enrollments')
    .select('id, status, class_schedules!inner(id, name, martial_art, level, day_of_week, start_time, end_time, instructor_id, max_capacity, location)')
    .eq('membership_id', membership!.id)
    .eq('status', 'active');

  if (error) throw error;
  return apiOk(enrollments || []);
});
