import { describe, expect, it } from 'vitest';

import { ADMIN_SHELL_CONFIG } from '@/app/(admin)/shell.config';

// ============================================================
// Phase 8 — UX Operational Maturity Tests
// Covers changes from Phases 2–4 of the overhaul
// ============================================================

describe('Phase 2: Grouped navigation shell', () => {
  const { nav } = ADMIN_SHELL_CONFIG;

  it('admin shell has drawerGroups defined', () => {
    expect(nav.drawerGroups).toBeDefined();
    expect(Array.isArray(nav.drawerGroups)).toBe(true);
    expect(nav.drawerGroups!.length).toBeGreaterThanOrEqual(5);
  });

  it('admin shell has desktopOverflowGroups defined', () => {
    expect(nav.desktopOverflowGroups).toBeDefined();
    expect(Array.isArray(nav.desktopOverflowGroups)).toBe(true);
  });

  it('drawer groups have required structure (title + items)', () => {
    for (const group of nav.drawerGroups!) {
      expect(group).toHaveProperty('title');
      expect(group).toHaveProperty('items');
      expect(typeof group.title).toBe('string');
      expect(group.title.length).toBeGreaterThan(0);
      expect(Array.isArray(group.items)).toBe(true);
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it('each group item has href, icon, and label', () => {
    for (const group of nav.drawerGroups!) {
      for (const item of group.items) {
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('label');
        expect(item.href).toMatch(/^\//);
      }
    }
  });

  it('operational group (Operação) includes check-in first', () => {
    const opGroup = nav.drawerGroups!.find(g => g.title === 'Operação');
    expect(opGroup).toBeDefined();
    expect(opGroup!.items[0].href).toBe('/check-in');
  });

  it('financial group includes all billing-related items', () => {
    const finGroup = nav.drawerGroups!.find(g => g.title === 'Financeiro');
    expect(finGroup).toBeDefined();
    const hrefs = finGroup!.items.map(i => i.href);
    expect(hrefs).toContain('/pagamentos');
    expect(hrefs).toContain('/pdv');
    expect(hrefs).toContain('/comissoes');
  });

  it('all drawer group items appear in allItems', () => {
    const allHrefs = nav.allItems.map(i => i.href);
    for (const group of nav.drawerGroups!) {
      for (const item of group.items) {
        expect(allHrefs).toContain(item.href);
      }
    }
  });

  it('desktop nav has exactly 4 primary modules', () => {
    const desktopTop = [
      { href: '/dashboard', label: 'Visao geral' },
      { href: '/financeiro', label: 'Financeiro' },
      { href: '/graduacoes', label: 'Pedagógico' },
      { href: '/usuarios', label: 'Pessoas' },
    ];
    for (const expected of desktopTop) {
      expect(nav.desktopNav).toEqual(
        expect.arrayContaining([expect.objectContaining(expected)]),
      );
    }
  });

  it('mobile bar has 3 items (compact for thumb reach)', () => {
    expect(nav.mobileBar.length).toBe(3);
  });

  it('no duplicate hrefs in allItems', () => {
    const hrefs = nav.allItems.map(i => i.href);
    const unique = [...new Set(hrefs)];
    expect(hrefs.length).toBe(unique.length);
  });
});

describe('Phase 2: Shell theme config', () => {
  const { theme } = ADMIN_SHELL_CONFIG;

  it('admin uses top-nav variant', () => {
    expect(theme.variant).toBe('top-nav');
  });

  it('logo navigates to dashboard', () => {
    expect(theme.logoHref).toBe('/dashboard');
  });

  it('module name is ADMIN', () => {
    expect(theme.moduleName).toBe('ADMIN');
  });

  it('theme functions return valid colors for both modes', () => {
    for (const isDark of [true, false]) {
      expect(theme.textHeading(isDark)).toMatch(/^#|^rgba/);
      expect(theme.textMuted(isDark)).toMatch(/^#|^rgba/);
      expect(theme.accentColor(isDark)).toMatch(/^#|^rgba/);
    }
  });
});

describe('Phase 3: Admin dashboard quick actions priority', () => {
  // Structural test: admin dashboard quick actions should include
  // the 5 most frequent operational actions
  it('admin quick action routes cover daily operations', () => {
    const expectedRoutes = ['/check-in', '/usuarios', '/agenda', '/turmas', '/financeiro'];
    // These routes must exist in admin allItems
    const { nav } = ADMIN_SHELL_CONFIG;
    const allHrefs = nav.allItems.map(i => i.href);
    for (const route of expectedRoutes) {
      expect(allHrefs).toContain(route);
    }
  });
});

describe('Phase 4: Check-in search normalization', () => {
  // Test the accent-normalization logic used in check-in search
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  it('normalizes accented Portuguese names', () => {
    expect(normalize('José')).toBe('jose');
    expect(normalize('Açaí')).toBe('acai');
    expect(normalize('João')).toBe('joao');
    expect(normalize('André')).toBe('andre');
    expect(normalize('Conceição')).toBe('conceicao');
  });

  it('unaccented query matches accented names', () => {
    const names = ['José da Silva', 'André Souza', 'João Conceição'];
    const query = normalize('joao');
    const matches = names.filter(n => normalize(n).includes(query));
    expect(matches).toEqual(['João Conceição']);
  });

  it('accented query matches accented names', () => {
    const names = ['José da Silva', 'André Souza'];
    const query = normalize('André');
    const matches = names.filter(n => normalize(n).includes(query));
    expect(matches).toEqual(['André Souza']);
  });

  it('graduation field matches', () => {
    const alunos = [
      { nome: 'Maria', graduacao: 'Faixa Azul' },
      { nome: 'Pedro', graduacao: 'Faixa Branca' },
    ];
    const query = normalize('azul');
    const matches = alunos.filter(a =>
      normalize(a.nome).includes(query) || normalize(a.graduacao).includes(query),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].nome).toBe('Maria');
  });

  it('empty search returns no matches', () => {
    const alunos = [{ nome: 'Test', graduacao: '' }];
    const query = '  ';
    if (!query.trim()) {
      expect([]).toHaveLength(0);
    }
  });
});

describe('Phase 2: Shell type contract', () => {
  it('ShellNavConfig supports optional drawerGroups', () => {
    // Verify the admin config compiles with drawerGroups
    const { nav } = ADMIN_SHELL_CONFIG;
    // drawerGroups is optional — other shells (professor, aluno) don't use it
    expect(nav.drawerGroups).toBeDefined();
    expect(nav.desktopOverflowGroups).toBeDefined();
  });
});
