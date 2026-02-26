/**
 * Progresso Service — Quick progress updates
 *
 * MOCK:  useMock() === true → dados locais
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-131): Implementar endpoints de progresso rápido
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

export type CategoriaProgresso = 'tecnica' | 'comportamento' | 'fisico';

export interface ProgressoUpdate {
  id: string;
  alunoId: string;
  categoria: CategoriaProgresso;
  nota: number; // 1-5
  observacao?: string;
  professorId: string;
  data: string;
}

export interface ProgressoResumo {
  alunoId: string;
  mediaGeral: number;
  mediaTecnica: number;
  mediaComportamento: number;
  mediaFisico: number;
  totalAvaliacoes: number;
  tendencia: 'up' | 'stable' | 'down';
  historico: ProgressoUpdate[];
}

// ── Mock data ──

const mockHistorico: ProgressoUpdate[] = [
  { id: 'p1', alunoId: 'a1', categoria: 'tecnica', nota: 4, observacao: 'Boa evolução na guarda', professorId: 'prof-001', data: '15/02/2026' },
  { id: 'p2', alunoId: 'a1', categoria: 'comportamento', nota: 5, observacao: 'Excelente disciplina', professorId: 'prof-001', data: '12/02/2026' },
  { id: 'p3', alunoId: 'a1', categoria: 'fisico', nota: 3, observacao: 'Precisa melhorar cardio', professorId: 'prof-001', data: '10/02/2026' },
];

// ── Service methods ──

export async function quickUpdateProgress(
  alunoId: string,
  update: { categoria: CategoriaProgresso; nota: number; observacao?: string },
  professorId: string,
): Promise<ProgressoUpdate> {
  const entry: ProgressoUpdate = {
    id: `p-${Date.now()}`,
    alunoId,
    categoria: update.categoria,
    nota: update.nota,
    observacao: update.observacao,
    professorId,
    data: new Date().toLocaleDateString('pt-BR'),
  };

  if (useMock()) {
    await mockDelay(400);
    mockHistorico.unshift(entry);
    return entry;
  }

  return apiClient.post<ProgressoUpdate>(`/alunos/${alunoId}/progresso`, update).then(r => r.data);
}

export async function getProgressoResumo(alunoId: string): Promise<ProgressoResumo> {
  if (useMock()) {
    await mockDelay(300);
    return {
      alunoId,
      mediaGeral: 4.0,
      mediaTecnica: 4.2,
      mediaComportamento: 4.5,
      mediaFisico: 3.3,
      totalAvaliacoes: mockHistorico.length,
      tendencia: 'up',
      historico: mockHistorico,
    };
  }

  return apiClient.get<ProgressoResumo>(`/alunos/${alunoId}/progresso`).then(r => r.data);
}
