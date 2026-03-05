/**
 * LGPD Service — Anonimização e Conformidade
 *
 * PRINCÍPIO: Dados pessoais podem ser removidos.
 *            Dados pedagógicos são preservados.
 *
 * ANONIMIZAÇÃO:
 * ✔ CPF → hash irreversível
 * ✔ Telefone → "DADO ANONIMIZADO"
 * ✔ Endereço → "DADO ANONIMIZADO"
 * ✔ Email → hash@anonimizado.blackbelt
 * ✔ Nome → "Aluno Anonimizado #XXXX"
 *
 * PRESERVADO:
 * ✔ Histórico de sessões
 * ✔ Progresso técnico
 * ✔ Avaliações
 * ✔ Conquistas
 * ✔ Estatísticas agregadas
 *
 * TODO(BE-021): Implementar endpoints LGPD
 *   POST /lgpd/anonymize/:studentId     (requer ADMIN + reauth)
 *   POST /lgpd/export/:userId           (exporta dados do usuário)
 *   GET  /lgpd/requests                 (lista solicitações)
 *   POST /lgpd/requests                 (cria solicitação)
 *   PATCH /lgpd/requests/:id/approve    (aprova solicitação)
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  AnonymizeResult,
  LGPDRequest,
  SensitivePersonalData,
  PaginatedResponse,
} from '@/lib/api/contracts';
import { auditedOperation } from './audit-manager';

// ============================================================
// ANONYMIZATION
// ============================================================

/**
 * Hash irreversível para CPF (simula SHA-256 em mock).
 * Em produção: usar crypto.createHash('sha256') no backend.
 */
function irreversibleHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit integer
  }
  return `HASH_${Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()}`;
}

