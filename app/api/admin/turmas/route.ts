import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin', 'instructor'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const { data, error } = await supabase
      .from('class_schedules' as any)
      .select('*')
      .eq('academy_id', membership.academy_id)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;

    return apiOk(data || []);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
