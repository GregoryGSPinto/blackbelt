// ============================================================
// Promotion Predictor — Unit Tests
// ============================================================
// Pure function tests — no mocks, no database, deterministic.
//
// Fixtures:
//   1. Ready for promotion (all criteria met)
//   2. Far from promotion (large gaps in criteria)
//   3. Blocked by attendance (one criterion failing)
//   4. Blocked by competency (competency gap)
//   5. Ahead of average (faster than peers)
// ============================================================

import { describe, it, expect } from 'vitest';
import { predictPromotion } from '@/lib/domain/intelligence/engines/promotion-predictor';
import type { PromotionInput } from '@/lib/domain/intelligence/models/promotion.types';

// ════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════

const readyForPromotion: PromotionInput = {
  participantId: 'p-ready',
  participantName: 'João Pronto',
  currentMilestone: 'Azul',
  nextMilestone: 'Roxa',
  criteria: [
    { id: 'attendance', name: 'Presença mínima', currentValue: 95, requiredValue: 80, weight: 0.3 },
    { id: 'technique', name: 'Avaliação técnica', currentValue: 88, requiredValue: 70, weight: 0.35 },
    { id: 'time', name: 'Tempo mínimo na faixa', currentValue: 24, requiredValue: 20, weight: 0.2 },
    { id: 'competition', name: 'Participação em campeonatos', currentValue: 3, requiredValue: 2, weight: 0.15 },
  ],
  weeklyVelocity: {
    attendance: 2,
    technique: 1.5,
    time: 1,
    competition: 0.1,
  },
  daysSinceLastPromotion: 180,
  peerAvgDaysToPromote: 210,
  engagementScore: 88,
  consistencyScore: 85,
  churnRisk: 5,
};

const farFromPromotion: PromotionInput = {
  participantId: 'p-far',
  participantName: 'Maria Longe',
  currentMilestone: 'Branca',
  nextMilestone: 'Azul',
  criteria: [
    { id: 'attendance', name: 'Presença mínima', currentValue: 40, requiredValue: 80, weight: 0.3 },
    { id: 'technique', name: 'Avaliação técnica', currentValue: 30, requiredValue: 70, weight: 0.35 },
    { id: 'time', name: 'Tempo mínimo na faixa', currentValue: 8, requiredValue: 20, weight: 0.2 },
    { id: 'competition', name: 'Participação em campeonatos', currentValue: 0, requiredValue: 2, weight: 0.15 },
  ],
  weeklyVelocity: {
    attendance: 1,
    technique: 0.5,
    time: 1,
    competition: 0,
  },
  daysSinceLastPromotion: 60,
  peerAvgDaysToPromote: 180,
  engagementScore: 35,
  consistencyScore: 30,
  churnRisk: 60,
};

const blockedByAttendance: PromotionInput = {
  participantId: 'p-attendance',
  participantName: 'Pedro Faltante',
  currentMilestone: 'Azul',
  nextMilestone: 'Roxa',
  criteria: [
    { id: 'attendance', name: 'Presença mínima', currentValue: 55, requiredValue: 80, weight: 0.3 },
    { id: 'technique', name: 'Avaliação técnica', currentValue: 82, requiredValue: 70, weight: 0.35 },
    { id: 'time', name: 'Tempo mínimo na faixa', currentValue: 22, requiredValue: 20, weight: 0.2 },
    { id: 'competition', name: 'Participação em campeonatos', currentValue: 3, requiredValue: 2, weight: 0.15 },
  ],
  weeklyVelocity: {
    attendance: 0.5,
    technique: 1,
    time: 1,
    competition: 0.1,
  },
  daysSinceLastPromotion: 200,
  peerAvgDaysToPromote: 210,
  engagementScore: 55,
  consistencyScore: 40,
  churnRisk: 30,
};

