/**
 * GET /api/ai/student-dna/[memberId] — DNA comportamental do aluno
 *
 * Auth: admin, professor ou o próprio aluno (self)
 * Returns: StudentDNA com dimensões, padrões e perfil de dificuldade
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden, apiNotFound } from '@/lib/api/route-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { memberId: string } },
) {
  try {
    const { supabase, user, membership } = await withAuth(req);

    if (!membership) {
      return apiForbidden('Sem membership ativa');
    }

    const { memberId } = params;

    // Auth: admin/professor can view anyone; student can only view self
    const isSelf = membership.id === memberId;
    const isPrivileged = ['admin', 'owner', 'professor'].includes(membership.role);

    if (!isSelf && !isPrivileged) {
      return apiForbidden('Acesso restrito a administradores, instrutores ou o próprio aluno');
    }

    // Verify member belongs to same academy
    const { data: member } = await supabase
      .from('memberships')
      .select('id, profile_id, role, belt_rank, joined_at, status, profiles(full_name, avatar_url)')
      .eq('id', memberId)
      .eq('academy_id', membership.academy_id)
      .single();

    if (!member) {
      return apiNotFound('Membro não encontrado nesta academia');
    }

    const { computeStudentDNA } = await import('@/lib/domain/intelligence/engines/student-dna');
    const { extractStudentDNAInput } = await import('@/lib/acl/mappers/student-dna-mapper');
    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');

    const profile = (member as any).profiles;
    const snapshot = await buildDevelopmentSnapshot(
      memberId,
      profile?.full_name,
      profile?.avatar_url,
    );

    const dnaInput = await extractStudentDNAInput(
      snapshot,
      memberId,
      membership.academy_id,
      supabase,
    );

    const dna = computeStudentDNA(dnaInput);

    return apiOk(dna);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
