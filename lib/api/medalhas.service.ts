/**
 * Conquistas Service
 *
 * MOCK:  useMock() === true → dados de __mocks__/conquistas.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-130): Implementar endpoints de conquistas/conquistas
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { ConquistaDisponivel, ConquistaConcessao } from '@/lib/__mocks__/conquistas.mock';

export type { ConquistaDisponivel, ConquistaConcessao } from '@/lib/__mocks__/conquistas.mock';

async function getMock() {
  return import('@/lib/__mocks__/conquistas.mock');
}

export async function getConquistasDisponiveis(): Promise<ConquistaDisponivel[]> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.getConquistasDisponiveis(); }
  return apiClient.get<ConquistaDisponivel[]>('/conquistas').then(r => r.data);
}

export async function concederConquista(
  alunoId: string,
  conquistaId: string,
  observacao?: string,
  professorNome?: string,
): Promise<ConquistaConcessao> {
  const concessao: ConquistaConcessao = {
    conquistaId,
    alunoId,
    observacao,
    concedidaPor: professorNome || 'Instrutor',
    dataConquista: new Date().toLocaleDateString('pt-BR'),
  };

  if (useMock()) {
    await mockDelay(500);
    // Duplicate prevention: check if student already has this conquista
    const existentes = await getConquistasAluno(alunoId);
    if (existentes.some(c => c.conquistaId === conquistaId)) {
      throw new Error('Aluno já possui esta conquista');
    }
    return concessao;
  }

  // Check client-side for duplicates before calling API
  const existentes = await getConquistasAluno(alunoId);
  if (existentes.some(c => c.conquistaId === conquistaId)) {
    throw new Error('Aluno já possui esta conquista');
  }

  return apiClient.post<ConquistaConcessao>(`/alunos/${alunoId}/conquistas`, { conquistaId, observacao }).then(r => r.data);
}

export async function getConquistasAluno(alunoId: string): Promise<ConquistaConcessao[]> {
  if (useMock()) {
    await mockDelay(200);
    return [];
  }
  return apiClient.get<ConquistaConcessao[]>(`/alunos/${alunoId}/conquistas`).then(r => r.data);
}
