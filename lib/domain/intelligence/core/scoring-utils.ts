/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SCORING UTILS — Funções utilitárias de scoring                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Funções puras reutilizáveis por todos os engines.             ║
 * ║  Zero side effects. Testável isoladamente.                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { Score0to100, TrendDirection, EngagementTier, AttentionLevel, Percentage } from './types';

/** Clamp value to 0-100 range */
export function clampScore(value: number): Score0to100 {
  return Math.round(Math.min(100, Math.max(0, value)));
}

/** Clamp value to 0-1 range */
export function clampConfidence(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}

/** Normalize a value within a range to 0-100 */
export function normalizeToScore(value: number, min: number, max: number): Score0to100 {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return clampScore(normalized);
}

/** Invert a score (100 becomes 0, 0 becomes 100) */
export function invertScore(score: Score0to100): Score0to100 {
  return clampScore(100 - score);
}

/** Calculate weighted average from array of { value, weight } */
export function weightedAverage(items: { value: number; weight: number }[]): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = items.reduce((sum, item) => sum + item.value * item.weight, 0);
  return Math.round((weighted / totalWeight) * 100) / 100;
}

/** Determine trend from a series of values (at least 2) */
export function computeTrend(values: number[]): TrendDirection {
  if (values.length < 2) return 'stable';
  const recent = values.slice(-Math.min(4, values.length));
  const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
  const secondHalf = recent.slice(Math.ceil(recent.length / 2));
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const delta = avgSecond - avgFirst;
  if (delta > 5) return 'rising';
  if (delta < -5) return 'declining';
  return 'stable';
}

/** Compute trend delta as percentage change */
export function computeTrendDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Classify engagement tier from score */
export function classifyEngagementTier(score: Score0to100): EngagementTier {
  if (score >= 90) return 'champion';
  if (score >= 70) return 'committed';
  if (score >= 50) return 'active';
  if (score >= 30) return 'drifting';
  return 'disconnected';
}

/** Determine attention level from engagement + trend */
export function computeAttentionLevel(
  engagement: Score0to100,
  trend: TrendDirection,
  trendDelta: number,
): AttentionLevel {
  if (engagement < 30 && trend === 'declining') return 1;
  if (engagement < 50 || (trend === 'declining' && trendDelta < -15)) return 2;
  if (engagement < 70) return 3;
  if (engagement < 90) return 4;
  return 5;
}

/** Calculate standard deviation */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/** Compute percentile placement (0-100) */
export function percentilePlacement(value: number, allValues: number[]): Percentage {
  if (allValues.length === 0) return 50;
  const sorted = [...allValues].sort((a, b) => a - b);
  const idx = sorted.findIndex(v => v >= value);
  if (idx === -1) return 100;
  return clampScore(Math.round((idx / sorted.length) * 100));
}

/** Safe division (returns fallback if denominator is 0) */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  return denominator === 0 ? fallback : numerator / denominator;
}

/** Group items by key */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/** Get top N items from array */
export function topN<T>(items: T[], n: number, scoreFn: (item: T) => number): T[] {
  return [...items].sort((a, b) => scoreFn(b) - scoreFn(a)).slice(0, n);
}

/** Get bottom N items from array */
export function bottomN<T>(items: T[], n: number, scoreFn: (item: T) => number): T[] {
  return [...items].sort((a, b) => scoreFn(a) - scoreFn(b)).slice(0, n);
}

/** Days between two ISO date strings */
export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.abs(Math.round((b - a) / (24 * 60 * 60 * 1000)));
}

/** Weeks between two ISO date strings */
export function weeksBetween(dateA: string, dateB: string): number {
  return Math.round(daysBetween(dateA, dateB) / 7);
}

/** Months between two ISO date strings */
export function monthsBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.abs((b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}
