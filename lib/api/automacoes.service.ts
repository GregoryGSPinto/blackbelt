/**
 * Automações Service — Configuração de automações admin
 *
 * MOCK:  useMock() === true → retorna dados de __mocks__/automacoes.mock.ts
 * PROD:  useMock() === false → chama apiClient
 *
 * TODO(BE-023): Implementar endpoints automações
 *   GET /automacoes
 *   PUT /automacoes/:id
 *   PUT /automacoes/:id/toggle
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Automacao } from './contracts';

export type { Automacao };

// ── Mock helpers (lazy import) ────────────────────────────

async function getMockModule() {
  return import('@/lib/__mocks__/automacoes.mock');
}

// ── Service functions ─────────────────────────────────────

/** Listar todas as automações */
export async function getAutomacoes(): Promise<Automacao[]> {
  if (useMock()) {
    await mockDelay();
    const { mockAutomacoes } = await getMockModule();
    return [...mockAutomacoes];
  }

  return apiClient.get<Automacao[]>('/automacoes').then(r => r.data);
}

/** Atualizar automação (config, canais, mensagem) */
export async function updateAutomacao(id: string, data: Partial<Automacao>): Promise<Automacao> {
  if (useMock()) {
    await mockDelay(300);
    const { getAutomacaoById } = await getMockModule();
    const existing = getAutomacaoById(id);
    if (!existing) throw new Error('Automação não encontrada');
    return { ...existing, ...data };
  }

  return apiClient.put<Automacao>(`/automacoes/${id}`, data).then(r => r.data);
}

/** Toggle on/off da automação */
export async function toggleAutomacao(id: string, ativa: boolean): Promise<Automacao> {
  if (useMock()) {
    await mockDelay(200);
    const { getAutomacaoById } = await getMockModule();
    const existing = getAutomacaoById(id);
    if (!existing) throw new Error('Automação não encontrada');
    return { ...existing, ativa };
  }

  return apiClient.put<Automacao>(`/automacoes/${id}/toggle`, { ativa }).then(r => r.data);
}
