/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STUDENT DNA ENGINE — Perfil Comportamental Inteligente         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Calcula 8 dimensões comportamentais, padrões descobertos,      ║
 * ║  perfil de dificuldade e predições.                             ║
 * ║                                                                 ║
 * ║  Input:  StudentDNAInput (dados brutos coletados via ACL)       ║
 * ║  Output: StudentDNA (dimensões + padrões + dificuldade)         ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  StudentDNA,
  StudentDNADimensions,
  StudentDNAPatterns,
  DifficultyProfile,
} from '../models/student-dna.types';
import type {
  TimeSlot,
  DropoffPattern,
  LearningStyle,
  LearningSpeed,
  MotivationDriver,
} from '../core/types';
import {
  clampScore,
  safeDivide,
  standardDeviation,
  normalizeToScore,
  computeTrend,
} from '../core/scoring-utils';
import { calculateConfidence } from '../core/confidence-calculator';

// ════════════════════════════════════════════════════════════════════
// INPUT TYPE (defines what raw data we need)
// ════════════════════════════════════════════════════════════════════

export interface StudentDNAInput {
  participantId: string;
  participantName: string;

  // Raw data for dimension calculation
  checkinIntervals: number[];
  sessionsPerWeek: number[];
  avgSessionDuration: number;
  academyAvgSessionDuration: number;
  milestoneTransitionDays: number[];
  academyAvgTransitionDays: number[];
  streakBreaks: { daysToReturn: number }[];
  coTrainerFrequency: { partnerId: string; count: number }[];
  pointsHistory: number[];
  achievementsCount: number;
  rankingChanges: number[];
  distinctClassesAttended: number;
  totalClassesAvailable: number;
  feedbackImprovements: { improved: boolean; daysToImprove: number }[];

  // Patterns
  checkinDaysOfWeek: number[];
  checkinTimeSlots: TimeSlot[];
  gapsOverSevenDays: {
    frequency: number[];
    beforeGap: number[];
    coincidenceWithHoliday: boolean;
  }[];

  // Difficulty profile
  competencyScores: { id: string; name: string; score: number }[];
  sublevelDays: number[];
  academyAvgSublevelDays: number;
  evaluationResults: { score: number }[];

  // Predictions from other engines
  churnRisk: number;

