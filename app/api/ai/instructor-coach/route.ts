/**
 * GET /api/ai/instructor-coach — Briefing diário inteligente do instrutor
 *
 * Auth: professor
 * Returns: InstructorCoachBriefing com resumo do dia, briefings por turma,
 *          dicas pedagógicas e métricas de performance
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);

    if (!membership || !['admin', 'owner', 'professor'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a instrutores');
    }

    const instructorId = membership.id;

    // Fetch instructor profile
    const { data: instructorProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    // Fetch classes taught by this instructor today
    const today = new Date();
    const dayOfWeek = today.getDay();

    const { data: classSchedules } = await supabase
      .from('class_schedules')
      .select('id, name, instructor_id, scheduled_time, day_of_week, max_capacity')
      .eq('instructor_id', instructorId)
      .eq('academy_id', membership.academy_id)
      .eq('day_of_week', dayOfWeek)
      .eq('active', true);

    const { generateDailyBriefing } = await import('@/lib/domain/intelligence/engines/instructor-coach');
    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');

    // Build class data for each scheduled class
    const classesData = await Promise.all(
      (classSchedules ?? []).map(async (cs: any) => {
        // Fetch enrolled students
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('membership_id, memberships(id, profile_id, belt_rank, joined_at, status, profiles(full_name, avatar_url))')
          .eq('class_schedule_id', cs.id)
          .eq('status', 'active');

        const students = await Promise.all(
          (enrollments ?? []).map(async (enrollment: any) => {
            try {
              const member = enrollment.memberships;
              const profile = member?.profiles;
              const snapshot = await buildDevelopmentSnapshot(
                member.id,
                profile?.full_name,
                profile?.avatar_url,
              );

              return {
                participantId: member.id,
                participantName: profile?.full_name ?? 'Aluno',
                engagementTier: 'active' as const,
                engagementScore: snapshot.overallScore ?? 50,
                churnRisk: 0,
                currentMilestone: snapshot.milestones?.currentLabel ?? '',
                currentSublevel: snapshot.sublevels?.current ?? 0,
                daysSinceLastCheckin: 0,
                daysSinceEnrollment: Math.floor(
                  (Date.now() - new Date(member.joined_at).getTime()) / (1000 * 60 * 60 * 24),
                ),
                streakCurrent: snapshot.activity?.currentStreak ?? 0,
              };
            } catch {
              return null;
            }
          }),
        );

        return {
          classId: cs.id,
          className: cs.name,
          scheduledTime: cs.scheduled_time,
          insight: null as any, // ClassInsight would be computed separately if needed
          students: students.filter(Boolean),
        };
      }),
    );

    // Compute academy average engagement (rough estimate)
    const { data: allMembers } = await supabase
      .from('memberships')
      .select('id')
      .eq('academy_id', membership.academy_id)
      .eq('role', 'student')
      .eq('status', 'active')
      .limit(100);

    const briefing = generateDailyBriefing({
      instructorId,
      instructorName: instructorProfile?.full_name ?? 'Professor',
      date: today.toISOString().split('T')[0],
      classes: classesData,
      academyAverageEngagement: 60, // Default baseline
    });

    return apiOk(briefing);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
