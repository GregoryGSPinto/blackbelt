/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CLASS OPTIMIZER MAPPER — ACL para Class Optimizer Engine       ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Busca dados de turma (schedule, alunos, presença) e combina    ║
 * ║  com dados de engajamento e DNA já computados.                  ║
 * ║                                                                 ║
 * ║  Respeita a fronteira ACL.                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  ClassAnalysisInput,
  ClassStudentData,
} from '@/lib/domain/intelligence/engines/class-optimizer';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';
import type { StudentDNA } from '@/lib/domain/intelligence/models/student-dna.types';

// ════════════════════════════════════════════════════════════════════
// COMBINED EXTRACTION
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai todos os dados necessários para análise de uma turma.
 * Enriches com mapas de engagement e DNA previamente computados.
 *
 * @param classScheduleId - ID da turma
 * @param academyId - ID da academia
 * @param supabase - Client Supabase
 * @param engagementScores - Mapa participantId -> EngagementScore
 * @param dnaProfiles - Mapa participantId -> StudentDNA
 */
export async function extractClassAnalysisInput(
  classScheduleId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  engagementScores: Map<string, EngagementScore>,
  dnaProfiles: Map<string, StudentDNA>,
): Promise<ClassAnalysisInput> {
  const [
    scheduleResult,
    enrolledResult,
    attendanceResult,
  ] = await Promise.allSettled([
    fetchClassSchedule(classScheduleId, academyId, supabase),
    fetchEnrolledStudents(classScheduleId, academyId, supabase),
    fetchRecentAttendance(classScheduleId, academyId, supabase),
  ]);

  const schedule = scheduleResult.status === 'fulfilled'
    ? scheduleResult.value
    : { className: 'Turma', instructorId: '', scheduledTime: '', dayOfWeek: 1, maxCapacity: 30 };

  const enrolledStudents = enrolledResult.status === 'fulfilled'
    ? enrolledResult.value
    : [];

  const attendanceStats = attendanceResult.status === 'fulfilled'
    ? attendanceResult.value
    : { avgAttendanceRate: 0, retentionRate: 0 };

  // Enrich students with engagement and DNA data
  const students: ClassStudentData[] = enrolledStudents.map(student => {
    const engagement = engagementScores.get(student.participantId);
    const dna = dnaProfiles.get(student.participantId);

    return {
      participantId: student.participantId,
      participantName: student.participantName,
      engagementScore: engagement?.overall ?? 50,
      engagementTier: engagement?.tier ?? 'active',
      churnRisk: dna?.predictions?.churnRisk ?? 0,
      currentMilestone: student.currentMilestone,
      currentMilestoneOrder: student.currentMilestoneOrder,
      currentSublevel: student.currentSublevel,
      daysSinceEnrollment: student.daysSinceEnrollment,
      daysSinceLastCheckin: student.daysSinceLastCheckin,
      streakCurrent: student.streakCurrent,
      dna: dna ?? undefined,
      competencyScores: dna?.difficultyProfile
        ? [
            ...dna.difficultyProfile.strongCompetencies.map(id => ({ id, name: id, score: 80 })),
            ...dna.difficultyProfile.weakCompetencies.map(id => ({ id, name: id, score: 30 })),
          ]
        : undefined,
    };
  });

  return {
    classScheduleId,
    className: schedule.className,
    instructorId: schedule.instructorId,
    scheduledTime: schedule.scheduledTime,
    dayOfWeek: schedule.dayOfWeek,
    maxCapacity: schedule.maxCapacity,
    students,
    avgAttendanceRate: attendanceStats.avgAttendanceRate,
    retentionRate: attendanceStats.retentionRate,
  };
}

// ════════════════════════════════════════════════════════════════════
// PRIVATE FETCH HELPERS
// ════════════════════════════════════════════════════════════════════

