/**
 * Kids Safety — Autorização de Saída Service
 * TODO(BE-038): Implementar endpoints kids-safety
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { PessoaAutorizada, AutorizacaoSaida } from './contracts';

export type { PessoaAutorizada, AutorizacaoSaida };

async function getMock() { return import('@/lib/__mocks__/kids-safety.mock'); }

// ── Pessoas Autorizadas ───────────────────────────────────

export async function getPessoasAutorizadas(responsavelId?: string): Promise<PessoaAutorizada[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return responsavelId ? m.mockPessoasAutorizadas.filter(p => p.responsavelId === responsavelId) : [...m.mockPessoasAutorizadas]; }
  const { data } = await apiClient.get<PessoaAutorizada[]>(`/kids-safety/autorizados${responsavelId ? `?responsavelId=${responsavelId}` : ''}`); return data;
}

export async function getPessoasPorAluno(alunoId: string): Promise<PessoaAutorizada[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.mockPessoasAutorizadas.filter(p => p.alunoId === alunoId && p.ativa); }
  const { data } = await apiClient.get<PessoaAutorizada[]>(`/kids-safety/autorizados?alunoId=${alunoId}`); return data;
}

export async function addPessoaAutorizada(payload: Omit<PessoaAutorizada, 'id' | 'dataCadastro'>): Promise<PessoaAutorizada> {
  if (useMock()) { await mockDelay(400); return { ...payload, id: `pa-${Date.now()}`, dataCadastro: new Date().toISOString().split('T')[0] } as PessoaAutorizada; }
  const { data } = await apiClient.post<PessoaAutorizada>('/kids-safety/autorizados', payload); return data;
}

export async function togglePessoaAutorizada(id: string, ativa: boolean): Promise<PessoaAutorizada> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); const p = m.mockPessoasAutorizadas.find(x => x.id === id); return { ...p!, ativa }; }
  const { data } = await apiClient.put<PessoaAutorizada>(`/kids-safety/autorizados/${id}`, { ativa }); return data;
}

export async function removePessoaAutorizada(id: string): Promise<void> {
  if (useMock()) { await mockDelay(200); return; }
  await apiClient.delete(`/kids-safety/autorizados/${id}`);
}

// ── Saídas ────────────────────────────────────────────────

export async function registrarSaida(alunoId: string, pessoaAutorizadaId: string, validadoPor: string, metodo: AutorizacaoSaida['metodoValidacao']): Promise<AutorizacaoSaida> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getMock();
    const pessoa = m.mockPessoasAutorizadas.find(p => p.id === pessoaAutorizadaId);
    return {
      id: `sa-${Date.now()}`, alunoId, alunoNome: 'Aluno', pessoaAutorizadaId,
      pessoaAutorizadaNome: pessoa?.nome || '', parentesco: pessoa?.parentesco || '',
      dataHoraSaida: new Date().toISOString(), validadoPor, metodoValidacao: metodo,
    };
  }
  const { data } = await apiClient.post<AutorizacaoSaida>('/kids-safety/saidas', { alunoId, pessoaAutorizadaId, validadoPor, metodoValidacao: metodo }); return data;
}

export async function getHistoricoSaidas(alunoId?: string): Promise<AutorizacaoSaida[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return alunoId ? m.mockSaidas.filter(s => s.alunoId === alunoId) : [...m.mockSaidas]; }
  const { data } = await apiClient.get<AutorizacaoSaida[]>(`/kids-safety/saidas${alunoId ? `?alunoId=${alunoId}` : ''}`); return data;
}
