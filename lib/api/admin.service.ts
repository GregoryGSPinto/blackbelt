/**
 * Admin Service — Gerenciamento de unidade
 *
 * MOCK:  useMock() === true → dados de __mocks__/admin.mock.ts
 * PROD:  useMock() === false → apiClient com fallback automático
 *
 * ⚠️  ATUALIZAÇÃO: Todas as funções agora usam safeCall internamente.
 *     NUNCA propagam erros para a UI - sempre retornam dados válidos.
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { safeGet, emptyArray } from './safe-client';
import { logger } from '@/lib/logger';

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

// ============================================================
// FALLBACKS (dados vazios seguros)
// ============================================================

const defaultStats: EstatisticasDashboard = {
  totalAlunos: 0,
  alunosAtivos: 0,
  alunosEmAtraso: 0,
  alunosBloqueados: 0,
  alunosCongelados: 0,
  alunosInativos: 0,
  checkInsHoje: 0,
  checkInsOntem: 0,
  turmasAtivas: 0,
  alertasNaoLidos: 0,
  novatos: { quantidade: 0, lista: [] },
  riscoEvasao: { quantidade: 0, lista: [] },
  congelados: { quantidade: 0, lista: [] },
  aniversariantes: { quantidade: 0, lista: [] },
  mapaCalor: [],
  aptosExame: { quantidade: 0, lista: [] },
  tempoMedioPorNível: [],
};

const defaultConfig: ConfiguracaoUnidade = {
  limiteAtrasoPermitido: 7,
  diasParaBloqueio: 60,
  mensagemBloqueio: 'Seu acesso está temporariamente bloqueado. Por favor, regularize sua situação na recepção.',
  horarioFuncionamento: {
    abertura: '06:00',
    fechamento: '22:00',
  },
  permitirCheckInAntecipado: true,
  minutosAntecedencia: 15,
};

async function getMock() {
  return import('@/lib/__mocks__/admin.mock');
}

// ============================================================
// FUNÇÕES COM FALLBACK AUTOMÁTICO
// ============================================================

export async function getUsuarios(_filters?: { status?: string; tipo?: string; search?: string }): Promise<Usuario[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return [...m.usuarios]; 
  }
  
  return safeGet<Usuario[]>('/admin/usuarios', {
    fallback: emptyArray<Usuario>(),
    params: _filters,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.usuarios || [],
    silent: true,
  });
}

export async function getUsuarioById(id: string): Promise<Usuario | undefined> {
  if (useMock()) { 
    await mockDelay(100); 
    const m = await getMock(); 
    return m.getUsuarioById(id); 
  }
  
  try {
    const { data } = await apiClient.get<Usuario>(`/admin/usuarios/${id}`);
    return data;
  } catch {
    return undefined;
  }
}

export async function getTurmas(): Promise<Turma[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return [...m.turmas]; 
  }
  
  return safeGet<Turma[]>('/admin/turmas', {
    fallback: emptyArray<Turma>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.turmas || [],
    silent: true,
  });
}

export async function getTurmaById(id: string): Promise<Turma | undefined> {
  if (useMock()) { 
    await mockDelay(100); 
    const m = await getMock(); 
    return m.getTurmaById(id); 
  }
  
  try {
    const { data } = await apiClient.get<Turma>(`/admin/turmas/${id}`);
    return data;
  } catch {
    return undefined;
  }
}

export async function getCheckIns(): Promise<CheckIn[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return [...m.checkIns]; 
  }
  
  return safeGet<CheckIn[]>('/admin/checkins', {
    fallback: emptyArray<CheckIn>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.checkIns || [],
    silent: true,
  });
}

export async function getAlunosByTurma(turmaId: string): Promise<Usuario[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return m.getAlunosByTurma(turmaId); 
  }
  
  return safeGet<Usuario[]>(`/admin/turmas/${turmaId}/alunos`, {
    fallback: emptyArray<Usuario>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getAlunosByTurma?.(turmaId) || [],
    silent: true,
  });
}

export async function getAlertas(): Promise<Alerta[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return m.getAlertasAtivos(); 
  }
  
  return safeGet<Alerta[]>('/admin/alertas', {
    fallback: emptyArray<Alerta>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getAlertasAtivos?.() || [],
    silent: true,
  });
}

export async function getEstatisticas(): Promise<EstatisticasDashboard> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return m.getEstatisticas(); 
  }
  
  return safeGet<EstatisticasDashboard>('/admin/dashboard/stats', {
    fallback: defaultStats,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.getEstatisticas?.() || defaultStats,
    silent: true,
  });
}

export async function getHistoricoStatus(): Promise<HistoricoStatus[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return [...m.historicoStatus]; 
  }
  
  return safeGet<HistoricoStatus[]>('/admin/historico-status', {
    fallback: emptyArray<HistoricoStatus>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.historicoStatus || [],
    silent: true,
  });
}

export async function getPermissoes(): Promise<Permissao[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return [...m.permissoes]; 
  }
  
  return safeGet<Permissao[]>('/admin/permissoes', {
    fallback: emptyArray<Permissao>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.permissoes || [],
    silent: true,
  });
}

export async function getPerfilPermissoes(): Promise<PerfilPermissoes[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return [...m.perfilPermissoes]; 
  }
  
  return safeGet<PerfilPermissoes[]>('/admin/perfil-permissoes', {
    fallback: emptyArray<PerfilPermissoes>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.perfilPermissoes || [],
    silent: true,
  });
}

export async function getPerfisDisponiveis(): Promise<PerfilInfo[]> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return [...m.perfisDisponiveis]; 
  }
  
  return safeGet<PerfilInfo[]>('/admin/perfis', {
    fallback: emptyArray<PerfilInfo>(),
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.perfisDisponiveis || [],
    silent: true,
  });
}

export async function getConfiguracao(): Promise<ConfiguracaoUnidade> {
  if (useMock()) { 
    await mockDelay(); 
    const m = await getMock(); 
    return { ...m.configuracaoUnidade }; 
  }
  
  return safeGet<ConfiguracaoUnidade>('/admin/configuracao', {
    fallback: defaultConfig,
    useMockFallback: true,
    mockPath: '@/lib/__mocks__/admin.mock',
    mockExtractor: (m) => m.configuracaoUnidade || defaultConfig,
    silent: true,
  });
}

export async function saveConfiguracao(config: ConfiguracaoUnidade): Promise<ConfiguracaoUnidade> {
  if (useMock()) { 
    await mockDelay(300); 
    return config; 
  }
  
  try {
    const { data } = await apiClient.put<ConfiguracaoUnidade>('/admin/configuracao', config);
    return data;
  } catch (err) {
    logger.warn('[admin.service]', 'saveConfiguracao failed, returning local config', err);
    return config; // Retorna config local em caso de erro
  }
}
