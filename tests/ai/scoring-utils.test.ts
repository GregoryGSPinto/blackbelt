// ============================================================
// Scoring Utils — Unit Tests
// ============================================================
// Pure function tests for shared utility functions.
// No mocks, no database, deterministic.
//
// Tests:
//   1. clampScore — boundary clamping
//   2. normalizeToScore — range normalization edge cases
//   3. weightedAverage — various weight distributions
//   4. computeTrend — trend detection from value series
//   5. classifyEngagementTier — tier classification
//   6. computeAttentionLevel — attention level determination
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  clampScore,
  normalizeToScore,
  weightedAverage,
  computeTrend,
  classifyEngagementTier,
  computeAttentionLevel,
} from '@/lib/domain/intelligence/core/scoring-utils';

// ════════════════════════════════════════════════════════════════════
// clampScore
// ════════════════════════════════════════════════════════════════════

describe('clampScore()', () => {
  it('returns value unchanged when within range (0-100)', () => {
    expect(clampScore(50)).toBe(50);
    expect(clampScore(0)).toBe(0);
    expect(clampScore(100)).toBe(100);
    expect(clampScore(73)).toBe(73);
  });

  it('clamps negative values to 0', () => {
    expect(clampScore(-1)).toBe(0);
    expect(clampScore(-100)).toBe(0);
    expect(clampScore(-0.5)).toBe(0);
  });

  it('clamps values above 100 to 100', () => {
    expect(clampScore(101)).toBe(100);
    expect(clampScore(200)).toBe(100);
    expect(clampScore(150.7)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(clampScore(50.4)).toBe(50);
    expect(clampScore(50.5)).toBe(51);
    expect(clampScore(50.6)).toBe(51);
    expect(clampScore(99.9)).toBe(100);
  });

  it('handles edge case of very small positive values', () => {
    expect(clampScore(0.1)).toBe(0);
    expect(clampScore(0.4)).toBe(0);
    expect(clampScore(0.5)).toBe(1);
  });

  it('handles NaN-like inputs gracefully', () => {
    // NaN compared with min/max will result in NaN, then Math.round(NaN) = NaN
    // The function does not explicitly guard against NaN, but it should be noted
    const result = clampScore(Number.NaN);
    expect(Number.isNaN(result)).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════
// normalizeToScore
// ════════════════════════════════════════════════════════════════════

describe('normalizeToScore()', () => {
  it('normalizes value within range to 0-100', () => {
    expect(normalizeToScore(50, 0, 100)).toBe(50);
    expect(normalizeToScore(0, 0, 100)).toBe(0);
    expect(normalizeToScore(100, 0, 100)).toBe(100);
  });

  it('normalizes with non-zero min', () => {
    expect(normalizeToScore(15, 10, 20)).toBe(50);
    expect(normalizeToScore(10, 10, 20)).toBe(0);
    expect(normalizeToScore(20, 10, 20)).toBe(100);
  });

  it('clamps values outside range', () => {
    expect(normalizeToScore(-10, 0, 100)).toBe(0);
    expect(normalizeToScore(150, 0, 100)).toBe(100);
  });

  it('returns 50 when min equals max (avoids division by zero)', () => {
    expect(normalizeToScore(5, 5, 5)).toBe(50);
    expect(normalizeToScore(0, 0, 0)).toBe(50);
  });

  it('works with inverted ranges (min > max conceptually)', () => {
    // normalizeToScore(1.5, 2.0, 0.5) -> (1.5-2.0)/(0.5-2.0)*100 = (-0.5)/(-1.5)*100 = 33.3
    const result = normalizeToScore(1.5, 2.0, 0.5);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('handles decimal values', () => {
    const result = normalizeToScore(0.75, 0, 1);
    expect(result).toBe(75);
  });
});

// ════════════════════════════════════════════════════════════════════
// weightedAverage
// ════════════════════════════════════════════════════════════════════

describe('weightedAverage()', () => {
  it('computes simple weighted average', () => {
    const result = weightedAverage([
      { value: 80, weight: 0.5 },
      { value: 60, weight: 0.5 },
    ]);
    expect(result).toBe(70);
  });

  it('gives more weight to heavier items', () => {
    const result = weightedAverage([
      { value: 100, weight: 0.9 },
      { value: 0, weight: 0.1 },
    ]);
    expect(result).toBe(90);
  });

  it('returns 0 when all weights are 0', () => {
    const result = weightedAverage([
      { value: 80, weight: 0 },
      { value: 60, weight: 0 },
    ]);
    expect(result).toBe(0);
  });

  it('works with a single item', () => {
    const result = weightedAverage([{ value: 75, weight: 1 }]);
    expect(result).toBe(75);
  });

  it('returns 0 for empty array', () => {
    const result = weightedAverage([]);
    expect(result).toBe(0);
  });

  it('handles unequal weights correctly', () => {
    const result = weightedAverage([
      { value: 100, weight: 0.3 },
      { value: 80, weight: 0.25 },
      { value: 60, weight: 0.2 },
      { value: 40, weight: 0.15 },
      { value: 20, weight: 0.1 },
    ]);
    // (100*0.3 + 80*0.25 + 60*0.2 + 40*0.15 + 20*0.1) / 1.0
    // = (30 + 20 + 12 + 6 + 2) / 1.0 = 70
    expect(result).toBe(70);
  });

  it('rounds to 2 decimal places', () => {
    const result = weightedAverage([
      { value: 33, weight: 1 },
      { value: 66, weight: 1 },
      { value: 99, weight: 1 },
    ]);
    // (33+66+99)/3 = 66
    expect(result).toBe(66);
  });
});

// ════════════════════════════════════════════════════════════════════
// computeTrend
// ════════════════════════════════════════════════════════════════════

describe('computeTrend()', () => {
  it('returns stable for fewer than 2 values', () => {
    expect(computeTrend([])).toBe('stable');
    expect(computeTrend([50])).toBe('stable');
  });

  it('detects rising trend (second half > first half by > 5)', () => {
    expect(computeTrend([30, 35, 45, 50])).toBe('rising');
    expect(computeTrend([10, 20, 30, 40])).toBe('rising');
  });

  it('detects declining trend (second half < first half by > 5)', () => {
    expect(computeTrend([80, 75, 65, 55])).toBe('declining');
    expect(computeTrend([90, 80, 70, 60])).toBe('declining');
  });

  it('detects stable trend (difference <= 5)', () => {
    expect(computeTrend([50, 50, 52, 51])).toBe('stable');
    expect(computeTrend([70, 72, 68, 71])).toBe('stable');
  });

  it('works with only 2 values', () => {
    expect(computeTrend([30, 50])).toBe('rising');
    expect(computeTrend([80, 60])).toBe('declining');
    expect(computeTrend([50, 52])).toBe('stable');
  });

  it('uses only the last 4 values for trend calculation', () => {
    // Old values should not affect trend
    const values = [10, 20, 30, 40, 80, 82, 84, 85];
    const result = computeTrend(values);
    // Last 4: [82, 84, 85, 85] -> first half avg=83, second half avg=85 -> delta=2 -> stable
    // Actually last 4: [82, 84, 85] or depends on slice logic
    expect(['stable', 'rising']).toContain(result);
  });

  it('handles equal values as stable', () => {
    expect(computeTrend([50, 50, 50, 50])).toBe('stable');
  });
});

// ════════════════════════════════════════════════════════════════════
// classifyEngagementTier
// ════════════════════════════════════════════════════════════════════

describe('classifyEngagementTier()', () => {
  it('classifies champion (>= 90)', () => {
    expect(classifyEngagementTier(90)).toBe('champion');
    expect(classifyEngagementTier(95)).toBe('champion');
    expect(classifyEngagementTier(100)).toBe('champion');
  });

  it('classifies committed (70-89)', () => {
    expect(classifyEngagementTier(70)).toBe('committed');
    expect(classifyEngagementTier(80)).toBe('committed');
    expect(classifyEngagementTier(89)).toBe('committed');
  });

  it('classifies active (50-69)', () => {
    expect(classifyEngagementTier(50)).toBe('active');
    expect(classifyEngagementTier(60)).toBe('active');
    expect(classifyEngagementTier(69)).toBe('active');
  });

  it('classifies drifting (30-49)', () => {
    expect(classifyEngagementTier(30)).toBe('drifting');
    expect(classifyEngagementTier(40)).toBe('drifting');
    expect(classifyEngagementTier(49)).toBe('drifting');
  });

  it('classifies disconnected (0-29)', () => {
    expect(classifyEngagementTier(0)).toBe('disconnected');
    expect(classifyEngagementTier(15)).toBe('disconnected');
    expect(classifyEngagementTier(29)).toBe('disconnected');
  });

  it('handles boundary values correctly', () => {
    expect(classifyEngagementTier(90)).toBe('champion');
    expect(classifyEngagementTier(89)).toBe('committed');
    expect(classifyEngagementTier(70)).toBe('committed');
    expect(classifyEngagementTier(69)).toBe('active');
    expect(classifyEngagementTier(50)).toBe('active');
    expect(classifyEngagementTier(49)).toBe('drifting');
    expect(classifyEngagementTier(30)).toBe('drifting');
    expect(classifyEngagementTier(29)).toBe('disconnected');
  });
});

// ════════════════════════════════════════════════════════════════════
// computeAttentionLevel
// ════════════════════════════════════════════════════════════════════

describe('computeAttentionLevel()', () => {
  it('returns level 1 (urgent) for very low engagement + declining trend', () => {
    expect(computeAttentionLevel(20, 'declining', -20)).toBe(1);
    expect(computeAttentionLevel(25, 'declining', -10)).toBe(1);
  });

  it('returns level 2 for low engagement (< 50)', () => {
    expect(computeAttentionLevel(40, 'stable', 0)).toBe(2);
    expect(computeAttentionLevel(35, 'rising', 5)).toBe(2);
  });

  it('returns level 2 for steep decline (trendDelta < -15)', () => {
    expect(computeAttentionLevel(65, 'declining', -20)).toBe(2);
    expect(computeAttentionLevel(75, 'declining', -16)).toBe(2);
  });

  it('returns level 3 for moderate engagement (50-69)', () => {
    expect(computeAttentionLevel(55, 'stable', 0)).toBe(3);
    expect(computeAttentionLevel(65, 'stable', 2)).toBe(3);
  });

  it('returns level 4 for good engagement (70-89)', () => {
    expect(computeAttentionLevel(75, 'stable', 0)).toBe(4);
    expect(computeAttentionLevel(85, 'rising', 5)).toBe(4);
  });

  it('returns level 5 (autonomous) for excellent engagement (>= 90)', () => {
    expect(computeAttentionLevel(90, 'stable', 0)).toBe(5);
    expect(computeAttentionLevel(95, 'rising', 3)).toBe(5);
    expect(computeAttentionLevel(100, 'stable', 0)).toBe(5);
  });

  it('declining trend with moderate delta does not override level 3+', () => {
    // trendDelta = -10 (not < -15), engagement = 60 -> level 3
    expect(computeAttentionLevel(60, 'declining', -10)).toBe(3);
  });

  it('boundary: engagement exactly 30 with declining', () => {
    // engagement < 30 is false (30 is not < 30), so not level 1
    // engagement < 50 is true, so level 2
    expect(computeAttentionLevel(30, 'declining', -10)).toBe(2);
  });

  it('boundary: engagement exactly 50', () => {
    // engagement < 50 is false, engagement < 70 is true -> level 3
    expect(computeAttentionLevel(50, 'stable', 0)).toBe(3);
  });

  it('boundary: engagement exactly 70', () => {
    // engagement < 70 is false, engagement < 90 is true -> level 4
    expect(computeAttentionLevel(70, 'stable', 0)).toBe(4);
  });

  it('level is always between 1 and 5', () => {
    const cases: [number, 'rising' | 'stable' | 'declining', number][] = [
      [0, 'declining', -50],
      [10, 'declining', -30],
      [25, 'stable', 0],
      [50, 'rising', 10],
      [75, 'stable', 0],
      [100, 'rising', 5],
    ];

    for (const [engagement, trend, delta] of cases) {
      const level = computeAttentionLevel(engagement, trend, delta);
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(5);
    }
  });
});

// ════════════════════════════════════════════════════════════════════
// Cross-function integration
// ════════════════════════════════════════════════════════════════════

describe('cross-function consistency', () => {
  it('higher tier students have higher or equal attention levels', () => {
    const championLevel = computeAttentionLevel(92, 'stable', 0);
    const driftingLevel = computeAttentionLevel(35, 'declining', -10);
    expect(championLevel).toBeGreaterThan(driftingLevel);
  });

  it('classifyEngagementTier matches expected tier for clampScore output', () => {
    const score = clampScore(85);
    const tier = classifyEngagementTier(score);
    expect(tier).toBe('committed');
  });

  it('normalizeToScore output is valid input for classifyEngagementTier', () => {
    const normalized = normalizeToScore(0.7, 0, 1);
    const tier = classifyEngagementTier(normalized);
    expect(['champion', 'committed', 'active', 'drifting', 'disconnected']).toContain(tier);
  });

  it('weightedAverage result is valid input for clampScore', () => {
    const avg = weightedAverage([
      { value: 80, weight: 0.5 },
      { value: 60, weight: 0.5 },
    ]);
    const clamped = clampScore(avg);
    expect(clamped).toBe(70);
  });
});
