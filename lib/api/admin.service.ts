/**
 * Admin Service — Gerenciamento de unidade
 *
 * MOCK:  useMock() === true → dados de __mocks__/admin.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-010): Implementar endpoints admin
 *   GET  /admin/usuarios
 *   GET  /admin/turmas
 *   GET  /admin/checkins
 *   GET  /admin/dashboard/stats
 *   GET  /admin/alertas
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

import type {
  Usuario, Turma, CheckIn, Alerta, HistoricoStatus,
  StatusOperacional, TipoUsuario, Permissao, PerfilPermissoes,
  PerfilAcesso, PerfilInfo, ConfiguracaoUnidade, EstatisticasDashboard,
} from '@/lib/__mocks__/admin.mock';

// Re-export types para UI
export type {
  Usuario, Turma, CheckIn, Alerta, HistoricoStatus,
  StatusOperacional, TipoUsuario, Permissao, PerfilPermissoes,
  PerfilAcesso, PerfilInfo, ConfiguracaoUnidade, EstatisticasDashboard,
};

async function getMock() {
  return import('@/lib/__mocks__/admin.mock');
}

export async function getUsuarios(_filters?: { status?: string; tipo?: string; search?: string }): Promise<Usuario[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.usuarios]; }
  const { data } = await apiClient.get<Usuario[]>('/admin/usuarios');
  return data;
}

export async function getUsuarioById(id: string): Promise<Usuario | undefined> {
  if (useMock()) { await mockDelay(100); const m = await getMock(); return m.getUsuarioById(id); }
  const { data } = await apiClient.get<Usuario>(`/admin/usuarios/${id}`);
  return data;
}

export async function getTurmas(): Promise<Turma[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.turmas]; }
  const { data } = await apiClient.get<Turma[]>('/admin/turmas');
  return data;
}

export async function getTurmaById(id: string): Promise<Turma | undefined> {
  if (useMock()) { await mockDelay(100); const m = await getMock(); return m.getTurmaById(id); }
  const { data } = await apiClient.get<Turma>(`/admin/turmas/${id}`);
  return data;
}

export async function getCheckIns(): Promise<CheckIn[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.checkIns]; }
  const { data } = await apiClient.get<CheckIn[]>('/admin/checkins');
  return data;
}

export async function getAlunosByTurma(turmaId: string): Promise<Usuario[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getAlunosByTurma(turmaId); }
  const { data } = await apiClient.get<Usuario[]>(`/admin/turmas/${turmaId}/alunos`);
  return data;
}

export async function getAlertas(): Promise<Alerta[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getAlertasAtivos(); }
  const { data } = await apiClient.get<Alerta[]>('/admin/alertas');
  return data;
}

export async function getEstatisticas(): Promise<EstatisticasDashboard> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getEstatisticas(); }
  const { data } = await apiClient.get<EstatisticasDashboard>('/admin/dashboard/stats');
  return data;
}

export async function getHistoricoStatus(): Promise<HistoricoStatus[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.historicoStatus]; }
  const { data } = await apiClient.get<HistoricoStatus[]>('/admin/historico-status');
  return data;
}

export async function getPermissoes(): Promise<Permissao[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.permissoes]; }
  const { data } = await apiClient.get<Permissao[]>('/admin/permissoes');
  return data;
}

export async function getPerfilPermissoes(): Promise<PerfilPermissoes[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.perfilPermissoes]; }
  const { data } = await apiClient.get<PerfilPermissoes[]>('/admin/perfil-permissoes');
  return data;
}

export async function getPerfisDisponiveis(): Promise<PerfilInfo[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.perfisDisponiveis]; }
  const { data } = await apiClient.get<PerfilInfo[]>('/admin/perfis');
  return data;
}

export async function getConfiguracao(): Promise<ConfiguracaoUnidade> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return { ...m.configuracaoUnidade }; }
  const { data } = await apiClient.get<ConfiguracaoUnidade>('/admin/configuracao');
  return data;
}


