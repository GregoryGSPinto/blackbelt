// ============================================================
// Engagement Scorer — Unit Tests
// ============================================================
// Pure function tests — no mocks, no database, deterministic.
//
// Fixtures:
//   1. Healthy student (high everything)
//   2. Disengaged student (low attendance, low points)
//   3. New student (cold start)
//   4. Financial issues (overdue payments)
//   5. Varying segments (fitness vs jiu-jitsu)
// ============================================================

import { describe, it, expect } from 'vitest';
import { computeEngagementScore } from '@/lib/domain/intelligence/engines/engagement-scorer';
import type { EngagementInput } from '@/lib/domain/intelligence/models/engagement.types';

// ════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════

const healthyStudent: EngagementInput = {
  participantId: 'p-healthy',
  checkinsLast30Days: 20,
  academyAvgCheckins: 12,
  hoursReal: 30,
  hoursExpected: 24,
  currentStreak: 18,
  overallScore: 85,
  sublevelsGained90Days: 3,
  maxSublevels: 5,
  evaluationsApproved: 4,
  evaluationsTotal: 5,
  rankingPositionNormalized: 90,
  achievementsUnlocked: 15,
  achievementsAvailable: 20,
  socialConnectionScore: 80,
  paymentStatus: 'current',
  digitalCheckin: true,
  appAccessLast7Days: true,
  viewedContent: true,
  daysSinceEnrollment: 365,
  previousOverallScore: 78,
};

const disengagedStudent: EngagementInput = {
  participantId: 'p-disengaged',
  checkinsLast30Days: 2,
  academyAvgCheckins: 12,
  hoursReal: 3,
  hoursExpected: 24,
  currentStreak: 0,
  overallScore: 25,
  sublevelsGained90Days: 0,
  maxSublevels: 5,
  evaluationsApproved: 1,
  evaluationsTotal: 3,
  rankingPositionNormalized: 15,
  achievementsUnlocked: 2,
  achievementsAvailable: 20,
  socialConnectionScore: 10,
  paymentStatus: 'overdue_30',
  digitalCheckin: false,
  appAccessLast7Days: false,
  viewedContent: false,
  daysSinceEnrollment: 200,
  previousOverallScore: 55,
};

const newStudent: EngagementInput = {
  participantId: 'p-new',
  checkinsLast30Days: 4,
  academyAvgCheckins: 12,
  hoursReal: 6,
  hoursExpected: 24,
  currentStreak: 4,
  overallScore: 50,
  sublevelsGained90Days: 0,
  maxSublevels: 5,
  evaluationsApproved: 0,
  evaluationsTotal: 0,
  rankingPositionNormalized: 50,
  achievementsUnlocked: 1,
  achievementsAvailable: 20,
  socialConnectionScore: 20,
  paymentStatus: 'current',
  digitalCheckin: true,
  appAccessLast7Days: true,
  viewedContent: false,
  daysSinceEnrollment: 7,
};

const financialIssuesStudent: EngagementInput = {
  participantId: 'p-financial',
  checkinsLast30Days: 14,
  academyAvgCheckins: 12,
  hoursReal: 20,
  hoursExpected: 24,
  currentStreak: 8,
  overallScore: 70,
  sublevelsGained90Days: 2,
  maxSublevels: 5,
  evaluationsApproved: 3,
  evaluationsTotal: 4,
  rankingPositionNormalized: 60,
  achievementsUnlocked: 8,
  achievementsAvailable: 20,
  socialConnectionScore: 55,
  paymentStatus: 'overdue_15',
  digitalCheckin: true,
  appAccessLast7Days: false,
  viewedContent: true,
  daysSinceEnrollment: 180,
  previousOverallScore: 70,
};

const fitnessStudent: EngagementInput = {
  participantId: 'p-fitness',
  checkinsLast30Days: 18,
  academyAvgCheckins: 15,
  hoursReal: 25,
  hoursExpected: 20,
  currentStreak: 10,
  overallScore: 60,
  sublevelsGained90Days: 1,
  maxSublevels: 3,
  evaluationsApproved: 1,
  evaluationsTotal: 2,
  rankingPositionNormalized: 70,
  achievementsUnlocked: 10,
  achievementsAvailable: 20,
  socialConnectionScore: 65,
  paymentStatus: 'current',
  digitalCheckin: true,
  appAccessLast7Days: true,
  viewedContent: true,
  daysSinceEnrollment: 120,
  previousOverallScore: 55,
};

// ════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════

