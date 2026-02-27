/**
 * GET /api/ai/churn — Overview de churn da academia
 *
 * Auth: admin ou professor
 * Query: ?limit=50
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);

    if (!membership || !['admin', 'owner', 'professor'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a administradores e instrutores');
    }

    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get('limit') ?? '50', 10),
      200,
    );

    // Fetch active students
    const { data: members } = await supabase
      .from('memberships')
      .select('id, profile_id, role, belt_rank, joined_at, status, profiles(full_name, avatar_url)')
      .eq('academy_id', membership.academy_id)
      .eq('role', 'student')
      .eq('status', 'active')
      .limit(limit);

    if (!members || members.length === 0) {
      const { projectAdminChurnOverview } = await import('@/lib/application/intelligence');
      return apiOk(projectAdminChurnOverview([]));
    }

    // Build predictions for each member
    const { predictChurn } = await import('@/lib/domain/intelligence');
    const { extractFeaturesFromSnapshot } = await import('@/lib/acl/mappers/intelligence-mapper');
    const { extractAdditionalFeatures } = await import('@/lib/acl/mappers/intelligence-mapper');
    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');
    const { projectAdminChurnOverview } = await import('@/lib/application/intelligence');

    const predictions = await Promise.all(
      members.map(async (member: any) => {
        try {
          const profile = member.profiles;
          const snapshot = await buildDevelopmentSnapshot(
            member.id,
            profile?.full_name,
            profile?.avatar_url,
          );

          const snapshotFeatures = extractFeaturesFromSnapshot(snapshot);
          const additionalFeatures = await extractAdditionalFeatures(
            member.id,
            membership.academy_id,
            supabase,
          );

          const features = {
            participantId: member.id,
            participantName: profile?.full_name ?? 'Aluno',
            participantAvatar: profile?.avatar_url,
            attendancePercentage: snapshotFeatures.attendancePercentage ?? null,
            currentStreak: snapshotFeatures.currentStreak ?? null,
            bestStreak: snapshotFeatures.bestStreak ?? null,
            daysSinceLastCheckin: additionalFeatures.daysSinceLastCheckin ?? null,
            monthsInCurrentMilestone: snapshotFeatures.monthsInCurrentMilestone ?? null,
            hasRecentSublevelProgress: snapshotFeatures.hasRecentSublevelProgress ?? false,
            paymentIssueLevel: additionalFeatures.paymentIssueLevel ?? null,
            overallScore: snapshotFeatures.overallScore ?? null,
            weeklyPointsTrend: additionalFeatures.weeklyPointsTrend ?? null,
            daysSinceEnrollment: snapshotFeatures.daysSinceEnrollment ?? null,
            collectedAt: new Date().toISOString(),
          };

          return predictChurn(features);
        } catch {
          return null;
        }
      }),
    );

    const validPredictions = predictions.filter(Boolean) as any[];
    return apiOk(projectAdminChurnOverview(validPredictions));
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
