import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ data: [], error: null, meta: {} });

  const [enrollmentsRes, recentCheckinsRes] = await Promise.all([
    supabase.from('class_enrollments')
      .select('id, status, class_schedules!inner(id, name, day_of_week, start_time, end_time, location, martial_art)')
      .eq('membership_id', membership.id)
      .eq('status', 'active'),
    supabase.from('attendances')
      .select('id, checked_in_at, status, class_session_id')
      .eq('membership_id', membership.id)
      .order('checked_in_at', { ascending: false })
      .limit(30),
  ]);

  const turmas = (enrollmentsRes.data || []).map((e: any) => ({
    id: e.id,
    nome: e.class_schedules?.name || 'Aula',
    diaSemana: e.class_schedules?.day_of_week || '',
    horarioInicio: e.class_schedules?.start_time || '',
    horarioFim: e.class_schedules?.end_time || '',
    local: e.class_schedules?.location || '',
    modalidade: e.class_schedules?.martial_art || '',
  }));

  const presencas = (recentCheckinsRes.data || []).map((a: any) => ({
    id: a.id,
    data: a.checked_in_at,
    status: a.status || 'presente',
  }));

  return apiOk({
    data: {
      turmas,
      presencas,
      totalPresencas: presencas.filter((p: any) => p.status === 'presente').length,
      totalFaltas: presencas.filter((p: any) => p.status === 'ausente').length,
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
