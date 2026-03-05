/**
 * Turma Broadcast Service — Send messages to entire classes
 *
 * TODO(BE-130): Implementar endpoints de broadcast
 */

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
  // TODO(BBOS-Phase-2): implement real backend — POST /broadcast/send
  return {} as TurmaBroadcast;
}

export async function getBroadcastsByProfessor(profId: string): Promise<TurmaBroadcast[]> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getBroadcastsByProfessor(profId); }
  // TODO(BBOS-Phase-2): implement real backend — GET /broadcast/professor/:id
  return [];
}

export async function getBroadcastsForAluno(alunoId: string): Promise<TurmaBroadcast[]> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getBroadcastsForAluno(alunoId); }
  // TODO(BBOS-Phase-2): implement real backend — GET /broadcast/aluno/:id
  return [];
}

export async function getTemplates(): Promise<BroadcastTemplate[]> {
  if (useMock()) { const m = await getMock(); return m.BROADCAST_TEMPLATES; }
  // TODO(BBOS-Phase-2): implement real backend — GET /broadcast/templates
  return [];
}

export async function markBroadcastRead(broadcastId: string, alunoId: string): Promise<void> {
  if (useMock()) { const m = await getMock(); m.markBroadcastRead(broadcastId, alunoId); }
  // TODO(BBOS-Phase-2): implement real backend — PATCH /broadcast/:id/read
}
