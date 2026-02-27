// ============================================================
// Churn Weights — Unit Tests
// ============================================================
// Tests for weight resolution and normalization per segment.
// ============================================================

import { describe, it, expect } from 'vitest';
import { resolveWeights, CHURN_LEVEL_THRESHOLDS } from '@/lib/domain/intelligence/engine/weights';
import { DEFAULT_RISK_FACTORS } from '@/lib/domain/intelligence/models/risk-factors';

describe('resolveWeights', () => {
  it('returns default weights when no segment is provided', () => {
    const weights = resolveWeights();
    expect(weights.ATTENDANCE_DROP).toBeDefined();
    expect(weights.STREAK_BROKEN).toBeDefined();
    expect(weights.DAYS_SINCE_LAST_CHECKIN).toBeDefined();
    expect(weights.LONG_PLATEAU).toBeDefined();
    expect(weights.PAYMENT_ISSUES).toBeDefined();
    expect(weights.LOW_ENGAGEMENT_SCORE).toBeDefined();
    expect(weights.DECLINING_POINTS).toBeDefined();
  });

  it('default weights sum to ~100', () => {
    const weights = resolveWeights();
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('martial_arts weights sum to ~100', () => {
    const weights = resolveWeights('martial_arts');
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('fitness weights sum to ~100', () => {
    const weights = resolveWeights('fitness');
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('dance weights sum to ~100', () => {
    const weights = resolveWeights('dance');
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('pilates weights sum to ~100', () => {
    const weights = resolveWeights('pilates');
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('music weights sum to ~100', () => {
    const weights = resolveWeights('music');
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('all weights are positive', () => {
    const segments = [undefined, 'martial_arts', 'fitness', 'dance', 'pilates', 'music'] as const;
    for (const seg of segments) {
      const weights = resolveWeights(seg as any);
      for (const [key, value] of Object.entries(weights)) {
        expect(value, `${seg ?? 'default'}:${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('fitness emphasizes STREAK_BROKEN more than default', () => {
    const defaultW = resolveWeights();
    const fitnessW = resolveWeights('fitness');
    expect(fitnessW.STREAK_BROKEN).toBeGreaterThanOrEqual(defaultW.STREAK_BROKEN);
  });
});

describe('CHURN_LEVEL_THRESHOLDS', () => {
  it('has correct ordering: safe < watch < at_risk < critical', () => {
    expect(CHURN_LEVEL_THRESHOLDS.safe).toBeLessThan(CHURN_LEVEL_THRESHOLDS.watch);
    expect(CHURN_LEVEL_THRESHOLDS.watch).toBeLessThan(CHURN_LEVEL_THRESHOLDS.at_risk);
    expect(CHURN_LEVEL_THRESHOLDS.at_risk).toBeLessThan(CHURN_LEVEL_THRESHOLDS.critical);
  });

  it('covers the full 0-100 range', () => {
    expect(CHURN_LEVEL_THRESHOLDS.safe).toBeGreaterThan(0);
    expect(CHURN_LEVEL_THRESHOLDS.critical).toBe(100);
  });
});

describe('DEFAULT_RISK_FACTORS', () => {
  it('has 7 factors defined', () => {
    expect(Object.keys(DEFAULT_RISK_FACTORS)).toHaveLength(7);
  });

  it('default weights sum to 100', () => {
    const sum = Object.values(DEFAULT_RISK_FACTORS).reduce((a, f) => a + f.weight, 0);
    expect(sum).toBe(100);
  });

  it('each factor has valid direction', () => {
    for (const factor of Object.values(DEFAULT_RISK_FACTORS)) {
      expect(['asc', 'desc']).toContain(factor.direction);
    }
  });

  it('each factor has ascending threshold values', () => {
    for (const factor of Object.values(DEFAULT_RISK_FACTORS)) {
      const t = factor.thresholds;
      if (factor.direction === 'asc') {
        // asc: low < medium < high < critical
        expect(t.low).toBeLessThanOrEqual(t.medium);
        expect(t.medium).toBeLessThanOrEqual(t.high);
        expect(t.high).toBeLessThanOrEqual(t.critical);
      } else {
        // desc: low > medium > high > critical
        expect(t.low).toBeGreaterThanOrEqual(t.medium);
        expect(t.medium).toBeGreaterThanOrEqual(t.high);
        expect(t.high).toBeGreaterThanOrEqual(t.critical);
      }
    }
  });
});
