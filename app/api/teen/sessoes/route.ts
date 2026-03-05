import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const url = new URL(req.url);
  const nivel = url.searchParams.get('nivel');

  if (!membership) return apiOk([]);

  const query = supabase
    .from('class_sessions')
    .select('*, class_schedules(*)')
    .eq('class_schedules.academy_id', membership.academy_id)
    .order('date', { ascending: false })
    .limit(20);

  const { data, error } = await query;
  if (error) throw error;

  const sessoes = (data || []).map((s: any) => ({
    id: s.id,
    titulo: s.class_schedules?.name || 'Sessão',
    data: s.date,
    horario: s.class_schedules?.start_time || '',
    duracao: s.class_schedules?.duration_minutes || 60,
    nivel: nivel || 'todos',
    tipo: 'regular',
    professorNome: '',
  }));

  return apiOk(sessoes);
});
