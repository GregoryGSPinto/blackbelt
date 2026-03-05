/**
 * Evolução Service — Student Evolution / Progress Data
 *
 * MOCK:  useMock() === true → dados de __mocks__/evolucao.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-081): Implementar endpoints evolução
 *   GET /aluno/evolucao   (timeline, frequencia histórico, resumo)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { EvolucaoData } from '@/lib/__mocks__/evolucao.mock';

export type { EvolucaoData, FrequenciaHistorico } from '@/lib/__mocks__/evolucao.mock';

async function getMock() {
  return import('@/lib/__mocks__/evolucao.mock');
}

export async function getEvolucaoData(): Promise<EvolucaoData> {
  if (useMock()) {
    await mockDelay(350);
    const mock = await getMock();
    return mock.getMockEvolucaoData();
  }
  const { data } = await apiClient.get<EvolucaoData>('/aluno/evolucao');
  return data;
}