  // Metadata
  daysSinceEnrollment: number;
  totalEvents: number;
  firstEventAt: string;
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPUTATION FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Computa o DNA comportamental completo de um aluno.
 *
 * @param input - Dados brutos coletados via ACL
 * @returns StudentDNA com dimensões, padrões e perfil de dificuldade
 */
export function computeStudentDNA(input: StudentDNAInput): StudentDNA {
  // ── Compute 8 behavioral dimensions ─────────────────────────
  const dimensions = computeDimensions(input);

  // ── Discover patterns ───────────────────────────────────────
  const patterns = discoverPatterns(input);

  // ── Build difficulty profile ────────────────────────────────
  const difficultyProfile = buildDifficultyProfile(input);

  // ── Build predictions ───────────────────────────────────────
  const predictions = buildPredictions(input, dimensions);

  // ── Compute confidence ──────────────────────────────────────
  const confidence = calculateConfidence(
    input.totalEvents,
    Math.max(100, input.totalEvents), // normalize against expected 100+ events
    input.daysSinceEnrollment,
    input.totalEvents,
  );

  return {
    participantId: input.participantId,
    dimensions,
    patterns,
    difficultyProfile,
    predictions,
    dataPoints: input.totalEvents,
    confidence,
    computedAt: new Date().toISOString(),
    firstEventAt: input.firstEventAt,
  };
}

// ════════════════════════════════════════════════════════════════════
// DIMENSION COMPUTATIONS
// ════════════════════════════════════════════════════════════════════

function computeDimensions(input: StudentDNAInput): StudentDNADimensions {
  return {
    consistency: computeConsistency(input),
    intensity: computeIntensity(input),
    progression: computeProgression(input),
    resilience: computeResilience(input),
    socialConnection: computeSocialConnection(input),
    competitiveness: computeCompetitiveness(input),
    curiosity: computeCuriosity(input),
    responsiveness: computeResponsiveness(input),
  };
}

// ── Consistency ─────────────────────────────────────────────────
// How regular is attendance? Low std dev of intervals = high consistency.

function computeConsistency(input: StudentDNAInput): number {
  if (input.checkinIntervals.length < 2) return 50;

  const avgInterval = input.checkinIntervals.reduce((a, b) => a + b, 0) / input.checkinIntervals.length;
  const stdDev = standardDeviation(input.checkinIntervals);

  // Lower coefficient of variation = more consistent
  const cv = safeDivide(stdDev, avgInterval, 1);

  // cv of 0 = perfect consistency (100), cv of 2+ = very inconsistent (0)
  const score = clampScore((1 - Math.min(cv, 2) / 2) * 100);

  // Bonus for sessions per week stability
  if (input.sessionsPerWeek.length >= 4) {
    const weeklyStdDev = standardDeviation(input.sessionsPerWeek);
    const weeklyAvg = input.sessionsPerWeek.reduce((a, b) => a + b, 0) / input.sessionsPerWeek.length;
    const weeklyCV = safeDivide(weeklyStdDev, weeklyAvg, 1);
    const weeklyBonus = clampScore((1 - Math.min(weeklyCV, 2) / 2) * 100);
    return clampScore(score * 0.6 + weeklyBonus * 0.4);
  }

  return score;
}

// ── Intensity ───────────────────────────────────────────────────
// Session frequency x duration compared to academy average.

function computeIntensity(input: StudentDNAInput): number {
  if (input.sessionsPerWeek.length === 0) return 50;

  const avgSessionsPerWeek = input.sessionsPerWeek.reduce((a, b) => a + b, 0) / input.sessionsPerWeek.length;

  // Duration ratio vs academy average
  const durationRatio = safeDivide(input.avgSessionDuration, input.academyAvgSessionDuration, 1);
  const durationScore = clampScore(durationRatio * 100);

  // Frequency score: 3+ sessions/week = 100, 0 = 0
  const frequencyScore = clampScore(safeDivide(avgSessionsPerWeek, 3, 0) * 100);

  return clampScore(frequencyScore * 0.5 + durationScore * 0.5);
}

// ── Progression ─────────────────────────────────────────────────
// Speed of milestone transitions vs academy average.

function computeProgression(input: StudentDNAInput): number {
  if (input.milestoneTransitionDays.length === 0 || input.academyAvgTransitionDays.length === 0) {
    return 50;
  }

  // Compare each transition to academy average
  let totalRatio = 0;
  const comparisons = Math.min(input.milestoneTransitionDays.length, input.academyAvgTransitionDays.length);

  for (let i = 0; i < comparisons; i++) {
    const participantDays = input.milestoneTransitionDays[i];
    const avgDays = input.academyAvgTransitionDays[i];

    // Faster than average = higher score
    // ratio > 1 means slower, ratio < 1 means faster
    const ratio = safeDivide(participantDays, avgDays, 1);
    totalRatio += ratio;
  }

  const avgRatio = totalRatio / comparisons;

  // ratio 0.5 = twice as fast = 100, ratio 2.0 = twice as slow = 0
  return clampScore(normalizeToScore(avgRatio, 2.0, 0.5));
}

// ── Resilience ──────────────────────────────────────────────────
// Ability to return after streak breaks.

function computeResilience(input: StudentDNAInput): number {
  if (input.streakBreaks.length === 0) {
    // Never had a break — either very new or very consistent
    return input.daysSinceEnrollment > 90 ? 95 : 70;
  }

  const returnDays = input.streakBreaks.map(b => b.daysToReturn);
  const avgReturn = returnDays.reduce((a, b) => a + b, 0) / returnDays.length;

  // Faster return = higher resilience
  // 1 day = 100, 7 days = 70, 14 days = 40, 30+ days = 0
  if (avgReturn <= 1) return 100;
  if (avgReturn <= 3) return 90;
  if (avgReturn <= 7) return 70;
  if (avgReturn <= 14) return 50;
  if (avgReturn <= 21) return 30;
  if (avgReturn <= 30) return 15;
  return 0;
}

// ── Social Connection ───────────────────────────────────────────
// How often trains with partners, diversity of partners.

function computeSocialConnection(input: StudentDNAInput): number {
  if (input.coTrainerFrequency.length === 0) return 20;

  const totalPartners = input.coTrainerFrequency.length;
  const totalCoSessions = input.coTrainerFrequency.reduce((sum, ct) => sum + ct.count, 0);

  // Partner diversity: more partners = more social
  const diversityScore = clampScore(Math.min(totalPartners, 10) * 10);

  // Co-session frequency: ratio of co-sessions to total
  const coSessionRatio = safeDivide(totalCoSessions, Math.max(1, input.sessionsPerWeek.length * 12), 0);
  const frequencyScore = clampScore(coSessionRatio * 100);

  return clampScore(diversityScore * 0.5 + frequencyScore * 0.5);
}

// ── Competitiveness ─────────────────────────────────────────────
// Engagement with ranking, points, achievements.

function computeCompetitiveness(input: StudentDNAInput): number {
  let score = 0;

  // Points trend: growing points = competitive
  if (input.pointsHistory.length >= 2) {
    const trend = computeTrend(input.pointsHistory);
    if (trend === 'rising') score += 40;
    else if (trend === 'stable') score += 20;
  }

  // Achievements unlocked (up to 20)
  score += Math.min(input.achievementsCount, 20) * 1.5;

  // Ranking engagement: active ranking changes indicate tracking
  if (input.rankingChanges.length > 0) {
    const avgChange = input.rankingChanges.reduce((a, b) => a + Math.abs(b), 0) / input.rankingChanges.length;
    // Active ranking movement = engaged with competition
    score += Math.min(avgChange * 2, 30);
  }

  return clampScore(score);
}

// ── Curiosity (Versatility) ─────────────────────────────────────
// Diversity of classes/schedules attended.

function computeCuriosity(input: StudentDNAInput): number {
  if (input.totalClassesAvailable === 0) return 50;

  const classRatio = safeDivide(input.distinctClassesAttended, input.totalClassesAvailable, 0);
  return clampScore(classRatio * 100);
}

// ── Responsiveness (Coachability) ───────────────────────────────
// How quickly responds to instructor feedback.

function computeResponsiveness(input: StudentDNAInput): number {
  if (input.feedbackImprovements.length === 0) return 50;

  const improved = input.feedbackImprovements.filter(f => f.improved);
  const improvementRate = safeDivide(improved.length, input.feedbackImprovements.length, 0);

  // Speed of improvement (fewer days = better)
  const avgDaysToImprove = improved.length > 0
    ? improved.reduce((sum, f) => sum + f.daysToImprove, 0) / improved.length
    : 30;

  // Speed score: 1 day = 100, 7 days = 80, 14 = 60, 30+ = 20
  let speedScore: number;
  if (avgDaysToImprove <= 1) speedScore = 100;
  else if (avgDaysToImprove <= 7) speedScore = 80;
  else if (avgDaysToImprove <= 14) speedScore = 60;
  else if (avgDaysToImprove <= 30) speedScore = 40;
  else speedScore = 20;

  return clampScore(improvementRate * 60 + speedScore * 0.4);
}

// ════════════════════════════════════════════════════════════════════
// PATTERN DISCOVERY
// ════════════════════════════════════════════════════════════════════

function discoverPatterns(input: StudentDNAInput): StudentDNAPatterns {
  return {
    preferredDays: discoverPreferredDays(input.checkinDaysOfWeek),
    preferredTimeSlot: discoverPreferredTimeSlot(input.checkinTimeSlots),
    averageSessionsPerWeek: computeAvgSessionsPerWeek(input.sessionsPerWeek),
    peakPerformanceDay: discoverPeakDay(input.checkinDaysOfWeek),
    dropoffPattern: analyzeDropoffPattern(input.gapsOverSevenDays),
    learningStyle: inferLearningStyle(input),
    motivationDrivers: inferMotivationDrivers(input),
  };
}

function discoverPreferredDays(daysOfWeek: number[]): number[] {
  if (daysOfWeek.length === 0) return [];

  // Count frequency of each day
  const counts: Record<number, number> = {};
  for (const day of daysOfWeek) {
    counts[day] = (counts[day] ?? 0) + 1;
  }

  // Sort by frequency, return top days (> avg frequency)
  const entries = Object.entries(counts).map(([d, c]) => ({ day: Number(d), count: c }));
  const avgCount = entries.reduce((sum, e) => sum + e.count, 0) / entries.length;

  return entries
    .filter(e => e.count >= avgCount)
    .sort((a, b) => b.count - a.count)
    .map(e => e.day);
}

function discoverPreferredTimeSlot(timeSlots: TimeSlot[]): TimeSlot {
  if (timeSlots.length === 0) return 'morning';

  const counts: Record<TimeSlot, number> = { morning: 0, afternoon: 0, evening: 0 };
  for (const slot of timeSlots) {
    counts[slot]++;
  }

  let max: TimeSlot = 'morning';
  let maxCount = 0;
  for (const [slot, count] of Object.entries(counts) as [TimeSlot, number][]) {
    if (count > maxCount) {
      max = slot;
      maxCount = count;
    }
  }
  return max;
}

function computeAvgSessionsPerWeek(sessionsPerWeek: number[]): number {
  if (sessionsPerWeek.length === 0) return 0;
  return Math.round(
    (sessionsPerWeek.reduce((a, b) => a + b, 0) / sessionsPerWeek.length) * 10,
  ) / 10;
}

function discoverPeakDay(daysOfWeek: number[]): number {
  if (daysOfWeek.length === 0) return 1; // Default Monday

  const counts: Record<number, number> = {};
  for (const day of daysOfWeek) {
    counts[day] = (counts[day] ?? 0) + 1;
  }

  let peakDay = 1;
  let peakCount = 0;
  for (const [day, count] of Object.entries(counts)) {
    if (count > peakCount) {
      peakDay = Number(day);
      peakCount = count;
    }
  }
  return peakDay;
}

function analyzeDropoffPattern(
  gaps: StudentDNAInput['gapsOverSevenDays'],
): DropoffPattern {
  if (gaps.length === 0) return 'unknown';

  // Check holiday coincidence
  const holidayRatio = gaps.filter(g => g.coincidenceWithHoliday).length / gaps.length;
  if (holidayRatio > 0.5) return 'seasonal';

  // Check if gaps are abrupt (high engagement before gap)
  const abruptGaps = gaps.filter(g => {
    if (g.beforeGap.length === 0) return false;
    const avgBefore = g.beforeGap.reduce((a, b) => a + b, 0) / g.beforeGap.length;
    return avgBefore > 3; // Was training 3+/week before gap
  });

  if (abruptGaps.length > gaps.length * 0.5) return 'abrupt';

  // Check if gaps follow events
  if (gaps.length >= 3) {
    const intervals = gaps.map((g, i) => {
      if (i === 0 || g.frequency.length === 0) return 0;
      return g.frequency.reduce((a, b) => a + b, 0) / g.frequency.length;
    }).filter(i => i > 0);

    if (intervals.length >= 2) {
      const stdDev = standardDeviation(intervals);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (safeDivide(stdDev, avg, 1) < 0.3) return 'gradual';
    }
  }

  return 'gradual';
}

function inferLearningStyle(input: StudentDNAInput): LearningStyle {
  // Consistent high sessions + low variation = consistent_grinder
  if (input.sessionsPerWeek.length >= 4) {
    const avg = input.sessionsPerWeek.reduce((a, b) => a + b, 0) / input.sessionsPerWeek.length;
    const stdDev = standardDeviation(input.sessionsPerWeek);
    const cv = safeDivide(stdDev, avg, 1);

    if (cv < 0.2 && avg >= 3) return 'consistent_grinder';
    if (cv > 0.5 && avg >= 2) return 'intensity_burst';
  }

  // High co-trainer frequency = social_learner
  if (input.coTrainerFrequency.length >= 3) {
    const totalCoSessions = input.coTrainerFrequency.reduce((sum, ct) => sum + ct.count, 0);
    if (totalCoSessions > 10) return 'social_learner';
  }

  // High ranking engagement = goal_oriented
  if (input.rankingChanges.length >= 4) {
    const avgChange = input.rankingChanges.reduce((a, b) => a + Math.abs(b), 0) / input.rankingChanges.length;
    if (avgChange > 3) return 'goal_oriented';
  }

  // High class diversity = explorer
  if (input.totalClassesAvailable > 0) {
    const classRatio = safeDivide(input.distinctClassesAttended, input.totalClassesAvailable, 0);
    if (classRatio > 0.6) return 'explorer';
  }

  return 'routine_follower';
}

function inferMotivationDrivers(input: StudentDNAInput): MotivationDriver[] {
  const drivers: { driver: MotivationDriver; score: number }[] = [];

  // Ranking engagement
  if (input.rankingChanges.length > 0) {
    const avgChange = input.rankingChanges.reduce((a, b) => a + Math.abs(b), 0) / input.rankingChanges.length;
    drivers.push({ driver: 'ranking', score: Math.min(avgChange * 10, 100) });
  }

  // Achievements
  drivers.push({ driver: 'badges', score: Math.min(input.achievementsCount * 5, 100) });

  // Streak (consistency proxy)
  if (input.checkinIntervals.length >= 4) {
    const stdDev = standardDeviation(input.checkinIntervals);
    drivers.push({ driver: 'streak', score: clampScore(100 - stdDev * 10) });
  }

  // Social
  if (input.coTrainerFrequency.length > 0) {
    const totalCo = input.coTrainerFrequency.reduce((sum, ct) => sum + ct.count, 0);
    drivers.push({ driver: 'social', score: Math.min(totalCo * 5, 100) });
  }

  // Competition
  if (input.pointsHistory.length >= 4) {
    const trend = computeTrend(input.pointsHistory);
    if (trend === 'rising') {
      drivers.push({ driver: 'competition', score: 80 });
    }
  }

  // Mastery (progression speed)
  if (input.milestoneTransitionDays.length > 0) {
    drivers.push({ driver: 'mastery', score: 60 });
  }

  // Promotion
  if (input.milestoneTransitionDays.length > 0 && input.academyAvgTransitionDays.length > 0) {
    const latestTransition = input.milestoneTransitionDays[input.milestoneTransitionDays.length - 1];
    const latestAvg = input.academyAvgTransitionDays[Math.min(
      input.milestoneTransitionDays.length - 1,
      input.academyAvgTransitionDays.length - 1,
    )];
    if (latestTransition < latestAvg * 0.8) {
      drivers.push({ driver: 'promotion', score: 90 });
    }
  }

  // Sort by score, return top 3
  return drivers
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => d.driver);
}

