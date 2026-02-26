import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const academyId = membership!.academy_id;
  const today = new Date().toISOString().split('T')[0];

  const [classesRes, studentsRes, checkinsRes] = await Promise.all([
    supabase.from('class_schedules').select('id', { count: 'exact' })
      .eq('academy_id', academyId).eq('instructor_id', membership!.id).eq('active', true),
    supabase.from('class_enrollments').select('id', { count: 'exact' })
      .in('schedule_id', (await supabase.from('class_schedules').select('id')
        .eq('instructor_id', membership!.id).eq('academy_id', academyId)).data?.map((c: any) => c.id) || []),
    supabase.from('attendances').select('id', { count: 'exact' })
      .eq('academy_id', academyId).gte('checked_in_at', `${today}T00:00:00`),
  ]);

  return apiOk({
    totalTurmas: classesRes.count || 0,
    totalAlunos: studentsRes.count || 0,
    checkinsHoje: checkinsRes.count || 0,
  });
});
