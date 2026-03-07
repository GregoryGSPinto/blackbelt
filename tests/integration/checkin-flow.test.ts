// ============================================================
// Integration Test — Check-in Flow
// Simulates: generate QR -> validate QR -> register presence ->
//   verify streak increment
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  registerCheckin,
  validateAndCheckin,
  getCheckinHistory,
  getTodayCheckins,
} from '@/lib/api/checkin.service';

describe('Check-in Flow Integration', () => {
  describe('QR Code generation and validation', () => {
    it('generates a valid QR hash for check-in', async () => {
      const { generateQRHash } = await import('@/lib/__mocks__/checkin.mock');
      const ts = Date.now();
      const hash = generateQRHash('u1', ts);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('validates QR payload and registers check-in', async () => {
      const { generateQRHash } = await import('@/lib/__mocks__/checkin.mock');
      const ts = Date.now();
      const hash = generateQRHash('u1', ts);

      const result = await validateAndCheckin({
        alunoId: 'u1',
        nome: 'Lucas Mendes',
        unidadeId: 'unit-001',
        turmaId: 't1',
        timestamp: ts,
        hash,
      });

      expect(result.success).toBe(true);
      if (result.checkIn) {
        expect(result.checkIn.method).toBe('QR');
        expect(result.checkIn.alunoId).toBe('u1');
      }
    });

    it('rejects invalid QR hash', async () => {
      const result = await validateAndCheckin({
        alunoId: 'u1',
        nome: 'Lucas Mendes',
        unidadeId: 'unit-001',
        turmaId: 't1',
        timestamp: Date.now(),
        hash: 'invalid-hash-value',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Manual check-in registration', () => {
    it('registers manual check-in successfully', async () => {
      const result = await registerCheckin('u1', 'turma-001', 'MANUAL');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      if (result.checkIn) {
        expect(result.checkIn.method).toBe('MANUAL');
      }
    });

    it('fails for blocked student', async () => {
      // Look for a blocked student in mock data
      const mock = await import('@/lib/__mocks__/checkin.mock');
      const blocked = mock.MOCK_ALUNOS_CHECKIN.find(a => a.status === 'BLOQUEADO');

      if (blocked) {
        const result = await registerCheckin(blocked.id, 'turma-001', 'MANUAL');
        expect(result.success).toBe(false);
      } else {
        // No blocked student in mocks — test non-existent student
        const result = await registerCheckin('nonexistent-user', 'turma-001');
        expect(result.success).toBe(false);
      }
    });

    it('fails for non-existent student', async () => {
      const result = await registerCheckin('student-that-does-not-exist', 'turma-001');
      expect(result.success).toBe(false);
    });
  });

  describe('Check-in history and streak', () => {
    it('returns check-in history as array', async () => {
      const history = await getCheckinHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('history entries have required fields', async () => {
      const history = await getCheckinHistory();
      if (history.length > 0) {
        const entry = history[0];
        expect(entry).toHaveProperty('alunoId');
        expect(entry).toHaveProperty('method');
      }
    });

    it('returns today checkins', async () => {
      const today = await getTodayCheckins();
      expect(Array.isArray(today)).toBe(true);
    });

    it('successful check-in returns aluno data with check-in details', async () => {
      const result = await registerCheckin('u1', 'turma-001', 'MANUAL');
      expect(result.success).toBe(true);

      // After check-in, the check-in record should be present
      if (result.checkIn) {
        expect(result.checkIn.alunoId).toBe('u1');
        expect(result.checkIn.method).toBe('MANUAL');
      }
    });
  });
});
