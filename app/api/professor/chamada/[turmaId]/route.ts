import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ turmaId: string }> }
) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin', 'instructor'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const { turmaId } = await params;

    const { data: alunos, error } = await supabase
      .from('memberships' as any)
      .select('id, profile_id, belt_rank, profiles!inner(full_name, avatar_url)')
      .eq('academy_id', membership.academy_id)
      .eq('role', 'student')
      .eq('status', 'active');

    if (error) throw error;

    const mapped = (alunos || []).map((a: any) => ({
      id: a.profile_id,
      nome: a.profiles?.full_name || 'Aluno',
      avatar: '🥋',
      nivel: a.belt_rank || 'Branca',
      nivelCor: '#FFFFFF',
    }));

    return apiOk(mapped);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
