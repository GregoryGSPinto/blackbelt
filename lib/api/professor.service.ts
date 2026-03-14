/**
 * Professor Service — Dashboard, turmas, avaliações, vídeos
 *
 * MOCK:  useMock() === true → dados de __mocks__/instrutor.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-013): Implementar endpoints professor
 *   GET /professor/dashboard
 *   GET /professor/turmas
 *   GET /professor/avaliacoes
 *   GET /professor/videos
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

// ============================================================
// TYPES
// ============================================================

export interface TurmaResumo {
  id: string;
  unidadeId?: string; // Multi-tenant
  nome: string;
  categoria: 'Kids' | 'Teen' | 'Adulto' | 'Avançado';
  horario: string;
  dias: string;
  totalAlunos: number;
  presentes: number;
  presencaMedia: number;
  proximaSessao: string;
  cor: string;
  modalityId?: string;
  modalityName?: string;
}

export interface AlunoProgresso {
  id: string;
  nome: string;
  avatar: string;
  nivel: string;
  presenca30d: number;
  ultimaSessao: string;
  status: 'em_dia' | 'atencao' | 'ausente';
}

export interface AvaliacaoPendente {
  id: string;
  aluno: string;
  avatar: string;
  turma: string;
  tipo: 'graduacao' | 'tecnica' | 'comportamento';
  prazo: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

export interface VideoRecente {
  id: string;
  titulo: string;
  thumbnail: string;
  duracao: string;
  turma: string;
  dataEnvio: string;
  visualizacoes: number;
  tipo: 'aula' | 'analise' | 'demonstracao';
}

export interface EstatisticaGeral {
  unidadeId?: string; // Multi-tenant
  totalAlunos: number;
  totalTurmas: number;
  presencaMedia: number;
  avaliacoesPendentes: number;
  sessõesEsteMes: number;
  horasTreinadas: number;
}

export interface AtividadeRecente {
  id: string;
  tipo: 'checkin' | 'avaliacao' | 'video' | 'graduacao';
  descricao: string;
  tempo: string;
  icone: string;
}

export interface ProfessorDashboard {
  unidadeId?: string; // Multi-tenant
  estatisticas: EstatisticaGeral;
  turmas: TurmaResumo[];
  avaliacoesPendentes: AvaliacaoPendente[];
  videosRecentes: VideoRecente[];
  alunosDestaque: AlunoProgresso[];
  atividadesRecentes: AtividadeRecente[];
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

async function getMock() {
  return import('@/lib/__mocks__/instrutor.mock');
}

export async function getDashboard(): Promise<ProfessorDashboard> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.getMockDashboard(); }
  const { data } = await apiClient.get<ProfessorDashboard>('/professor/dashboard');
  return data;
}

export async function getTurmas(): Promise<TurmaResumo[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.TURMAS]; }
  const { data } = await apiClient.get<TurmaResumo[]>('/professor/turmas');
  return data;
}

export async function getAvaliacoes(): Promise<AvaliacaoPendente[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.AVALIACOES_PENDENTES]; }
  const { data } = await apiClient.get<AvaliacaoPendente[]>('/professor/avaliacoes');
  return data;
}

export async function getVideos(): Promise<VideoRecente[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.VIDEOS_RECENTES]; }
  const { data } = await apiClient.get<VideoRecente[]>('/professor/videos');
  return data;
}

export async function getAlunosProgresso(): Promise<AlunoProgresso[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.ALUNOS_DESTAQUE]; }
  const { data } = await apiClient.get<AlunoProgresso[]>('/professor/alunos-progresso');
  return data;
}

export async function getAtividades(): Promise<AtividadeRecente[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.ATIVIDADES_RECENTES]; }
  const { data } = await apiClient.get<AtividadeRecente[]>('/professor/atividades');
  return data;
}

// ============================================================
// CHAMADA RÁPIDA
// TODO(BE-061): POST /professor/chamada/:turmaId/salvar
//               GET  /professor/chamada/:turmaId
// ============================================================

import type { AlunoPresenca, ChamadaPayload, ChamadaResumo } from '@/lib/__mocks__/chamada.mock';
export type { AlunoPresenca, ChamadaPayload, ChamadaResumo };

async function getChamadaMock() {
  return import('@/lib/__mocks__/chamada.mock');
}

export async function getChamadaAlunos(turmaId: string): Promise<AlunoPresenca[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getChamadaMock();
    return m.getChamadaByTurma(turmaId);
  }
  const { data } = await apiClient.get<AlunoPresenca[]>(`/professor/chamada/${turmaId}`);
  return data;
}

export async function salvarChamada(payload: { turmaId: string; data: string; presencas: { alunoId: string; status: 'presente' | 'falta' }[]; observacao?: string }): Promise<ChamadaResumo> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getChamadaMock();
    return m.salvarChamadaMock(payload);
  }
  const { data } = await apiClient.post<ChamadaResumo>(`/professor/chamada/${payload.turmaId}/salvar`, payload);
  return data;
}
