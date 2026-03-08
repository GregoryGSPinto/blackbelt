/**
 * Admin Service — VERSÃO SAFE (nunca propaga erros)
 *
 * Esta versão usa safeCall para garantir que sempre retorna dados,
 * mesmo quando a API falha ou está indisponível.
 *
 * Para usar em produção onde não queremos erros na UI.
 */

import { safeGet, safePut, emptyArray } from './safe-client';
import { getEstatisticas, configuracaoUnidade } from '@/lib/__mocks__/admin.mock';

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

// Estatísticas padrão (zeros)
const defaultStats: EstatisticasDashboard = getEstatisticas();

// Configuração padrão
const defaultConfig: ConfiguracaoUnidade = configuracaoUnidade;

// ============================================================
// FUNÇÕES SAFE (nunca throw)
// ============================================================

export async function getUsuariosSafe(_filters?: { status?: string; tipo?: string; search?: string }): Promise<Usuario[]> {
  return safeGet<Usuario[]>('/admin/usuarios', {
    fallback: emptyArray<Usuario>(),
    params: _filters,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.usuarios || [],
    silent: true,
  });
}

export async function getUsuarioByIdSafe(id: string): Promise<Usuario | null> {
  return safeGet<Usuario | null>(`/admin/usuarios/${id}`, {
    fallback: null,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getUsuarioById?.(id) || null,
    silent: true,
  });
}

export async function getTurmasSafe(): Promise<Turma[]> {
  return safeGet<Turma[]>('/admin/turmas', {
    fallback: emptyArray<Turma>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.turmas || [],
    silent: true,
  });
}

export async function getTurmaByIdSafe(id: string): Promise<Turma | null> {
  return safeGet<Turma | null>(`/admin/turmas/${id}`, {
    fallback: null,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getTurmaById?.(id) || null,
    silent: true,
  });
}

export async function getCheckInsSafe(): Promise<CheckIn[]> {
  return safeGet<CheckIn[]>('/admin/checkins', {
    fallback: emptyArray<CheckIn>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.checkIns || [],
    silent: true,
  });
}

export async function getAlunosByTurmaSafe(turmaId: string): Promise<Usuario[]> {
  return safeGet<Usuario[]>(`/admin/turmas/${turmaId}/alunos`, {
    fallback: emptyArray<Usuario>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getAlunosByTurma?.(turmaId) || [],
    silent: true,
  });
}

export async function getAlertasSafe(): Promise<Alerta[]> {
  return safeGet<Alerta[]>('/admin/alertas', {
    fallback: emptyArray<Alerta>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getAlertasAtivos?.() || [],
    silent: true,
  });
}

export async function getEstatisticasSafe(): Promise<EstatisticasDashboard> {
  return safeGet<EstatisticasDashboard>('/admin/dashboard/stats', {
    fallback: defaultStats,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getEstatisticas?.() || defaultStats,
    silent: true,
  });
}

export async function getHistoricoStatusSafe(): Promise<HistoricoStatus[]> {
  return safeGet<HistoricoStatus[]>('/admin/historico-status', {
    fallback: emptyArray<HistoricoStatus>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.historicoStatus || [],
    silent: true,
  });
}

export async function getPermissoesSafe(): Promise<Permissao[]> {
  return safeGet<Permissao[]>('/admin/permissoes', {
    fallback: emptyArray<Permissao>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.permissoes || [],
    silent: true,
  });
}

export async function getPerfilPermissoesSafe(): Promise<PerfilPermissoes[]> {
  return safeGet<PerfilPermissoes[]>('/admin/perfil-permissoes', {
    fallback: emptyArray<PerfilPermissoes>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.perfilPermissoes || [],
    silent: true,
  });
}

export async function getPerfisDisponiveisSafe(): Promise<PerfilInfo[]> {
  return safeGet<PerfilInfo[]>('/admin/perfis', {
    fallback: emptyArray<PerfilInfo>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.perfisDisponiveis || [],
    silent: true,
  });
}

export async function getConfiguracaoSafe(): Promise<ConfiguracaoUnidade> {
  return safeGet<ConfiguracaoUnidade>('/admin/configuracao', {
    fallback: defaultConfig,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.configuracaoUnidade || defaultConfig,
    silent: true,
  });
}

export async function saveConfiguracaoSafe(config: ConfiguracaoUnidade): Promise<ConfiguracaoUnidade> {
  return safePut<ConfiguracaoUnidade>('/admin/configuracao', config, {
    fallback: config,
    silent: false, // Logar erros de save
  });
}

// ============================================================
// RE-EXPORT para compatibilidade (usar versões safe por padrão)
// ============================================================

export {
  getUsuariosSafe as getUsuarios,
  getUsuarioByIdSafe as getUsuarioById,
  getTurmasSafe as getTurmas,
  getTurmaByIdSafe as getTurmaById,
  getCheckInsSafe as getCheckIns,
  getAlunosByTurmaSafe as getAlunosByTurma,
  getAlertasSafe as getAlertas,
  getEstatisticasSafe as getEstatisticas,
  getHistoricoStatusSafe as getHistoricoStatus,
  getPermissoesSafe as getPermissoes,
  getPerfilPermissoesSafe as getPerfilPermissoes,
  getPerfisDisponiveisSafe as getPerfisDisponiveis,
  getConfiguracaoSafe as getConfiguracao,
  saveConfiguracaoSafe as saveConfiguracao,
};
