// ============================================================
// AuthContext — Unit Tests
// ============================================================
// Validated against contexts/AuthContext.tsx:
//   REDIRECT_MAP, CONFIG_MAP, PERFIL_INFO, PERMISSOES_POR_PERFIL
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getRedirectForProfile,
  getConfigRouteForProfile,
  PERFIL_INFO,
  PERMISSOES_POR_PERFIL,
} from '@/features/auth/context/AuthContext';
import type { TipoPerfil } from '@/lib/api/contracts';

const ALL_PROFILES: TipoPerfil[] = [
  'ALUNO_ADULTO',
  'ALUNO_KIDS',
  'ALUNO_TEEN',
  'RESPONSAVEL',
  'INSTRUTOR',
  'SUPPORT',
  'UNIT_OWNER',
  'ADMINISTRADOR',
  'SUPER_ADMIN',
  'GESTOR',
  'SYS_AUDITOR',
];

describe('AuthContext — Profile Routing', () => {
  describe('getRedirectForProfile', () => {
    it('routes ALUNO_ADULTO to /inicio', () => {
      expect(getRedirectForProfile('ALUNO_ADULTO')).toBe('/inicio');
    });

    it('routes ALUNO_KIDS to /kids-inicio', () => {
      expect(getRedirectForProfile('ALUNO_KIDS')).toBe('/kids-inicio');
    });

    it('routes ALUNO_TEEN to /teen-inicio', () => {
      expect(getRedirectForProfile('ALUNO_TEEN')).toBe('/teen-inicio');
    });

    it('routes RESPONSAVEL to /painel-responsavel', () => {
      expect(getRedirectForProfile('RESPONSAVEL')).toBe('/painel-responsavel');
    });

    it('routes PROFESSOR to /professor-dashboard', () => {
      expect(getRedirectForProfile('INSTRUTOR')).toBe('/professor-dashboard');
    });

    it('routes SUPPORT to /developer', () => {
      expect(getRedirectForProfile('SUPPORT')).toBe('/developer');
    });

    it('routes SYS_AUDITOR to /developer', () => {
      expect(getRedirectForProfile('SYS_AUDITOR')).toBe('/developer');
    });

    it('routes UNIT_OWNER to /dashboard', () => {
      expect(getRedirectForProfile('UNIT_OWNER')).toBe('/dashboard');
    });

    it('routes ADMINISTRADOR to /dashboard', () => {
      expect(getRedirectForProfile('ADMINISTRADOR')).toBe('/dashboard');
    });

    it('all profiles have a valid redirect starting with /', () => {
      for (const p of ALL_PROFILES) {
        const redirect = getRedirectForProfile(p);
        expect(redirect, `${p} should have redirect`).toBeTruthy();
        expect(redirect.startsWith('/'), `${p} redirect should start with /`).toBe(true);
      }
    });
  });

  describe('getConfigRouteForProfile', () => {
    it('returns a config route for each profile', () => {
      for (const p of ALL_PROFILES) {
        const route = getConfigRouteForProfile(p);
        expect(route, `${p} should have config route`).toBeTruthy();
        expect(route.startsWith('/')).toBe(true);
      }
    });
  });
});

describe('AuthContext — Profile Info', () => {
  describe('PERFIL_INFO', () => {
    it('has info for all profiles', () => {
      for (const p of ALL_PROFILES) {
        expect(PERFIL_INFO[p], `PERFIL_INFO missing ${p}`).toBeDefined();
      }
    });

    it('each profile has label and cor', () => {
      for (const p of ALL_PROFILES) {
        const info = PERFIL_INFO[p];
        expect(info.label, `${p} missing label`).toBeTruthy();
        expect(info.cor, `${p} missing cor`).toBeTruthy();
      }
    });

    it('labels are non-empty strings', () => {
      const labels = Object.values(PERFIL_INFO).map((i) => i.label);
      for (const l of labels) {
        expect(l.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('AuthContext — Permissions', () => {
  describe('PERMISSOES_POR_PERFIL', () => {
    it('has entry for all profiles', () => {
      for (const p of ALL_PROFILES) {
        expect(
          PERMISSOES_POR_PERFIL[p],
          `PERMISSOES_POR_PERFIL missing ${p}`,
        ).toBeDefined();
      }
    });

    it('permissions are arrays', () => {
      for (const p of ALL_PROFILES) {
        expect(Array.isArray(PERMISSOES_POR_PERFIL[p])).toBe(true);
      }
    });

    it('UNIT_OWNER has financial and management permissions', () => {
      const perms = PERMISSOES_POR_PERFIL['UNIT_OWNER'];
      expect(perms).toContain('acessar_financeiro');
      expect(perms).toContain('gerenciar_usuarios');
    });

    it('PROFESSOR has validar_checkin permission', () => {
      const perms = PERMISSOES_POR_PERFIL['INSTRUTOR'];
      expect(perms).toContain('validar_checkin');
    });

    it('ALUNO profiles have empty permissions (auth-only)', () => {
      expect(PERMISSOES_POR_PERFIL['ALUNO_ADULTO']).toEqual([]);
      expect(PERMISSOES_POR_PERFIL['ALUNO_KIDS']).toEqual([]);
      expect(PERMISSOES_POR_PERFIL['ALUNO_TEEN']).toEqual([]);
    });

    it('system roles (SUPPORT, SYS_AUDITOR) have empty legacy permissions', () => {
      expect(PERMISSOES_POR_PERFIL['SUPPORT']).toEqual([]);
      expect(PERMISSOES_POR_PERFIL['SYS_AUDITOR']).toEqual([]);
    });
  });

  describe('CEO vs CTO role separation', () => {
    it('UNIT_OWNER routes to /dashboard, SUPPORT to /developer', () => {
      expect(getRedirectForProfile('UNIT_OWNER')).toBe('/dashboard');
      expect(getRedirectForProfile('SUPPORT')).toBe('/developer');
    });

    it('SUPPORT and UNIT_OWNER are different profiles', () => {
      expect(PERFIL_INFO['SUPPORT'].label).not.toBe(PERFIL_INFO['UNIT_OWNER'].label);
    });
  });
});
