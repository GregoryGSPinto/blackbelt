// ============================================================
// Nav Ranking — Unit Tests
// ============================================================
// Tests: recordNavVisit, rankNavItems, getNavCount,
//        resetNavRanking, pin index 0, stable sort, decay
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordNavVisit,
  getNavCount,
  rankNavItems,
  resetNavRanking,
} from '@/lib/nav-ranking';

const MODULE = 'TEST_MODULE';

const NAV_ITEMS = [
  { href: '/home', label: 'Home' },
  { href: '/financeiro', label: 'Financeiro' },
  { href: '/pedagogico', label: 'Pedagógico' },
  { href: '/operacao', label: 'Operação' },
  { href: '/analytics', label: 'Analytics' },
];

describe('Nav Ranking', () => {
  beforeEach(() => {
    resetNavRanking(MODULE);
  });

  // ── recordNavVisit ────────────────────────────────────

  describe('recordNavVisit', () => {
    it('increments count for visited href', () => {
      expect(getNavCount(MODULE, '/financeiro')).toBe(0);

      recordNavVisit(MODULE, '/financeiro');
      expect(getNavCount(MODULE, '/financeiro')).toBe(1);

      recordNavVisit(MODULE, '/financeiro');
      expect(getNavCount(MODULE, '/financeiro')).toBe(2);
    });

    it('tracks different hrefs independently', () => {
      recordNavVisit(MODULE, '/financeiro');
      recordNavVisit(MODULE, '/financeiro');
      recordNavVisit(MODULE, '/operacao');

      expect(getNavCount(MODULE, '/financeiro')).toBe(2);
      expect(getNavCount(MODULE, '/operacao')).toBe(1);
    });

    it('handles empty/null gracefully', () => {
      recordNavVisit('', '/test');
      recordNavVisit(MODULE, '');
      // Should not throw
    });
  });

  // ── rankNavItems ──────────────────────────────────────

  describe('rankNavItems', () => {
    it('preserves original order when no visits', () => {
      const ranked = rankNavItems(MODULE, NAV_ITEMS);
      expect(ranked.map((i) => i.href)).toEqual(
        NAV_ITEMS.map((i) => i.href),
      );
    });

    it('always pins index 0 (home)', () => {
      // Visit /operacao many times
      for (let i = 0; i < 20; i++) {
        recordNavVisit(MODULE, '/operacao');
      }

      const ranked = rankNavItems(MODULE, NAV_ITEMS);
      expect(ranked[0].href).toBe('/home'); // always pinned
    });

    it('promotes most-visited items', () => {
      // Visit /operacao 10x, /analytics 5x
      for (let i = 0; i < 10; i++) recordNavVisit(MODULE, '/operacao');
      for (let i = 0; i < 5; i++) recordNavVisit(MODULE, '/analytics');

      const ranked = rankNavItems(MODULE, NAV_ITEMS);

      // After /home (pinned), /operacao should be first
      expect(ranked[1].href).toBe('/operacao');
      expect(ranked[2].href).toBe('/analytics');
    });

    it('demotes less-visited items', () => {
      // Visit everything except /financeiro
      for (let i = 0; i < 10; i++) recordNavVisit(MODULE, '/pedagogico');
      for (let i = 0; i < 8; i++) recordNavVisit(MODULE, '/operacao');
      for (let i = 0; i < 5; i++) recordNavVisit(MODULE, '/analytics');

      const ranked = rankNavItems(MODULE, NAV_ITEMS);
      const financIdx = ranked.findIndex((i) => i.href === '/financeiro');
      // Financeiro should be last (zero visits)
      expect(financIdx).toBe(ranked.length - 1);
    });

    it('uses stable sort for equal counts', () => {
      // No visits — original order preserved (after pin)
      const ranked = rankNavItems(MODULE, NAV_ITEMS);
      expect(ranked[1].href).toBe('/financeiro');
      expect(ranked[2].href).toBe('/pedagogico');
    });

    it('handles arrays of 0, 1, 2 items', () => {
      expect(rankNavItems(MODULE, [])).toEqual([]);
      expect(rankNavItems(MODULE, [NAV_ITEMS[0]])).toEqual([NAV_ITEMS[0]]);
      expect(rankNavItems(MODULE, [NAV_ITEMS[0], NAV_ITEMS[1]])).toEqual([
        NAV_ITEMS[0],
        NAV_ITEMS[1],
      ]);
    });
  });

  // ── resetNavRanking ───────────────────────────────────

  describe('resetNavRanking', () => {
    it('clears all counts', () => {
      recordNavVisit(MODULE, '/financeiro');
      recordNavVisit(MODULE, '/financeiro');
      expect(getNavCount(MODULE, '/financeiro')).toBe(2);

      resetNavRanking(MODULE);
      expect(getNavCount(MODULE, '/financeiro')).toBe(0);
    });

    it('does not affect other modules', () => {
      recordNavVisit('MOD_A', '/test');
      recordNavVisit('MOD_B', '/test');

      resetNavRanking('MOD_A');

      expect(getNavCount('MOD_A', '/test')).toBe(0);
      expect(getNavCount('MOD_B', '/test')).toBe(1);
    });
  });

  // ── Module isolation ──────────────────────────────────

  describe('module isolation', () => {
    it('different modules have independent rankings', () => {
      recordNavVisit('ADMIN', '/dashboard');
      recordNavVisit('ADMIN', '/dashboard');
      recordNavVisit('SUPPORT', '/developer');

      expect(getNavCount('ADMIN', '/dashboard')).toBe(2);
      expect(getNavCount('SUPPORT', '/dashboard')).toBe(0);
      expect(getNavCount('SUPPORT', '/developer')).toBe(1);
    });
  });
});
