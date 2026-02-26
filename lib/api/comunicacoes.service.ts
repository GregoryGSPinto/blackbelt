/**
 * Comunicações Service — Central de Comunicações
 *
 * MOCK:  useMock() === true → __mocks__/comunicacoes.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-064): Implementar endpoints comunicacoes
 *   GET    /comunicacoes/comunicados
 *   POST   /comunicacoes/comunicados
 *   GET    /comunicacoes/mensagens
 *   POST   /comunicacoes/mensagens
 *   GET    /comunicacoes/stats
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Comunicado, MensagemDireta, ComunicacoesStats, ComunicadoCanal, ComunicadoDestinatario, ComunicadoTipo } from '@/lib/api/contracts';

export type { Comunicado, MensagemDireta, ComunicacoesStats, ComunicadoCanal, ComunicadoDestinatario, ComunicadoTipo };

async function getMock() {
  return import('@/lib/__mocks__/comunicacoes.mock');
}

export async function getComunicados(): Promise<Comunicado[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.COMUNICADOS].sort((a: Comunicado, b: Comunicado) => b.dataCriacao.localeCompare(a.dataCriacao));
  }
  const { data } = await apiClient.get<Comunicado[]>('/comunicacoes/comunicados');
  return data;
}

export async function createComunicado(comunicado: Omit<Comunicado, 'id' | 'dataCriacao' | 'lidos' | 'totalDestinatarios'>): Promise<Comunicado> {
  if (useMock()) {
    await mockDelay(400);
    return {
      ...comunicado,
      id: `com_${Date.now()}`,
      dataCriacao: new Date().toISOString().split('T')[0],
      lidos: 0,
      totalDestinatarios: comunicado.destinatario === 'todos' ? 54 : comunicado.destinatario === 'alunos' ? 46 : comunicado.destinatario === 'instrutores' ? 4 : comunicado.destinatario === 'inadimplentes' ? 7 : 14,
    };
  }
  const { data } = await apiClient.post<Comunicado>('/comunicacoes/comunicados', comunicado);
  return data;
}

export async function getMensagens(): Promise<MensagemDireta[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.MENSAGENS].sort((a: MensagemDireta, b: MensagemDireta) => b.data.localeCompare(a.data));
  }
  const { data } = await apiClient.get<MensagemDireta[]>('/comunicacoes/mensagens');
  return data;
}

export async function sendMensagem(msg: Omit<MensagemDireta, 'id' | 'data' | 'lida'>): Promise<MensagemDireta> {
  if (useMock()) {
    await mockDelay(300);
    return { ...msg, id: `msg_${Date.now()}`, data: new Date().toISOString(), lida: false };
  }
  const { data } = await apiClient.post<MensagemDireta>('/comunicacoes/mensagens', msg);
  return data;
}

export async function getStats(): Promise<ComunicacoesStats> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getStats();
  }
  const { data } = await apiClient.get<ComunicacoesStats>('/comunicacoes/stats');
  return data;
}