interface ClassScheduleData {
  className: string;
  instructorId: string;
  scheduledTime: string;
  dayOfWeek: number;
  maxCapacity: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchClassSchedule(
  classScheduleId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<ClassScheduleData> {
  const { data } = await supabase
    .from('class_schedules')
    .select('name, instructor_id, start_time, day_of_week, max_capacity')
    .eq('id', classScheduleId)
    .eq('academy_id', academyId)
    .single();

  if (!data) {
    return { className: 'Turma', instructorId: '', scheduledTime: '', dayOfWeek: 1, maxCapacity: 30 };
  }

  return {
    className: data.name ?? 'Turma',
    instructorId: data.instructor_id ?? '',
    scheduledTime: data.start_time ?? '',
    dayOfWeek: data.day_of_week ?? 1,
    maxCapacity: data.max_capacity ?? 30,
  };
}

interface EnrolledStudentRaw {
  participantId: string;
  participantName: string;
  currentMilestone: string;
  currentMilestoneOrder: number;
  currentSublevel: number;
  daysSinceEnrollment: number;
  daysSinceLastCheckin: number;
  streakCurrent: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchEnrolledStudents(
  classScheduleId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<EnrolledStudentRaw[]> {
  // Fetch enrollments with membership + participant data
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      membership_id,
      memberships (
        id,
        enrolled_at,
        participants (
          id,
          name,
          current_milestone_id,
          current_milestone_order,
          current_sublevel
        )
      )
    `)
    .eq('class_schedule_id', classScheduleId)
    .eq('academy_id', academyId)
    .eq('active', true);

  if (!enrollments || enrollments.length === 0) return [];

  // Fetch last checkin per membership for daysSinceLastCheckin
  const membershipIds = enrollments
    .map((e: { membership_id: string }) => e.membership_id)
    .filter(Boolean);

  const [lastCheckinsResult, streaksResult] = await Promise.allSettled([
    supabase
      .from('attendances')
      .select('membership_id, checked_in_at')
      .in('membership_id', membershipIds)
      .eq('academy_id', academyId)
      .order('checked_in_at', { ascending: false }),
    supabase
      .from('streaks')
      .select('membership_id, current_streak')
      .in('membership_id', membershipIds)
      .eq('academy_id', academyId),
  ]);

  // Build last checkin map
  const lastCheckinMap = new Map<string, string>();
  if (lastCheckinsResult.status === 'fulfilled' && lastCheckinsResult.value.data) {
    for (const row of lastCheckinsResult.value.data) {
      if (!lastCheckinMap.has(row.membership_id)) {
        lastCheckinMap.set(row.membership_id, row.checked_in_at);
      }
    }
  }

  // Build streak map
  const streakMap = new Map<string, number>();
  if (streaksResult.status === 'fulfilled' && streaksResult.value.data) {
    for (const row of streaksResult.value.data) {
      streakMap.set(row.membership_id, row.current_streak ?? 0);
    }
  }

  const now = Date.now();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return enrollments.map((enrollment: any) => {
    const membership = enrollment.memberships;
    const participant = membership?.participants;
    const membershipId = enrollment.membership_id;

    const enrolledAt = membership?.enrolled_at;
    const daysSinceEnrollment = enrolledAt
      ? Math.floor((now - new Date(enrolledAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const lastCheckin = lastCheckinMap.get(membershipId);
    const daysSinceLastCheckin = lastCheckin
      ? Math.floor((now - new Date(lastCheckin).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      participantId: participant?.id ?? membershipId,
      participantName: participant?.name ?? 'Aluno',
      currentMilestone: participant?.current_milestone_id ?? '',
      currentMilestoneOrder: participant?.current_milestone_order ?? 0,
      currentSublevel: participant?.current_sublevel ?? 0,
      daysSinceEnrollment,
      daysSinceLastCheckin,
      streakCurrent: streakMap.get(membershipId) ?? 0,
    };
  }).filter((s: EnrolledStudentRaw) => s.participantId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRecentAttendance(
  classScheduleId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ avgAttendanceRate: number; retentionRate: number }> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [recentResult, oldResult] = await Promise.allSettled([
    supabase
      .from('attendances')
      .select('membership_id')
      .eq('class_schedule_id', classScheduleId)
      .eq('academy_id', academyId)
      .gte('checked_in_at', thirtyDaysAgo),
    supabase
      .from('attendances')
      .select('membership_id')
      .eq('class_schedule_id', classScheduleId)
      .eq('academy_id', academyId)
      .gte('checked_in_at', ninetyDaysAgo)
      .lt('checked_in_at', thirtyDaysAgo),
  ]);

  const recentData = recentResult.status === 'fulfilled' ? (recentResult.value.data ?? []) : [];
  const oldData = oldResult.status === 'fulfilled' ? (oldResult.value.data ?? []) : [];

  // Avg attendance rate (sessions in last 30 days / expected ~12 sessions)
  const avgAttendanceRate = recentData.length > 0
    ? Math.min(100, Math.round((recentData.length / 12) * 100))
    : 0;

  // Retention: how many unique members from 60-90 days ago are still active in last 30 days
  const oldMembers = new Set(oldData.map((a: { membership_id: string }) => a.membership_id));
  const recentMembers = new Set(recentData.map((a: { membership_id: string }) => a.membership_id));

  let retentionRate = 0;
  if (oldMembers.size > 0) {
    let retained = 0;
    Array.from(oldMembers).forEach(m => {
      if (recentMembers.has(m)) retained++;
    });
    retentionRate = Math.round((retained / oldMembers.size) * 100);
  }

  return { avgAttendanceRate, retentionRate };
}
