/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PERSON IDENTITY — Identidade global separada de participante ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  participantId = inscrição em uma trilha específica            ║
 * ║  personId      = pessoa física (existe antes da matrícula)     ║
 * ║                                                                 ║
 * ║  Uma pessoa pode ter múltiplos participantIds:                 ║
 * ║  • João participa de BJJ (participant_bjj_123)                 ║
 * ║  • João participa de Muay Thai (participant_mt_456)            ║
 * ║  • Ambos ligados a personId "person_joao_789"                  ║
 * ║                                                                 ║
 * ║  personId é usado para:                                         ║
 * ║  • LGPD (anonimizar TUDO de uma pessoa)                        ║
 * ║  • Login (uma conta, múltiplas matrículas)                      ║
 * ║  • Certificados (emitidos para pessoa, não para matrícula)     ║
 * ║  • Financeiro (cobrança por pessoa)                             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ISODateTime } from '../shared/kernel';
import { utcNow } from '../shared/time';

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

/** ID global da pessoa (branded type) */
export type PersonId = string & { readonly __brand: 'PersonId' };

/**
 * Identidade da pessoa — dados pessoais (PII).
 * Separada do domínio pedagógico.
 */
export interface PersonIdentity {
  id: PersonId;

  /** Nome completo */
  fullName: string;

  /** Nome social (se diferente) */
  displayName?: string;

  /** Email (nullable — crianças podem não ter) */
  email?: string;

  /** Telefone */
  phone?: string;

  /** CPF (nullable — estrangeiros) */
  document?: string;

  /** Data de nascimento */
  birthDate?: string;

  /** IDs dos participantes vinculados */
  participantIds: string[];

  /** ID do responsável (para menores) */
  guardianPersonId?: PersonId;

  /** Status LGPD */
  dataStatus: 'active' | 'anonymized' | 'deletion_requested';

  /** Quando dados foram anonimizados */
  anonymizedAt?: ISODateTime;

  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// ════════════════════════════════════════════════════════════════════
// LGPD — Política de anonimização
// ════════════════════════════════════════════════════════════════════

/**
 * POLÍTICA LGPD DO BLACKBELT:
 *
 * 1. NUNCA deletar eventos do event_log (são fatos imutáveis).
 *
 * 2. Anonimizar em vez de deletar:
 *    - Nome → "Participante Anônimo"
 *    - Email → null
 *    - Telefone → null
 *    - CPF → null
 *    - Avatar → null
 *
 * 3. Eventos históricos permanecem com participantId,
 *    mas PersonIdentity fica anonimizada.
 *    Snapshot continua funcional (milestone, score, etc.)
 *    mas sem PII.
 *
 * 4. Dados pedagógicos (milestones, competências, streaks)
 *    NÃO são PII e NÃO são anonimizados.
 *
 * 5. O pedido de anonimização gera um evento:
 *    PersonDataAnonymized
 *    → auditorável, rastreável, irreversível.
 */

/**
 * Anonimiza uma PersonIdentity.
 * Preserva ID e dados pedagógicos, remove PII.
 */
export function anonymizePerson(person: PersonIdentity): PersonIdentity {
  return {
    ...person,
    fullName: 'Participante Anônimo',
    displayName: undefined,
    email: undefined,
    phone: undefined,
    document: undefined,
    birthDate: undefined,
    dataStatus: 'anonymized',
    anonymizedAt: utcNow(),
  };
}
