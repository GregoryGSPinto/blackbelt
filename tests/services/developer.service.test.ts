// ============================================================
// Developer Service — Unit Tests
// ============================================================

import { describe, it, expect } from 'vitest';
import { getSystemHealth, getObservability } from '@/lib/api/developer.service';

describe('Developer Service (mock mode)', () => {
  describe('getSystemHealth', () => {
    it('returns array of health metrics', async () => {
      const health = await getSystemHealth();
      expect(Array.isArray(health)).toBe(true);
      expect(health.length).toBeGreaterThan(0);
    });

    it('each metric has name, value, status, trend', async () => {
      const health = await getSystemHealth();
      for (const m of health) {
        expect(m.name).toBeTruthy();
        expect(typeof m.value).toBe('number');
        expect(m.status).toMatch(/healthy|warning|critical/);
        expect(m.trend).toMatch(/up|down|stable/);
        expect(m.unit).toBeDefined();
      }
    });
  });

  describe('getObservability', () => {
    it('returns observability snapshot', async () => {
      const obs = await getObservability();
      expect(obs).toBeDefined();
      expect(typeof obs.requestsPerMinute).toBe('number');
      expect(typeof obs.avgLatencyMs).toBe('number');
      expect(typeof obs.errorRate).toBe('number');
      expect(typeof obs.anomaliesLast24h).toBe('number');
    });
  });
});
