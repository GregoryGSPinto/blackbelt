/**
 * Professor Pedagógico Service — Visão completa de TODOS os alunos
 *
 * TIPOS:     Importados de contracts.ts (SINGLE SOURCE OF TRUTH)
 * MOCK:      useMock() === true → dados de __mocks__/professor-pedagogico.mock.ts
 * PROD:      useMock() === false → apiClient
 *
 * FEATURES:
 * - Server-side pagination (limit=20 padrão)
 * - Busca/filtro/ordenação no servidor
 * - Controle de concorrência otimista (updatedAt)
 * - Audit trail em toda operação de escrita
 * - Integridade referencial (soft delete com dependency check)
 * - Logs pedagógicos obrigatórios
 *
 * TODO(BE-014): Implementar endpoints pedagógicos
 *   GET  /professor/pedagogico/alunos?page=1&limit=20&categoria=Adulto&search=pedro
 *   GET  /professor/pedagogico/alunos/:id
 *   GET  /professor/pedagogico/estatisticas
 *   GET  /professor/pedagogico/logs?alunoId=...
 *   POST /professor/pedagogico/alunos/:id/observacao
 *   POST /professor/pedagogico/alunos/:id/avaliacao
 *   POST /professor/pedagogico/alunos/:id/conquista
 *   PUT  /professor/pedagogico/alunos/:id/progresso  (com updatedAt + audit)
 *   DELETE /professor/pedagogico/sessões/:id            (soft delete + integrity)
 */

import { apiClient, ApiError } from './client';
import { useMock, mockDelay } from '@/lib/env';
import * as auditManager from '@/lib/persistence/audit-manager';
import * as softDeleteModule from '@/lib/persistence/soft-delete';
import type {
  AlunoPedagogico,
  CategoriaAluno,
  StatusAluno,
  EstatisticasPedagogicas,
  LogPedagogico,
  PaginatedResponse,
  AlunoQueryParams,
  UpdateProgressoPayload,
  ConflictError,
  StatusGraduacao,
  ProgressoTecnico,
  ModuloProgresso,
  ConquistaAluno,
  DesafioAluno,
  StatusDesafio,
  ObservacaoPedagogica,
  AvaliacaoRegistro,
  HistoricoAula,
  TipoLog,
} from '@/lib/api/contracts';

// Re-export types for page consumers
export type {
  AlunoPedagogico,
  CategoriaAluno,
  StatusAluno,
  EstatisticasPedagogicas,
  LogPedagogico,
  PaginatedResponse,
  AlunoQueryParams,
  UpdateProgressoPayload,
  ConflictError,
  StatusGraduacao,
  ProgressoTecnico,
  ModuloProgresso,
  ConquistaAluno,
  DesafioAluno,
  StatusDesafio,
  ObservacaoPedagogica,
  AvaliacaoRegistro,
  HistoricoAula,
  TipoLog,
};

async function getMock() {
  return import('@/lib/__mocks__/professor-pedagogico.mock');
}

/** Resultado genérico de operação de escrita */
export interface WriteResult {
  success: boolean;
  updatedAt?: string;
  conflict?: ConflictError;
  error?: string;
  /** ID do registro de auditoria gerado */
  auditLogId?: string;
}

// ============================================================
// READ — PAGINATED
// ============================================================

export async function getAlunosPaginated(params: AlunoQueryParams = {}): Promise<PaginatedResponse<AlunoPedagogico>> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    return m.getAlunosPaginated(params);
  }
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.categoria) sp.set('categoria', params.categoria);
  if (params.search) sp.set('search', params.search);
  if (params.status) sp.set('status', params.status);
  if (params.sortBy) sp.set('sortBy', params.sortBy);
  if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
  const { data } = await apiClient.get<PaginatedResponse<AlunoPedagogico>>(
    `/professor/pedagogico/alunos?${sp.toString()}`
  );
  return data;
}