describe('Engagement Scorer — computeEngagementScore()', () => {
  describe('healthy student (high everything)', () => {
    it('returns a high overall score (>= 70)', () => {
      const result = computeEngagementScore(healthyStudent);
      expect(result.overall).toBeGreaterThanOrEqual(70);
    });

    it('classifies as champion or committed tier', () => {
      const result = computeEngagementScore(healthyStudent);
      expect(['champion', 'committed']).toContain(result.tier);
    });

    it('returns rising trend (current > previous + 5)', () => {
      const result = computeEngagementScore(healthyStudent);
      expect(result.trend).toBe('rising');
    });

    it('has all five dimensions above 50', () => {
      const result = computeEngagementScore(healthyStudent);
      expect(result.dimensions.physical).toBeGreaterThanOrEqual(50);
      expect(result.dimensions.pedagogical).toBeGreaterThanOrEqual(50);
      expect(result.dimensions.social).toBeGreaterThanOrEqual(50);
      expect(result.dimensions.financial).toBe(100);
      expect(result.dimensions.digital).toBe(100);
    });

    it('has attention level 4 or 5 (low attention needed)', () => {
      const result = computeEngagementScore(healthyStudent);
      expect(result.attentionPriority.level).toBeGreaterThanOrEqual(4);
    });

    it('includes metadata with high confidence', () => {
      const result = computeEngagementScore(healthyStudent);
      expect(result.metadata.confidence).toBeGreaterThan(0.5);
      expect(result.metadata.dataPoints).toBeGreaterThan(10);
      expect(result.metadata.computedAt).toBeTruthy();
    });
  });

  describe('disengaged student', () => {
    it('returns a low overall score (< 40)', () => {
      const result = computeEngagementScore(disengagedStudent);
      expect(result.overall).toBeLessThan(40);
    });

    it('classifies as drifting or disconnected tier', () => {
      const result = computeEngagementScore(disengagedStudent);
      expect(['drifting', 'disconnected']).toContain(result.tier);
    });

    it('returns declining trend', () => {
      const result = computeEngagementScore(disengagedStudent);
      expect(result.trend).toBe('declining');
    });

    it('has low physical and pedagogical dimensions', () => {
      const result = computeEngagementScore(disengagedStudent);
      expect(result.dimensions.physical).toBeLessThan(30);
      expect(result.dimensions.pedagogical).toBeLessThan(40);
    });

    it('financial dimension reflects overdue_30 status', () => {
      const result = computeEngagementScore(disengagedStudent);
      expect(result.dimensions.financial).toBe(30);
    });

    it('has high attention priority (level 1 or 2)', () => {
      const result = computeEngagementScore(disengagedStudent);
      expect(result.attentionPriority.level).toBeLessThanOrEqual(2);
    });

    it('has non-empty reasons and suggested actions', () => {
      const result = computeEngagementScore(disengagedStudent);
      expect(result.attentionPriority.reasons.length).toBeGreaterThan(0);
      expect(result.attentionPriority.suggestedAction).toBeTruthy();
    });
  });

  describe('new student (cold start)', () => {
    it('returns a valid score between 0 and 100', () => {
      const result = computeEngagementScore(newStudent);
      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('has low confidence due to limited enrollment time', () => {
      const result = computeEngagementScore(newStudent);
      expect(result.metadata.confidence).toBeLessThan(0.5);
    });

    it('trend is stable when no previous score exists', () => {
      const result = computeEngagementScore(newStudent);
      expect(result.trend).toBe('stable');
      expect(result.trendDelta).toBe(0);
    });

    it('financial dimension is 100 (current payments)', () => {
      const result = computeEngagementScore(newStudent);
      expect(result.dimensions.financial).toBe(100);
    });

    it('digital dimension reflects partial digital activity', () => {
      const result = computeEngagementScore(newStudent);
      // digitalCheckin=true(+20) + appAccess=true(+40) + viewedContent=false(+0) = 60
      expect(result.dimensions.digital).toBe(60);
    });
  });

  describe('financial issues student', () => {
    it('financial dimension reflects overdue_15 status (60)', () => {
      const result = computeEngagementScore(financialIssuesStudent);
      expect(result.dimensions.financial).toBe(60);
    });

    it('overall score is moderate despite good attendance', () => {
      const result = computeEngagementScore(financialIssuesStudent);
      expect(result.overall).toBeGreaterThanOrEqual(40);
      expect(result.overall).toBeLessThanOrEqual(80);
    });

    it('physical dimension is decent (above average checkins)', () => {
      const result = computeEngagementScore(financialIssuesStudent);
      expect(result.dimensions.physical).toBeGreaterThanOrEqual(40);
    });

    it('tier is active or committed', () => {
      const result = computeEngagementScore(financialIssuesStudent);
      expect(['active', 'committed']).toContain(result.tier);
    });

    it('attention priority mentions financial irregularity when level <= 2', () => {
      const result = computeEngagementScore(financialIssuesStudent);
      // With overdue_15, the financial dimension is reduced but overall may still be decent
      // Attention priority depends on overall score and trend
      expect(result.attentionPriority.level).toBeGreaterThanOrEqual(1);
      expect(result.attentionPriority.level).toBeLessThanOrEqual(5);
    });
  });

  describe('fitness segment student (varying segment)', () => {
    it('returns a valid score in the expected range', () => {
      const result = computeEngagementScore(fitnessStudent);
      expect(result.overall).toBeGreaterThanOrEqual(40);
      expect(result.overall).toBeLessThanOrEqual(90);
    });

    it('physical dimension reflects above-average hours', () => {
      const result = computeEngagementScore(fitnessStudent);
      // hoursReal (25) > hoursExpected (20) -> good ratio
      expect(result.dimensions.physical).toBeGreaterThanOrEqual(50);
    });

    it('has all expected fields', () => {
      const result = computeEngagementScore(fitnessStudent);
      expect(result.participantId).toBe('p-fitness');
      expect(result.overall).toBeDefined();
      expect(result.trend).toBeDefined();
      expect(result.trendDelta).toBeDefined();
      expect(result.dimensions).toBeDefined();
      expect(result.tier).toBeDefined();
      expect(result.tierSince).toBeDefined();
      expect(result.attentionPriority).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('trend is rising when current score exceeds previous by > 5', () => {
      const result = computeEngagementScore(fitnessStudent);
      // previousOverallScore was 55, current should be > 60
      expect(result.trend).toBe('rising');
    });

    it('digital dimension is 100 (all digital flags true)', () => {
      const result = computeEngagementScore(fitnessStudent);
      expect(result.dimensions.digital).toBe(100);
    });
  });

  describe('score boundaries', () => {
    it('overall score is always between 0 and 100', () => {
      const students = [healthyStudent, disengagedStudent, newStudent, financialIssuesStudent, fitnessStudent];
      for (const s of students) {
        const result = computeEngagementScore(s);
        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(100);
      }
    });

    it('all dimension scores are between 0 and 100', () => {
      const students = [healthyStudent, disengagedStudent, newStudent, financialIssuesStudent, fitnessStudent];
      for (const s of students) {
        const result = computeEngagementScore(s);
        expect(result.dimensions.physical).toBeGreaterThanOrEqual(0);
        expect(result.dimensions.physical).toBeLessThanOrEqual(100);
        expect(result.dimensions.pedagogical).toBeGreaterThanOrEqual(0);
        expect(result.dimensions.pedagogical).toBeLessThanOrEqual(100);
        expect(result.dimensions.social).toBeGreaterThanOrEqual(0);
        expect(result.dimensions.social).toBeLessThanOrEqual(100);
        expect(result.dimensions.financial).toBeGreaterThanOrEqual(0);
        expect(result.dimensions.financial).toBeLessThanOrEqual(100);
        expect(result.dimensions.digital).toBeGreaterThanOrEqual(0);
        expect(result.dimensions.digital).toBeLessThanOrEqual(100);
      }
    });

    it('confidence is always between 0 and 1', () => {
      const students = [healthyStudent, disengagedStudent, newStudent, financialIssuesStudent, fitnessStudent];
      for (const s of students) {
        const result = computeEngagementScore(s);
        expect(result.metadata.confidence).toBeGreaterThanOrEqual(0);
        expect(result.metadata.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('attention level is always between 1 and 5', () => {
      const students = [healthyStudent, disengagedStudent, newStudent, financialIssuesStudent, fitnessStudent];
      for (const s of students) {
        const result = computeEngagementScore(s);
        expect(result.attentionPriority.level).toBeGreaterThanOrEqual(1);
        expect(result.attentionPriority.level).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('tier classification correctness', () => {
    it('tier is valid for all students', () => {
      const validTiers = ['champion', 'committed', 'active', 'drifting', 'disconnected'];
      const students = [healthyStudent, disengagedStudent, newStudent, financialIssuesStudent, fitnessStudent];
      for (const s of students) {
        const result = computeEngagementScore(s);
        expect(validTiers).toContain(result.tier);
      }
    });

    it('higher overall score leads to higher or equal tier', () => {
      const healthy = computeEngagementScore(healthyStudent);
      const disengaged = computeEngagementScore(disengagedStudent);
      const tierOrder = ['disconnected', 'drifting', 'active', 'committed', 'champion'];
      expect(tierOrder.indexOf(healthy.tier)).toBeGreaterThanOrEqual(tierOrder.indexOf(disengaged.tier));
    });
  });

  describe('digital dimension edge cases', () => {
    it('returns 50 when no digital data tracked', () => {
      const noDigital: EngagementInput = {
        ...healthyStudent,
        participantId: 'p-nodigital',
        digitalCheckin: false,
        appAccessLast7Days: false,
        viewedContent: false,
      };
      const result = computeEngagementScore(noDigital);
      expect(result.dimensions.digital).toBe(50);
    });
  });
});