// ════════════════════════════════════════════════════════════════════
// DIFFICULTY PROFILE
// ════════════════════════════════════════════════════════════════════

function buildDifficultyProfile(input: StudentDNAInput): DifficultyProfile {
  const sorted = [...input.competencyScores].sort((a, b) => b.score - a.score);

  // Strong: top 30% competencies (score > 70)
  const strongCompetencies = sorted
    .filter(c => c.score >= 70)
    .slice(0, 5)
    .map(c => c.id);

  // Weak: bottom 30% competencies (score < 50)
  const weakCompetencies = sorted
    .filter(c => c.score < 50)
    .slice(-5)
    .map(c => c.id);

  // Learning speed
  const learningSpeed = computeLearningSpeed(input);

  // Retention rate from evaluations
  const retentionRate = computeRetentionRate(input);

  // Optimal challenge level from competency spread
  const optimalChallengeLevel = computeOptimalChallengeLevel(input);

  return {
    strongCompetencies,
    weakCompetencies,
    learningSpeed,
    retentionRate,
    optimalChallengeLevel,
  };
}

function computeLearningSpeed(input: StudentDNAInput): LearningSpeed {
  if (input.sublevelDays.length === 0) return 'average';

  const avgDays = input.sublevelDays.reduce((a, b) => a + b, 0) / input.sublevelDays.length;
  const ratio = safeDivide(avgDays, input.academyAvgSublevelDays, 1);

  if (ratio <= 0.7) return 'fast';
  if (ratio >= 1.3) return 'slow';
  return 'average';
}

