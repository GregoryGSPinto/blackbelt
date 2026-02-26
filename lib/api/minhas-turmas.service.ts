/**
 * Minhas Turmas Service — Student's enrolled classes
 *
 * MOCK:  useMock() === true → dados de __mocks__/minhas-turmas.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-082): Implementar endpoints minhas turmas
 *   GET /aluno/turmas   (turmas matriculadas + próxima sessão + presença)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { TurmaAluno } from '@/lib/__mocks__/minhas-turmas.mock';

export type { TurmaAluno } from '@/lib/__mocks__/minhas-turmas.mock';

async function getMock() {
  return import('@/lib/__mocks__/minhas-turmas.mock');
}

export async function getMinhasTurmas(): Promise<TurmaAluno[]> {
  if (useMock()) {
    await mockDelay(250);
    const mock = await getMock();
    return mock.getMockMinhasTurmas();
  }
  const { data } = await apiClient.get<TurmaAluno[]>('/aluno/turmas');
  return data;
}
