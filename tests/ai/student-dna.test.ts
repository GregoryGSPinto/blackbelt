// ============================================================
// Student DNA — Unit Tests
// ============================================================
// Pure function tests — no mocks, no database, deterministic.
//
// Fixtures:
//   1. Consistent student (high consistency + intensity)
//   2. Competitive student (ranking-driven)
//   3. Social student (many co-trainers)
//   4. New student (cold start, minimal data)
//   5. Well-rounded student (balanced all dimensions)
// ============================================================

import { describe, it, expect } from 'vitest';
import { computeStudentDNA } from '@/lib/domain/intelligence/engines/student-dna';
import type { StudentDNAInput } from '@/lib/domain/intelligence/engines/student-dna';

// ════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════

const consistentStudent: StudentDNAInput = {
  participantId: 'p-consistent',
  participantName: 'Carlos Constante',
  checkinIntervals: [2, 2, 3, 2, 2, 3, 2, 2, 2, 3, 2, 2],
  sessionsPerWeek: [3, 3, 3, 4, 3, 3, 3, 3],
  avgSessionDuration: 65,
  academyAvgSessionDuration: 55,
  milestoneTransitionDays: [45, 50, 42],
  academyAvgTransitionDays: [60, 65, 58],
  streakBreaks: [{ daysToReturn: 2 }],
  coTrainerFrequency: [
    { partnerId: 'p1', count: 8 },
    { partnerId: 'p2', count: 5 },
  ],
  pointsHistory: [100, 120, 150, 180, 220, 260, 310],
  achievementsCount: 12,
  rankingChanges: [2, -1, 3, 1],
  distinctClassesAttended: 3,
  totalClassesAvailable: 8,
  feedbackImprovements: [
    { improved: true, daysToImprove: 3 },
    { improved: true, daysToImprove: 5 },
    { improved: true, daysToImprove: 2 },
  ],
  checkinDaysOfWeek: [1, 1, 1, 3, 3, 3, 5, 5, 5, 1, 3, 5],
  checkinTimeSlots: ['morning', 'morning', 'morning', 'morning', 'evening', 'evening'],
  gapsOverSevenDays: [],
  competencyScores: [
    { id: 'c1', name: 'Guarda', score: 85 },
    { id: 'c2', name: 'Passagem', score: 78 },
    { id: 'c3', name: 'Finalização', score: 72 },
    { id: 'c4', name: 'Defesa', score: 90 },
    { id: 'c5', name: 'Queda', score: 45 },
  ],
  sublevelDays: [12, 14, 11],
  academyAvgSublevelDays: 18,
  evaluationResults: [{ score: 85 }, { score: 88 }, { score: 90 }],
  churnRisk: 10,
  daysSinceEnrollment: 400,
  totalEvents: 250,
  firstEventAt: '2025-01-15T10:00:00Z',
};

const competitiveStudent: StudentDNAInput = {
  participantId: 'p-competitive',
  participantName: 'Ana Competitiva',
  checkinIntervals: [1, 3, 2, 4, 1, 2, 3, 1, 2, 3],
  sessionsPerWeek: [4, 5, 3, 5, 4, 6, 4, 5],
  avgSessionDuration: 70,
  academyAvgSessionDuration: 55,
  milestoneTransitionDays: [35, 40],
  academyAvgTransitionDays: [60, 65],
  streakBreaks: [{ daysToReturn: 1 }, { daysToReturn: 2 }],
  coTrainerFrequency: [
    { partnerId: 'p1', count: 4 },
    { partnerId: 'p2', count: 3 },
  ],
  pointsHistory: [200, 280, 350, 420, 530, 650, 780, 900],
  achievementsCount: 18,
  rankingChanges: [5, 3, 4, 6, 2, 5, 7],
  distinctClassesAttended: 4,
  totalClassesAvailable: 8,
  feedbackImprovements: [
    { improved: true, daysToImprove: 1 },
    { improved: true, daysToImprove: 2 },
  ],
  checkinDaysOfWeek: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 3, 5],
  checkinTimeSlots: ['evening', 'evening', 'evening', 'morning', 'evening'],
  gapsOverSevenDays: [],
  competencyScores: [
    { id: 'c1', name: 'Guarda', score: 90 },
    { id: 'c2', name: 'Passagem', score: 88 },
    { id: 'c3', name: 'Finalização', score: 92 },
    { id: 'c4', name: 'Defesa', score: 85 },
    { id: 'c5', name: 'Queda', score: 65 },
  ],
  sublevelDays: [10, 8],
  academyAvgSublevelDays: 18,
  evaluationResults: [{ score: 92 }, { score: 88 }, { score: 95 }],
  churnRisk: 5,
  daysSinceEnrollment: 300,
  totalEvents: 350,
  firstEventAt: '2025-04-10T08:00:00Z',
};

