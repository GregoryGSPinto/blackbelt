/**
 * GET /api/ai/admin-analytics — Painel analítico de IA para admin/owner
 *
 * Auth: admin ou owner
 * Returns: AdminAIAnalyticsVM com métricas agregadas de todos os alunos,
 *          distribuição de tiers, tendências e alertas prioritários
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a administradores e proprietários');
    }

    const academyId = membership.academy_id;

    // Fetch all active students
    const { data: members } = await supabase
      .from('memberships')
      .select('id, profile_id, role, belt_rank, joined_at, status, profiles(full_name, avatar_url)')
      .eq('academy_id', academyId)
      .eq('role', 'student')
      .eq('status', 'active')
      .limit(500);

    if (!members || members.length === 0) {
      return apiOk(buildEmptyAnalytics(academyId));
    }

    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');

    // Build snapshots for all students (parallel, with error handling)
    const snapshots = await Promise.all(
      members.map(async (member: any) => {
        try {
          const profile = member.profiles;
          const snapshot = await buildDevelopmentSnapshot(
            member.id,
            profile?.full_name,
            profile?.avatar_url,
          );
          return { memberId: member.id, snapshot, profile };
        } catch {
          return null;
        }
      }),
    );

    const validSnapshots = snapshots.filter(Boolean) as any[];

    // Aggregate analytics
    const analytics = aggregateAnalytics(academyId, validSnapshots);

    return apiOk(analytics);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

// ════════════════════════════════════════════════════════════════════
// ANALYTICS AGGREGATION
// ════════════════════════════════════════════════════════════════════

function aggregateAnalytics(academyId: string, data: any[]): any {
  const totalStudents = data.length;

  // Score distribution
  const scores = data.map(d => d.snapshot.overallScore ?? 0);
  const avgScore = totalStudents > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / totalStudents)
    : 0;

  // Attendance
  const attendanceRates = data.map(d => d.snapshot.activity?.attendancePercentage ?? 0);
  const avgAttendance = totalStudents > 0
    ? Math.round(attendanceRates.reduce((a: number, b: number) => a + b, 0) / totalStudents)
    : 0;

  // Streak
  const streaks = data.map(d => d.snapshot.activity?.currentStreak ?? 0);
  const avgStreak = totalStudents > 0
    ? Math.round(streaks.reduce((a: number, b: number) => a + b, 0) / totalStudents * 10) / 10
    : 0;

  // Students at risk (low attendance + no recent activity)
  const atRiskStudents = data.filter(d => {
    const attendance = d.snapshot.activity?.attendancePercentage ?? 0;
    const streak = d.snapshot.activity?.currentStreak ?? 0;
    return attendance < 50 && streak === 0;
  });

  // Students excelling
  const excellingStudents = data.filter(d => {
    const score = d.snapshot.overallScore ?? 0;
    const attendance = d.snapshot.activity?.attendancePercentage ?? 0;
    return score >= 80 && attendance >= 80;
  });

  // Belt distribution
  const beltDistribution: Record<string, number> = {};
  for (const d of data) {
    const belt = d.snapshot.milestones?.currentLabel ?? 'Sem faixa';
    beltDistribution[belt] = (beltDistribution[belt] ?? 0) + 1;
  }

  // Score buckets (0-25, 25-50, 50-75, 75-100)
  const scoreBuckets = {
    critical: scores.filter((s: number) => s < 25).length,
    low: scores.filter((s: number) => s >= 25 && s < 50).length,
    moderate: scores.filter((s: number) => s >= 50 && s < 75).length,
    high: scores.filter((s: number) => s >= 75).length,
  };

  // Top students
  const topStudents = data
    .sort((a, b) => (b.snapshot.overallScore ?? 0) - (a.snapshot.overallScore ?? 0))
    .slice(0, 5)
    .map(d => ({
      memberId: d.memberId,
      name: d.profile?.full_name ?? 'Aluno',
      avatar: d.profile?.avatar_url,
      score: d.snapshot.overallScore ?? 0,
      belt: d.snapshot.milestones?.currentLabel ?? '',
    }));

  // Priority alerts
  const priorityAlerts = atRiskStudents.slice(0, 10).map((d: any) => ({
    memberId: d.memberId,
    name: d.profile?.full_name ?? 'Aluno',
    avatar: d.profile?.avatar_url,
    reason: 'Baixa frequência e sem atividade recente',
    score: d.snapshot.overallScore ?? 0,
  }));

  return {
    academyId,
    totalStudents,
    summary: {
      avgScore,
      avgAttendance,
      avgStreak,
      atRiskCount: atRiskStudents.length,
      excellingCount: excellingStudents.length,
    },
    scoreBuckets,
    beltDistribution,
    topStudents,
    priorityAlerts,
    computedAt: new Date().toISOString(),
  };
}

function buildEmptyAnalytics(academyId: string): any {
  return {
    academyId,
    totalStudents: 0,
    summary: {
      avgScore: 0,
      avgAttendance: 0,
      avgStreak: 0,
      atRiskCount: 0,
      excellingCount: 0,
    },
    scoreBuckets: { critical: 0, low: 0, moderate: 0, high: 0 },
    beltDistribution: {},
    topStudents: [],
    priorityAlerts: [],
    computedAt: new Date().toISOString(),
  };
}
