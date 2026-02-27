/**
 * GET /api/ai/churn/[memberId] — Predição individual de churn
 *
 * Auth: admin ou professor
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden, apiNotFound } from '@/lib/api/route-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { memberId: string } },
) {
  try {
    const { supabase, membership } = await withAuth(req);

    if (!membership || !['admin', 'owner', 'professor'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a administradores e instrutores');
    }

    const { memberId } = params;

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

    const { predictChurn } = await import('@/lib/domain/intelligence');
    const { extractChurnFeatures } = await import('@/lib/acl/mappers/intelligence-mapper');
    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');

    const profile = (member as any).profiles;
    const snapshot = await buildDevelopmentSnapshot(
      memberId,
      profile?.full_name,
      profile?.avatar_url,
    );

    const features = await extractChurnFeatures(
      snapshot,
      memberId,
      membership.academy_id,
      supabase,
    );

    const prediction = predictChurn(features);

    return apiOk(prediction);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
