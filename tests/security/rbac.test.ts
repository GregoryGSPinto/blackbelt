// ============================================================
// RBAC — Unit Tests
// ============================================================
// SecurityRole: 'SUPPORT' | 'UNIT_OWNER' | 'INSTRUTOR' | 'ALUNO_ADULTO'
//               | 'ALUNO_ADOLESCENTE' | 'ALUNO_KIDS' | 'RESPONSAVEL'
//               | 'ADMIN' | 'SYS_AUDITOR' (legacy)
// SecurityPermission: 'admin:manage:users' | 'student:checkin' | etc.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  requireAuth,
  requireRole,
  requireAnyRole,
  requirePermission,
  requireOwnership,
  requireSameUnit,
  hasPermission,
  hasRole,
  isAdmin,
  isInstrutor,
  getCurrentPermissions,
} from '@/lib/security/rbac';
import { setAuth, clearAuth } from '@/lib/security/token-store';
import type { AuthenticatedUser, SecurityRole, SecurityPermission } from '@/lib/api/contracts';

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 'u-1',
    nome: 'Test User',
    email: 'test@test.com',
    role: 'ALUNO_ADULTO' as SecurityRole,
    permissions: ['student:view:content', 'student:checkin'] as SecurityPermission[],
    unitId: 'unit-1',
    ...overrides,
  };
}

function loginAs(user: AuthenticatedUser) {
  const exp = new Date(Date.now() + 600_000).toISOString();
  setAuth('tok_test', exp, user, 'sess-test');
}

describe('RBAC', () => {
  beforeEach(() => {
    clearAuth();
  });

  // ── requireAuth ───────────────────────────────────────

  describe('requireAuth', () => {
    it('denies when not authenticated', () => {
      expect(requireAuth().allowed).toBe(false);
    });

    it('allows when authenticated', () => {
      loginAs(makeUser());
      expect(requireAuth().allowed).toBe(true);
    });
  });

  // ── requireRole ───────────────────────────────────────

  describe('requireRole', () => {
    it('allows matching role', () => {
      loginAs(makeUser({ role: 'INSTRUTOR' }));
      expect(requireRole('INSTRUTOR').allowed).toBe(true);
    });

    it('denies mismatching role', () => {
      loginAs(makeUser({ role: 'ALUNO_ADULTO' }));
      const result = requireRole('INSTRUTOR');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('INSTRUTOR');
    });

    it('ADMIN bypasses role check', () => {
      loginAs(makeUser({ role: 'ADMIN' }));
      expect(requireRole('INSTRUTOR').allowed).toBe(true);
      expect(requireRole('ALUNO_ADULTO').allowed).toBe(true);
    });

    it('denies if not authenticated', () => {
      expect(requireRole('ALUNO_ADULTO').allowed).toBe(false);
    });
  });

  // ── requireAnyRole ────────────────────────────────────

  describe('requireAnyRole', () => {
    it('allows if user has any of the roles', () => {
      loginAs(makeUser({ role: 'INSTRUTOR' }));
      expect(requireAnyRole('ALUNO_ADULTO', 'INSTRUTOR').allowed).toBe(true);
    });

    it('denies if user has none of the roles', () => {
      loginAs(makeUser({ role: 'ALUNO_ADULTO' }));
      expect(requireAnyRole('INSTRUTOR', 'ADMIN').allowed).toBe(false);
    });

    it('ADMIN always passes', () => {
      loginAs(makeUser({ role: 'ADMIN' }));
      expect(requireAnyRole('ALUNO_ADULTO', 'INSTRUTOR').allowed).toBe(true);
    });
  });

  // ── requirePermission ─────────────────────────────────

  describe('requirePermission', () => {
    it('allows if user has the permission', () => {
      loginAs(makeUser({ permissions: ['student:checkin', 'student:view:content'] as SecurityPermission[] }));
      expect(requirePermission('student:checkin').allowed).toBe(true);
    });

    it('denies if user lacks the permission', () => {
      loginAs(makeUser({ permissions: ['student:view:content'] as SecurityPermission[] }));
      const result = requirePermission('admin:manage:users');
      expect(result.allowed).toBe(false);
    });

    it('ADMIN has all permissions', () => {
      loginAs(makeUser({ role: 'ADMIN', permissions: [] as SecurityPermission[] }));
      expect(requirePermission('admin:manage:users').allowed).toBe(true);
    });
  });

  // ── requireOwnership ──────────────────────────────────

  describe('requireOwnership', () => {
    it('allows if user owns the resource', () => {
      loginAs(makeUser({ id: 'u-42' }));
      expect(requireOwnership('u-42').allowed).toBe(true);
    });

    it('denies if user does not own resource', () => {
      loginAs(makeUser({ id: 'u-42' }));
      expect(requireOwnership('u-99').allowed).toBe(false);
    });

    it('allows with fallback permission', () => {
      loginAs(makeUser({ id: 'u-42', permissions: ['admin:manage:users'] as SecurityPermission[] }));
      expect(requireOwnership('u-99', 'admin:manage:users').allowed).toBe(true);
    });
  });

  // ── requireSameUnit ───────────────────────────────────

  describe('requireSameUnit', () => {
    it('allows if same unit', () => {
      loginAs(makeUser({ unitId: 'unit-abc' }));
      expect(requireSameUnit('unit-abc').allowed).toBe(true);
    });

    it('denies if different unit', () => {
      loginAs(makeUser({ unitId: 'unit-abc' }));
      const result = requireSameUnit('unit-xyz');
      expect(result.allowed).toBe(false);
    });
  });

  // ── Helpers ───────────────────────────────────────────

  describe('helpers', () => {
    it('hasRole returns correct boolean', () => {
      loginAs(makeUser({ role: 'INSTRUTOR' }));
      expect(hasRole('INSTRUTOR')).toBe(true);
      expect(hasRole('ALUNO_ADULTO')).toBe(false);
    });

    it('hasPermission returns correct boolean', () => {
      loginAs(makeUser({ permissions: ['student:checkin'] as SecurityPermission[] }));
      expect(hasPermission('student:checkin')).toBe(true);
      expect(hasPermission('admin:manage:users')).toBe(false);
    });

    it('isAdmin checks ADMIN role', () => {
      loginAs(makeUser({ role: 'ALUNO_ADULTO' }));
      expect(isAdmin()).toBe(false);

      loginAs(makeUser({ role: 'ADMIN' }));
      expect(isAdmin()).toBe(true);
    });

    it('isInstrutor checks PROFESSOR role', () => {
      loginAs(makeUser({ role: 'INSTRUTOR' }));
      expect(isInstrutor()).toBe(true);
    });

    it('getCurrentPermissions returns user + role permissions combined', () => {
      loginAs(makeUser({ permissions: ['student:checkin', 'student:view:content'] as SecurityPermission[] }));
      const perms = getCurrentPermissions();
      // Combines explicit user permissions + ROLE_PERMISSIONS[ALUNO_ADULTO]
      expect(perms).toContain('student:checkin');
      expect(perms).toContain('student:view:content');
      expect(perms).toContain('student:view:own_progress');
    });

    it('getCurrentPermissions returns empty when not logged in', () => {
      expect(getCurrentPermissions()).toEqual([]);
    });
  });
});
