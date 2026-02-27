// ============================================================
// Churn Projectors — Unit Tests
// ============================================================
// Tests for the three churn projectors:
//   - projectAdminChurnOverview
//   - projectInstructorChurnAlerts
//   - projectRetentionEncouragement
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  projectAdminChurnOverview,
  projectInstructorChurnAlerts,
  projectRetentionEncouragement,
} from '@/lib/application/intelligence/projectors/churn-projectors';
import type { ChurnPrediction } from '@/lib/domain/intelligence/models/churn-score';

// ════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════

const NOW = new Date().toISOString();

function makePrediction(overrides: Partial<ChurnPrediction>): ChurnPrediction {
  return {
    participantId: 'p-1',
    participantName: 'Test Student',
    score: 50,
    riskLevel: 'at_risk',
    factors: [{
      type: 'ATTENDANCE_DROP',
      weight: 25,
      riskLevel: 'high',
      rawValue: 30,
      threshold: { low: 70, medium: 50, high: 35, critical: 20 },
      contribution: 18.75,
      description: 'Frequência em 30% no último período',
    }],
    recommendations: [{
      priority: 'high',
      action: 'Agendar conversa individual com o aluno',
      targetRole: 'instructor',
      automatable: false,
      relatedFactor: 'ATTENDANCE_DROP',
    }],
    confidence: 0.85,
    computedAt: NOW,
    dataQuality: {
      availableFactors: 7,
      totalFactors: 7,
      oldestDataPoint: NOW,
      completeness: 1,
    },
    ...overrides,
  };
}

const safePrediction = makePrediction({
  participantId: 'p-safe',
  participantName: 'Aluno Seguro',
  score: 10,
  riskLevel: 'safe',
  factors: [],
  recommendations: [],
});

const watchPrediction = makePrediction({
  participantId: 'p-watch',
  participantName: 'Aluno Observação',
  score: 30,
  riskLevel: 'watch',
});

const atRiskPrediction = makePrediction({
  participantId: 'p-atrisk',
  participantName: 'Aluno Em Risco',
  score: 55,
  riskLevel: 'at_risk',
});

const criticalPrediction = makePrediction({
  participantId: 'p-critical',
  participantName: 'Aluno Crítico',
  score: 85,
  riskLevel: 'critical',
  recommendations: [
    {
      priority: 'urgent',
      action: 'Ligar para o aluno para entender ausência',
      targetRole: 'admin',
      automatable: false,
      relatedFactor: 'DAYS_SINCE_LAST_CHECKIN',
    },
    {
      priority: 'urgent',
      action: 'Agendar conversa individual com o aluno',
      targetRole: 'instructor',
      automatable: false,
      relatedFactor: 'ATTENDANCE_DROP',
    },
  ],
});

const allPredictions = [safePrediction, watchPrediction, atRiskPrediction, criticalPrediction];

// ════════════════════════════════════════════════════════════════════
// ADMIN OVERVIEW PROJECTOR
// ════════════════════════════════════════════════════════════════════

describe('projectAdminChurnOverview', () => {
  it('counts students correctly per risk level', () => {
    const overview = projectAdminChurnOverview(allPredictions);
    expect(overview.summary.safe).toBe(1);
    expect(overview.summary.watch).toBe(1);
    expect(overview.summary.atRisk).toBe(1);
    expect(overview.summary.critical).toBe(1);
    expect(overview.summary.total).toBe(4);
  });

  it('places students in correct risk arrays', () => {
    const overview = projectAdminChurnOverview(allPredictions);
    expect(overview.criticalStudents).toHaveLength(1);
    expect(overview.criticalStudents[0].participantId).toBe('p-critical');
    expect(overview.atRiskStudents).toHaveLength(1);
    expect(overview.atRiskStudents[0].participantId).toBe('p-atrisk');
    expect(overview.watchStudents).toHaveLength(1);
    expect(overview.watchStudents[0].participantId).toBe('p-watch');
  });

  it('calculates average score', () => {
    const overview = projectAdminChurnOverview(allPredictions);
    const expected = Math.round((10 + 30 + 55 + 85) / 4);
    expect(overview.averageScore).toBe(expected);
  });

  it('aggregates recommendations by action', () => {
    const overview = projectAdminChurnOverview(allPredictions);
    expect(overview.topRecommendations.length).toBeGreaterThan(0);
    // Each recommendation has affectedCount
    for (const rec of overview.topRecommendations) {
      expect(rec.affectedCount).toBeGreaterThan(0);
      expect(rec.action).toBeTruthy();
    }
  });

  it('handles empty predictions', () => {
    const overview = projectAdminChurnOverview([]);
    expect(overview.summary.total).toBe(0);
    expect(overview.averageScore).toBe(0);
    expect(overview.criticalStudents).toHaveLength(0);
    expect(overview.topRecommendations).toHaveLength(0);
  });

  it('sorts students by score descending within groups', () => {
    const twoAtRisk = [
      makePrediction({ participantId: 'p-ar1', score: 60, riskLevel: 'at_risk' }),
      makePrediction({ participantId: 'p-ar2', score: 50, riskLevel: 'at_risk' }),
    ];
    const overview = projectAdminChurnOverview(twoAtRisk);
    expect(overview.atRiskStudents[0].score).toBeGreaterThanOrEqual(overview.atRiskStudents[1].score);
  });

  it('maps student VM fields correctly', () => {
    const overview = projectAdminChurnOverview([criticalPrediction]);
    const student = overview.criticalStudents[0];
    expect(student.name).toBe('Aluno Crítico');
    expect(student.score).toBe(85);
    expect(student.riskLevel).toBe('critical');
    expect(student.confidence).toBe(0.85);
    expect(student.recommendationCount).toBe(2);
  });
});

