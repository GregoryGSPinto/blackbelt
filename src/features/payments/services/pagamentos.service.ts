/**
 * Pagamentos Service — Payment Gateway
 *
 * MOCK:  useMock() === true → dados de __mocks__/pagamentos.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-062): Implementar endpoints pagamentos
 *   GET  /pagamentos/planos
 *   GET  /pagamentos/assinaturas
 *   GET  /pagamentos/faturas/:alunoId
 *   POST /pagamentos/pix/gerar       { faturaId, valor, descricao }
 *   GET  /pagamentos/resumo/:alunoId
 *   GET  /pagamentos/admin/dashboard
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  Plano, Assinatura, Fatura, PixPaymentRequest, PixPaymentResponse,
  ResumoFinanceiroAluno,
} from '@/lib/api/contracts';

import type { AdminFinanceDashboard } from '@/lib/__mocks__/pagamentos.mock';

export type { Plano, Assinatura, Fatura, PixPaymentRequest, PixPaymentResponse, ResumoFinanceiroAluno, AdminFinanceDashboard };

async function getMock() {
  return import('@/lib/__mocks__/pagamentos.mock');
}

// ── Planos ──
export async function getPlanos(): Promise<Plano[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.PLANOS];
  }
  const { data } = await apiClient.get<Plano[]>('/pagamentos/planos');
  return data;
}

// ── Assinaturas (admin: todas / aluno: própria) ──
export async function getAssinaturas(alunoId?: string): Promise<Assinatura[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (alunoId) return m.ASSINATURAS.filter((s: Assinatura) => s.alunoId === alunoId);
    return [...m.ASSINATURAS];
  }
  const url = alunoId ? `/pagamentos/assinaturas?alunoId=${alunoId}` : '/pagamentos/assinaturas';
  const { data } = await apiClient.get<Assinatura[]>(url);
  return data;
}

// ── Faturas ──
export async function getFaturas(alunoId?: string): Promise<Fatura[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (alunoId) return m.FATURAS.filter((f: Fatura) => f.alunoId === alunoId);
    return [...m.FATURAS];
  }
  const url = alunoId ? `/pagamentos/faturas/${alunoId}` : '/pagamentos/faturas';
  const { data } = await apiClient.get<Fatura[]>(url);
  return data;
}

// ── Gerar Pix ──
export async function gerarPix(req: PixPaymentRequest): Promise<PixPaymentResponse> {
  if (useMock()) {
    await mockDelay(500);
    const m = await getMock();
    return m.gerarPixMock(req.faturaId, req.valor);
  }
  const { data } = await apiClient.post<PixPaymentResponse>('/pagamentos/pix/gerar', req);
  return data;
}

// ── Resumo do aluno ──
export async function getResumoAluno(alunoId: string): Promise<ResumoFinanceiroAluno> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getResumoAluno(alunoId);
  }
  const { data } = await apiClient.get<ResumoFinanceiroAluno>(`/pagamentos/resumo/${alunoId}`);
  return data;
}

// ── Admin Dashboard ──
export async function getAdminFinanceDashboard(): Promise<AdminFinanceDashboard> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getAdminDashboard();
  }
  const { data } = await apiClient.get<AdminFinanceDashboard>('/pagamentos/admin/dashboard');
  return data;
}

// ── Financial Check-in Status (Teen) ──
export type FinancialStatus = 'ativo' | 'atraso' | 'bloqueado';

export interface FinancialHistoryItem {
  month: string;
  status: string;
  date: string;
  color: string;
  emoji: string;
}

export async function getFinancialStatus(alunoId?: string): Promise<FinancialStatus> {
  if (useMock()) {
    await mockDelay();
    return 'ativo';
  }
  const url = alunoId ? `/pagamentos/status?alunoId=${alunoId}` : '/pagamentos/status';
  const { data } = await apiClient.get<{ status: FinancialStatus }>(url);
  return data.status;
}

export async function getFinancialHistory(alunoId?: string): Promise<FinancialHistoryItem[]> {
  if (useMock()) {
    await mockDelay();
    return [
      { month: 'Fev 2026', status: 'ativo', date: '07/02', color: 'green', emoji: '\u2705' },
      { month: 'Jan 2026', status: 'ativo', date: '05/01', color: 'green', emoji: '\u2705' },
      { month: 'Dez 2025', status: 'atraso', date: '28/12', color: 'yellow', emoji: '\u26A0\uFE0F' },
      { month: 'Nov 2025', status: 'ativo', date: '03/11', color: 'green', emoji: '\u2705' },
      { month: 'Out 2025', status: 'ativo', date: '02/10', color: 'green', emoji: '\u2705' },
      { month: 'Set 2025', status: 'ativo', date: '01/09', color: 'green', emoji: '\u2705' },
    ];
  }
  const url = alunoId ? `/pagamentos/history?alunoId=${alunoId}` : '/pagamentos/history';
  const { data } = await apiClient.get<FinancialHistoryItem[]>(url);
  return data;
}