const socialStudent: StudentDNAInput = {
  participantId: 'p-social',
  participantName: 'Bruno Social',
  checkinIntervals: [2, 3, 2, 3, 4, 2, 3, 2],
  sessionsPerWeek: [3, 3, 2, 3, 3, 2, 3, 3],
  avgSessionDuration: 55,
  academyAvgSessionDuration: 55,
  milestoneTransitionDays: [55, 60],
  academyAvgTransitionDays: [60, 65],
  streakBreaks: [{ daysToReturn: 3 }, { daysToReturn: 4 }],
  coTrainerFrequency: [
    { partnerId: 'p1', count: 25 },
    { partnerId: 'p2', count: 18 },
    { partnerId: 'p3', count: 15 },
    { partnerId: 'p4', count: 12 },
    { partnerId: 'p5', count: 10 },
    { partnerId: 'p6', count: 8 },
  ],
  pointsHistory: [80, 90, 100, 110, 115, 120],
  achievementsCount: 8,
  rankingChanges: [1, 0, -1, 1],
  distinctClassesAttended: 5,
  totalClassesAvailable: 8,
  feedbackImprovements: [
    { improved: true, daysToImprove: 7 },
    { improved: false, daysToImprove: 0 },
    { improved: true, daysToImprove: 10 },
  ],
  checkinDaysOfWeek: [1, 2, 3, 5, 1, 2, 5, 1, 3, 5],
  checkinTimeSlots: ['afternoon', 'afternoon', 'afternoon', 'evening', 'afternoon'],
  gapsOverSevenDays: [],
  competencyScores: [
    { id: 'c1', name: 'Guarda', score: 60 },
    { id: 'c2', name: 'Passagem', score: 55 },
    { id: 'c3', name: 'Finalização', score: 50 },
    { id: 'c4', name: 'Defesa', score: 65 },
  ],
  sublevelDays: [16, 18, 17],
  academyAvgSublevelDays: 18,
  evaluationResults: [{ score: 65 }, { score: 60 }],
  churnRisk: 20,
  daysSinceEnrollment: 250,
  totalEvents: 180,
  firstEventAt: '2025-06-01T14:00:00Z',
};

const newStudent: StudentDNAInput = {
  participantId: 'p-new',
  participantName: 'Lucas Novato',
  checkinIntervals: [3],
  sessionsPerWeek: [2],
  avgSessionDuration: 50,
  academyAvgSessionDuration: 55,
  milestoneTransitionDays: [],
  academyAvgTransitionDays: [60],
  streakBreaks: [],
  coTrainerFrequency: [],
  pointsHistory: [20],
  achievementsCount: 0,
  rankingChanges: [],
  distinctClassesAttended: 1,
  totalClassesAvailable: 8,
  feedbackImprovements: [],
  checkinDaysOfWeek: [1, 3],
  checkinTimeSlots: ['morning', 'morning'],
  gapsOverSevenDays: [],
  competencyScores: [
    { id: 'c1', name: 'Guarda', score: 30 },
    { id: 'c2', name: 'Passagem', score: 25 },
  ],
  sublevelDays: [],
  academyAvgSublevelDays: 18,
  evaluationResults: [],
  churnRisk: 40,
  daysSinceEnrollment: 10,
  totalEvents: 5,
  firstEventAt: '2026-02-17T09:00:00Z',
};

const wellRoundedStudent: StudentDNAInput = {
  participantId: 'p-rounded',
  participantName: 'Maria Equilibrada',
  checkinIntervals: [2, 3, 2, 2, 3, 2, 3, 2, 2, 3],
  sessionsPerWeek: [3, 3, 3, 2, 3, 3, 3, 3],
  avgSessionDuration: 58,
  academyAvgSessionDuration: 55,
  milestoneTransitionDays: [55, 58, 52],
  academyAvgTransitionDays: [60, 65, 58],
  streakBreaks: [{ daysToReturn: 3 }, { daysToReturn: 2 }],
  coTrainerFrequency: [
    { partnerId: 'p1', count: 12 },
    { partnerId: 'p2', count: 8 },
    { partnerId: 'p3', count: 6 },
    { partnerId: 'p4', count: 5 },
  ],
  pointsHistory: [100, 130, 155, 180, 210, 240, 270],
  achievementsCount: 10,
  rankingChanges: [2, 1, -1, 2, 1],
  distinctClassesAttended: 5,
  totalClassesAvailable: 8,
  feedbackImprovements: [
    { improved: true, daysToImprove: 5 },
    { improved: true, daysToImprove: 4 },
    { improved: true, daysToImprove: 6 },
    { improved: false, daysToImprove: 0 },
  ],
  checkinDaysOfWeek: [1, 2, 3, 5, 1, 2, 3, 5, 1, 3, 5],
  checkinTimeSlots: ['morning', 'morning', 'afternoon', 'afternoon', 'morning', 'morning'],
  gapsOverSevenDays: [],
  competencyScores: [
    { id: 'c1', name: 'Guarda', score: 70 },
    { id: 'c2', name: 'Passagem', score: 68 },
    { id: 'c3', name: 'Finalização', score: 65 },
    { id: 'c4', name: 'Defesa', score: 72 },
    { id: 'c5', name: 'Queda', score: 60 },
  ],
  sublevelDays: [15, 16, 14],
  academyAvgSublevelDays: 18,
  evaluationResults: [{ score: 75 }, { score: 72 }, { score: 78 }, { score: 80 }],
  churnRisk: 15,
  daysSinceEnrollment: 350,
  totalEvents: 220,
  firstEventAt: '2025-03-01T09:00:00Z',
};

