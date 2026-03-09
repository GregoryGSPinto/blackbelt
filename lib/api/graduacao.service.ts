/**
 * Graduação Service — FAIL-SAFE
 *
 * Retorna dados mock automaticamente se API não estiver implementada (501)
 * ou qualquer outro erro ocorrer. A tela nunca fica em erro.
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { ExameGraduacao, RequisitoGraduacao, GraduacaoHistorico, SubnivelAluno } from './contracts';

export type { ExameGraduacao, RequisitoGraduacao, GraduacaoHistorico, SubnivelAluno };

async function getMock() { return import('@/lib/__mocks__/graduacao.mock'); }

/** Fallback silencioso para mock quando API falhar */
async function withMockFallback<T>(
  operation: () => Promise<T>,
  mockGetter: (m: any) => T | Promise<T>,
  endpoint: string
): Promise<T> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return await mockGetter(m);
  }

  try {
    return await operation();
  } catch (err) {
    const status = (err as any)?.status;
    // 501 Not Implemented ou qualquer erro → fallback para mock
    logger.warn(`[GraduacaoService] API ${endpoint} falhou (${status || 'error'}), usando mock`);
    await mockDelay(200);
    const m = await getMock();
    return await mockGetter(m);
  }
}

export async function getExames(): Promise<ExameGraduacao[]> {
  return withMockFallback(
    () => apiClient.get<ExameGraduacao[]>('/graduacao/exames').then(r => r.data),
    (m) => [...m.mockExames],
    '/graduacao/exames'
  );
}

export async function getRequisitos(): Promise<RequisitoGraduacao[]> {
  return withMockFallback(
    () => apiClient.get<RequisitoGraduacao[]>('/graduacao/requisitos').then(r => r.data),
    (m) => [...m.mockRequisitos],
    '/graduacao/requisitos'
  );
}

export async function getMinhaGraduacao(): Promise<GraduacaoHistorico[]> {
  return withMockFallback(
    () => apiClient.get<GraduacaoHistorico[]>('/graduacao/minha').then(r => r.data),
    (m) => [...m.mockMinhaGraduacao],
    '/graduacao/minha'
  );
}

export async function agendarExame(data: Partial<ExameGraduacao>): Promise<ExameGraduacao> {
  return withMockFallback(
    () => apiClient.post<ExameGraduacao>('/graduacao/exames', data).then(r => r.data),
    () => ({ id: `exam-${Date.now()}`, ...data } as ExameGraduacao),
    '/graduacao/exames'
  );
}

export async function avaliarExame(id: string, status: 'APROVADO' | 'REPROVADO', obs?: string): Promise<ExameGraduacao> {
  return withMockFallback(
    () => apiClient.put<ExameGraduacao>(`/graduacao/exames/${id}`, { status, observacao: obs }).then(r => r.data),
    async (m) => {
      const exam = m.mockExames.find((e: ExameGraduacao) => e.id === id);
      return { ...exam!, status, observacao: obs };
    },
    `/graduacao/exames/${id}`
  );
}

// ── Subniveis (Stripes) ───────────────────────────────────────

export async function getSubniveisAlunos(): Promise<SubnivelAluno[]> {
  return withMockFallback(
    () => apiClient.get<SubnivelAluno[]>('/graduacao/subniveis').then(r => r.data),
    (m) => [...m.mockSubniveisAlunos],
    '/graduacao/subniveis'
  );
}

export async function adicionarSubnivel(alunoId: string, instrutor: string): Promise<SubnivelAluno> {
  return withMockFallback(
    () => apiClient.post<SubnivelAluno>(`/graduacao/subniveis/${alunoId}/adicionar`, { instrutor }).then(r => r.data),
    async (m) => {
      const aluno = m.mockSubniveisAlunos.find((a: SubnivelAluno) => a.alunoId === alunoId);
      if (!aluno) throw new Error('Aluno não encontrado');
      const novo = { ...aluno, subniveisAtuais: Math.min(4, aluno.subniveisAtuais + 1), dataUltimoSubnivel: new Date().toISOString().split('T')[0] };
      novo.historicoSubniveis = [...novo.historicoSubniveis, { subnivel: novo.subniveisAtuais, data: novo.dataUltimoSubnivel!, instrutor }];
      return novo;
    },
    `/graduacao/subniveis/${alunoId}/adicionar`
  );
}

export async function removerSubnivel(alunoId: string, motivo: string): Promise<SubnivelAluno> {
  return withMockFallback(
    () => apiClient.post<SubnivelAluno>(`/graduacao/subniveis/${alunoId}/remover`, { motivo }).then(r => r.data),
    async (m) => {
      const aluno = m.mockSubniveisAlunos.find((a: SubnivelAluno) => a.alunoId === alunoId);
      if (!aluno) throw new Error('Aluno não encontrado');
      return { ...aluno, subniveisAtuais: Math.max(0, aluno.subniveisAtuais - 1) };
    },
    `/graduacao/subniveis/${alunoId}/remover`
  );
}

export async function getMeusSubniveis(): Promise<{ subniveisAtuais: number; dataUltimoSubnivel?: string }> {
  return withMockFallback(
    () => apiClient.get<{ subniveisAtuais: number; dataUltimoSubnivel?: string }>('/graduacao/meus-subniveis').then(r => r.data),
    (m) => ({ ...m.mockMeusSubniveis }),
    '/graduacao/meus-subniveis'
  );
}
