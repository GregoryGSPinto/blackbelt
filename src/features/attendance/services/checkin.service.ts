/**
 * Check-in Service — QR Code + Manual — FAIL-SAFE
 *
 * PRINCÍPIO: Nunca quebra a UI, sempre retorna dados válidos
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { CheckIn, CheckInQR, CheckInResult, CheckInMethod } from '@/lib/api/contracts';

export type { CheckIn, CheckInQR, CheckInResult, CheckInMethod };

// Fallback seguro
const emptyCheckInResult: CheckInResult = {
  success: false,
  error: 'Erro ao processar check-in',
};

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
    if (!aluno) {
      return { success: false, error: 'Aluno não encontrado' };
    }
    if (aluno.status === 'BLOQUEADO') {
      return { success: false, aluno, error: 'Aluno bloqueado' };
    }

    if (turmaId && turmaId.trim() === '') {
      return { success: false, error: 'turmaId inválido' };
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
  
  try {
    const { data } = await apiClient.post<CheckInResult>('/checkin/register', { alunoId, turmaId, method });
    return data || emptyCheckInResult;
  } catch (err) {
    logger.error('[checkin.service]', 'registerCheckin failed', err);
    return { 
      success: false, 
      error: 'Erro ao registrar check-in. Tente novamente.',
    };
  }
}

// ── Validate QR and register ──
export async function validateAndCheckin(qrPayload: CheckInQR): Promise<CheckInResult> {
  if (useMock()) {
    await mockDelay(500);
    const mock = await getMock();
    return mock.validateQR(qrPayload);
  }
  
  try {
    const { data } = await apiClient.post<CheckInResult>('/checkin/validate-qr', qrPayload);
    return data || emptyCheckInResult;
  } catch (err) {
    logger.error('[checkin.service]', 'validateAndCheckin failed', err);
    return {
      success: false,
      error: 'QR Code inválido ou expirado',
    };
  }
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
  
  try {
    const params = new URLSearchParams();
    if (alunoId) params.set('alunoId', alunoId);
    if (dateRange) {
      params.set('from', dateRange.from);
      params.set('to', dateRange.to);
    }
    const { data } = await apiClient.get<CheckIn[]>(`/checkin/history?${params}`);
    return data || [];
  } catch (err) {
    logger.error('[checkin.service]', 'getCheckinHistory failed', err);
    return [];
  }
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
  
  try {
    const { data } = await apiClient.get<CheckIn[]>('/checkin/today');
    return data || [];
  } catch (err) {
    logger.error('[checkin.service]', 'getTodayCheckins failed', err);
    return [];
  }
}

// ── Weekly frequency (parent dashboard) ──
export type DayStatus = 'presente' | 'ausente' | 'sem_aula';

export async function getWeeklyFrequency(alunoId: string): Promise<DayStatus[]> {
  if (useMock()) {
    await mockDelay();
    return ['presente', 'sem_aula', 'presente', 'sem_aula', 'ausente'];
  }
  
  try {
    const { data } = await apiClient.get<DayStatus[]>(`/checkin/weekly-frequency/${alunoId}`);
    return data || ['sem_aula', 'sem_aula', 'sem_aula', 'sem_aula', 'sem_aula'];
  } catch (err) {
    logger.error('[checkin.service]', 'getWeeklyFrequency failed', err);
    return ['sem_aula', 'sem_aula', 'sem_aula', 'sem_aula', 'sem_aula'];
  }
}