function computeRetentionRate(input: StudentDNAInput): number {
  if (input.evaluationResults.length < 2) return 50;

  // Compare first attempt scores over time — improving or maintaining = good retention
  const scores = input.evaluationResults.map(e => e.score);
  const recentScores = scores.slice(-5);
  const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  // Base retention from average recent scores
  return clampScore(avgRecent);
}

function computeOptimalChallengeLevel(input: StudentDNAInput): number {
  if (input.competencyScores.length === 0) return 50;

  // Optimal challenge = slightly above current average (Zone of Proximal Development)
  const avgScore = input.competencyScores.reduce((sum, c) => sum + c.score, 0) / input.competencyScores.length;

  // ZPD: 10-20% above current level, capped at 100
  return clampScore(avgScore + 15);
}

// ════════════════════════════════════════════════════════════════════
// PREDICTIONS
// ════════════════════════════════════════════════════════════════════

function buildPredictions(
  input: StudentDNAInput,
  dimensions: StudentDNADimensions,
): StudentDNA['predictions'] {
  // Plateau risk: low progression + low consistency
  const plateauRisk = clampScore(
    100 - (dimensions.progression * 0.5 + dimensions.consistency * 0.3 + dimensions.responsiveness * 0.2),
  );

  // Estimate weeks to next milestone from sublevel days
  let nextMilestoneWeeks: number | null = null;
  if (input.sublevelDays.length > 0 && input.milestoneTransitionDays.length > 0) {
    const avgSublevelDays = input.sublevelDays.reduce((a, b) => a + b, 0) / input.sublevelDays.length;
    // Rough estimate: assume ~4 sublevels per milestone
    nextMilestoneWeeks = Math.round((avgSublevelDays * 4) / 7);
  }

  return {
    nextPromotionEstimate: null, // Computed by promotion-predictor engine
    churnRisk: input.churnRisk,
    nextMilestoneWeeks,
    plateauRisk,
  };
}
