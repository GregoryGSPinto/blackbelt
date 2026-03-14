import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ turmaId: string }> }
) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin', 'professor'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const { turmaId } = await params;

    const { data: schedule, error: scheduleError } = await supabase
      .from('class_schedules' as any)
      .select('id, academy_id, instructor_id, active')
      .eq('id', turmaId)
      .eq('academy_id', membership.academy_id)
      .maybeSingle();

    if (scheduleError) throw scheduleError;
    if (!schedule) return apiError('Turma não encontrada', 'NOT_FOUND', 404);
    if (!schedule.active) return apiError('Turma não está ativa', 'INACTIVE_CLASS', 400);
    if (membership.role === 'professor' && schedule.instructor_id !== membership.id) {
      return apiError('Sem permissão para acessar esta turma', 'FORBIDDEN', 403);
    }

    const { data: alunos, error } = await supabase
      .from('class_enrollments' as any)
      .select('membership:memberships!inner(id, profile_id, belt_rank, academy_id, role, status, profiles!inner(full_name, avatar_url))')
      .eq('schedule_id', turmaId)
      .eq('status', 'active');

    if (error) throw error;

    const mapped = (alunos || [])
      .map((row: any) => row.membership)
      .filter((item: any) =>
        item &&
        item.academy_id === membership.academy_id &&
        item.role === 'student' &&
        item.status === 'active'
      )
      .map((a: any) => ({
        id: a.id,
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
