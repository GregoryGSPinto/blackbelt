/**
 * Historico Service — Training history data
 *
 * MOCK:  useMock() === true -> dados mock
 * PROD:  useMock() === false -> apiClient
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

export interface HistoricoStats {
  totalTreinos: number;
  treinosMes: number;
  streak: number;
  melhorStreak: number;
  mediaSemanal: number;
  tempoTotal: string;
}

export interface DiaSemana {
  dia: string;
  treinos: number;
  ativo: boolean;
}

export interface Treino {
  id: string;
  data: string;
  hora: string;
  tipo: string;
  instrutor: string;
  duracao: string;
}

export async function getHistoricoStats(): Promise<HistoricoStats> {
  if (useMock()) {
    await mockDelay();
    return {
      totalTreinos: 147,
      treinosMes: 14,
      streak: 5,
      melhorStreak: 12,
      mediaSemanal: 3.5,
      tempoTotal: '294h',
    };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await apiClient.get<any>('/aluno/home');
    return {
      totalTreinos: data?.totalTreinos ?? data?.checkinsHoje ?? 0,
      treinosMes: data?.treinosMes ?? data?.frequenciaMes ?? 0,
      streak: data?.streak ?? data?.sequencia ?? 0,
      melhorStreak: data?.melhorStreak ?? data?.maiorSequencia ?? 0,
      mediaSemanal: 0,
      tempoTotal: '0h',
    };
  } catch {
    return { totalTreinos: 0, treinosMes: 0, streak: 0, melhorStreak: 0, mediaSemanal: 0, tempoTotal: '0h' };
  }
}

export async function getUltimosTreinos(): Promise<Treino[]> {
  if (useMock()) {
    await mockDelay();
    return [
      { id: '1', data: '13/02/2026', hora: '18:00', tipo: 'Avancado', instrutor: 'Prof. Ricardo', duracao: '90 min' },
      { id: '2', data: '12/02/2026', hora: '18:00', tipo: 'Iniciante', instrutor: 'Prof. Ricardo', duracao: '60 min' },
      { id: '3', data: '11/02/2026', hora: '19:30', tipo: 'Competicao', instrutor: 'Prof. Marcos', duracao: '90 min' },
      { id: '4', data: '10/02/2026', hora: '06:30', tipo: 'Fundamentos', instrutor: 'Prof. Ricardo', duracao: '60 min' },
      { id: '5', data: '07/02/2026', hora: '18:00', tipo: 'Avancado', instrutor: 'Prof. Ricardo', duracao: '90 min' },
    ];
  }
  try {
    const { data } = await apiClient.get<Treino[]>('/checkin/history');
    return Array.isArray(data) ? data.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function getDiasSemana(): DiaSemana[] {
  return [
    { dia: 'Seg', treinos: 0, ativo: true },
    { dia: 'Ter', treinos: 0, ativo: true },
    { dia: 'Qua', treinos: 0, ativo: true },
    { dia: 'Qui', treinos: 0, ativo: true },
    { dia: 'Sex', treinos: 0, ativo: true },
    { dia: 'Sab', treinos: 0, ativo: false },
    { dia: 'Dom', treinos: 0, ativo: false },
  ];
}
