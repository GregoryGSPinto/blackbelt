// ============================================================
// Admin Service — Unit Tests
// ============================================================
// Types validated against lib/__mocks__/admin.mock.ts:
//   Usuario: { id, nome, email, tipo, status, ... }
//   ConfiguracaoUnidade: { limiteAtrasoPermitido, horarioFuncionamento, ... }
//   EstatisticasDashboard: { totalAlunos, alunosAtivos, ... }
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getUsuarios,
  getUsuarioById,
  getTurmas,
  getTurmaById,
  getCheckIns,
  getAlertas,
  getEstatisticas,
  getConfiguracao,
} from '@/lib/api/admin.service';

describe('Admin Service (mock mode)', () => {
  describe('getUsuarios', () => {
    it('returns array of users', async () => {
      const users = await getUsuarios();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it('each user has id, nome, email', async () => {
      const users = await getUsuarios();
      for (const u of users.slice(0, 5)) {
        expect(u.id).toBeTruthy();
        expect(u.nome).toBeTruthy();
        expect(u.email).toContain('@');
      }
    });
  });

  describe('getUsuarioById', () => {
    it('returns user for valid id', async () => {
      const users = await getUsuarios();
      const first = users[0];
      const found = await getUsuarioById(first.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(first.id);
    });

    it('returns undefined for invalid id', async () => {
      const found = await getUsuarioById('non-existent-xyz');
      expect(found).toBeUndefined();
    });
  });

  describe('getTurmas', () => {
    it('returns array of classes', async () => {
      const turmas = await getTurmas();
      expect(Array.isArray(turmas)).toBe(true);
      expect(turmas.length).toBeGreaterThan(0);
    });
  });

  describe('getTurmaById', () => {
    it('returns class for valid id', async () => {
      const turmas = await getTurmas();
      if (turmas.length === 0) return;
      const found = await getTurmaById(turmas[0].id);
      expect(found).toBeDefined();
    });
  });

  describe('getCheckIns', () => {
    it('returns array of checkins', async () => {
      const checkins = await getCheckIns();
      expect(Array.isArray(checkins)).toBe(true);
    });
  });

  describe('getAlertas', () => {
    it('returns array of alerts', async () => {
      const alertas = await getAlertas();
      expect(Array.isArray(alertas)).toBe(true);
    });
  });

  describe('getEstatisticas', () => {
    it('returns dashboard statistics', async () => {
      const stats = await getEstatisticas();
      expect(stats).toBeDefined();
      expect(typeof stats.totalAlunos).toBe('number');
      expect(typeof stats.alunosAtivos).toBe('number');
      expect(typeof stats.checkInsHoje).toBe('number');
    });
  });

  describe('getConfiguracao', () => {
    it('returns academy configuration', async () => {
      const config = await getConfiguracao();
      expect(config).toBeDefined();
      expect(typeof config.limiteAtrasoPermitido).toBe('number');
      expect(config.horarioFuncionamento).toBeDefined();
      expect(config.horarioFuncionamento.abertura).toBeTruthy();
    });
  });
});
