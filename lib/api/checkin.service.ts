/**
 * Check-in Service — QR Code + Manual
 *
 * MOCK:  useMock() === true → dados de __mocks__/checkin.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-060): Implementar endpoints check-in
 *   POST /checkin/register          { alunoId, turmaId, method }
 *   POST /checkin/validate-qr       { qrPayload }
 *   GET  /checkin/history/:alunoId  ?from=&to=
 *   GET  /checkin/today             (lista do dia)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { CheckIn, CheckInQR, CheckInResult, CheckInMethod } from '@/lib/api/contracts';

export type { CheckIn, CheckInQR, CheckInResult, CheckInMethod };

async function getMock() {
  return import('@/lib/__mocks__/checkin.mock');
}

// ── Register check-in ──
export async function registerCheckin(
  alunoId: string,
  turmaId: string,
  method: CheckInMethod = 'MANUAL'
): Promise<CheckInResult> {
  if (useMock()) {
    await mockDelay(300);
    const mock = await getMock();
    const aluno = mock.MOCK_ALUNOS_CHECKIN.find(a => a.id === alunoId);
    if (!aluno) return { success: false, error: 'Aluno não encontrado' };
    if (aluno.status === 'BLOQUEADO') {
      return { success: false, aluno, error: 'Aluno bloqueado' };
    }
    return {
      success: true,
      checkIn: {
        id: `ck_${Date.now()}`,
        alunoId,
        alunoNome: aluno.nome,
        turmaId,
        turmaNome: 'Adulto Manhã',
        dataHora: new Date().toISOString(),
        status: 'confirmado',
        method,
      },
      aluno,
    };
  }
  return apiClient.post<CheckInResult>('/checkin/register', { alunoId, turmaId, method }).then(r => r.data);
}

// ── Validate QR and register ──
export async function validateAndCheckin(qrPayload: CheckInQR): Promise<CheckInResult> {
  if (useMock()) {
    await mockDelay(500);
    const mock = await getMock();
    return mock.validateQR(qrPayload);
  }
  return apiClient.post<CheckInResult>('/checkin/validate-qr', qrPayload).then(r => r.data);
}

// ── Get check-in history ──
export async function getCheckinHistory(
  alunoId?: string,
  dateRange?: { from: string; to: string }
): Promise<CheckIn[]> {
  if (useMock()) {
    await mockDelay(200);
    const mock = await getMock();
    let results = [...mock.MOCK_CHECKINS];
    if (alunoId) {
      results = results.filter(c => c.alunoId === alunoId);
    }
    if (dateRange) {
      results = results.filter(c => {
        const d = c.dataHora.split('T')[0];
        return d >= dateRange.from && d <= dateRange.to;
      });
    }
    return results.sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }
  const params = new URLSearchParams();
  if (alunoId) params.set('alunoId', alunoId);
  if (dateRange) {
    params.set('from', dateRange.from);
    params.set('to', dateRange.to);
  }
  const { data } = await apiClient.get<CheckIn[]>(`/checkin/history?${params}`);
  return data;
}

// ── Get today's check-ins ──
export async function getTodayCheckins(): Promise<CheckIn[]> {
  if (useMock()) {
    await mockDelay(200);
    const mock = await getMock();
    const today = new Date().toISOString().split('T')[0];
    return mock.MOCK_CHECKINS
      .filter(c => c.dataHora.startsWith(today))
      .sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }
  const { data } = await apiClient.get<CheckIn[]>('/checkin/today');
  return data;
}
