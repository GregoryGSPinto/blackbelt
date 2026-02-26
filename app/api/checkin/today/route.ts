import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { supabase, membership } = await withAuth();
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendances' as any)
      .select('id, checked_in_at, checkin_method, membership_id, session_id, memberships!inner(profile_id, belt_rank, profiles!inner(full_name, avatar_url))')
      .eq('academy_id', membership.academy_id)
      .gte('checked_in_at', `${today}T00:00:00`)
      .lte('checked_in_at', `${today}T23:59:59`)
      .order('checked_in_at', { ascending: false });

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
