/**
 * Aluno Home Service — Student Dashboard Data
 *
 * MOCK:  useMock() === true → dados de __mocks__/aluno-home.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-080): Implementar endpoints aluno home
 *   GET /aluno/home         (próxima sessão, frequência, conquistas)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { AlunoHomeData } from '@/lib/__mocks__/aluno-home.mock';

export type {
  AlunoHomeData,
  ProximaAula,
  FrequenciaMensal,
  ConquistaRecente,
} from '@/lib/__mocks__/aluno-home.mock';

async function getMock() {
  return import('@/lib/__mocks__/aluno-home.mock');
}

export async function getAlunoHomeData(): Promise<AlunoHomeData> {
  if (useMock()) {
    await mockDelay(300);
    const mock = await getMock();
    return mock.getMockAlunoHomeData();
  }
  const { data } = await apiClient.get<AlunoHomeData>('/aluno/home');
  return data;
}
