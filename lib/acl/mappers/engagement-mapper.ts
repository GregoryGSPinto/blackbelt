/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ENGAGEMENT MAPPER — ACL para Engagement Scorer                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Extrai features do snapshot + queries adicionais para o        ║
 * ║  motor de engajamento multi-dimensional.                        ║
 * ║                                                                 ║
 * ║  Este é o ÚNICO ponto onde o Engagement Scorer toca dados.      ║
 * ║  Respeita a fronteira ACL.                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ParticipantDevelopmentSnapshot } from '@/lib/application/progression/state/snapshot';

// ════════════════════════════════════════════════════════════════════
// ENGAGEMENT INPUT — Vetor de features para o engine
// ════════════════════════════════════════════════════════════════════

export interface EngagementInput {
  participantId: string;

  // ── Physical dimension ─────────────────────────────────────
  checkinsLast30Days: number;
  academyAvgCheckins: number;
  hoursReal: number;
  hoursExpected: number;
  currentStreak: number;

  // ── Pedagogical dimension ──────────────────────────────────
  overallScore: number;
  sublevelsGained90Days: number;
  maxSublevels: number;
  evaluationsApproved: number;
  evaluationsTotal: number;

  // ── Social dimension ───────────────────────────────────────
  rankingPositionNormalized: number;    // 0-100, top=100
  achievementsUnlocked: number;
  achievementsAvailable: number;
  socialConnectionScore: number;        // 0-100

  // ── Financial dimension ────────────────────────────────────
  paymentStatus: 'current' | 'overdue_15' | 'overdue_30' | 'paused' | 'cancelled';

  // ── Digital dimension ──────────────────────────────────────
  digitalCheckin: boolean;
  appAccessLast7Days: boolean;
  viewedContent: boolean;

  // ── Context ────────────────────────────────────────────────
  daysSinceEnrollment: number | null;
  previousOverallScore?: number;
}

// ════════════════════════════════════════════════════════════════════
// FEATURE EXTRACTION — From Snapshot (no DB calls)
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai features de engajamento disponíveis diretamente do snapshot.
 * Pure function — sem side effects, sem queries.
 */
