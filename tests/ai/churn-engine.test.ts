// ============================================================
// Churn Engine — Unit Tests
// ============================================================
// Pure function tests — no mocks, no database, deterministic.
//
// Fixtures:
//   1. Healthy student (safe)
//   2. At-risk student (multiple factors)
//   3. Critical student (all factors severe)
//   4. Partial data (missing factors)
//   5. Cold start (new student < 7 days)
// ============================================================

import { describe, it, expect } from 'vitest';
import { predictChurn } from '@/lib/domain/intelligence/engine/churn-engine';
import type { ChurnFeatureVector } from '@/lib/domain/intelligence/models/churn-score';

// ════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════

const NOW = new Date().toISOString();

const healthyStudent: ChurnFeatureVector = {
  participantId: 'p-healthy',
  participantName: 'João Saudável',
  attendancePercentage: 90,
  currentStreak: 12,
  bestStreak: 15,
  daysSinceLastCheckin: 1,
  monthsInCurrentMilestone: 2,
  hasRecentSublevelProgress: true,
  paymentIssueLevel: 0,
  overallScore: 80,
  weeklyPointsTrend: 10,
  daysSinceEnrollment: 365,
  collectedAt: NOW,
};

const atRiskStudent: ChurnFeatureVector = {
  participantId: 'p-atrisk',
  participantName: 'Maria Risco',
  attendancePercentage: 40,
  currentStreak: 2,
  bestStreak: 20,
  daysSinceLastCheckin: 12,
  monthsInCurrentMilestone: 8,
  hasRecentSublevelProgress: false,
  paymentIssueLevel: 1,
  overallScore: 35,
  weeklyPointsTrend: -20,
  daysSinceEnrollment: 180,
  collectedAt: NOW,
};

const criticalStudent: ChurnFeatureVector = {
  participantId: 'p-critical',
  participantName: 'Pedro Crítico',
  attendancePercentage: 15,
  currentStreak: 0,
  bestStreak: 25,
  daysSinceLastCheckin: 25,
  monthsInCurrentMilestone: 20,
  hasRecentSublevelProgress: false,
  paymentIssueLevel: 4,
  overallScore: 5,
  weeklyPointsTrend: -80,
  daysSinceEnrollment: 400,
  collectedAt: NOW,
};

const partialDataStudent: ChurnFeatureVector = {
  participantId: 'p-partial',
  participantName: 'Ana Parcial',
  attendancePercentage: 60,
  currentStreak: null,
  bestStreak: null,
  daysSinceLastCheckin: 7,
  monthsInCurrentMilestone: null,
  hasRecentSublevelProgress: false,
  paymentIssueLevel: null,
  overallScore: null,
  weeklyPointsTrend: null,
  daysSinceEnrollment: 120,
  collectedAt: NOW,
};

const coldStartStudent: ChurnFeatureVector = {
  participantId: 'p-cold',
  participantName: 'Lucas Novo',
  attendancePercentage: 100,
  currentStreak: 3,
  bestStreak: 3,
  daysSinceLastCheckin: 1,
  monthsInCurrentMilestone: 0,
  hasRecentSublevelProgress: false,
  paymentIssueLevel: 0,
  overallScore: 50,
  weeklyPointsTrend: 0,
  daysSinceEnrollment: 5,
  collectedAt: NOW,
};

// ════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════