/** @deprecated Use getAlunosPaginated() — mantido para dashboard alerts */
export async function getAlunos(categoria?: CategoriaAluno): Promise<AlunoPedagogico[]> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    if (categoria) return m.getAlunosByCategoria(categoria);
    return [...m.ALUNOS_PEDAGOGICO];
  }
  const url = categoria ? `/professor/pedagogico/alunos/all?categoria=${categoria}` : '/professor/pedagogico/alunos/all';
  const { data } = await apiClient.get<AlunoPedagogico[]>(url);
  return data;
}

// ============================================================
// READ — SINGLE / AGGREGATED
// ============================================================

export async function getAlunoById(id: string): Promise<AlunoPedagogico | null> {
  if (useMock()) {
    await mockDelay(150);
    const m = await getMock();
    return m.getAlunoById(id) ?? null;
  }
  const { data } = await apiClient.get<AlunoPedagogico>(`/professor/pedagogico/alunos/${id}`);
  return data;
}

export async function getEstatisticas(): Promise<EstatisticasPedagogicas> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    return m.getEstatisticasPedagogicas();
  }
  const { data } = await apiClient.get<EstatisticasPedagogicas>('/professor/pedagogico/estatisticas');
  return data;
}

export async function getAlunosBaixaFrequencia(threshold = 60): Promise<AlunoPedagogico[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getAlunosBaixaFrequencia(threshold);
  }
  const { data } = await apiClient.get<AlunoPedagogico[]>(`/professor/pedagogico/alunos/baixa-frequencia?threshold=${threshold}`);
  return data;
}

export async function getAlunosDestaque(): Promise<AlunoPedagogico[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getAlunosDestaque();
  }
  const { data } = await apiClient.get<AlunoPedagogico[]>('/professor/pedagogico/alunos/destaque');
  return data;
}

export async function getAlunosAptoGraduacao(): Promise<AlunoPedagogico[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getAlunosAptoGraduacao();
  }
  const { data } = await apiClient.get<AlunoPedagogico[]>('/professor/pedagogico/alunos/aptos-graduacao');
  return data;
}

export async function getLogs(alunoId?: string): Promise<LogPedagogico[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (alunoId) return m.getLogsByAluno(alunoId);
    return [...m.LOGS_PEDAGOGICOS];
  }
  const url = alunoId ? `/professor/pedagogico/logs?alunoId=${alunoId}` : '/professor/pedagogico/logs';
  const { data } = await apiClient.get<LogPedagogico[]>(url);
  return data;
}

// ============================================================
// WRITE — COM AUDIT TRAIL + CONCURRENCY + SOFT DELETE
// ============================================================

/**
 * Atualizar progresso de módulo COM:
 * - Controle de concorrência otimista (version/updatedAt)
 * - Audit trail (before/after state capture)
 * - Validação de score 0..100
 * - Recálculo automático de overallScore e statusGraduacao (backend)
 */
export async function updateProgresso(
  alunoId: string,
  payload: UpdateProgressoPayload
): Promise<WriteResult> {
  if (useMock()) {
    await mockDelay(300);
    const m = await getMock();
    // Concurrency check
    const check = m.checkConcurrency(alunoId, payload.updatedAt);
    if (check.conflict) {
      return {
        success: false,
        conflict: {
          code: 'CONFLICT',
          message: 'Este registro foi atualizado por outro instrutor. Atualize a página.',
          currentUpdatedAt: check.currentUpdatedAt,
        },
      };
    }
    // Score validation
    if (payload.valor < 0 || payload.valor > 100) {
      return { success: false, error: 'Score deve ser entre 0 e 100.' };
    }
    // Audit trail
    const result = await auditManager.auditedOperation(
      'UPDATE', 'progress', alunoId,
      { moduloId: payload.moduloId, valorAnterior: 'N/A' },
      async () => ({ moduloId: payload.moduloId, novoValor: payload.valor })
    );
    return { success: true, updatedAt: new Date().toISOString(), auditLogId: result.auditLogId };
  }
  try {
    const { data } = await apiClient.put<WriteResult>(
      `/professor/pedagogico/alunos/${alunoId}/progresso`, payload
    );
    return data;
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 409) {
      return { success: false, conflict: err.data as ConflictError };
    }
    throw err;
  }
}

