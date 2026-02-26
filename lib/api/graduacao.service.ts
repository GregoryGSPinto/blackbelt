/**
 * Graduação Service
 * TODO(BE-027): Implementar endpoints graduação
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { ExameGraduacao, RequisitoGraduacao, GraduacaoHistorico, SubnivelAluno } from './contracts';

export type { ExameGraduacao, RequisitoGraduacao, GraduacaoHistorico, SubnivelAluno };

async function getMock() { return import('@/lib/__mocks__/graduacao.mock'); }

export async function getExames(): Promise<ExameGraduacao[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.mockExames]; }
  return apiClient.get<ExameGraduacao[]>('/graduacao/exames').then(r => r.data);
}

export async function getRequisitos(): Promise<RequisitoGraduacao[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.mockRequisitos]; }
  return apiClient.get<RequisitoGraduacao[]>('/graduacao/requisitos').then(r => r.data);
}

export async function getMinhaGraduacao(): Promise<GraduacaoHistorico[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.mockMinhaGraduacao]; }
  return apiClient.get<GraduacaoHistorico[]>('/graduacao/minha').then(r => r.data);
}

export async function agendarExame(data: Partial<ExameGraduacao>): Promise<ExameGraduacao> {
  if (useMock()) { await mockDelay(400); return { id: `exam-${Date.now()}`, ...data } as ExameGraduacao; }
  return apiClient.post<ExameGraduacao>('/graduacao/exames', data).then(r => r.data);
}

export async function avaliarExame(id: string, status: 'APROVADO' | 'REPROVADO', obs?: string): Promise<ExameGraduacao> {
  if (useMock()) {
    await mockDelay(300);
    const m = await getMock();
    const exam = m.mockExames.find(e => e.id === id);
    return { ...exam!, status, observacao: obs };
  }
  return apiClient.put<ExameGraduacao>(`/graduacao/exames/${id}`, { status, observacao: obs }).then(r => r.data);
}

// ── Subniveis (Stripes) ───────────────────────────────────────

export async function getSubniveisAlunos(): Promise<SubnivelAluno[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.mockSubniveisAlunos]; }
  return apiClient.get<SubnivelAluno[]>('/graduacao/subniveis').then(r => r.data);
}

export async function adicionarSubnivel(alunoId: string, instrutor: string): Promise<SubnivelAluno> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getMock();
    const aluno = m.mockSubniveisAlunos.find(a => a.alunoId === alunoId);
    if (!aluno) throw new Error('Aluno não encontrado');
    const novo = { ...aluno, subniveisAtuais: Math.min(4, aluno.subniveisAtuais + 1), dataUltimoSubnivel: new Date().toISOString().split('T')[0] };
    novo.historicoSubniveis = [...novo.historicoSubniveis, { subnivel: novo.subniveisAtuais, data: novo.dataUltimoSubnivel!, instrutor }];
    return novo;
  }
  return apiClient.post<SubnivelAluno>(`/graduacao/subniveis/${alunoId}/adicionar`, { instrutor }).then(r => r.data);
}

export async function removerSubnivel(alunoId: string, motivo: string): Promise<SubnivelAluno> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getMock();
    const aluno = m.mockSubniveisAlunos.find(a => a.alunoId === alunoId);
    if (!aluno) throw new Error('Aluno não encontrado');
    return { ...aluno, subniveisAtuais: Math.max(0, aluno.subniveisAtuais - 1) };
  }
  return apiClient.post<SubnivelAluno>(`/graduacao/subniveis/${alunoId}/remover`, { motivo }).then(r => r.data);
}

export async function getMeusSubniveis(): Promise<{ subniveisAtuais: number; dataUltimoSubnivel?: string }> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return { ...m.mockMeusSubniveis }; }
  return apiClient.get<{ subniveisAtuais: number; dataUltimoSubnivel?: string }>('/graduacao/meus-subniveis').then(r => r.data);
}
