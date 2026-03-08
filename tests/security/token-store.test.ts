// ============================================================
// Token Store — Unit Tests
// ============================================================
// Tests: setAuth, getAccessToken, clearAuth, isAuthenticated,
//        getCurrentUser, getSessionId, expiry logic, security config
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setAuth,
  clearAuth,
  getAccessToken,
  isAuthenticated,
  getCurrentUser,
  getSessionId,
  getSecurityConfig,
  setSecurityConfig,
} from '@/features/auth/services/token-store';
import type { AuthenticatedUser } from '@/lib/api/contracts';

const mockUser: AuthenticatedUser = {
  id: 'user-1',
  nome: 'João Silva',
  email: 'joao@test.com',
  role: 'ALUNO_ADULTO',
  permissions: ['student:view:content', 'student:checkin'],
  unitId: 'unit-1',
  avatar: '🥋',
  graduacao: 'Nível Iniciante',
};

describe('Token Store', () => {
  beforeEach(() => {
    clearAuth();
  });

  // ── setAuth / getAccessToken ──────────────────────────

  describe('setAuth', () => {
    it('stores token and user in memory', () => {
      const futureExpiry = new Date(Date.now() + 600_000).toISOString(); // 10min
      setAuth('tok_abc123', futureExpiry, mockUser, 'sess-001');

      expect(getAccessToken()).toBe('tok_abc123');
      expect(getCurrentUser()).toEqual(mockUser);
      expect(getSessionId()).toBe('sess-001');
    });

    it('overwrites previous session', () => {
      const exp = new Date(Date.now() + 600_000).toISOString();
      setAuth('tok_first', exp, mockUser, 'sess-1');
      setAuth('tok_second', exp, { ...mockUser, nome: 'Maria' }, 'sess-2');

      expect(getAccessToken()).toBe('tok_second');
      expect(getCurrentUser()?.nome).toBe('Maria');
      expect(getSessionId()).toBe('sess-2');
    });
  });

  // ── Token expiry ──────────────────────────────────────

  describe('getAccessToken - expiry', () => {
    it('returns null for expired token', () => {
      const pastExpiry = new Date(Date.now() - 60_000).toISOString(); // 1min ago
      setAuth('tok_expired', pastExpiry, mockUser, 'sess-1');

      expect(getAccessToken()).toBeNull();
    });

    it('returns null for token expiring within 30s margin', () => {
      const soonExpiry = new Date(Date.now() + 20_000).toISOString(); // 20s
      setAuth('tok_soon', soonExpiry, mockUser, 'sess-1');

      expect(getAccessToken()).toBeNull();
    });

    it('returns token if more than 30s remaining', () => {
      const safeExpiry = new Date(Date.now() + 120_000).toISOString(); // 2min
      setAuth('tok_safe', safeExpiry, mockUser, 'sess-1');

      expect(getAccessToken()).toBe('tok_safe');
    });
  });

  // ── isAuthenticated ───────────────────────────────────

  describe('isAuthenticated', () => {
    it('returns false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true with valid token', () => {
      const exp = new Date(Date.now() + 600_000).toISOString();
      setAuth('tok_valid', exp, mockUser, 'sess-1');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false with expired token', () => {
      const exp = new Date(Date.now() - 60_000).toISOString();
      setAuth('tok_expired', exp, mockUser, 'sess-1');
      expect(isAuthenticated()).toBe(false);
    });
  });

  // ── clearAuth ─────────────────────────────────────────

  describe('clearAuth', () => {
    it('removes all auth data', () => {
      const exp = new Date(Date.now() + 600_000).toISOString();
      setAuth('tok_123', exp, mockUser, 'sess-1');

      clearAuth();

      expect(getAccessToken()).toBeNull();
      expect(getCurrentUser()).toBeNull();
      expect(getSessionId()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });

  // ── getCurrentUser ────────────────────────────────────

  describe('getCurrentUser', () => {
    it('returns null when not authenticated', () => {
      expect(getCurrentUser()).toBeNull();
    });

    it('returns deep copy (not reference)', () => {
      const exp = new Date(Date.now() + 600_000).toISOString();
      setAuth('tok_123', exp, mockUser, 'sess-1');

      const u1 = getCurrentUser();
      const u2 = getCurrentUser();
      expect(u1).toEqual(u2);
      // Should be different references
      expect(u1).not.toBe(mockUser);
    });
  });

  // ── Security Config ───────────────────────────────────

  describe('Security Config', () => {
    it('returns defaults', () => {
      const cfg = getSecurityConfig();
      expect(cfg.maxLoginAttempts).toBe(5);
      expect(cfg.lockoutDuration).toBe(900);
      expect(cfg.accessTokenTTL).toBe(900);
    });

    it('merges partial config', () => {
      setSecurityConfig({ maxLoginAttempts: 3 });
      const cfg = getSecurityConfig();
      expect(cfg.maxLoginAttempts).toBe(3);
      expect(cfg.lockoutDuration).toBe(900); // unchanged
    });
  });
});