/** Adicionar observação pedagógica (com audit trail) */
export async function addObservacao(
  alunoId: string, texto: string, tipo: 'positiva' | 'neutra' | 'atencao'
): Promise<WriteResult> {
  if (useMock()) {
    await mockDelay(300);
    const result = await auditManager.auditedOperation(
      'CREATE', 'observation', alunoId, null,
      async () => ({ texto, tipo, data: new Date().toISOString() })
    );
    return { success: true, updatedAt: new Date().toISOString(), auditLogId: result.auditLogId };
  }
  const { data } = await apiClient.post<WriteResult>(
    `/professor/pedagogico/alunos/${alunoId}/observacao`, { texto, tipo }
  );
  return data;
}

/** Conceder conquista (com audit trail) */
export async function concederConquista(
  alunoId: string, nome: string, emoji: string, descricao: string
): Promise<WriteResult> {
  if (useMock()) {
    await mockDelay(300);
    const result = await auditManager.auditedOperation(
      'CREATE', 'medal', alunoId, null,
      async () => ({ nome, emoji, descricao, data: new Date().toISOString() })
    );
    return { success: true, updatedAt: new Date().toISOString(), auditLogId: result.auditLogId };
  }
  const { data } = await apiClient.post<WriteResult>(
    `/professor/pedagogico/alunos/${alunoId}/conquista`, { nome, emoji, descricao }
  );
  return data;
}

/** Criar avaliação (com audit trail) */
export async function criarAvaliacao(
  alunoId: string,
  tipo: 'tecnica' | 'graduacao' | 'comportamento',
  resultado: 'aprovado' | 'reprovado',
  nota: number,
  observacao: string
): Promise<WriteResult> {
  if (useMock()) {
    await mockDelay(300);
    const result = await auditManager.auditedOperation(
      'CREATE', 'evaluation', alunoId, null,
      async () => ({ tipo, resultado, nota, observacao, data: new Date().toISOString() })
    );
    return { success: true, updatedAt: new Date().toISOString(), auditLogId: result.auditLogId };
  }
  const { data } = await apiClient.post<WriteResult>(
    `/professor/pedagogico/alunos/${alunoId}/avaliacao`,
    { tipo, resultado, nota, observacao }
  );
  return data;
}

// ============================================================
// SESSÕES — SOFT DELETE COM INTEGRIDADE REFERENCIAL
// ============================================================

/**
 * Excluir sessão com:
 * - Verificação de integridade (attendance vinculados)
 * - Soft delete (UPDATE SET deleted_at = NOW())
 * - Audit trail (before/after)
 *
 * FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT
 */
export async function excluirAula(aulaId: string): Promise<WriteResult> {
  if (useMock()) {
    await mockDelay(300);

    // Verificar integridade via persistence layer
    const integrityCheck = await softDeleteModule.checkDeletionAllowed('class', aulaId);
    if (integrityCheck) {
      await auditManager.auditedOperation(
        'DELETE', 'class', aulaId,
        { aulaId, _blocked: true },
        async () => ({ aulaId, _reason: integrityCheck.message })
      );
      return { success: false, error: integrityCheck.message };
    }

    // Fallback mock: sessões ha_01..ha_09 têm attendance
    if (aulaId.startsWith('ha_0')) {
      return {
        success: false,
        error: 'Não é possível excluir sessão com registros de presença vinculados.',
      };
    }

    // Soft delete com audit
    const result = await auditManager.auditedOperation(
      'DELETE', 'class', aulaId,
      { aulaId, deletedAt: null },
      async () => ({ aulaId, deletedAt: new Date().toISOString() })
    );
    return { success: true, auditLogId: result.auditLogId };
  }
  try {
    const { data } = await apiClient.delete<WriteResult>(
      `/professor/pedagogico/sessões/${aulaId}`
    );
    return data;
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 422) {
      return {
        success: false,
        error: (err.data as { message?: string })?.message ||
          'Não é possível excluir sessão com registros de presença vinculados.',
      };
    }
    throw err;
  }
}
