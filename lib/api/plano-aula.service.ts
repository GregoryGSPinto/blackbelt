/**
 * Plano de Sessão — Service
 * TODO(BE-039): Implementar endpoints plano-aula
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { TecnicaPratica, PlanoAula, ItemPlanoAula, FaseSessão } from './contracts';

export type { TecnicaPratica, PlanoAula, ItemPlanoAula, FaseSessão };

async function getMock() { return import('@/lib/__mocks__/plano-aula.mock'); }

export async function getTecnicas(): Promise<TecnicaPratica[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.mockTecnicas]; }
  const { data } = await apiClient.get<TecnicaPratica[]>('/plano-aula/tecnicas'); return data;
}

export async function getPlanos(dateFilter?: string): Promise<PlanoAula[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return dateFilter ? m.mockPlanos.filter(p => p.data === dateFilter) : [...m.mockPlanos]; }
  const { data } = await apiClient.get<PlanoAula[]>(`/plano-aula/planos${dateFilter ? `?data=${dateFilter}` : ''}`); return data;
}

export async function getTemplates(): Promise<PlanoAula[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.mockPlanos.filter(p => p.template); }
  const { data } = await apiClient.get<PlanoAula[]>('/plano-aula/templates'); return data;
}

export async function salvarPlano(plano: Omit<PlanoAula, 'id'>): Promise<PlanoAula> {
  if (useMock()) { await mockDelay(400); return { ...plano, id: `pl-${Date.now()}` } as PlanoAula; }
  const { data } = await apiClient.post<PlanoAula>('/plano-aula/planos', plano); return data;
}

export async function deletarPlano(id: string): Promise<void> {
  if (useMock()) { await mockDelay(200); return; }
  await apiClient.delete(`/plano-aula/planos/${id}`);
}
