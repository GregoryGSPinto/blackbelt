/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SOCIAL GRAPH MAPPER — ACL para Social Graph Engine             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Busca dados de co-presença da tabela de attendances e agrupa   ║
 * ║  por sessão para contar pares que treinam juntos.               ║
 * ║                                                                 ║
 * ║  Respeita a fronteira ACL.                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { SocialGraphInput } from '@/lib/domain/intelligence/engines/social-graph';
import type { Score0to100 } from '@/lib/domain/intelligence/core/types';

// ════════════════════════════════════════════════════════════════════
// COMBINED EXTRACTION
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai o grafo social de um participante a partir de co-presenças.
 *
 * @param membershipId - ID do membership do aluno
 * @param academyId - ID da academia
 * @param supabase - Client Supabase
 * @param engagementScore - Score de engajamento previamente computado (0-100)
 * @param churnRisk - Risco de churn previamente computado (0-100)
 * @param daysSinceEnrollment - Dias desde a matrícula
 */
export async function extractSocialGraphInput(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  engagementScore: Score0to100 = 50,
  churnRisk: Score0to100 = 0,
  daysSinceEnrollment: number = 0,
): Promise<SocialGraphInput> {
  const [
    coAttendanceResult,
    totalCheckinsResult,
    classesResult,
    participantResult,
  ] = await Promise.allSettled([
    fetchCoAttendances(membershipId, academyId, supabase),
    fetchTotalCheckins(membershipId, academyId, supabase),
    fetchClassesAttended(membershipId, academyId, supabase),
    fetchParticipantName(membershipId, supabase),
  ]);

  const coAttendances = coAttendanceResult.status === 'fulfilled'
    ? coAttendanceResult.value
    : [];

  const totalCheckins = totalCheckinsResult.status === 'fulfilled'
    ? totalCheckinsResult.value
    : 0;

  const classesAttended = classesResult.status === 'fulfilled'
    ? classesResult.value
    : [];

  const participantName = participantResult.status === 'fulfilled'
    ? participantResult.value
    : '';

  return {
    participantId: membershipId,
    participantName,
    coAttendances,
    totalCheckins,
    classesAttended,
    daysSinceEnrollment,
    engagementScore,
    churnRisk,
  };
}

// ════════════════════════════════════════════════════════════════════
// PRIVATE FETCH HELPERS
// ════════════════════════════════════════════════════════════════════

interface CoAttendanceData {
  partnerId: string;
  partnerName: string;
  count: number;
  lastDate: string;
  isActive: boolean;
  sharedClasses: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCoAttendances(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<CoAttendanceData[]> {
  // Step 1: Get all session IDs for this member
  const { data: mySessions } = await supabase
    .from('attendances')
    .select('class_session_id, class_schedule_id, checked_in_at')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .not('class_session_id', 'is', null)
    .order('checked_in_at', { ascending: false })
    .limit(300); // Last ~300 sessions

  if (!mySessions || mySessions.length === 0) return [];

  const sessionIds = Array.from(new Set(
    mySessions.map((s: { class_session_id: string }) => s.class_session_id),
  ));

  // Build session -> class schedule map
  const sessionClassMap = new Map<string, string>();
  for (const s of mySessions) {
    if (s.class_session_id && s.class_schedule_id) {
      sessionClassMap.set(s.class_session_id, s.class_schedule_id);
    }
  }

  // Step 2: Get all other attendees in those sessions
  const { data: coAttendees } = await supabase
    .from('attendances')
    .select('membership_id, class_session_id, checked_in_at')
    .in('class_session_id', sessionIds)
    .eq('academy_id', academyId)
    .neq('membership_id', membershipId);

  if (!coAttendees || coAttendees.length === 0) return [];

  // Step 3: Group by partner and count
  const partnerMap = new Map<string, {
    count: number;
    lastDate: string;
    sharedClassIds: Set<string>;
  }>();

  for (const co of coAttendees) {
    const existing = partnerMap.get(co.membership_id);
    const classId = sessionClassMap.get(co.class_session_id) ?? '';

    if (existing) {
      existing.count++;
      if (co.checked_in_at > existing.lastDate) {
        existing.lastDate = co.checked_in_at;
      }
      if (classId) existing.sharedClassIds.add(classId);
    } else {
      const classIds = new Set<string>();
      if (classId) classIds.add(classId);
      partnerMap.set(co.membership_id, {
        count: 1,
        lastDate: co.checked_in_at ?? new Date().toISOString(),
        sharedClassIds: classIds,
      });
    }
  }

  // Step 4: Get partner names and active status
  const partnerIds = Array.from(partnerMap.keys()).slice(0, 50); // Top 50 partners

  const [namesResult, activeResult] = await Promise.allSettled([
    supabase
      .from('memberships')
      .select('id, participants(name)')
      .in('id', partnerIds)
      .eq('academy_id', academyId),
    fetchActivePartnerIds(partnerIds, academyId, supabase),
  ]);

  // Build name map
  const nameMap = new Map<string, string>();
  if (namesResult.status === 'fulfilled' && namesResult.value.data) {
    for (const row of namesResult.value.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const name = (row as any).participants?.name ?? 'Colega';
      nameMap.set(row.id, name);
    }
  }

  // Build active set
  const activeIds = activeResult.status === 'fulfilled'
    ? new Set(activeResult.value)
    : new Set<string>();

  // Step 5: Build result
  const result: CoAttendanceData[] = [];
  for (const [partnerId, data] of Array.from(partnerMap.entries())) {
    if (!partnerIds.includes(partnerId)) continue;

    result.push({
      partnerId,
      partnerName: nameMap.get(partnerId) ?? 'Colega',
      count: data.count,
      lastDate: data.lastDate,
      isActive: activeIds.has(partnerId),
      sharedClasses: data.sharedClassIds.size,
    });
  }

  // Sort by count descending, return top 30
  return result
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

/**
 * Returns IDs of partners who have checked in within the last 30 days.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchActivePartnerIds(
  partnerIds: string[],
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<string[]> {
  if (partnerIds.length === 0) return [];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('attendances')
    .select('membership_id')
    .in('membership_id', partnerIds)
    .eq('academy_id', academyId)
    .gte('checked_in_at', thirtyDaysAgo);

  if (!data) return [];

  return Array.from(new Set(data.map((a: { membership_id: string }) => a.membership_id)));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTotalCheckins(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<number> {
  const { count } = await supabase
    .from('attendances')
    .select('id', { count: 'exact', head: true })
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId);

  return count ?? 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchClassesAttended(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<string[]> {
  const { data } = await supabase
    .from('attendances')
    .select('class_schedule_id')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .not('class_schedule_id', 'is', null);

  if (!data) return [];

  return Array.from(new Set(data.map((a: { class_schedule_id: string }) => a.class_schedule_id)));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchParticipantName(
  membershipId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<string> {
  const { data } = await supabase
    .from('memberships')
    .select('participants(name)')
    .eq('id', membershipId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any)?.participants?.name ?? '';
}
