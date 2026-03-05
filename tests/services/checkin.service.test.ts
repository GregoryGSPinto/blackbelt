// ============================================================
// Checkin Service — Unit Tests
// ============================================================
// Signatures validated against lib/api/checkin.service.ts:
//   registerCheckin(alunoId: string, turmaId: string, method?: CheckInMethod)
//   validateAndCheckin(qrPayload: CheckInQR)
//   getCheckinHistory(alunoId?: string, dateRange?: {...})
//   getTodayCheckins()
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  registerCheckin,
  validateAndCheckin,
  getCheckinHistory,
  getTodayCheckins,
} from '@/lib/api/checkin.service';

describe('Checkin Service (mock mode)', () => {
  describe('registerCheckin', () => {
    it('registers a checkin successfully', async () => {
      const result = await registerCheckin('u1', 'turma-001', 'MANUAL');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('returns success=false for unknown aluno', async () => {
      const result = await registerCheckin('non-existent-aluno', 'turma-001');
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });

    it('supports QR method', async () => {
      const result = await registerCheckin('u1', 'turma-001', 'QR');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('validateAndCheckin', () => {
    it('validates QR payload and checks in', async () => {
      // Use a valid mock aluno ID and generate a proper hash
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
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('getCheckinHistory', () => {
    it('returns array of checkins', async () => {
      const history = await getCheckinHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('supports alunoId filter', async () => {
      const history = await getCheckinHistory('aluno-test-001');
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getTodayCheckins', () => {
    it('returns today\'s checkins array', async () => {
      const today = await getTodayCheckins();
      expect(Array.isArray(today)).toBe(true);
    });
  });
});