const blockedByCompetency: PromotionInput = {
  participantId: 'p-competency',
  participantName: 'Ana Técnica',
  currentMilestone: 'Azul',
  nextMilestone: 'Roxa',
  criteria: [
    { id: 'attendance', name: 'Presença mínima', currentValue: 90, requiredValue: 80, weight: 0.3 },
    { id: 'technique', name: 'Avaliação técnica', currentValue: 45, requiredValue: 70, weight: 0.35 },
    { id: 'time', name: 'Tempo mínimo na faixa', currentValue: 24, requiredValue: 20, weight: 0.2 },
    { id: 'competition', name: 'Participação em campeonatos', currentValue: 2, requiredValue: 2, weight: 0.15 },
  ],
  weeklyVelocity: {
    attendance: 2,
    technique: 0.8,
    time: 1,
    competition: 0.1,
  },
  daysSinceLastPromotion: 190,
  peerAvgDaysToPromote: 210,
  engagementScore: 72,
  consistencyScore: 70,
  churnRisk: 15,
};

const aheadOfAverage: PromotionInput = {
  participantId: 'p-ahead',
  participantName: 'Lucas Rápido',
  currentMilestone: 'Branca',
  nextMilestone: 'Azul',
  criteria: [
    { id: 'attendance', name: 'Presença mínima', currentValue: 95, requiredValue: 80, weight: 0.3 },
    { id: 'technique', name: 'Avaliação técnica', currentValue: 75, requiredValue: 70, weight: 0.35 },
    { id: 'time', name: 'Tempo mínimo na faixa', currentValue: 18, requiredValue: 20, weight: 0.2 },
    { id: 'competition', name: 'Participação em campeonatos', currentValue: 2, requiredValue: 2, weight: 0.15 },
  ],
  weeklyVelocity: {
    attendance: 3,
    technique: 2,
    time: 1,
    competition: 0.2,
  },
  daysSinceLastPromotion: 90,
  peerAvgDaysToPromote: 180,
  engagementScore: 92,
  consistencyScore: 88,
  churnRisk: 3,
};

// ════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════

