/**
 * Particulares Service — Sessões Particulares + Comissões
 * TODO(BE-066): Implementar endpoints particulares
 */
import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { AulaParticular, Comissao } from '@/lib/api/contracts';

async function getMock() { return import('@/lib/__mocks__/particulares.mock'); }

export async function getParticulares(): Promise<AulaParticular[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.PARTICULARES].sort((a: AulaParticular, b: AulaParticular) => b.data.localeCompare(a.data)); }
  const { data } = await apiClient.get<AulaParticular[]>('/particulares'); return data;
}

export async function getComissoes(mes?: string): Promise<Comissao[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return mes ? m.COMISSOES.filter((c: Comissao) => c.mes === mes) : [...m.COMISSOES]; }
  const { data } = await apiClient.get<Comissao[]>(mes ? `/comissoes?mes=${mes}` : '/comissoes'); return data;
}

export async function getInstrutoresSplit() {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.PROFESSORES_SPLIT]; }
  const { data } = await apiClient.get('/particulares/instrutores'); return data;
}
