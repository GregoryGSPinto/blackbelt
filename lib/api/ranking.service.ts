/**
 * Ranking Service — Leaderboard & Sistema de Pontos
 *
 * MOCK:  useMock() === true → retorna dados de __mocks__/ranking.mock.ts
 * PROD:  useMock() === false → chama apiClient
 *
 * TODO(BE-020): Implementar endpoints ranking
 *   GET /ranking?categoria=&turmaId=&periodo=
 *   GET /ranking/me
 *   GET /ranking/config/pontos
 *   PUT /ranking/config/pontos/:id (admin)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  RankingEntry,
  PontoRegra,
  PontosResumo,
  CategoriaRanking,
  PeriodoRanking,
} from './contracts';

// Re-export types
export type { RankingEntry, PontoRegra, PontosResumo, CategoriaRanking, PeriodoRanking };

// ── Mock helpers (lazy import) ────────────────────────────

async function getMockModule() {
  return import('@/lib/__mocks__/ranking.mock');
}

// ── Filtros ───────────────────────────────────────────────

export interface RankingFiltros {
  categoria?: CategoriaRanking;
  turmaId?: string;
  periodo?: PeriodoRanking;
  limite?: number;
}

// ── Service functions ─────────────────────────────────────

/** Buscar leaderboard com filtros */
export async function getRanking(filtros?: RankingFiltros): Promise<RankingEntry[]> {
  if (useMock()) {
    await mockDelay();
    const mock = await getMockModule();

    let resultado: RankingEntry[];

    if (filtros?.turmaId) {
      resultado = mock.getRankingPorTurma(filtros.turmaId);
    } else if (filtros?.periodo === 'MENSAL') {
      resultado = mock.getRankingMensal();
    } else if (filtros?.categoria) {
      resultado = mock.getRankingPorCategoria(filtros.categoria);
    } else {
      resultado = mock.rankingAdulto; // Default: adulto
    }

    const limite = filtros?.limite ?? 30;
    return resultado.slice(0, limite);
  }

  const params = new URLSearchParams();
  if (filtros?.categoria) params.set('categoria', filtros.categoria);
  if (filtros?.turmaId) params.set('turmaId', filtros.turmaId);
  if (filtros?.periodo) params.set('periodo', filtros.periodo);
  if (filtros?.limite) params.set('limite', String(filtros.limite));

  return apiClient.get<RankingEntry[]>(`/ranking?${params}`);
}

/** Buscar posição do aluno logado */
export async function getMinhaPosicao(alunoId?: string): Promise<RankingEntry> {
  if (useMock()) {
    await mockDelay();
    const { mockMinhaPosicao } = await getMockModule();
    return mockMinhaPosicao;
  }

  return apiClient.get<RankingEntry>('/ranking/me');
}

/** Buscar resumo de pontos do aluno logado */
export async function getPontosResumo(): Promise<PontosResumo> {
  if (useMock()) {
    await mockDelay();
    const { mockPontosResumo } = await getMockModule();
    return mockPontosResumo;
  }

  return apiClient.get<PontosResumo>('/ranking/pontos/resumo');
}

/** Buscar configuração de regras de pontuação */
export async function getPontosConfig(): Promise<PontoRegra[]> {
  if (useMock()) {
    await mockDelay();
    const { mockPontosConfig } = await getMockModule();
    return mockPontosConfig;
  }

  return apiClient.get<PontoRegra[]>('/ranking/config/pontos');
}

/** Atualizar regra de pontuação (admin) */
export async function updatePontoRegra(id: string, data: Partial<PontoRegra>): Promise<PontoRegra> {
  if (useMock()) {
    await mockDelay();
    const { mockPontosConfig } = await getMockModule();
    const regra = mockPontosConfig.find(r => r.id === id);
    if (!regra) throw new Error('Regra não encontrada');
    return { ...regra, ...data };
  }

  return apiClient.put<PontoRegra>(`/ranking/config/pontos/${id}`, data);
}
