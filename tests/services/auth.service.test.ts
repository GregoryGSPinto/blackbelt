// ============================================================
// Auth Service — Integration Tests
// ============================================================
// Mock credentials (from lib/__mocks__/auth.mock.ts):
//   adulto@blackbelt.com / blackbelt123 → ALUNO_ADULTO
//   support@blackbelt.com / BlackBelt123 → SUPPORT
//   owner@blackbelt.com / BlackBelt123 → UNIT_OWNER
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  secureLogin,
  secureLogout,
  login,
  checkEmailAvailable,
  register,
} from '@/lib/api/auth.service';
import { clearAuth, isAuthenticated } from '@/lib/security/token-store';
import { clearAllTrackers } from '@/lib/security/rate-limiter';

describe('Auth Service (mock mode)', () => {
  beforeEach(() => {
    clearAuth();
    clearAllTrackers();
  });

  // ── secureLogin ───────────────────────────────────────

  describe('secureLogin', () => {
    it('succeeds with valid credentials', async () => {
      const result = await secureLogin({ email: 'adulto@blackbelt.com', password: 'blackbelt123' });
      expect(result.success).toBe(true);
      expect(result.loginData).toBeDefined();
      expect(result.rateLimited).toBeFalsy();
    });

    it('fails with invalid credentials', async () => {
      const result = await secureLogin({ email: 'adulto@blackbelt.com', password: 'wrongpassword' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('decrements attempts on failure', async () => {
      const r1 = await secureLogin({ email: 'fail@test.com', password: 'wrong' });
      expect(r1.success).toBe(false);
      expect(r1.attemptsRemaining).toBeDefined();

      const r2 = await secureLogin({ email: 'fail@test.com', password: 'wrong' });
      expect(r2.attemptsRemaining!).toBeLessThan(r1.attemptsRemaining!);
    });

    it('blocks after too many failures (5 attempts)', async () => {
      for (let i = 0; i < 5; i++) {
        await secureLogin({ email: 'brute@test.com', password: 'wrong' });
      }

      const result = await secureLogin({ email: 'brute@test.com', password: 'wrong' });
      expect(result.success).toBe(false);
      expect(result.rateLimited).toBe(true);
      expect(result.blockedFor).toBeGreaterThan(0);
    });

    it('stores auth token in memory on success', async () => {
      await secureLogin({ email: 'adulto@blackbelt.com', password: 'blackbelt123' });
      expect(isAuthenticated()).toBe(true);
    });
  });

  // ── login (simple) ────────────────────────────────────

  describe('login', () => {
    it('returns LoginResponse on success', async () => {
      const result = await login({ email: 'adulto@blackbelt.com', password: 'blackbelt123' });
      expect(result).not.toBeNull();
      expect(result!.user).toBeDefined();
      expect(result!.user.email).toBe('adulto@blackbelt.com');
    });

    it('returns null on failure', async () => {
      const result = await login({ email: 'no@user.com', password: 'wrong' });
      expect(result).toBeNull();
    });
  });

  // ── checkEmailAvailable ───────────────────────────────

  describe('checkEmailAvailable', () => {
    it('returns false for existing email', async () => {
      const available = await checkEmailAvailable('adulto@blackbelt.com');
      expect(available).toBe(false);
    });

    it('returns true for new email', async () => {
      const available = await checkEmailAvailable('brand_new_never_seen@random.com');
      expect(available).toBe(true);
    });
  });

  // ── register ──────────────────────────────────────────

  describe('register', () => {
    it('succeeds with valid data', async () => {
      const result = await register({
        email: `new_user_${Date.now()}@test.com`,
        password: 'StrongPassword123!',
        nome: 'Test User',
      });
      expect(result).not.toBeNull();
    });

    it('fails for existing email', async () => {
      const result = await register({
        email: 'adulto@blackbelt.com',
        password: 'StrongPassword123!',
        nome: 'Duplicate User',
      });
      expect(result).toBeNull();
    });
  });

  // ── secureLogout ──────────────────────────────────────

  describe('secureLogout', () => {
    it('clears auth state', async () => {
      await secureLogin({ email: 'adulto@blackbelt.com', password: 'blackbelt123' });
      expect(isAuthenticated()).toBe(true);

      await secureLogout();
      expect(isAuthenticated()).toBe(false);
    });
  });
});