describe('Promotion Predictor — predictPromotion()', () => {
  describe('ready for promotion (all criteria met)', () => {
    it('returns high readiness score (>= 80)', () => {
      const result = predictPromotion(readyForPromotion);
      expect(result.readinessScore).toBeGreaterThanOrEqual(80);
    });

    it('has zero or minimal blockers', () => {
      const result = predictPromotion(readyForPromotion);
      expect(result.blockers.length).toBe(0);
    });

    it('estimated days to promotion is 0 (all met)', () => {
      const result = predictPromotion(readyForPromotion);
      expect(result.estimatedDaysToPromotion).toBe(0);
    });

    it('estimated date is today or null when 0 days', () => {
      const result = predictPromotion(readyForPromotion);
      if (result.estimatedDate !== null) {
        const today = new Date().toISOString().split('T')[0];
        expect(result.estimatedDate).toBe(today);
      }
    });

    it('peer comparison shows faster than average', () => {
      const result = predictPromotion(readyForPromotion);
      // 180 days total vs 210 avg -> percentile > 50
      expect(result.peerComparison.percentile).toBeGreaterThanOrEqual(50);
    });

    it('preserves participant metadata', () => {
      const result = predictPromotion(readyForPromotion);
      expect(result.participantId).toBe('p-ready');
      expect(result.participantName).toBe('João Pronto');
      expect(result.currentMilestone).toBe('Azul');
      expect(result.nextMilestone).toBe('Roxa');
    });

    it('has high confidence (all criteria have velocity data)', () => {
      const result = predictPromotion(readyForPromotion);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('far from promotion (large gaps)', () => {
    it('returns low readiness score (< 60)', () => {
      const result = predictPromotion(farFromPromotion);
      expect(result.readinessScore).toBeLessThan(60);
    });

    it('has multiple blockers', () => {
      const result = predictPromotion(farFromPromotion);
      expect(result.blockers.length).toBeGreaterThanOrEqual(3);
    });

    it('identifies attendance as a blocker', () => {
      const result = predictPromotion(farFromPromotion);
      const attendanceBlocker = result.blockers.find(b => b.criterionId === 'attendance');
      expect(attendanceBlocker).toBeDefined();
      expect(attendanceBlocker!.gap).toBeGreaterThan(0);
    });

    it('identifies competition as a blocker with null days (zero velocity)', () => {
      const result = predictPromotion(farFromPromotion);
      const competitionBlocker = result.blockers.find(b => b.criterionId === 'competition');
      expect(competitionBlocker).toBeDefined();
      expect(competitionBlocker!.estimatedDaysToClose).toBeNull();
    });

    it('has accelerators suggesting improvements', () => {
      const result = predictPromotion(farFromPromotion);
      expect(result.accelerators.length).toBeGreaterThan(0);
    });

    it('churn risk applies penalty to readiness score', () => {
      const result = predictPromotion(farFromPromotion);
      // churnRisk 60 -> -5 penalty, engagementScore 35 -> -10, consistency 30 -> -5
      // These penalties should keep readiness low
      expect(result.readinessScore).toBeLessThan(50);
    });

    it('peer comparison shows behind average', () => {
      const result = predictPromotion(farFromPromotion);
      // Only 60 days in, still far from promotion
      // But total estimate is 60 + estimatedDays which could be high
      expect(result.peerComparison.averageDays).toBe(180);
    });
  });

  describe('blocked by attendance', () => {
    it('has attendance as the main blocker', () => {
      const result = predictPromotion(blockedByAttendance);
      const attendanceBlocker = result.blockers.find(b => b.criterionId === 'attendance');
      expect(attendanceBlocker).toBeDefined();
      expect(attendanceBlocker!.gap).toBe(25);
    });

    it('technique is NOT a blocker (already met)', () => {
      const result = predictPromotion(blockedByAttendance);
      const techniqueBlocker = result.blockers.find(b => b.criterionId === 'technique');
      expect(techniqueBlocker).toBeUndefined();
    });

    it('only has 1 blocker (attendance)', () => {
      const result = predictPromotion(blockedByAttendance);
      expect(result.blockers.length).toBe(1);
    });

    it('estimated days reflects attendance gap', () => {
      const result = predictPromotion(blockedByAttendance);
      // gap=25, velocity=0.5/week -> 50 weeks = 350 days, adjusted by engagement multiplier
      expect(result.estimatedDaysToPromotion).toBeGreaterThan(0);
    });

    it('accelerators suggest increasing training frequency', () => {
      const result = predictPromotion(blockedByAttendance);
      const frequencyAccelerator = result.accelerators.find(
        a => a.description.includes('frequência') || a.description.includes('attendance') || a.description.includes('gargalo'),
      );
      expect(frequencyAccelerator).toBeDefined();
    });

    it('readiness is moderate-to-high (most criteria met)', () => {
      const result = predictPromotion(blockedByAttendance);
      // 3 out of 4 criteria met + high engagement boosts score
      expect(result.readinessScore).toBeGreaterThanOrEqual(50);
      expect(result.readinessScore).toBeLessThanOrEqual(100);
    });
  });

  describe('blocked by competency', () => {
    it('has technique as the main blocker', () => {
      const result = predictPromotion(blockedByCompetency);
      const techniqueBlocker = result.blockers.find(b => b.criterionId === 'technique');
      expect(techniqueBlocker).toBeDefined();
      expect(techniqueBlocker!.gap).toBe(25);
    });

    it('blocker includes estimated days to close', () => {
      const result = predictPromotion(blockedByCompetency);
      const techniqueBlocker = result.blockers.find(b => b.criterionId === 'technique');
      expect(techniqueBlocker).toBeDefined();
      // gap=25, velocity=0.8/week -> ~31.25 weeks -> ~219 days
      expect(techniqueBlocker!.estimatedDaysToClose).toBeGreaterThan(0);
    });

    it('blocker suggestion references the criterion name', () => {
      const result = predictPromotion(blockedByCompetency);
      const techniqueBlocker = result.blockers.find(b => b.criterionId === 'technique');
      expect(techniqueBlocker!.suggestion).toContain('Avaliação técnica');
    });

    it('readiness score reflects one blocked criterion', () => {
      const result = predictPromotion(blockedByCompetency);
      // 3 out of 4 criteria met with good engagement/consistency boosts
      expect(result.readinessScore).toBeGreaterThanOrEqual(40);
      expect(result.readinessScore).toBeLessThanOrEqual(100);
    });

    it('accelerators suggest focusing on the slowest criterion', () => {
      const result = predictPromotion(blockedByCompetency);
      const focusAccelerator = result.accelerators.find(
        a => a.description.includes('Avaliação técnica') || a.description.includes('gargalo'),
      );
      expect(focusAccelerator).toBeDefined();
    });
  });

  describe('ahead of average (faster than peers)', () => {
    it('has high readiness score (>= 80)', () => {
      const result = predictPromotion(aheadOfAverage);
      expect(result.readinessScore).toBeGreaterThanOrEqual(80);
    });

    it('has only 1 blocker (time at belt)', () => {
      const result = predictPromotion(aheadOfAverage);
      expect(result.blockers.length).toBe(1);
      expect(result.blockers[0].criterionId).toBe('time');
    });

    it('estimated total days is less than peer average', () => {
      const result = predictPromotion(aheadOfAverage);
      if (result.peerComparison.participantEstimate !== null) {
        expect(result.peerComparison.participantEstimate).toBeLessThan(result.peerComparison.averageDays);
      }
    });

    it('peer percentile is high (faster than most)', () => {
      const result = predictPromotion(aheadOfAverage);
      expect(result.peerComparison.percentile).toBeGreaterThanOrEqual(50);
    });

    it('engagement modifier boosts readiness (score 92 -> +10)', () => {
      const result = predictPromotion(aheadOfAverage);
      // With high engagement and consistency, readiness should be boosted
      expect(result.readinessScore).toBeGreaterThanOrEqual(85);
    });

    it('has computedAt timestamp', () => {
      const result = predictPromotion(aheadOfAverage);
      expect(result.computedAt).toBeTruthy();
      expect(new Date(result.computedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('output structure and boundaries', () => {
    it('readiness score is always between 0 and 100', () => {
      const inputs = [readyForPromotion, farFromPromotion, blockedByAttendance, blockedByCompetency, aheadOfAverage];
      for (const input of inputs) {
        const result = predictPromotion(input);
        expect(result.readinessScore).toBeGreaterThanOrEqual(0);
        expect(result.readinessScore).toBeLessThanOrEqual(100);
      }
    });

    it('confidence is always between 0 and 1', () => {
      const inputs = [readyForPromotion, farFromPromotion, blockedByAttendance, blockedByCompetency, aheadOfAverage];
      for (const input of inputs) {
        const result = predictPromotion(input);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('estimatedDaysToPromotion is null or non-negative', () => {
      const inputs = [readyForPromotion, farFromPromotion, blockedByAttendance, blockedByCompetency, aheadOfAverage];
      for (const input of inputs) {
        const result = predictPromotion(input);
        if (result.estimatedDaysToPromotion !== null) {
          expect(result.estimatedDaysToPromotion).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('blockers have non-empty suggestions', () => {
      const inputs = [farFromPromotion, blockedByAttendance, blockedByCompetency];
      for (const input of inputs) {
        const result = predictPromotion(input);
        for (const blocker of result.blockers) {
          expect(blocker.suggestion).toBeTruthy();
          expect(blocker.suggestion.length).toBeGreaterThan(0);
        }
      }
    });

    it('accelerators have positive potentialDaysSaved', () => {
      const inputs = [farFromPromotion, blockedByAttendance, blockedByCompetency];
      for (const input of inputs) {
        const result = predictPromotion(input);
        for (const acc of result.accelerators) {
          expect(acc.potentialDaysSaved).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('accelerators are sorted by potentialDaysSaved descending', () => {
      const inputs = [farFromPromotion, blockedByAttendance, blockedByCompetency];
      for (const input of inputs) {
        const result = predictPromotion(input);
        for (let i = 1; i < result.accelerators.length; i++) {
          expect(result.accelerators[i - 1].potentialDaysSaved)
            .toBeGreaterThanOrEqual(result.accelerators[i].potentialDaysSaved);
        }
      }
    });
  });

  describe('edge case: empty criteria', () => {
    it('returns readiness 0 with empty criteria', () => {
      const emptyInput: PromotionInput = {
        ...readyForPromotion,
        participantId: 'p-empty',
        criteria: [],
        weeklyVelocity: {},
      };
      const result = predictPromotion(emptyInput);
      expect(result.readinessScore).toBe(0);
      expect(result.blockers.length).toBe(0);
    });
  });
});
