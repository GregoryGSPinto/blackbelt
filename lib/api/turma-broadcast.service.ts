/**
 * Turma Broadcast Service — Send messages to entire classes
 *
 * TODO(BBOS-Phase-2): implement when feature flag enabled
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { TurmaBroadcast, BroadcastTemplate } from '@/lib/__mocks__/turma-broadcast.mock';

export type { TurmaBroadcast, BroadcastTemplate } from '@/lib/__mocks__/turma-broadcast.mock';

async function getMock() {
  return import('@/lib/__mocks__/turma-broadcast.mock');
}

export async function sendToTurma(
  turmaId: string, turmaNome: string,
  remetenteId: string, remetenteNome: string,
  conteudo: string, totalDestinatarios: number
): Promise<TurmaBroadcast> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getMock();
    return m.sendToTurma(turmaId, turmaNome, remetenteId, remetenteNome, conteudo, totalDestinatarios);
  }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.post<TurmaBroadcast>('/broadcast/send', {
    turmaId, turmaNome, remetenteId, remetenteNome, conteudo, totalDestinatarios,
  });
  return data;
}

export async function getBroadcastsByProfessor(profId: string): Promise<TurmaBroadcast[]> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getBroadcastsByProfessor(profId); }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.get<TurmaBroadcast[]>(`/broadcast/professor/${profId}`);
  return data;
}

export async function getBroadcastsForAluno(alunoId: string): Promise<TurmaBroadcast[]> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getBroadcastsForAluno(alunoId); }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.get<TurmaBroadcast[]>(`/broadcast/aluno/${alunoId}`);
  return data;
}

export async function getTemplates(): Promise<BroadcastTemplate[]> {
  if (useMock()) { const m = await getMock(); return m.BROADCAST_TEMPLATES; }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.get<BroadcastTemplate[]>('/broadcast/templates');
  return data;
}

export async function markBroadcastRead(broadcastId: string, alunoId: string): Promise<void> {
  if (useMock()) { const m = await getMock(); m.markBroadcastRead(broadcastId, alunoId); return; }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  await apiClient.patch(`/broadcast/${broadcastId}/read`, { alunoId });
}
