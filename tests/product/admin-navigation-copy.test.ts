import { describe, expect, it } from 'vitest';

import { ADMIN_SHELL_CONFIG } from '@/app/(admin)/shell.config';

describe('admin navigation copy', () => {
  it('uses clearer top-level labels for core admin navigation', () => {
    expect(ADMIN_SHELL_CONFIG.nav.desktopNav).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/dashboard', label: 'Visao geral' }),
        expect.objectContaining({ href: '/usuarios', label: 'Pessoas' }),
      ]),
    );
  });

  it('keeps the search prompt focused on real operational entities', () => {
    expect(ADMIN_SHELL_CONFIG.nav.searchPlaceholder).toBe(
      'Buscar alunos, professores, turmas e cobranca...',
    );
  });
});