/** Gera ID anônimo para substituição de nome */
function generateAnonId(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

/**
 * Constantes de substituição (valores que indicam dado anonimizado)
 */
export const ANONYMIZED_VALUES = {
  telefone: 'DADO ANONIMIZADO',
  endereco: 'DADO ANONIMIZADO',
  emailDomain: '@anonimizado.blackbelt',
  nomePrefix: 'Aluno Anonimizado',
} as const;

/**
 * Anonimiza dados pessoais de um aluno.
 *
 * REGRAS:
 * - Requer role ADMIN
 * - Requer reautenticação antes (ação crítica)
 * - Mantém histórico pedagógico intacto
 * - Registra como ANONYMIZE no audit log
 * - CPF substituído por hash irreversível
 * - Demais dados pessoais substituídos por placeholders
 *
 * @param studentId - ID do aluno a ser anonimizado
 * @param currentData - Dados pessoais atuais (para audit before/after)
 * @param reason - Motivo da anonimização (obrigatório para compliance)
 */
export async function anonymizeStudent(
  studentId: string,
  currentData: SensitivePersonalData,
  reason: string
): Promise<AnonymizeResult> {
  const anonId = generateAnonId();
  const fieldsAnonymized: string[] = [];

  // ─── Build anonymized version ───
  const anonymizedData: SensitivePersonalData = { ...currentData };

  if (currentData.cpf) {
    anonymizedData.cpf = irreversibleHash(currentData.cpf);
    fieldsAnonymized.push('cpf');
  }

  if (currentData.telefone) {
    anonymizedData.telefone = ANONYMIZED_VALUES.telefone;
    fieldsAnonymized.push('telefone');
  }

  if (currentData.endereco) {
    anonymizedData.endereco = ANONYMIZED_VALUES.endereco;
    fieldsAnonymized.push('endereco');
  }

  if (currentData.email) {
    anonymizedData.email = `${irreversibleHash(currentData.email)}${ANONYMIZED_VALUES.emailDomain}`;
    fieldsAnonymized.push('email');
  }

  if (currentData.nomeCompleto) {
    anonymizedData.nomeCompleto = `${ANONYMIZED_VALUES.nomePrefix} #${anonId}`;
    fieldsAnonymized.push('nomeCompleto');
  }

  // ─── Execute with audit trail ───
  const result = await auditedOperation(
    'ANONYMIZE',
    'student',
    studentId,
    { ...currentData, _reason: reason } as Record<string, unknown>,
    async () => {
      if (useMock()) {
        await mockDelay(500);
        return anonymizedData as Record<string, unknown>;
      }

      const { data } = await apiClient.post<SensitivePersonalData>(
        `/lgpd/anonymize/${studentId}`,
        { anonymizedData, reason }
      );
      return data as Record<string, unknown>;
    }
  );

  return {
    success: true,
    studentId,
    fieldsAnonymized,
    auditLogId: result.auditLogId,
    pedagogicalDataPreserved: true,
  };
}

// ============================================================
// DATA EXPORT (direito do titular — LGPD Art. 18)
// ============================================================

/**
 * Exporta todos os dados de um usuário (LGPD Art. 18, V).
 * Retorna JSON com todos os dados pessoais e pedagógicos.
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  if (useMock()) {
    await mockDelay(800);
    return {
      _meta: {
        exportedAt: new Date().toISOString(),
        userId,
        format: 'JSON',
        lgpdArticle: 'Art. 18, V — Portabilidade de dados',
      },
      personalData: {
        note: 'Dados pessoais do mock (desenvolvimento)',
      },
      pedagogicalData: {
        note: 'Dados pedagógicos seriam incluídos aqui',
      },
      attendanceHistory: {
        note: 'Histórico de presença seria incluído aqui',
      },
    };
  }

  const { data } = await apiClient.post<Record<string, unknown>>(
    `/lgpd/export/${userId}`
  );
  return data;
}

// ============================================================
// LGPD REQUESTS — Fluxo de solicitação
// ============================================================

/**
 * Cria solicitação LGPD (exportação, anonimização, ou exclusão).
 * Requer aprovação de ADMIN antes de executar.
 */
export async function createRequest(
  type: LGPDRequest['type'],
  userId: string,
  reason: string
): Promise<LGPDRequest> {
  const request: LGPDRequest = {
    type,
    userId,
    reason,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };

  if (useMock()) {
    await mockDelay(300);
    return { ...request };
  }

  const { data } = await apiClient.post<LGPDRequest>('/lgpd/requests', request);
  return data;
}

/**
 * Lista solicitações LGPD (apenas ADMIN).
 */
export async function listRequests(params: {
  page?: number;
  limit?: number;
  status?: LGPDRequest['status'];
} = {}): Promise<PaginatedResponse<LGPDRequest>> {
  if (useMock()) {
    await mockDelay(200);
    return {
      data: [],
      total: 0,
      page: params.page || 1,
      pageSize: params.limit || 20,
      totalPages: 0,
    };
  }

  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null) sp.set(k, String(v)); });
  const { data } = await apiClient.get<PaginatedResponse<LGPDRequest>>(
    `/lgpd/requests?${sp.toString()}`
  );
  return data;
}

/**
 * Aprova e executa solicitação LGPD.
 * Apenas ADMIN pode aprovar.
 */
export async function approveRequest(
  requestId: string
): Promise<LGPDRequest> {
  if (useMock()) {
    await mockDelay(500);
    return {
      type: 'anonymize',
      userId: 'mock',
      reason: 'Solicitação do titular',
      requestedAt: new Date().toISOString(),
      approvedBy: 'admin',
      completedAt: new Date().toISOString(),
      status: 'completed',
    };
  }

  const { data } = await apiClient.patch<LGPDRequest>(
    `/lgpd/requests/${requestId}/approve`
  );
  return data;
}

// ============================================================
// DETECTION — Verifica se dado está anonimizado
// ============================================================

/** Verifica se um campo contém dado anonimizado */
export function isAnonymized(value: string | undefined): boolean {
  if (!value) return false;
  return (
    value === ANONYMIZED_VALUES.telefone ||
    value === ANONYMIZED_VALUES.endereco ||
    value.startsWith('HASH_') ||
    value.endsWith(ANONYMIZED_VALUES.emailDomain) ||
    value.startsWith(ANONYMIZED_VALUES.nomePrefix)
  );
}
