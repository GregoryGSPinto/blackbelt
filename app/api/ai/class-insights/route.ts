/**
 * GET /api/ai/class-insights — Insights inteligentes da turma
 *
 * Auth: admin ou professor
 * Query: ?classScheduleId=xxx
 * Returns: ClassInsight com saúde, composição e recomendações
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError, apiForbidden } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);

    if (!membership || !['admin', 'owner', 'professor'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a administradores e instrutores');
    }

    const classScheduleId = req.nextUrl.searchParams.get('classScheduleId');
    if (!classScheduleId) {
      return apiError('Query parameter classScheduleId é obrigatório', 'VALIDATION_ERROR', 400);
    }

    // Fetch class schedule
    const { data: classSchedule } = await supabase
      .from('class_schedules')
      .select('id, name, instructor_id, scheduled_time, day_of_week, max_capacity')
      .eq('id', classScheduleId)
      .eq('academy_id', membership.academy_id)
      .single();

    if (!classSchedule) {
      return apiError('Turma não encontrada nesta academia', 'NOT_FOUND', 404);
    }

    // Fetch enrolled students
    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('membership_id, memberships(id, profile_id, belt_rank, joined_at, status, profiles(full_name, avatar_url))')
      .eq('class_schedule_id', classScheduleId)
      .eq('status', 'active');

    const { analyzeClass } = await import('@/lib/domain/intelligence/engines/class-optimizer');
    const { buildDevelopmentSnapshot } = await import('@/lib/application/progression/state/build-snapshot');

    // Build student data for each enrolled student
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
            engagementScore: snapshot.overallScore ?? 50,
            engagementTier: 'active' as const,
            churnRisk: 0,
            currentMilestone: snapshot.milestones?.currentLabel ?? '',
            currentMilestoneOrder: snapshot.milestones?.currentOrder ?? 0,
            currentSublevel: snapshot.sublevels?.current ?? 0,
            daysSinceEnrollment: Math.floor(
              (Date.now() - new Date(member.joined_at).getTime()) / (1000 * 60 * 60 * 24),
            ),
            daysSinceLastCheckin: 0,
            streakCurrent: snapshot.activity?.currentStreak ?? 0,
          };
        } catch {
          return null;
        }
      }),
    );

    const validStudents = students.filter(Boolean) as any[];

    const insight = analyzeClass({
      classScheduleId,
      className: classSchedule.name,
      instructorId: classSchedule.instructor_id,
      scheduledTime: classSchedule.scheduled_time,
      dayOfWeek: classSchedule.day_of_week,
      maxCapacity: classSchedule.max_capacity ?? 30,
      students: validStudents,
    });

    return apiOk(insight);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
