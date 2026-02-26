/**
 * Eventos Service — Campeonatos e Eventos
 *
 * MOCK:  useMock() === true → retorna dados de __mocks__/eventos.mock.ts
 * PROD:  useMock() === false → chama apiClient
 *
 * TODO(BE-022): Implementar endpoints eventos
 *   GET /eventos?status=&tipo=
 *   GET /eventos/:id
 *   POST /eventos (admin)
 *   PUT /eventos/:id (admin)
 *   DELETE /eventos/:id (admin)
 *   POST /eventos/:id/inscrever
 *   PUT /eventos/:id/resultados (admin)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  Evento,
  InscricaoEvento,
  TipoEvento,
  StatusEvento,
} from './contracts';

export type { Evento, InscricaoEvento, TipoEvento, StatusEvento };

// ── Mock helpers (lazy import) ────────────────────────────

async function getMockModule() {
  return import('@/lib/__mocks__/eventos.mock');
}

// ── Filtros ───────────────────────────────────────────────

export interface EventosFiltros {
  status?: StatusEvento;
  tipo?: TipoEvento;
  /** 'proximos' | 'passados' | 'todos' */
  periodo?: 'proximos' | 'passados' | 'todos';
}

// ── Service functions ─────────────────────────────────────

/** Listar eventos com filtros */
export async function getEventos(filtros?: EventosFiltros): Promise<Evento[]> {
  if (useMock()) {
    await mockDelay();
    const mock = await getMockModule();

    if (filtros?.periodo === 'proximos') return mock.getEventosFuturos();
    if (filtros?.periodo === 'passados') return mock.getEventosPassados();

    let resultado = [...mock.mockEventos];
    if (filtros?.status) resultado = resultado.filter(e => e.status === filtros.status);
    if (filtros?.tipo) resultado = resultado.filter(e => e.tipo === filtros.tipo);

    return resultado;
  }

  const params = new URLSearchParams();
  if (filtros?.status) params.set('status', filtros.status);
  if (filtros?.tipo) params.set('tipo', filtros.tipo);
  if (filtros?.periodo) params.set('periodo', filtros.periodo);

  return apiClient.get<Evento[]>(`/eventos?${params}`);
}

/** Buscar evento por ID */
export async function getEvento(id: string): Promise<Evento | null> {
  if (useMock()) {
    await mockDelay();
    const { getEventoById } = await getMockModule();
    return getEventoById(id) ?? null;
  }

  try {
    return await apiClient.get<Evento>(`/eventos/${id}`);
  } catch {
    return null;
  }
}

/** Inscrever aluno em evento */
export async function inscreverEvento(
  eventoId: string,
  data: { categoriaId: string; peso: string }
): Promise<InscricaoEvento> {
  if (useMock()) {
    await mockDelay(400);
    return {
      id: `insc-${eventoId}-new`,
      alunoId: 'USR_ADULTO_01',
      alunoNome: 'Carlos Silva',
      eventoId,
      categoriaId: data.categoriaId,
      categoriaDescricao: `Categoria selecionada`,
      peso: data.peso,
      dataInscricao: new Date().toISOString().split('T')[0],
    };
  }

  return apiClient.post<InscricaoEvento>(`/eventos/${eventoId}/inscrever`, data);
}

/** Criar evento (admin) */
export async function criarEvento(data: Partial<Evento>): Promise<Evento> {
  if (useMock()) {
    await mockDelay(400);
    return {
      id: `evt-new-${Date.now()}`,
      nome: data.nome || 'Novo Evento',
      descricao: data.descricao || '',
      data: data.data || new Date().toISOString().split('T')[0],
      local: data.local || '',
      tipo: data.tipo || 'INTERNO',
      status: 'AGENDADO',
      categorias: data.categorias || [],
      inscricoesAbertas: false,
      inscritos: [],
      ...data,
    } as Evento;
  }

  return apiClient.post<Evento>('/eventos', data);
}

/** Atualizar evento (admin) */
export async function atualizarEvento(id: string, data: Partial<Evento>): Promise<Evento> {
  if (useMock()) {
    await mockDelay(300);
    const { getEventoById } = await getMockModule();
    const existing = getEventoById(id);
    if (!existing) throw new Error('Evento não encontrado');
    return { ...existing, ...data };
  }

  return apiClient.put<Evento>(`/eventos/${id}`, data);
}

/** Excluir evento (admin) */
export async function excluirEvento(id: string): Promise<void> {
  if (useMock()) {
    await mockDelay(300);
    return;
  }

  return apiClient.delete(`/eventos/${id}`);
}

/** Registrar resultados de evento (admin) */
export async function registrarResultados(
  eventoId: string,
  resultados: InscricaoEvento[]
): Promise<void> {
  if (useMock()) {
    await mockDelay(400);
    return;
  }

  return apiClient.put(`/eventos/${eventoId}/resultados`, { resultados });
}

/** Exportar inscritos como CSV (client-side) */
export function exportarInscritosCSV(evento: Evento): string {
  const header = 'Nome,Categoria,Peso,Data Inscrição\n';
  const rows = evento.inscritos
    .map(i => `"${i.alunoNome}","${i.categoriaDescricao}","${i.peso}","${i.dataInscricao}"`)
    .join('\n');
  return header + rows;
}
