/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STUDENT DNA MAPPER — ACL para Student DNA Engine               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Extrai padrões históricos de check-ins, intervalos, dias da    ║
 * ║  semana, horários, co-treinadores, pontos e streaks.            ║
 * ║                                                                 ║
 * ║  Combina snapshot + queries para montar StudentDNAInput.        ║
 * ║  Respeita a fronteira ACL.                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ParticipantDevelopmentSnapshot } from '@/lib/application/progression/state/snapshot';
import type { StudentDNAInput } from '@/lib/domain/intelligence/engines/student-dna';
import type { TimeSlot } from '@/lib/domain/intelligence/core/types';

// ════════════════════════════════════════════════════════════════════
// COMBINED EXTRACTION
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai o vetor completo de features do DNA comportamental.
 * Combina snapshot + queries adicionais via Supabase.
 */
export async function extractStudentDNAInput(
  snapshot: ParticipantDevelopmentSnapshot,
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<StudentDNAInput> {
  const [
    checkinPatternsResult,
    coTrainersResult,
    pointsResult,
    streakBreaksResult,
    competencyResult,
    evaluationResult,
    academyStatsResult,
  ] = await Promise.allSettled([
    fetchCheckinPatterns(membershipId, academyId, supabase),
    fetchCoTrainerFrequency(membershipId, academyId, supabase),
    fetchPointsHistory(membershipId, academyId, supabase),
    fetchStreakBreaks(membershipId, academyId, supabase),
    fetchCompetencyScores(membershipId, academyId, supabase),
    fetchEvaluationResults(membershipId, academyId, supabase),
    fetchAcademyStats(academyId, supabase),
  ]);

  const checkinPatterns = checkinPatternsResult.status === 'fulfilled'
    ? checkinPatternsResult.value
    : defaultCheckinPatterns();

  const coTrainers = coTrainersResult.status === 'fulfilled'
    ? coTrainersResult.value
    : [];

  const points = pointsResult.status === 'fulfilled'
    ? pointsResult.value
    : [];

  const streakBreaks = streakBreaksResult.status === 'fulfilled'
    ? streakBreaksResult.value
    : [];

  const competencies = competencyResult.status === 'fulfilled'
    ? competencyResult.value
    : [];

  const evaluations = evaluationResult.status === 'fulfilled'
    ? evaluationResult.value
    : [];

  const academyStats = academyStatsResult.status === 'fulfilled'
    ? academyStatsResult.value
    : defaultAcademyStats();

  // Compute enrollment days
  const enrollmentDate = snapshot.time.enrollmentDate;
  const daysSinceEnrollment = enrollmentDate
    ? Math.floor((Date.now() - new Date(enrollmentDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Build sessions per week from checkin patterns
  const sessionsPerWeek = computeSessionsPerWeek(checkinPatterns.timestamps);

  return {
    participantId: snapshot.participantId,
    participantName: snapshot.participantName ?? '',

    // Raw data for dimension calculation
    checkinIntervals: checkinPatterns.intervals,
    sessionsPerWeek,
    avgSessionDuration: checkinPatterns.avgDuration,
    academyAvgSessionDuration: academyStats.avgSessionDuration,
    milestoneTransitionDays: snapshot.time.milestoneTransitionDays ?? [],
    academyAvgTransitionDays: academyStats.avgTransitionDays,
    streakBreaks,
    coTrainerFrequency: coTrainers,
    pointsHistory: points,
    achievementsCount: snapshot.achievements?.total ?? 0,
    rankingChanges: [],  // TODO: populate from ranking history
    distinctClassesAttended: checkinPatterns.distinctClasses,
    totalClassesAvailable: academyStats.totalClasses,
    feedbackImprovements: [], // TODO: populate from feedback data

    // Patterns
    checkinDaysOfWeek: checkinPatterns.daysOfWeek,
    checkinTimeSlots: checkinPatterns.timeSlots,
    gapsOverSevenDays: checkinPatterns.gaps,

    // Difficulty profile
    competencyScores: competencies,
    sublevelDays: snapshot.time.sublevelDays ?? [],
    academyAvgSublevelDays: academyStats.avgSublevelDays,
    evaluationResults: evaluations,

    // Predictions from other engines
    churnRisk: 0, // Populated by orchestrator from churn engine

    // Metadata
    daysSinceEnrollment,
    totalEvents: checkinPatterns.totalCheckins,
    firstEventAt: checkinPatterns.firstCheckinAt ?? new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════
// PRIVATE FETCH HELPERS
// ════════════════════════════════════════════════════════════════════

interface CheckinPatterns {
  timestamps: string[];
  intervals: number[];
  daysOfWeek: number[];
  timeSlots: TimeSlot[];
  avgDuration: number;
  distinctClasses: number;
  totalCheckins: number;
  firstCheckinAt: string | null;
  gaps: StudentDNAInput['gapsOverSevenDays'];
}

function defaultCheckinPatterns(): CheckinPatterns {
  return {
    timestamps: [],
    intervals: [],
    daysOfWeek: [],
    timeSlots: [],
    avgDuration: 60,
    distinctClasses: 0,
    totalCheckins: 0,
    firstCheckinAt: null,
    gaps: [],
  };
}

function defaultAcademyStats() {
  return {
    avgSessionDuration: 60,
    avgTransitionDays: [] as number[],
    totalClasses: 5,
    avgSublevelDays: 30,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCheckinPatterns(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<CheckinPatterns> {
  const { data } = await supabase
    .from('attendances')
    .select('checked_in_at, duration_minutes, class_schedule_id')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('checked_in_at', { ascending: true });

  if (!data || data.length === 0) return defaultCheckinPatterns();

  const timestamps: string[] = data.map((a: { checked_in_at: string }) => a.checked_in_at);
  const intervals: number[] = [];
  const daysOfWeek: number[] = [];
  const timeSlots: TimeSlot[] = [];
  let totalDuration = 0;
  const classIds = new Set<string>();

  for (let i = 0; i < data.length; i++) {
    const date = new Date(data[i].checked_in_at);
    daysOfWeek.push(date.getDay());
    timeSlots.push(classifyTimeSlot(date.getHours()));
    totalDuration += data[i].duration_minutes ?? 60;

    if (data[i].class_schedule_id) {
      classIds.add(data[i].class_schedule_id);
    }

    if (i > 0) {
      const prevDate = new Date(data[i - 1].checked_in_at);
      const intervalDays = Math.floor(
        (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      intervals.push(intervalDays);
    }
  }

  // Detect gaps > 7 days
  const gaps: StudentDNAInput['gapsOverSevenDays'] = [];
  for (let i = 0; i < intervals.length; i++) {
    if (intervals[i] > 7) {
      // Get frequency before gap (sessions per week in the 4 weeks before)
      const gapStartIdx = i;
      const beforeGapIntervals = intervals.slice(Math.max(0, gapStartIdx - 8), gapStartIdx);
      const frequency = beforeGapIntervals.length > 0
        ? [beforeGapIntervals.reduce((a, b) => a + b, 0) / beforeGapIntervals.length]
        : [];

      gaps.push({
        frequency,
        beforeGap: beforeGapIntervals,
        coincidenceWithHoliday: false, // Would need holiday data
      });
    }
  }

  return {
    timestamps,
    intervals,
    daysOfWeek,
    timeSlots,
    avgDuration: data.length > 0 ? Math.round(totalDuration / data.length) : 60,
    distinctClasses: classIds.size,
    totalCheckins: data.length,
    firstCheckinAt: timestamps[0] ?? null,
    gaps,
  };
}

function classifyTimeSlot(hour: number): TimeSlot {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function computeSessionsPerWeek(timestamps: string[]): number[] {
  if (timestamps.length === 0) return [];

  const weeks: Record<string, number> = {};
  for (const ts of timestamps) {
    const date = new Date(ts);
    // Get ISO week key
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7,
    );
    const key = `${date.getFullYear()}-W${weekNum}`;
    weeks[key] = (weeks[key] ?? 0) + 1;
  }

  return Object.values(weeks);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCoTrainerFrequency(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ partnerId: string; count: number }[]> {
  // Find sessions where participant attended, then find others in same sessions
  const { data: sessions } = await supabase
    .from('attendances')
    .select('class_session_id')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .not('class_session_id', 'is', null);

  if (!sessions || sessions.length === 0) return [];

  const sessionIds = [...new Set(sessions.map((s: { class_session_id: string }) => s.class_session_id))];

  // Fetch all attendees in those sessions (limited to recent 100 sessions)
  const recentSessionIds = sessionIds.slice(-100);
  const { data: coAttendees } = await supabase
    .from('attendances')
    .select('membership_id, class_session_id')
    .in('class_session_id', recentSessionIds)
    .eq('academy_id', academyId)
    .neq('membership_id', membershipId);

  if (!coAttendees || coAttendees.length === 0) return [];

  // Count co-occurrences
  const partnerCounts: Record<string, number> = {};
  for (const co of coAttendees) {
    partnerCounts[co.membership_id] = (partnerCounts[co.membership_id] ?? 0) + 1;
  }

  return Object.entries(partnerCounts)
    .map(([partnerId, count]) => ({ partnerId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 partners
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPointsHistory(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<number[]> {
  const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('points_ledger')
    .select('points, created_at')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .gte('created_at', twelveWeeksAgo)
    .order('created_at', { ascending: true });

  if (!data || data.length === 0) return [];

  // Aggregate by week
  const weeklyPoints: Record<string, number> = {};
  for (const entry of data) {
    const date = new Date(entry.created_at);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7,
    );
    const key = `${date.getFullYear()}-W${weekNum}`;
    weeklyPoints[key] = (weeklyPoints[key] ?? 0) + entry.points;
  }

  return Object.values(weeklyPoints);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchStreakBreaks(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ daysToReturn: number }[]> {
  const { data } = await supabase
    .from('attendances')
    .select('checked_in_at')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('checked_in_at', { ascending: true });

  if (!data || data.length < 2) return [];

  const breaks: { daysToReturn: number }[] = [];

  for (let i = 1; i < data.length; i++) {
    const prev = new Date(data[i - 1].checked_in_at);
    const curr = new Date(data[i].checked_in_at);
    const gapDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    // Consider a break if gap is > 7 days (missed a full week)
    if (gapDays > 7) {
      breaks.push({ daysToReturn: gapDays });
    }
  }

  return breaks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCompetencyScores(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ id: string; name: string; score: number }[]> {
  const { data } = await supabase
    .from('competency_scores')
    .select('competency_id, competency_name, score')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('updated_at', { ascending: false });

  if (!data || data.length === 0) return [];

  // Deduplicate by competency_id (keep most recent)
  const seen = new Set<string>();
  const result: { id: string; name: string; score: number }[] = [];
  for (const row of data) {
    if (!seen.has(row.competency_id)) {
      seen.add(row.competency_id);
      result.push({
        id: row.competency_id,
        name: row.competency_name ?? row.competency_id,
        score: row.score ?? 0,
      });
    }
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchEvaluationResults(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ score: number }[]> {
  const { data } = await supabase
    .from('evaluations')
    .select('score')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('evaluated_at', { ascending: true });

  if (!data || data.length === 0) return [];

  return data.map((e: { score: number }) => ({ score: e.score ?? 0 }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAcademyStats(
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{
  avgSessionDuration: number;
  avgTransitionDays: number[];
  totalClasses: number;
  avgSublevelDays: number;
}> {
  const [classesResult, durationResult] = await Promise.allSettled([
    supabase
      .from('class_schedules')
      .select('id')
      .eq('academy_id', academyId)
      .eq('active', true),
    supabase
      .from('attendances')
      .select('duration_minutes')
      .eq('academy_id', academyId)
      .order('checked_in_at', { ascending: false })
      .limit(500),
  ]);

  const totalClasses = classesResult.status === 'fulfilled'
    ? (classesResult.value.data?.length ?? 5)
    : 5;

  const durations = durationResult.status === 'fulfilled'
    ? (durationResult.value.data ?? [])
    : [];

  const avgDuration = durations.length > 0
    ? Math.round(
        durations.reduce((sum: number, d: { duration_minutes?: number }) => sum + (d.duration_minutes ?? 60), 0) /
          durations.length,
      )
    : 60;

  return {
    avgSessionDuration: avgDuration,
    avgTransitionDays: [90, 120, 150], // Defaults; TODO: compute from actual promotion data
    totalClasses,
    avgSublevelDays: 30, // Default; TODO: compute from actual sublevel transitions
  };
}
