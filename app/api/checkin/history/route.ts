import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const url = new URL(req.url);
    const alunoId = url.searchParams.get('alunoId');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let query = supabase
      .from('attendances' as any)
      .select('id, checked_in_at, checkin_method, membership_id, session_id, memberships!inner(profile_id, belt_rank, profiles!inner(full_name))')
      .eq('academy_id', membership.academy_id)
      .order('checked_in_at', { ascending: false })
      .limit(100);

    if (alunoId) {
      // Filter by specific student's membership
      const { data: mem } = await supabase
        .from('memberships' as any)
        .select('id')
        .eq('profile_id', alunoId)
        .eq('academy_id', membership.academy_id)
        .single();

      if (mem) query = query.eq('membership_id', mem.id);
    }

    if (from) query = query.gte('checked_in_at', `${from}T00:00:00`);
    if (to) query = query.lte('checked_in_at', `${to}T23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    const checkins = (data || []).map((a: any) => ({
      id: a.id,
      alunoId: a.memberships?.profile_id || '',
      alunoNome: a.memberships?.profiles?.full_name || '',
      turmaId: a.session_id || '',
      dataHora: a.checked_in_at,
      status: 'confirmado' as const,
      method: a.checkin_method,
    }));

    return apiOk(checkins);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
