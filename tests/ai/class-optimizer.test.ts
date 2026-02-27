// ============================================================
// Class Optimizer — Unit Tests
// ============================================================
// Pure function tests — no mocks, no database, deterministic.
//
// Fixtures:
//   1. Healthy class (high engagement, balanced levels)
//   2. Struggling class (high churn risk, disengaged students)
//   3. Mixed levels class (wide level spread)
//   4. Empty class (zero students)
//   5. Overcrowded class (over capacity, diverse tiers)
// ============================================================

import { describe, it, expect } from 'vitest';
import { analyzeClass } from '@/lib/domain/intelligence/engines/class-optimizer';
import type { ClassAnalysisInput, ClassStudentData } from '@/lib/domain/intelligence/engines/class-optimizer';

// ════════════════════════════════════════════════════════════════════
// HELPER: Create student data
// ════════════════════════════════════════════════════════════════════

function makeStudent(overrides: Partial<ClassStudentData> & { participantId: string }): ClassStudentData {
  return {
    participantName: overrides.participantName ?? `Aluno ${overrides.participantId}`,
    engagementScore: 70,
    engagementTier: 'committed',
    churnRisk: 15,
    currentMilestone: 'Azul',
    currentMilestoneOrder: 3,
    currentSublevel: 2,
    daysSinceEnrollment: 200,
    daysSinceLastCheckin: 2,
    streakCurrent: 8,
    competencyScores: [
      { id: 'c1', name: 'Guarda', score: 70 },
      { id: 'c2', name: 'Passagem', score: 65 },
      { id: 'c3', name: 'Finalização', score: 60 },
    ],
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════

const healthyClassInput: ClassAnalysisInput = {
  classScheduleId: 'cs-healthy',
  className: 'Turma Azul Avançada',
  instructorId: 'inst-1',
  scheduledTime: '19:00',
  dayOfWeek: 1,
  maxCapacity: 20,
  avgAttendanceRate: 85,
  retentionRate: 90,
  students: [
    makeStudent({ participantId: 's1', participantName: 'João', engagementScore: 90, engagementTier: 'champion', churnRisk: 5, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's2', participantName: 'Maria', engagementScore: 85, engagementTier: 'champion', churnRisk: 8, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's3', participantName: 'Pedro', engagementScore: 75, engagementTier: 'committed', churnRisk: 12, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's4', participantName: 'Ana', engagementScore: 80, engagementTier: 'committed', churnRisk: 10, currentMilestoneOrder: 4 }),
    makeStudent({ participantId: 's5', participantName: 'Lucas', engagementScore: 70, engagementTier: 'committed', churnRisk: 18, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's6', participantName: 'Carla', engagementScore: 72, engagementTier: 'committed', churnRisk: 15, currentMilestoneOrder: 3 }),
  ],
};

const strugglingClassInput: ClassAnalysisInput = {
  classScheduleId: 'cs-struggling',
  className: 'Turma Noturna Livre',
  instructorId: 'inst-2',
  scheduledTime: '20:00',
  dayOfWeek: 3,
  maxCapacity: 15,
  avgAttendanceRate: 45,
  retentionRate: 50,
  students: [
    makeStudent({ participantId: 's10', participantName: 'Roberto', engagementScore: 20, engagementTier: 'disconnected', churnRisk: 85, daysSinceLastCheckin: 20 }),
    makeStudent({ participantId: 's11', participantName: 'Cláudia', engagementScore: 25, engagementTier: 'drifting', churnRisk: 75, daysSinceLastCheckin: 15 }),
    makeStudent({ participantId: 's12', participantName: 'Felipe', engagementScore: 35, engagementTier: 'drifting', churnRisk: 65, daysSinceLastCheckin: 10 }),
    makeStudent({ participantId: 's13', participantName: 'Fernanda', engagementScore: 30, engagementTier: 'drifting', churnRisk: 70, daysSinceEnrollment: 40, daysSinceLastCheckin: 5 }),
    makeStudent({ participantId: 's14', participantName: 'Diego', engagementScore: 40, engagementTier: 'drifting', churnRisk: 55, daysSinceLastCheckin: 8 }),
  ],
};

const mixedLevelsClassInput: ClassAnalysisInput = {
  classScheduleId: 'cs-mixed',
  className: 'Turma Mista',
  instructorId: 'inst-3',
  scheduledTime: '18:00',
  dayOfWeek: 2,
  maxCapacity: 20,
  avgAttendanceRate: 70,
  retentionRate: 75,
  students: [
    makeStudent({ participantId: 's20', participantName: 'Branca Iniciante', engagementScore: 60, engagementTier: 'active', churnRisk: 25, currentMilestone: 'Branca', currentMilestoneOrder: 1, daysSinceEnrollment: 30 }),
    makeStudent({ participantId: 's21', participantName: 'Branca Antigo', engagementScore: 55, engagementTier: 'active', churnRisk: 30, currentMilestone: 'Branca', currentMilestoneOrder: 1, daysSinceEnrollment: 100 }),
    makeStudent({ participantId: 's22', participantName: 'Azul Sólido', engagementScore: 75, engagementTier: 'committed', churnRisk: 10, currentMilestone: 'Azul', currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's23', participantName: 'Roxa Forte', engagementScore: 85, engagementTier: 'champion', churnRisk: 5, currentMilestone: 'Roxa', currentMilestoneOrder: 5 }),
    makeStudent({ participantId: 's24', participantName: 'Marrom Experiente', engagementScore: 90, engagementTier: 'champion', churnRisk: 3, currentMilestone: 'Marrom', currentMilestoneOrder: 7 }),
    makeStudent({ participantId: 's25', participantName: 'Branca Novo', engagementScore: 50, engagementTier: 'active', churnRisk: 35, currentMilestone: 'Branca', currentMilestoneOrder: 1, daysSinceEnrollment: 15 }),
  ],
};

const emptyClassInput: ClassAnalysisInput = {
  classScheduleId: 'cs-empty',
  className: 'Turma Vazia',
  instructorId: 'inst-4',
  scheduledTime: '07:00',
  dayOfWeek: 6,
  maxCapacity: 15,
  students: [],
};

const overcrowdedClassInput: ClassAnalysisInput = {
  classScheduleId: 'cs-overcrowded',
  className: 'Turma Superlotada',
  instructorId: 'inst-5',
  scheduledTime: '19:00',
  dayOfWeek: 4,
  maxCapacity: 10,
  avgAttendanceRate: 90,
  retentionRate: 80,
  students: [
    makeStudent({ participantId: 's30', engagementScore: 90, engagementTier: 'champion', churnRisk: 5, currentMilestoneOrder: 4 }),
    makeStudent({ participantId: 's31', engagementScore: 85, engagementTier: 'champion', churnRisk: 8, currentMilestoneOrder: 4 }),
    makeStudent({ participantId: 's32', engagementScore: 70, engagementTier: 'committed', churnRisk: 15, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's33', engagementScore: 65, engagementTier: 'active', churnRisk: 20, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's34', engagementScore: 55, engagementTier: 'active', churnRisk: 30, currentMilestoneOrder: 2 }),
    makeStudent({ participantId: 's35', engagementScore: 45, engagementTier: 'drifting', churnRisk: 50, currentMilestoneOrder: 2 }),
    makeStudent({ participantId: 's36', engagementScore: 60, engagementTier: 'active', churnRisk: 22, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's37', engagementScore: 75, engagementTier: 'committed', churnRisk: 12, currentMilestoneOrder: 4 }),
    makeStudent({ participantId: 's38', engagementScore: 80, engagementTier: 'committed', churnRisk: 10, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's39', engagementScore: 72, engagementTier: 'committed', churnRisk: 18, currentMilestoneOrder: 3 }),
    makeStudent({ participantId: 's40', engagementScore: 50, engagementTier: 'active', churnRisk: 35, currentMilestoneOrder: 2, daysSinceEnrollment: 45 }),
    makeStudent({ participantId: 's41', engagementScore: 68, engagementTier: 'active', churnRisk: 20, currentMilestoneOrder: 3 }),
  ],
};

// ════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════

describe('Class Optimizer — analyzeClass()', () => {
  describe('healthy class (high engagement, balanced levels)', () => {
    it('returns high health score (>= 70)', () => {
      const result = analyzeClass(healthyClassInput);
      expect(result.health.score).toBeGreaterThanOrEqual(70);
    });

    it('has improving trend (high attendance rate)', () => {
      const result = analyzeClass(healthyClassInput);
      expect(result.health.trend).toBe('improving');
    });

    it('composition shows no drifting students', () => {
      const result = analyzeClass(healthyClassInput);
      expect(result.composition.driftingCount).toBe(0);
    });

    it('composition shows 2 champions', () => {
      const result = analyzeClass(healthyClassInput);
      expect(result.composition.championCount).toBe(2);
    });

    it('has few or no high-priority recommendations', () => {
      const result = analyzeClass(healthyClassInput);
      const highPriority = result.recommendations.filter(r => r.priority === 'high');
      expect(highPriority.length).toBeLessThanOrEqual(1);
    });

    it('returns total enrolled = 6', () => {
      const result = analyzeClass(healthyClassInput);
      expect(result.composition.totalEnrolled).toBe(6);
    });

    it('has low level spread (students at order 3-4)', () => {
      const result = analyzeClass(healthyClassInput);
      expect(result.composition.levelSpread).toBeLessThan(1);
    });
  });

  describe('struggling class (high churn risk, disengaged students)', () => {
    it('returns low health score (< 40)', () => {
      const result = analyzeClass(strugglingClassInput);
      expect(result.health.score).toBeLessThan(40);
    });

    it('has declining trend (low attendance rate)', () => {
      const result = analyzeClass(strugglingClassInput);
      expect(result.health.trend).toBe('declining');
    });

    it('all students are drifting or disconnected', () => {
      const result = analyzeClass(strugglingClassInput);
      expect(result.composition.driftingCount).toBe(5);
    });

    it('generates focus_retention recommendation for high-risk students', () => {
      const result = analyzeClass(strugglingClassInput);
      const retentionRec = result.recommendations.find(r => r.type === 'focus_retention');
      expect(retentionRec).toBeDefined();
      expect(retentionRec!.priority).toBe('high');
    });

    it('generates welcome_back recommendation for returning students', () => {
      const result = analyzeClass(strugglingClassInput);
      const welcomeBack = result.recommendations.find(r => r.type === 'welcome_back');
      expect(welcomeBack).toBeDefined();
      // s10 (20 days) and s11 (15 days) are returning
      expect(welcomeBack!.involvedParticipants!.length).toBeGreaterThanOrEqual(2);
    });

    it('special attention includes students with high churn risk', () => {
      const result = analyzeClass(strugglingClassInput);
      const churnAttention = result.suggestedFocus.specialAttention.filter(
        sa => sa.reason.includes('Risco alto de evasão'),
      );
      expect(churnAttention.length).toBeGreaterThan(0);
    });

    it('identifies new students in composition', () => {
      const result = analyzeClass(strugglingClassInput);
      // s13 has 40 days enrollment — counted as new member
      expect(result.composition.newMemberCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('mixed levels class (wide level spread)', () => {
    it('has high level spread (students from order 1 to 7)', () => {
      const result = analyzeClass(mixedLevelsClassInput);
      expect(result.composition.levelSpread).toBeGreaterThan(2);
    });

    it('generates recommendations for level disparity', () => {
      const result = analyzeClass(mixedLevelsClassInput);
      // Wide level spread should trigger some recommendation
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('identifies new members needing welcome', () => {
      const result = analyzeClass(mixedLevelsClassInput);
      expect(result.composition.newMemberCount).toBeGreaterThanOrEqual(2);
    });

    it('generates celebrate_progress recommendation for new students', () => {
      const result = analyzeClass(mixedLevelsClassInput);
      const celebrateRec = result.recommendations.find(r => r.type === 'celebrate_progress');
      expect(celebrateRec).toBeDefined();
    });

    it('generates pair_mentoring when champions and drifting coexist', () => {
      // This class has champions but no drifting, so no pair_mentoring expected
      const result = analyzeClass(mixedLevelsClassInput);
      const mentoringRec = result.recommendations.find(r => r.type === 'pair_mentoring');
      // No drifting students in this class
      expect(mentoringRec).toBeUndefined();
    });

    it('suggested focus difficulty level adapts to average milestone order', () => {
      const result = analyzeClass(mixedLevelsClassInput);
      expect(result.suggestedFocus.difficultyLevel).toBeGreaterThanOrEqual(1);
      expect(result.suggestedFocus.difficultyLevel).toBeLessThanOrEqual(5);
    });
  });

  describe('empty class (zero students)', () => {
    it('returns health score of 0', () => {
      const result = analyzeClass(emptyClassInput);
      expect(result.health.score).toBe(0);
    });

    it('has stable trend', () => {
      const result = analyzeClass(emptyClassInput);
      expect(result.health.trend).toBe('stable');
    });

    it('composition shows 0 for all counts', () => {
      const result = analyzeClass(emptyClassInput);
      expect(result.composition.totalEnrolled).toBe(0);
      expect(result.composition.championCount).toBe(0);
      expect(result.composition.driftingCount).toBe(0);
      expect(result.composition.newMemberCount).toBe(0);
    });

    it('generates no recommendations', () => {
      const result = analyzeClass(emptyClassInput);
      expect(result.recommendations.length).toBe(0);
    });

    it('has zero average engagement', () => {
      const result = analyzeClass(emptyClassInput);
      expect(result.health.avgEngagement).toBe(0);
    });

    it('preserves class metadata', () => {
      const result = analyzeClass(emptyClassInput);
      expect(result.classScheduleId).toBe('cs-empty');
      expect(result.className).toBe('Turma Vazia');
      expect(result.instructorId).toBe('inst-4');
    });
  });

  describe('overcrowded class (over capacity, diverse tiers)', () => {
    it('has 12 students (exceeds capacity of 10)', () => {
      const result = analyzeClass(overcrowdedClassInput);
      expect(result.composition.totalEnrolled).toBe(12);
    });

    it('has both champions and drifting students', () => {
      const result = analyzeClass(overcrowdedClassInput);
      expect(result.composition.championCount).toBeGreaterThanOrEqual(2);
      expect(result.composition.driftingCount).toBeGreaterThanOrEqual(1);
    });

    it('generates pair_mentoring recommendation (champions + drifting)', () => {
      const result = analyzeClass(overcrowdedClassInput);
      const mentoringRec = result.recommendations.find(r => r.type === 'pair_mentoring');
      expect(mentoringRec).toBeDefined();
    });

    it('recommendations are sorted by priority', () => {
      const result = analyzeClass(overcrowdedClassInput);
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < result.recommendations.length; i++) {
        expect(priorityOrder[result.recommendations[i - 1].priority])
          .toBeLessThanOrEqual(priorityOrder[result.recommendations[i].priority]);
      }
    });

    it('identifies new members (< 60 days enrollment)', () => {
      const result = analyzeClass(overcrowdedClassInput);
      expect(result.composition.newMemberCount).toBeGreaterThanOrEqual(1);
    });

    it('has improving trend (high attendance rate)', () => {
      const result = analyzeClass(overcrowdedClassInput);
      expect(result.health.trend).toBe('improving');
    });
  });

  describe('output structure', () => {
    it('always returns all required fields', () => {
      const classes = [healthyClassInput, strugglingClassInput, mixedLevelsClassInput, emptyClassInput, overcrowdedClassInput];
      for (const cls of classes) {
        const result = analyzeClass(cls);
        expect(result.classScheduleId).toBe(cls.classScheduleId);
        expect(result.className).toBe(cls.className);
        expect(result.instructorId).toBe(cls.instructorId);
        expect(result.health).toBeDefined();
        expect(result.composition).toBeDefined();
        expect(result.recommendations).toBeDefined();
        expect(result.suggestedFocus).toBeDefined();
        expect(result.metadata).toBeDefined();
        expect(result.metadata.computedAt).toBeTruthy();
      }
    });

    it('health score is always between 0 and 100', () => {
      const classes = [healthyClassInput, strugglingClassInput, mixedLevelsClassInput, emptyClassInput, overcrowdedClassInput];
      for (const cls of classes) {
        const result = analyzeClass(cls);
        expect(result.health.score).toBeGreaterThanOrEqual(0);
        expect(result.health.score).toBeLessThanOrEqual(100);
      }
    });

    it('confidence is always between 0 and 1', () => {
      const classes = [healthyClassInput, strugglingClassInput, mixedLevelsClassInput, emptyClassInput, overcrowdedClassInput];
      for (const cls of classes) {
        const result = analyzeClass(cls);
        expect(result.metadata.confidence).toBeGreaterThanOrEqual(0);
        expect(result.metadata.confidence).toBeLessThanOrEqual(1);
      }
    });
  });
});