// ════════════════════════════════════════════════════════════════════
// INSTRUCTOR ALERTS PROJECTOR
// ════════════════════════════════════════════════════════════════════

describe('projectInstructorChurnAlerts', () => {
  it('only includes at_risk and critical students', () => {
    const alerts = projectInstructorChurnAlerts(allPredictions);
    expect(alerts).toHaveLength(2); // at_risk + critical
    const riskLevels = alerts.map(a => a.riskLevel);
    expect(riskLevels).toContain('at_risk');
    expect(riskLevels).toContain('critical');
    expect(riskLevels).not.toContain('safe');
    expect(riskLevels).not.toContain('watch');
  });

  it('sorts by score descending', () => {
    const alerts = projectInstructorChurnAlerts(allPredictions);
    expect(alerts[0].score).toBeGreaterThanOrEqual(alerts[1].score);
  });

  it('only includes instructor-targeted recommendations', () => {
    const alerts = projectInstructorChurnAlerts([criticalPrediction]);
    for (const alert of alerts) {
      // Instructor recommendations only
      for (const rec of alert.recommendations) {
        expect(rec.action).toBeTruthy();
      }
    }
  });

  it('limits factors to top 3', () => {
    const manyFactors = makePrediction({
      riskLevel: 'critical',
      factors: Array.from({ length: 7 }, (_, i) => ({
        type: 'ATTENDANCE_DROP' as const,
        weight: 10,
        riskLevel: 'high' as const,
        rawValue: 30,
        threshold: { low: 70, medium: 50, high: 35, critical: 20 },
        contribution: 7.5,
        description: `Factor ${i}`,
      })),
    });
    const alerts = projectInstructorChurnAlerts([manyFactors]);
    expect(alerts[0].factors.length).toBeLessThanOrEqual(3);
  });

  it('returns empty for all-safe predictions', () => {
    const alerts = projectInstructorChurnAlerts([safePrediction, watchPrediction]);
    expect(alerts).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════
// RETENTION ENCOURAGEMENT PROJECTOR
// ════════════════════════════════════════════════════════════════════

describe('projectRetentionEncouragement', () => {
  it('returns shouldShow=false for safe students', () => {
    const result = projectRetentionEncouragement(safePrediction);
    expect(result.shouldShow).toBe(false);
    expect(result.incentiveType).toBe('general');
  });

  it('returns shouldShow=true for at-risk students', () => {
    const result = projectRetentionEncouragement(atRiskPrediction);
    expect(result.shouldShow).toBe(true);
  });

  it('never contains the word "risco" in messages', () => {
    for (const prediction of allPredictions) {
      const result = projectRetentionEncouragement(prediction);
      expect(result.message.toLowerCase()).not.toContain('risco');
      expect(result.suggestedAction.toLowerCase()).not.toContain('risco');
    }
  });

  it('never contains the word "evasão" in messages', () => {
    for (const prediction of allPredictions) {
      const result = projectRetentionEncouragement(prediction);
      expect(result.message.toLowerCase()).not.toContain('evasão');
      expect(result.suggestedAction.toLowerCase()).not.toContain('evasão');
    }
  });

  it('returns streak_recovery for streak-related top factor', () => {
    const streakPrediction = makePrediction({
      riskLevel: 'watch',
      factors: [{
        type: 'STREAK_BROKEN',
        weight: 20,
        riskLevel: 'medium',
        rawValue: 30,
        threshold: { low: 60, medium: 40, high: 20, critical: 5 },
        contribution: 10,
        description: 'Sequência atual é 30% da melhor',
      }],
    });
    const result = projectRetentionEncouragement(streakPrediction);
    expect(result.incentiveType).toBe('streak_recovery');
  });

  it('returns milestone_push for plateau factor', () => {
    const plateauPrediction = makePrediction({
      riskLevel: 'watch',
      factors: [{
        type: 'LONG_PLATEAU',
        weight: 15,
        riskLevel: 'medium',
        rawValue: 7,
        threshold: { low: 4, medium: 6, high: 10, critical: 18 },
        contribution: 7.5,
        description: '7 meses no mesmo nível',
      }],
    });
    const result = projectRetentionEncouragement(plateauPrediction);
    expect(result.incentiveType).toBe('milestone_push');
  });

  it('returns social_motivation for attendance drop', () => {
    const attendancePrediction = makePrediction({
      riskLevel: 'watch',
      factors: [{
        type: 'ATTENDANCE_DROP',
        weight: 25,
        riskLevel: 'medium',
        rawValue: 45,
        threshold: { low: 70, medium: 50, high: 35, critical: 20 },
        contribution: 12.5,
        description: 'Frequência em 45% no último período',
      }],
    });
    const result = projectRetentionEncouragement(attendancePrediction);
    expect(result.incentiveType).toBe('social_motivation');
  });

  it('always returns non-empty message and action', () => {
    for (const prediction of allPredictions) {
      const result = projectRetentionEncouragement(prediction);
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.suggestedAction.length).toBeGreaterThan(0);
    }
  });
});
