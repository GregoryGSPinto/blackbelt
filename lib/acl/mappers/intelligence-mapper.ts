/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INTELLIGENCE MAPPER — ACL para IA                              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Extrai features do snapshot + queries adicionais para o        ║
 * ║  motor de churn.                                                ║
 * ║                                                                 ║
 * ║  Este é o ÚNICO ponto onde a IA toca dados do domínio.         ║
 * ║  Respeita a fronteira ACL.                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ParticipantDevelopmentSnapshot } from '@/lib/application/progression/state/snapshot';
import type { ChurnFeatureVector } from '@/lib/domain/intelligence';

// ════════════════════════════════════════════════════════════════════
// FEATURE EXTRACTION — From Snapshot (no DB calls)
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai features disponíveis diretamente do snapshot.
 * Pure function — sem side effects, sem queries.
 */
export function extractFeaturesFromSnapshot(
  snapshot: ParticipantDevelopmentSnapshot,
): Partial<ChurnFeatureVector> {
  const enrollmentDate = snapshot.time.enrollmentDate;
  const daysSinceEnrollment = enrollmentDate
    ? Math.floor((Date.now() - new Date(enrollmentDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    participantId: snapshot.participantId,
    participantName: snapshot.participantName,
    participantAvatar: snapshot.participantAvatar,
    attendancePercentage: snapshot.activity.attendancePercentage as number,
    currentStreak: snapshot.activity.currentStreak,
    bestStreak: snapshot.activity.bestStreak,
    monthsInCurrentMilestone: snapshot.time.monthsInCurrentMilestone,
    hasRecentSublevelProgress: snapshot.sublevels.current > 0,
    overallScore: snapshot.overallScore as number,
    daysSinceEnrollment,
    collectedAt: new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════════════
// FEATURE EXTRACTION — From Supabase (requires DB calls)
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai features que precisam de queries adicionais ao banco.
 * Chamado pela application layer, não diretamente por componentes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function extractAdditionalFeatures(
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<Partial<ChurnFeatureVector>> {
  const [checkinResult, pointsResult, paymentResult] = await Promise.allSettled([
    fetchDaysSinceLastCheckin(membershipId, academyId, supabase),
    fetchWeeklyPointsTrend(membershipId, academyId, supabase),
    fetchPaymentIssueLevel(membershipId, academyId, supabase),
  ]);

  return {
    daysSinceLastCheckin: checkinResult.status === 'fulfilled' ? checkinResult.value : null,
    weeklyPointsTrend: pointsResult.status === 'fulfilled' ? pointsResult.value : null,
    paymentIssueLevel: paymentResult.status === 'fulfilled' ? paymentResult.value : null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchDaysSinceLastCheckin(membershipId: string, academyId: string, supabase: any): Promise<number> {
  const { data } = await supabase
    .from('attendances')
    .select('checked_in_at')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('checked_in_at', { ascending: false })
    .limit(1)
    .single();

  if (!data?.checked_in_at) return 999; // Nunca fez check-in
  return Math.floor((Date.now() - new Date(data.checked_in_at).getTime()) / (1000 * 60 * 60 * 24));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchWeeklyPointsTrend(membershipId: string, academyId: string, supabase: any): Promise<number> {
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('points_ledger')
    .select('points, created_at')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .gte('created_at', fourWeeksAgo)
    .order('created_at', { ascending: true });

  if (!data || data.length === 0) return 0;

  // Split into 4 weekly buckets
  const now = Date.now();
  const weekBuckets = [0, 0, 0, 0]; // [4 weeks ago, 3 weeks ago, 2 weeks ago, last week]
  for (const entry of data) {
    const weeksAgo = Math.floor((now - new Date(entry.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const idx = Math.min(3, Math.max(0, 3 - weeksAgo));
    weekBuckets[idx] += entry.points;
  }

  // Calculate trend: compare last 2 weeks avg vs first 2 weeks avg
  const recentAvg = (weekBuckets[2] + weekBuckets[3]) / 2;
  const olderAvg = (weekBuckets[0] + weekBuckets[1]) / 2;

  if (olderAvg === 0) return recentAvg > 0 ? 100 : 0;
  return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPaymentIssueLevel(membershipId: string, academyId: string, supabase: any): Promise<number> {
  // Check subscription status
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('membership_id', membershipId)
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (sub?.status === 'canceled') return 3;
  if (sub?.status === 'suspended') return 2;
  if (sub?.status === 'past_due') return 1;

  // Check for overdue invoices
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('id')
    .eq('academy_id', academyId)
    .eq('status', 'overdue')
    .limit(5);

  if (overdueInvoices && overdueInvoices.length >= 2) return 4;
  if (overdueInvoices && overdueInvoices.length === 1) return 1;

  return 0;
}

// ════════════════════════════════════════════════════════════════════
// COMBINED EXTRACTION
// ════════════════════════════════════════════════════════════════════

/**
 * Extrai o vetor completo de features combinando snapshot + queries.
 */
export async function extractChurnFeatures(
  snapshot: ParticipantDevelopmentSnapshot,
  membershipId: string,
  academyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<ChurnFeatureVector> {
  const snapshotFeatures = extractFeaturesFromSnapshot(snapshot);
  const additionalFeatures = await extractAdditionalFeatures(membershipId, academyId, supabase);

  return {
    participantId: snapshotFeatures.participantId!,
    participantName: snapshotFeatures.participantName!,
    participantAvatar: snapshotFeatures.participantAvatar,
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
}
