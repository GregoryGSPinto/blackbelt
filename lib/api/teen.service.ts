/**
 * Teen Service — Perfis teen, sessões, conquistas, check-ins
 *
 * MOCK:  useMock() === true → dados de __mocks__/teen.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-015): Implementar endpoints teen
 *   GET /teen/profiles
 *   GET /teen/sessões
 *   GET /teen/conquistas
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

import type {
  TeenProfile, TeenAula, TeenConquista, TeenCheckin,
} from '@/lib/__mocks__/teen.mock';

export type {
  TeenProfile, TeenAula, TeenConquista, TeenCheckin,
};

async function getMock() {
  return import('@/lib/__mocks__/teen.mock');
}

export async function getTeenProfiles(responsavelId?: string): Promise<TeenProfile[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (responsavelId) return m.getTeensByResponsavel(responsavelId);
    return [...m.TEEN_PROFILES];
  }
  const url = responsavelId ? `/teen/profiles?responsavelId=${responsavelId}` : '/teen/profiles';
  const { data } = await apiClient.get<TeenProfile[]>(url);
  return data;
}

export async function getTeenSessoes(nivel?: string): Promise<TeenAula[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (nivel) return m.getSessoesByNivel(nivel);
    return [...m.TEEN_SESSÕES];
  }
  const url = nivel ? `/teen/sessões?nivel=${nivel}` : '/teen/sessões';
  const { data } = await apiClient.get<TeenAula[]>(url);
  return data;
}

export async function getConquistas(): Promise<TeenConquista[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.TEEN_CONQUISTAS]; }
  const { data } = await apiClient.get<TeenConquista[]>('/teen/conquistas');
  return data;
}

export async function getTeenCheckins(): Promise<TeenCheckin[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.TEEN_CHECKINS]; }
  const { data } = await apiClient.get<TeenCheckin[]>('/teen/checkins');
  return data;
}

// TODO(BE-011): Migrar helpers síncronos para endpoints async quando backend estiver pronto
// Re-export synchronous helpers
export {
  getTeenById, getTeensByResponsavel, getSessoesByNivel,
  calcularRiscoEvasao, getProximaMeta,
  TEEN_PROFILES, TEEN_SESSÕES, TEEN_CONQUISTAS, TEEN_CHECKINS,
} from '@/lib/__mocks__/teen.mock';
