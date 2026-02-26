/**
 * Visitantes Service
 * TODO(BE-067): Implementar endpoints visitantes
 */
import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Visitante } from '@/lib/api/contracts';

async function getMock() { return import('@/lib/__mocks__/visitantes.mock'); }

export async function getVisitantes(): Promise<Visitante[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.VISITANTES].sort((a: Visitante, b: Visitante) => b.data.localeCompare(a.data)); }
  const { data } = await apiClient.get<Visitante[]>('/visitantes'); return data;
}

export async function getVisitantesStats() {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getVisitantesStats(); }
  const { data } = await apiClient.get('/visitantes/stats'); return data;
}
