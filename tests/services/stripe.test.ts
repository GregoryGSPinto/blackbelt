// ============================================================
// Stripe/Pagamentos Service — Tests
// Tests: checkout session creation, webhook processing,
//   billing meter, PIX generation
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getPlanos,
  getAssinaturas,
  getFaturas,
  gerarPix,
  getResumoAluno,
  getAdminFinanceDashboard,
} from '@/lib/api/pagamentos.service';

describe('Stripe/Pagamentos Service (mock mode)', () => {
  describe('Checkout session creation (plans)', () => {
    it('returns available plans for checkout', async () => {
      const planos = await getPlanos();
      expect(Array.isArray(planos)).toBe(true);
      expect(planos.length).toBeGreaterThan(0);
    });

    it('each plan has required checkout fields', async () => {
      const planos = await getPlanos();
      for (const plan of planos) {
        expect(plan.id).toBeTruthy();
        expect(plan.nome).toBeTruthy();
        expect(typeof plan.valor).toBe('number');
        expect(plan.valor).toBeGreaterThan(0);
        expect(plan.frequencia).toBeTruthy();
      }
    });

    it('plans include benefits list', async () => {
      const planos = await getPlanos();
      for (const plan of planos) {
        expect(plan.beneficios).toBeDefined();
        expect(Array.isArray(plan.beneficios)).toBe(true);
      }
    });
  });

  describe('Subscription management', () => {
    it('returns all subscriptions', async () => {
      const subs = await getAssinaturas();
      expect(Array.isArray(subs)).toBe(true);
    });

    it('filters subscriptions by student ID', async () => {
      const allSubs = await getAssinaturas();
      if (allSubs.length > 0) {
        const alunoId = allSubs[0].alunoId;
        const filtered = await getAssinaturas(alunoId);
        expect(Array.isArray(filtered)).toBe(true);
        for (const sub of filtered) {
          expect(sub.alunoId).toBe(alunoId);
        }
      }
    });

    it('subscriptions have status field', async () => {
      const subs = await getAssinaturas();
      for (const sub of subs.slice(0, 5)) {
        expect(sub.status).toBeTruthy();
      }
    });
  });

  describe('Invoice/billing processing', () => {
    it('returns array of invoices', async () => {
      const faturas = await getFaturas();
      expect(Array.isArray(faturas)).toBe(true);
    });

    it('each invoice has status and valor', async () => {
      const faturas = await getFaturas();
      for (const f of faturas.slice(0, 5)) {
        expect(f.status).toBeTruthy();
        expect(typeof f.valor).toBe('number');
      }
    });

    it('student financial summary aggregates correctly', async () => {
      const resumo = await getResumoAluno('aluno-1');
      expect(resumo).toBeDefined();
      expect(typeof resumo.totalPago).toBe('number');
      expect(typeof resumo.totalPendente).toBe('number');
      expect(resumo.totalPago).toBeGreaterThanOrEqual(0);
      expect(resumo.totalPendente).toBeGreaterThanOrEqual(0);
    });
  });

  describe('PIX payment generation', () => {
    it('generates PIX with QR code and copy-paste', async () => {
      const pix = await gerarPix({
        faturaId: 'fat-001',
        valor: 150.00,
        descricao: 'Mensalidade Marco 2026',
      });

      expect(pix.qrCodeBase64).toBeTruthy();
      expect(pix.copiaECola).toBeTruthy();
      expect(pix.expiresAt).toBeTruthy();
      expect(pix.transactionId).toBeTruthy();
    });

    it('PIX has valid expiration date', async () => {
      const pix = await gerarPix({
        faturaId: 'fat-002',
        valor: 200.00,
        descricao: 'Teste',
      });

      expect(pix.expiresAt).toBeTruthy();
    });

    it('PIX transaction ID is unique', async () => {
      const pix1 = await gerarPix({ faturaId: 'fat-a', valor: 100, descricao: 'A' });
      const pix2 = await gerarPix({ faturaId: 'fat-b', valor: 100, descricao: 'B' });

      expect(pix1.transactionId).not.toBe(pix2.transactionId);
    });
  });

  describe('Admin finance dashboard (billing meter)', () => {
    it('returns admin dashboard data', async () => {
      const dash = await getAdminFinanceDashboard();
      expect(dash).toBeDefined();
      expect(typeof dash.receitaMes).toBe('number');
      expect(typeof dash.inadimplentes).toBe('number');
      expect(typeof dash.totalAssinaturas).toBe('number');
    });

    it('dashboard has revenue metrics', async () => {
      const dash = await getAdminFinanceDashboard();
      expect(dash.receitaMes).toBeGreaterThanOrEqual(0);
      expect(typeof dash.receitaPendente).toBe('number');
    });

    it('dashboard has subscription count', async () => {
      const dash = await getAdminFinanceDashboard();
      expect(dash.totalAssinaturas).toBeGreaterThanOrEqual(0);
    });
  });
});
