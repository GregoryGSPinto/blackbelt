/**
 * GET /api/ai/parent-insights/[childId] — Insights para pais/responsáveis
 *
 * Auth: responsável da criança (parent of child)
 * Returns: ParentInsightsVM com resumo simplificado de progresso,
 *          conquistas e próximos passos do filho
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError, apiForbidden, apiNotFound } from '@/lib/api/route-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { childId: string } },
) {
  try {
    const { supabase, user, membership } = await withAuth(req);

    if (!membership) {
      return apiForbidden('Sem membership ativa');
    }

    const { childId } = params;

    // Verify the current user is a parent/guardian of this child
    // Parents have role 'parent' and are linked via parent_child table
    const isParent = membership.role === 'parent';
    const isAdmin = ['admin', 'owner'].includes(membership.role);

    if (!isAdmin) {
      if (!isParent) {
        return apiForbidden('Acesso restrito a responsáveis');
      }

      // Verify parent-child relationship
      const { data: relationship } = await supabase
        .from('parent_child')
        .select('id')
        .eq('parent_membership_id', membership.id)
        .eq('child_membership_id', childId)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (!relationship) {
        return apiForbidden('Você não é responsável deste aluno');
      }
    }

    // Fetch child member
    const { data: child } = await supabase
      .from('memberships')
      .select('id, profile_id, role, belt_rank, joined_at, status, profiles(full_name, avatar_url)')
      .eq('id', childId)
      .eq('academy_id', membership.academy_id)
      .single();

    if (!child) {
      return apiNotFound('Aluno não encontrado nesta academia');
    }

    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');

    const profile = (child as any).profiles;
    const snapshot = await buildDevelopmentSnapshot(
      childId,
      profile?.full_name,
      profile?.avatar_url,
    );

    // Project parent-friendly insights from the snapshot
    const parentInsights = projectParentInsights(snapshot, child);

    return apiOk(parentInsights);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

/**
 * Projects a parent-friendly view from the development snapshot.
 * Simplifies technical data into language parents understand.
 */
function projectParentInsights(snapshot: any, child: any): any {
  const profile = child.profiles ?? {};

  return {
    childId: child.id,
    childName: profile.full_name ?? 'Aluno',
    childAvatar: profile.avatar_url ?? null,

    // ── Progresso simplificado ──────────────────────────────
    progress: {
      currentBelt: snapshot.milestones?.currentLabel ?? child.belt_rank ?? 'Branca',
      overallScore: snapshot.overallScore ?? 0,
      attendancePercentage: snapshot.activity?.attendancePercentage ?? 0,
      currentStreak: snapshot.activity?.currentStreak ?? 0,
      bestStreak: snapshot.activity?.bestStreak ?? 0,
      totalSessions: snapshot.activity?.totalSessions ?? 0,
    },

    // ── Conquistas recentes ─────────────────────────────────
    recentAchievements: (snapshot.achievements ?? []).slice(0, 5).map((a: any) => ({
      title: a.title ?? a.name ?? 'Conquista',
      description: a.description ?? '',
      date: a.date ?? a.awardedAt ?? null,
    })),

    // ── Próximos passos ─────────────────────────────────────
    nextSteps: {
      nextMilestone: snapshot.milestones?.nextLabel ?? 'Próxima faixa',
      progressToNextMilestone: snapshot.milestones?.progressPercentage ?? 0,
      estimatedWeeksToPromotion: null, // Computed by promotion predictor if available
    },

    // ── Resumo de engajamento (linguagem para pais) ─────────
    engagementSummary: buildParentEngagementSummary(snapshot),

    // ── Metadados ───────────────────────────────────────────
    computedAt: new Date().toISOString(),
  };
}

/**
 * Generates a parent-friendly engagement summary.
 */
function buildParentEngagementSummary(snapshot: any): string {
  const attendance = snapshot.activity?.attendancePercentage ?? 0;
  const streak = snapshot.activity?.currentStreak ?? 0;

  if (attendance >= 80 && streak >= 7) {
    return 'Seu filho está muito engajado e frequente nas aulas. Continue incentivando!';
  }
  if (attendance >= 60) {
    return 'Seu filho tem frequentado as aulas regularmente. Bom progresso!';
  }
  if (attendance >= 40) {
    return 'A frequência do seu filho está moderada. Converse sobre como apoiar a rotina de treinos.';
  }
  return 'A frequência está abaixo do ideal. Converse com o professor sobre formas de motivar seu filho.';
}