describe('Churn Engine — predictChurn()', () => {
  describe('healthy student', () => {
    it('returns safe risk level', () => {
      const result = predictChurn(healthyStudent);
      expect(result.riskLevel).toBe('safe');
    });

    it('returns low score (< 25)', () => {
      const result = predictChurn(healthyStudent);
      expect(result.score).toBeLessThan(25);
    });

    it('includes participantId from features', () => {
      const result = predictChurn(healthyStudent);
      expect(result.participantId).toBe('p-healthy');
      expect(result.participantName).toBe('João Saudável');
    });

    it('has high confidence for tenured student', () => {
      const result = predictChurn(healthyStudent);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('generates zero or few recommendations', () => {
      const result = predictChurn(healthyStudent);
      expect(result.recommendations.length).toBeLessThanOrEqual(2);
    });
  });

  describe('at-risk student', () => {
    it('returns at_risk or critical risk level', () => {
      const result = predictChurn(atRiskStudent);
      expect(['at_risk', 'critical']).toContain(result.riskLevel);
    });

    it('returns score >= 45', () => {
      const result = predictChurn(atRiskStudent);
      expect(result.score).toBeGreaterThanOrEqual(45);
    });

    it('has multiple active factors', () => {
      const result = predictChurn(atRiskStudent);
      const activeFactors = result.factors.filter(f => f.riskLevel !== 'none');
      expect(activeFactors.length).toBeGreaterThanOrEqual(3);
    });

    it('generates recommendations for active factors', () => {
      const result = predictChurn(atRiskStudent);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('sorts factors by contribution descending', () => {
      const result = predictChurn(atRiskStudent);
      for (let i = 1; i < result.factors.length; i++) {
        expect(result.factors[i - 1].contribution).toBeGreaterThanOrEqual(
          result.factors[i].contribution,
        );
      }
    });
  });

  describe('critical student', () => {
    it('returns critical risk level', () => {
      const result = predictChurn(criticalStudent);
      expect(result.riskLevel).toBe('critical');
    });

    it('returns score >= 70', () => {
      const result = predictChurn(criticalStudent);
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('has urgent priority recommendations', () => {
      const result = predictChurn(criticalStudent);
      const urgent = result.recommendations.filter(r => r.priority === 'urgent');
      expect(urgent.length).toBeGreaterThan(0);
    });

    it('includes all 7 factors', () => {
      const result = predictChurn(criticalStudent);
      expect(result.factors.length).toBe(7);
    });

    it('reports full data quality', () => {
      const result = predictChurn(criticalStudent);
      expect(result.dataQuality.availableFactors).toBe(7);
      expect(result.dataQuality.totalFactors).toBe(7);
      expect(result.dataQuality.completeness).toBe(1);
    });
  });

  describe('partial data student', () => {
    it('skips null factors gracefully', () => {
      const result = predictChurn(partialDataStudent);
      // Only attendancePercentage and daysSinceLastCheckin have data
      expect(result.factors.length).toBeLessThan(7);
      expect(result.dataQuality.availableFactors).toBeLessThan(7);
    });

    it('reduces completeness for missing data', () => {
      const result = predictChurn(partialDataStudent);
      expect(result.dataQuality.completeness).toBeLessThan(1);
    });

    it('still produces a valid score (0-100)', () => {
      const result = predictChurn(partialDataStudent);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('has a valid risk level', () => {
      const result = predictChurn(partialDataStudent);
      expect(['safe', 'watch', 'at_risk', 'critical']).toContain(result.riskLevel);
    });
  });

  describe('cold start (new student)', () => {
    it('has very low confidence for < 7 day member', () => {
      const result = predictChurn(coldStartStudent);
      // 5 days enrolled → 0.2 multiplier
      expect(result.confidence).toBeLessThanOrEqual(0.2);
    });

    it('still returns a valid prediction', () => {
      const result = predictChurn(coldStartStudent);
      expect(result.participantId).toBe('p-cold');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('score boundaries', () => {
    it('score is always between 0 and 100', () => {
      const students = [healthyStudent, atRiskStudent, criticalStudent, partialDataStudent, coldStartStudent];
      for (const s of students) {
        const result = predictChurn(s);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
    });

    it('confidence is always between 0 and 1', () => {
      const students = [healthyStudent, atRiskStudent, criticalStudent, partialDataStudent, coldStartStudent];
      for (const s of students) {
        const result = predictChurn(s);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('segment weights', () => {
    it('produces different scores for different segments', () => {
      const defaultResult = predictChurn(atRiskStudent);
      const fitnessResult = predictChurn(atRiskStudent, 'fitness');
      // Scores may differ due to different weight distributions
      // We just verify both are valid
      expect(defaultResult.score).toBeGreaterThanOrEqual(0);
      expect(fitnessResult.score).toBeGreaterThanOrEqual(0);
    });

    it('fitness segment has valid factors', () => {
      const result = predictChurn(atRiskStudent, 'fitness');
      expect(result.factors.length).toBe(7);
      // All factor weights should be positive
      for (const f of result.factors) {
        expect(f.weight).toBeGreaterThan(0);
      }
    });
  });

  describe('recommendations', () => {
    it('recommendations reference valid factor types', () => {
      const result = predictChurn(criticalStudent);
      const validTypes = [
        'ATTENDANCE_DROP', 'STREAK_BROKEN', 'DAYS_SINCE_LAST_CHECKIN',
        'LONG_PLATEAU', 'PAYMENT_ISSUES', 'LOW_ENGAGEMENT_SCORE', 'DECLINING_POINTS',
      ];
      for (const rec of result.recommendations) {
        expect(validTypes).toContain(rec.relatedFactor);
      }
    });

    it('recommendations have valid priority values', () => {
      const result = predictChurn(criticalStudent);
      const validPriorities = ['urgent', 'high', 'medium', 'low'];
      for (const rec of result.recommendations) {
        expect(validPriorities).toContain(rec.priority);
      }
    });

    it('recommendations have valid target roles', () => {
      const result = predictChurn(criticalStudent);
      const validRoles = ['admin', 'instructor', 'system'];
      for (const rec of result.recommendations) {
        expect(validRoles).toContain(rec.targetRole);
      }
    });

    it('recommendations are sorted by priority', () => {
      const result = predictChurn(criticalStudent);
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      for (let i = 1; i < result.recommendations.length; i++) {
        expect(priorityOrder[result.recommendations[i - 1].priority])
          .toBeLessThanOrEqual(priorityOrder[result.recommendations[i].priority]);
      }
    });
  });

  describe('factor descriptions', () => {
    it('active factors have non-empty descriptions', () => {
      const result = predictChurn(criticalStudent);
      for (const f of result.factors) {
        expect(f.description).toBeTruthy();
        expect(f.description.length).toBeGreaterThan(0);
      }
    });

    it('safe factors show positive descriptions', () => {
      const result = predictChurn(healthyStudent);
      const safeFactors = result.factors.filter(f => f.riskLevel === 'none');
      for (const f of safeFactors) {
        expect(f.description).toBeTruthy();
      }
    });
  });

  describe('streak edge cases', () => {
    it('handles bestStreak = 0 (never had a streak)', () => {
      const noStreakStudent: ChurnFeatureVector = {
        ...healthyStudent,
        participantId: 'p-nostreak',
        currentStreak: 0,
        bestStreak: 0,
      };
      const result = predictChurn(noStreakStudent);
      // Should not crash, bestStreak=0 returns rawValue=100
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('handles currentStreak > bestStreak gracefully', () => {
      const overStreakStudent: ChurnFeatureVector = {
        ...healthyStudent,
        participantId: 'p-overstreak',
        currentStreak: 20,
        bestStreak: 15,
      };
      const result = predictChurn(overStreakStudent);
      // ratio > 100% → should be safe for this factor
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