// ════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════

describe('Student DNA — computeStudentDNA()', () => {
  describe('consistent student (high consistency + intensity)', () => {
    it('has high consistency dimension (> 70)', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.dimensions.consistency).toBeGreaterThan(70);
    });

    it('has high intensity dimension (> 60)', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.dimensions.intensity).toBeGreaterThan(60);
    });

    it('has fast progression (above average transition speed)', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.dimensions.progression).toBeGreaterThan(50);
    });

    it('learning style is consistent_grinder', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.patterns.learningStyle).toBe('consistent_grinder');
    });

    it('has high resilience (enrolled > 90 days, only 1 break with quick return)', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.dimensions.resilience).toBeGreaterThanOrEqual(80);
    });

    it('has difficulty profile with strong competencies', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.difficultyProfile.strongCompetencies.length).toBeGreaterThan(0);
      expect(result.difficultyProfile.strongCompetencies).toContain('c4'); // Defesa (90)
    });

    it('has weak competencies identified', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.difficultyProfile.weakCompetencies).toContain('c5'); // Queda (45)
    });

    it('learning speed is fast (sublevel days < academy avg)', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.difficultyProfile.learningSpeed).toBe('fast');
    });

    it('preferred days are Mon/Wed/Fri', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.patterns.preferredDays).toContain(1);
      expect(result.patterns.preferredDays).toContain(3);
      expect(result.patterns.preferredDays).toContain(5);
    });

    it('preferred time slot is morning', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.patterns.preferredTimeSlot).toBe('morning');
    });
  });

  describe('competitive student (ranking-driven)', () => {
    it('has high competitiveness dimension (> 60)', () => {
      const result = computeStudentDNA(competitiveStudent);
      expect(result.dimensions.competitiveness).toBeGreaterThan(60);
    });

    it('motivation drivers include ranking or competition', () => {
      const result = computeStudentDNA(competitiveStudent);
      const hasCompetitiveDriver = result.patterns.motivationDrivers.some(
        d => d === 'ranking' || d === 'competition' || d === 'badges',
      );
      expect(hasCompetitiveDriver).toBe(true);
    });

    it('has fast learning speed', () => {
      const result = computeStudentDNA(competitiveStudent);
      expect(result.difficultyProfile.learningSpeed).toBe('fast');
    });

    it('has high intensity (4-6 sessions/week)', () => {
      const result = computeStudentDNA(competitiveStudent);
      expect(result.dimensions.intensity).toBeGreaterThan(60);
    });

    it('has good responsiveness (quick feedback improvement)', () => {
      const result = computeStudentDNA(competitiveStudent);
      expect(result.dimensions.responsiveness).toBeGreaterThan(60);
    });

    it('has high retention rate from evaluation results', () => {
      const result = computeStudentDNA(competitiveStudent);
      expect(result.difficultyProfile.retentionRate).toBeGreaterThanOrEqual(80);
    });
  });

  describe('social student (many co-trainers)', () => {
    it('has high social connection dimension (> 50)', () => {
      const result = computeStudentDNA(socialStudent);
      expect(result.dimensions.socialConnection).toBeGreaterThan(50);
    });

    it('learning style is social_learner', () => {
      const result = computeStudentDNA(socialStudent);
      expect(result.patterns.learningStyle).toBe('social_learner');
    });

    it('motivation drivers include social', () => {
      const result = computeStudentDNA(socialStudent);
      expect(result.patterns.motivationDrivers).toContain('social');
    });

    it('has decent curiosity (5/8 distinct classes)', () => {
      const result = computeStudentDNA(socialStudent);
      expect(result.dimensions.curiosity).toBeGreaterThan(50);
    });

    it('preferred time slot is afternoon', () => {
      const result = computeStudentDNA(socialStudent);
      expect(result.patterns.preferredTimeSlot).toBe('afternoon');
    });
  });

  describe('new student (cold start)', () => {
    it('has low confidence due to minimal data', () => {
      const result = computeStudentDNA(newStudent);
      expect(result.confidence).toBeLessThan(0.3);
    });

    it('dimensions default to neutral values (around 50)', () => {
      const result = computeStudentDNA(newStudent);
      // With only 1 interval, consistency defaults to 50
      expect(result.dimensions.consistency).toBe(50);
      // No milestones -> progression defaults to 50
      expect(result.dimensions.progression).toBe(50);
      // No feedback -> responsiveness defaults to 50
      expect(result.dimensions.responsiveness).toBe(50);
    });

    it('has few data points', () => {
      const result = computeStudentDNA(newStudent);
      expect(result.dataPoints).toBeLessThanOrEqual(10);
    });

    it('social connection is low (no co-trainers)', () => {
      const result = computeStudentDNA(newStudent);
      expect(result.dimensions.socialConnection).toBeLessThanOrEqual(20);
    });

    it('preferred time slot defaults to morning with 2 morning check-ins', () => {
      const result = computeStudentDNA(newStudent);
      expect(result.patterns.preferredTimeSlot).toBe('morning');
    });

    it('plateau risk reflects low progression + low consistency', () => {
      const result = computeStudentDNA(newStudent);
      // plateauRisk = 100 - (progression*0.5 + consistency*0.3 + responsiveness*0.2)
      // = 100 - (50*0.5 + 50*0.3 + 50*0.2) = 100 - 50 = 50
      expect(result.predictions.plateauRisk).toBeGreaterThanOrEqual(30);
    });
  });

  describe('well-rounded student (balanced all dimensions)', () => {
    it('all dimensions are within valid range', () => {
      const result = computeStudentDNA(wellRoundedStudent);
      const dims = result.dimensions;
      for (const [, value] of Object.entries(dims)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    });

    it('has multiple motivation drivers', () => {
      const result = computeStudentDNA(wellRoundedStudent);
      expect(result.patterns.motivationDrivers.length).toBeGreaterThanOrEqual(2);
    });

    it('learning speed is computed based on sublevel progression', () => {
      const result = computeStudentDNA(wellRoundedStudent);
      expect(['slow', 'average', 'fast']).toContain(result.difficultyProfile.learningSpeed);
    });

    it('has competencies in both strong and moderate range', () => {
      const result = computeStudentDNA(wellRoundedStudent);
      // All competencies are 60-72 so strong = those >= 70
      expect(result.difficultyProfile.strongCompetencies.length).toBeGreaterThanOrEqual(1);
    });

    it('average sessions per week is around 3', () => {
      const result = computeStudentDNA(wellRoundedStudent);
      expect(result.patterns.averageSessionsPerWeek).toBeGreaterThanOrEqual(2.5);
      expect(result.patterns.averageSessionsPerWeek).toBeLessThanOrEqual(3.5);
    });

    it('has high confidence (long enrollment, many events)', () => {
      const result = computeStudentDNA(wellRoundedStudent);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('output structure', () => {
    it('always returns all required fields', () => {
      const students = [consistentStudent, competitiveStudent, socialStudent, newStudent, wellRoundedStudent];
      for (const s of students) {
        const result = computeStudentDNA(s);
        expect(result.participantId).toBe(s.participantId);
        expect(result.dimensions).toBeDefined();
        expect(result.patterns).toBeDefined();
        expect(result.difficultyProfile).toBeDefined();
        expect(result.predictions).toBeDefined();
        expect(result.dataPoints).toBeDefined();
        expect(result.confidence).toBeDefined();
        expect(result.computedAt).toBeTruthy();
        expect(result.firstEventAt).toBe(s.firstEventAt);
      }
    });

    it('all dimension scores are between 0 and 100', () => {
      const students = [consistentStudent, competitiveStudent, socialStudent, newStudent, wellRoundedStudent];
      for (const s of students) {
        const result = computeStudentDNA(s);
        for (const [, value] of Object.entries(result.dimensions)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
    });

    it('confidence is always between 0 and 1', () => {
      const students = [consistentStudent, competitiveStudent, socialStudent, newStudent, wellRoundedStudent];
      for (const s of students) {
        const result = computeStudentDNA(s);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('dropoff pattern analysis', () => {
    it('returns unknown for students with no gaps', () => {
      const result = computeStudentDNA(consistentStudent);
      expect(result.patterns.dropoffPattern).toBe('unknown');
    });
  });
});
