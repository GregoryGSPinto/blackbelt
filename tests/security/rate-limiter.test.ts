// ============================================================
// Rate Limiter — Unit Tests
// ============================================================
// Tests: checkRateLimit, recordAttempt, recordSuccess,
//        blocking logic, expiry, clearAllTrackers
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  recordAttempt,
  recordSuccess,
  getBlockTimeRemaining,
  clearAllTrackers,
} from '@/lib/security/rate-limiter';

// Default: 5 attempts, 900s lockout
describe('Rate Limiter', () => {
  beforeEach(() => {
    clearAllTrackers();
  });

  // ── Initial State ─────────────────────────────────────

  describe('initial state', () => {
    it('allows first attempt', () => {
      const status = checkRateLimit('user@test.com');
      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(5);
      expect(status.blocked).toBe(false);
    });

    it('different keys are independent', () => {
      recordAttempt('user-a@test.com');
      recordAttempt('user-a@test.com');
      recordAttempt('user-a@test.com');

      const statusA = checkRateLimit('user-a@test.com');
      const statusB = checkRateLimit('user-b@test.com');

      expect(statusA.remaining).toBe(2);
      expect(statusB.remaining).toBe(5);
    });
  });

  // ── Recording Attempts ────────────────────────────────

  describe('recordAttempt', () => {
    it('decrements remaining on each attempt', () => {
      const s1 = recordAttempt('test@key');
      expect(s1.remaining).toBe(4);

      const s2 = recordAttempt('test@key');
      expect(s2.remaining).toBe(3);

      const s3 = recordAttempt('test@key');
      expect(s3.remaining).toBe(2);
    });

    it('blocks after max attempts (5)', () => {
      for (let i = 0; i < 4; i++) {
        recordAttempt('brute@force');
      }

      // 5th attempt should block
      const status = recordAttempt('brute@force');
      expect(status.allowed).toBe(false);
      expect(status.remaining).toBe(0);
      expect(status.blocked).toBe(true);
      expect(status.blockedUntil).toBeDefined();
    });

    it('remains blocked on subsequent checks', () => {
      for (let i = 0; i < 5; i++) {
        recordAttempt('blocked@user');
      }

      const status = checkRateLimit('blocked@user');
      expect(status.allowed).toBe(false);
      expect(status.blocked).toBe(true);
    });
  });

  // ── recordSuccess ─────────────────────────────────────

  describe('recordSuccess', () => {
    it('resets counter after successful login', () => {
      recordAttempt('good@user');
      recordAttempt('good@user');
      recordAttempt('good@user');

      recordSuccess('good@user');

      const status = checkRateLimit('good@user');
      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(5);
    });
  });

  // ── Block Expiry ──────────────────────────────────────

  describe('block expiry', () => {
    it('unblocks after lockout duration expires', () => {
      // Block the user
      for (let i = 0; i < 5; i++) {
        recordAttempt('timed@user');
      }

      expect(checkRateLimit('timed@user').blocked).toBe(true);

      // Fast-forward time past lockout (900s = 15min)
      const originalNow = Date.now;
      Date.now = () => originalNow() + 901_000;

      const status = checkRateLimit('timed@user');
      expect(status.allowed).toBe(true);
      expect(status.blocked).toBe(false);
      expect(status.remaining).toBe(5);

      // Restore
      Date.now = originalNow;
    });
  });

  // ── getBlockTimeRemaining ─────────────────────────────

  describe('getBlockTimeRemaining', () => {
    it('returns 0 for unblocked user', () => {
      expect(getBlockTimeRemaining('free@user')).toBe(0);
    });

    it('returns positive seconds for blocked user', () => {
      for (let i = 0; i < 5; i++) {
        recordAttempt('blocked@time');
      }

      const remaining = getBlockTimeRemaining('blocked@time');
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(900);
    });
  });

  // ── clearAllTrackers ──────────────────────────────────

  describe('clearAllTrackers', () => {
    it('resets all tracking data', () => {
      recordAttempt('a@test');
      recordAttempt('b@test');

      clearAllTrackers();

      expect(checkRateLimit('a@test').remaining).toBe(5);
      expect(checkRateLimit('b@test').remaining).toBe(5);
    });
  });
});
