import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk([]);

  const { data, error } = await supabase
    .from('attendances')
    .select('*, class_sessions(*, class_schedules(name))')
    .eq('membership_id', membership.id)
    .order('checked_in_at', { ascending: false })
    .limit(30);

  if (error) throw error;

  const checkins = (data || []).map((a: any) => ({
    id: a.id,
    data: a.checked_in_at,
    turma: a.class_sessions?.class_schedules?.name || 'Aula',
    status: a.status || 'presente',
    pontos: 10,
  }));

  return apiOk(checkins);
});