export function extractEngagementFromSnapshot(
  snapshot: ParticipantDevelopmentSnapshot,
): Partial<EngagementInput> {
  const enrollmentDate = snapshot.time.enrollmentDate;
  const daysSinceEnrollment = enrollmentDate
    ? Math.floor((Date.now() - new Date(enrollmentDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    participantId: snapshot.participantId,
    currentStreak: snapshot.activity.currentStreak ?? 0,
    overallScore: (snapshot.overallScore as number) ?? 0,
    daysSinceEnrollment,
  };
}

// ════════════════════════════════════════════════════════════════════
// FEATURE EXTRACTION — From Supabase (requires DB calls)
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai features de engajamento que precisam de queries ao banco.
 * Usa Promise.allSettled para resiliência.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function extractEngagementAdditionalFeatures(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<Partial<EngagementInput>> {
  const [
    checkinsResult,
    paymentResult,
    rankingResult,
    achievementsResult,
    digitalResult,
  ] = await Promise.allSettled([
    fetchCheckinsLast30Days(membershipId, academyId, supabase),
    fetchPaymentStatus(membershipId, academyId, supabase),
    fetchRankingPosition(membershipId, academyId, supabase),
    fetchAchievements(membershipId, academyId, supabase),
    fetchDigitalUsage(membershipId, academyId, supabase),
  ]);

  return {
    checkinsLast30Days: checkinsResult.status === 'fulfilled' ? checkinsResult.value.checkins : 0,
    academyAvgCheckins: checkinsResult.status === 'fulfilled' ? checkinsResult.value.academyAvg : 8,
    hoursReal: checkinsResult.status === 'fulfilled' ? checkinsResult.value.hoursReal : 0,
    hoursExpected: checkinsResult.status === 'fulfilled' ? checkinsResult.value.hoursExpected : 12,
    paymentStatus: paymentResult.status === 'fulfilled' ? paymentResult.value : 'current',
    rankingPositionNormalized: rankingResult.status === 'fulfilled' ? rankingResult.value : 50,
    achievementsUnlocked: achievementsResult.status === 'fulfilled' ? achievementsResult.value.unlocked : 0,
    achievementsAvailable: achievementsResult.status === 'fulfilled' ? achievementsResult.value.available : 0,
    digitalCheckin: digitalResult.status === 'fulfilled' ? digitalResult.value.digitalCheckin : false,
    appAccessLast7Days: digitalResult.status === 'fulfilled' ? digitalResult.value.appAccess : false,
    viewedContent: digitalResult.status === 'fulfilled' ? digitalResult.value.viewedContent : false,
  };
}

// ════════════════════════════════════════════════════════════════════
// COMBINED EXTRACTION
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai o vetor completo de engajamento combinando snapshot + queries.
 */
export async function extractEngagementInput(
  snapshot: ParticipantDevelopmentSnapshot,
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<EngagementInput> {
  const snapshotFeatures = extractEngagementFromSnapshot(snapshot);
  const additionalFeatures = await extractEngagementAdditionalFeatures(membershipId, academyId, supabase);

  return {
    participantId: snapshotFeatures.participantId!,

    // Physical
    checkinsLast30Days: additionalFeatures.checkinsLast30Days ?? 0,
    academyAvgCheckins: additionalFeatures.academyAvgCheckins ?? 8,
    hoursReal: additionalFeatures.hoursReal ?? 0,
    hoursExpected: additionalFeatures.hoursExpected ?? 12,
    currentStreak: snapshotFeatures.currentStreak ?? 0,

    // Pedagogical
    overallScore: snapshotFeatures.overallScore ?? 0,
    sublevelsGained90Days: snapshot.sublevels?.current ?? 0,
    maxSublevels: snapshot.sublevels?.total ?? 4,
    evaluationsApproved: 0, // Populated by caller if available
    evaluationsTotal: 0,

    // Social
    rankingPositionNormalized: additionalFeatures.rankingPositionNormalized ?? 50,
    achievementsUnlocked: additionalFeatures.achievementsUnlocked ?? 0,
    achievementsAvailable: additionalFeatures.achievementsAvailable ?? 0,
    socialConnectionScore: 50, // Populated by social-graph engine later

    // Financial
    paymentStatus: additionalFeatures.paymentStatus ?? 'current',

    // Digital
    digitalCheckin: additionalFeatures.digitalCheckin ?? false,
    appAccessLast7Days: additionalFeatures.appAccessLast7Days ?? false,
    viewedContent: additionalFeatures.viewedContent ?? false,

    // Context
    daysSinceEnrollment: snapshotFeatures.daysSinceEnrollment ?? null,
  };
}

// ════════════════════════════════════════════════════════════════════
// PRIVATE FETCH HELPERS
// ════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCheckinsLast30Days(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ checkins: number; academyAvg: number; hoursReal: number; hoursExpected: number }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [memberResult, academyResult] = await Promise.allSettled([
    supabase
      .from('attendances')
      .select('checked_in_at, duration_minutes')
      .eq('membership_id', membershipId)
      .eq('academy_id', academyId)
      .gte('checked_in_at', thirtyDaysAgo),
    supabase
      .from('attendances')
      .select('membership_id')
      .eq('academy_id', academyId)
      .gte('checked_in_at', thirtyDaysAgo),
  ]);

  const memberData = memberResult.status === 'fulfilled' ? memberResult.value.data ?? [] : [];
  const academyData = academyResult.status === 'fulfilled' ? academyResult.value.data ?? [] : [];

  const checkins = memberData.length;

  // Compute academy average: total checkins / unique members
  const uniqueMembers = new Set(academyData.map((a: { membership_id: string }) => a.membership_id)).size;
  const academyAvg = uniqueMembers > 0 ? Math.round(academyData.length / uniqueMembers) : 8;

  // Hours: sum duration_minutes and convert to hours
  const totalMinutes = memberData.reduce(
    (sum: number, a: { duration_minutes?: number }) => sum + (a.duration_minutes ?? 60),
    0,
  );
  const hoursReal = Math.round((totalMinutes / 60) * 10) / 10;

  // Expected: 3 sessions/week * 4.3 weeks * 1 hour
  const hoursExpected = 12;

  return { checkins, academyAvg, hoursReal, hoursExpected };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPaymentStatus(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<EngagementInput['paymentStatus']> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (sub?.status === 'canceled') return 'cancelled';
  if (sub?.status === 'suspended' || sub?.status === 'paused') return 'paused';

  // Check for overdue invoices
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('id, due_date')
    .eq('academy_id', academyId)
    .eq('status', 'overdue')
    .limit(5);

  if (overdueInvoices && overdueInvoices.length > 0) {
    const oldestDue = overdueInvoices.reduce(
      (oldest: string, inv: { due_date: string }) =>
        inv.due_date < oldest ? inv.due_date : oldest,
      overdueInvoices[0].due_date,
    );
    const daysOverdue = Math.floor(
      (Date.now() - new Date(oldestDue).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysOverdue > 30) return 'overdue_30';
    if (daysOverdue > 15) return 'overdue_15';
  }

  return 'current';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRankingPosition(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<number> {
  const { data } = await supabase
    .from('rankings')
    .select('position, total_participants')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('period_end', { ascending: false })
    .limit(1)
    .single();

  if (!data?.position || !data?.total_participants) return 50;

  // Normalize: position 1 = 100, last = 0
  const normalized = Math.round(
    ((data.total_participants - data.position) / Math.max(1, data.total_participants - 1)) * 100,
  );
  return Math.max(0, Math.min(100, normalized));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAchievements(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ unlocked: number; available: number }> {
  const [unlockedResult, availableResult] = await Promise.allSettled([
    supabase
      .from('achievements_unlocked')
      .select('id')
      .eq('membership_id', membershipId)
      .eq('academy_id', academyId),
    supabase
      .from('achievements')
      .select('id')
      .eq('academy_id', academyId)
      .eq('active', true),
  ]);

  const unlocked = unlockedResult.status === 'fulfilled'
    ? (unlockedResult.value.data?.length ?? 0)
    : 0;
  const available = availableResult.status === 'fulfilled'
    ? (availableResult.value.data?.length ?? 0)
    : 0;

  return { unlocked, available };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchDigitalUsage(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ digitalCheckin: boolean; appAccess: boolean; viewedContent: boolean }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [checkinResult, accessResult, contentResult] = await Promise.allSettled([
    supabase
      .from('attendances')
      .select('check_in_method')
      .eq('membership_id', membershipId)
      .eq('academy_id', academyId)
      .eq('check_in_method', 'digital')
      .gte('checked_in_at', sevenDaysAgo)
      .limit(1),
    supabase
      .from('app_sessions')
      .select('id')
      .eq('membership_id', membershipId)
      .gte('created_at', sevenDaysAgo)
      .limit(1),
    supabase
      .from('content_views')
      .select('id')
      .eq('membership_id', membershipId)
      .gte('viewed_at', sevenDaysAgo)
      .limit(1),
  ]);

  return {
    digitalCheckin: checkinResult.status === 'fulfilled' && (checkinResult.value.data?.length ?? 0) > 0,
    appAccess: accessResult.status === 'fulfilled' && (accessResult.value.data?.length ?? 0) > 0,
    viewedContent: contentResult.status === 'fulfilled' && (contentResult.value.data?.length ?? 0) > 0,
  };
}
