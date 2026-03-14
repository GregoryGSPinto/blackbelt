import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiCreated, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    if (type === 'sessions') {
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('class_sessions' as any)
        .select('*, class_schedules!inner(martial_art, level, day_of_week, start_time, end_time, max_capacity)')
        .eq('academy_id', membership.academy_id)
        .eq('date', date)
        .order('created_at');

      if (error) throw error;
      return apiOk(data);
    }

    const { data, error } = await supabase
      .from('class_schedules' as any)
      .select('*')
      .eq('academy_id', membership.academy_id)
      .eq('active', true)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;
    return apiOk(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin', 'professor'].includes(membership.role)) {
      return apiError('Sem permissão', 'FORBIDDEN', 403);
    }

    const body = await req.json();
    const { name, martial_art, level, day_of_week, start_time, end_time, max_capacity, instructor_id } = body;

    if (!martial_art || !start_time || !end_time || !instructor_id) {
      return apiError('martial_art, start_time, end_time, instructor_id são obrigatórios', 'VALIDATION');
    }

    const { data: instructor } = await supabase
      .from('memberships' as any)
      .select('id, academy_id, role, status')
      .eq('id', instructor_id)
      .eq('academy_id', membership.academy_id)
      .in('role', ['professor', 'admin', 'owner'])
      .eq('status', 'active')
      .maybeSingle();

    if (!instructor) {
      return apiError('Instrutor inválido para esta academia', 'FORBIDDEN', 403);
    }

    const { data, error } = await supabase
      .from('class_schedules' as any)
      .insert({
        academy_id: membership.academy_id,
        name: name || `${martial_art} - ${level || 'Todos'}`,
        instructor_id,
        martial_art,
        level: level || 'all',
        day_of_week: day_of_week ?? 1,
        start_time,
        end_time,
        max_capacity: max_capacity || 30,
      })
      .select()
      .single();

    if (error) throw error;
    return apiCreated(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
