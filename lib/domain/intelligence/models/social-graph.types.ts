/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SOCIAL GRAPH TYPES — Retenção por Vínculos Sociais             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Grafo social do aluno: conexões, métricas de rede e alertas.   ║
 * ║  Vínculos fortes aumentam retenção; perda de bonds = risco.     ║
 * ║  Sem side effects. Sem imports de infra.                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  Score0to100,
  CommunityRole,
  IntelligenceMetadata,
} from '../core/types';

// ════════════════════════════════════════════════════════════════════
// SOCIAL PROFILE — Output principal do engine
// ════════════════════════════════════════════════════════════════════

export interface SocialProfile {
  participantId: string;

  // ── Conexões ────────────────────────────────────────────
  connections: SocialConnection[];

  // ── Métricas sociais ────────────────────────────────────
  metrics: SocialMetrics;

  // ── Alerta de risco social ──────────────────────────────
  alerts: SocialAlert[];

  // ── Metadados ───────────────────────────────────────────
  metadata: IntelligenceMetadata;
}

// ════════════════════════════════════════════════════════════════════
// CONEXÃO SOCIAL
// ════════════════════════════════════════════════════════════════════

export interface SocialConnection {
  participantId: string;
  name: string;

  /** Força da conexão 0-100 (baseado em co-ocorrência de check-ins) */
  strength: Score0to100;

  /** Quantas turmas em comum */
  sharedClasses: number;

  /** Quantas sessões treinaram juntos */
  sharedSessions: number;

  /** Se o colega ainda está ativo */
  isActive: boolean;
}

// ════════════════════════════════════════════════════════════════════
// MÉTRICAS SOCIAIS
// ════════════════════════════════════════════════════════════════════

export interface SocialMetrics {
  /** Total de conexões significativas (strength > 30) */
  networkSize: number;

  /** Conexões com strength > 70 */
  strongBonds: number;

  /** 0-100 (se bonds principais saírem → risco) */
  socialRetentionRisk: Score0to100;

  /** Papel do aluno na comunidade */
  communityRole: CommunityRole;
}

// ════════════════════════════════════════════════════════════════════
// ALERTA SOCIAL
// ════════════════════════════════════════════════════════════════════

export interface SocialAlert {
  /** Tipo do alerta */
  type: SocialAlertType;

  /** Severidade */
  severity: 'high' | 'medium' | 'low';

  /** Descrição do alerta */
  description: string;

  /** Ação sugerida */
  suggestedAction: string;
}

// ════════════════════════════════════════════════════════════════════
// TIPOS DE ALERTA SOCIAL
// ════════════════════════════════════════════════════════════════════

export type SocialAlertType =
  | 'bond_churned'        // Amigo próximo saiu da academia
  | 'group_declining'     // Grupo do aluno está todo declining
  | 'isolated'            // Aluno sem conexões significativas
  | 'influencer_at_risk'; // Influencer em risco → pode levar outros
