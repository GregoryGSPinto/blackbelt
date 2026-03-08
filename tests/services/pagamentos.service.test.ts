// ============================================================
// Pagamentos Service — Unit Tests
// ============================================================
// Types validated against lib/api/contracts.ts:
//   Plano: { id, nome, valor, frequencia, beneficios, ... }
//   Fatura: { id, valor, status, ... }
//   PixPaymentRequest: { faturaId, valor, descricao }
//   PixPaymentResponse: { qrCodeBase64, copiaECola, expiresAt, transactionId }
//   ResumoFinanceiroAluno: { totalPago, totalPendente, ... }
//   AdminFinanceDashboard: { receitaMes, receitaPendente, ... }
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getPlanos,
  getAssinaturas,
  getFaturas,
  gerarPix,
  getResumoAluno,
  getAdminFinanceDashboard,
} from '@/src/features/payments/services/pagamentos.service';

describe('Pagamentos Service (mock mode)', () => {
  describe('getPlanos', () => {
    it('returns array of plans', async () => {
      const planos = await getPlanos();
      expect(Array.isArray(planos)).toBe(true);
      expect(planos.length).toBeGreaterThan(0);
    });

    it('each plan has nome and valor', async () => {
      const planos = await getPlanos();
      for (const p of planos) {
        expect(p.nome).toBeTruthy();
        expect(typeof p.valor).toBe('number');
        expect(p.valor).toBeGreaterThan(0);
      }
    });
  });

  describe('getFaturas', () => {
    it('returns array of invoices', async () => {
      const faturas = await getFaturas();
      expect(Array.isArray(faturas)).toBe(true);
    });

    it('each fatura has status and valor', async () => {
      const faturas = await getFaturas();
      for (const f of faturas.slice(0, 5)) {
        expect(f.status).toBeTruthy();
        expect(typeof f.valor).toBe('number');
      }
    });
  });

  describe('getAssinaturas', () => {
    it('returns array of subscriptions', async () => {
      const subs = await getAssinaturas();
      expect(Array.isArray(subs)).toBe(true);
    });
  });

  describe('gerarPix', () => {
    it('generates PIX payment with QR code', async () => {
      const pix = await gerarPix({
        faturaId: 'fat-001',
        valor: 150.0,
        descricao: 'Mensalidade Janeiro 2026',
      });
      expect(pix.qrCodeBase64).toBeTruthy();
      expect(pix.copiaECola).toBeTruthy();
      expect(pix.expiresAt).toBeTruthy();
      expect(pix.transactionId).toBeTruthy();
    });
  });

  describe('getResumoAluno', () => {
    it('returns financial summary for student', async () => {
      const resumo = await getResumoAluno('aluno-1');
      expect(resumo).toBeDefined();
      expect(typeof resumo.totalPago).toBe('number');
      expect(typeof resumo.totalPendente).toBe('number');
    });
  });

  describe('getAdminFinanceDashboard', () => {
    it('returns admin finance dashboard data', async () => {
      const dash = await getAdminFinanceDashboard();
      expect(dash).toBeDefined();
      expect(typeof dash.receitaMes).toBe('number');
      expect(typeof dash.inadimplentes).toBe('number');
      expect(typeof dash.totalAssinaturas).toBe('number');
    });
  });
});
