/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SOCIAL GRAPH — Análise de Vínculos e Retenção Social           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function — ZERO side effects.                             ║
 * ║  Mapeia o grafo social do aluno a partir de co-presenças.       ║
 * ║  Calcula força de conexões, papel comunitário e alertas.        ║
 * ║                                                                 ║
 * ║  Input:  SocialGraphInput (co-presenças + contexto)             ║
 * ║  Output: SocialProfile (conexões + métricas + alertas)          ║
 * ║                                                                 ║
 * ║  Vínculo social é o maior preditor de retenção.                 ║
 * ║  Aluno sem bonds fortes = 2x mais chance de churn.              ║
 * ║                                                                 ║
 * ║  Testável sem banco. Determinístico.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  SocialProfile,
  SocialConnection,
  SocialMetrics,
  SocialAlert,
} from '../models/social-graph.types';
import type { CommunityRole, Score0to100 } from '../core/types';
import {
  clampScore,
  safeDivide,
} from '../core/scoring-utils';
import { calculateConfidence } from '../core/confidence-calculator';

// ════════════════════════════════════════════════════════════════════
// INPUT TYPE
// ════════════════════════════════════════════════════════════════════

export interface SocialGraphInput {
  participantId: string;
  participantName: string;

  /** Co-presença: quem treinou junto e quantas vezes */
  coAttendances: {
    partnerId: string;
    partnerName: string;
    count: number;
    lastDate: string;
    isActive: boolean;         // se o parceiro ainda frequenta
    sharedClasses: number;     // turmas em comum
  }[];

  /** Total de check-ins do participante */
  totalCheckins: number;

  /** IDs de turmas que frequenta */
  classesAttended: string[];

  /** Dias desde matrícula */
  daysSinceEnrollment: number;

  /** Engagement score (do engagement-scorer) */
  engagementScore: Score0to100;

  /** Churn risk (do churn-engine) */
  churnRisk: Score0to100;
}

// ════════════════════════════════════════════════════════════════════
// STRENGTH THRESHOLDS
// ════════════════════════════════════════════════════════════════════

const STRONG_BOND_THRESHOLD = 70;
const SIGNIFICANT_CONNECTION_THRESHOLD = 30;

// ════════════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ════════════════════════════════════════════════════════════════════

/**
 * Constrói o perfil social de um participante a partir de co-presenças.
 *
 * @param input - Dados de co-presença, check-ins e contexto
 * @returns SocialProfile com conexões, métricas, papel e alertas
 */
export function buildSocialProfile(input: SocialGraphInput): SocialProfile {
  // ── Build connection list ───────────────────────────────────
  const connections = buildConnections(input);

  // ── Compute social metrics ──────────────────────────────────
  const metrics = computeSocialMetrics(connections, input);

  // ── Generate alerts ─────────────────────────────────────────
  const alerts = generateAlerts(connections, metrics, input);

  // ── Confidence ──────────────────────────────────────────────
  const confidence = calculateConfidence(
    input.coAttendances.length + (input.totalCheckins > 0 ? 1 : 0),
    Math.max(5, input.coAttendances.length) + 1, // expect at least 5 co-attendances
    input.daysSinceEnrollment,
    input.totalCheckins,
  );

  return {
    participantId: input.participantId,
    connections,
    metrics,
    alerts,
    metadata: {
      computedAt: new Date().toISOString(),
      confidence,
      dataPoints: input.totalCheckins,
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// CONNECTION BUILDING
// ════════════════════════════════════════════════════════════════════

function buildConnections(input: SocialGraphInput): SocialConnection[] {
  if (input.coAttendances.length === 0) return [];

  const maxCoAttendance = Math.max(...input.coAttendances.map(ca => ca.count));

  return input.coAttendances
    .map(ca => ({
      participantId: ca.partnerId,
      name: ca.partnerName,
      strength: computeConnectionStrength(ca.count, maxCoAttendance, input.totalCheckins),
      sharedClasses: ca.sharedClasses,
      sharedSessions: ca.count,
      isActive: ca.isActive,
    }))
    .sort((a, b) => b.strength - a.strength);
}

/**
 * Computa a força de uma conexão (0-100).
 *
 * Baseado em:
 * - Frequência de co-presença relativa ao máximo (40%)
 * - Frequência de co-presença relativa ao total de check-ins (30%)
 * - Valor absoluto de co-presenças (30%)
 */
function computeConnectionStrength(
  coCount: number,
  maxCoCount: number,
  totalCheckins: number,
): Score0to100 {
  // Relative to strongest connection
  const relativeScore = safeDivide(coCount, maxCoCount, 0) * 100;

  // Ratio of co-presences to total checkins
  const ratioScore = safeDivide(coCount, totalCheckins, 0) * 100;

  // Absolute: more co-presences = stronger
  // 20+ = 100, 10 = 70, 5 = 50, 1 = 20
  let absoluteScore: number;
  if (coCount >= 20) absoluteScore = 100;
  else if (coCount >= 10) absoluteScore = 70;
  else if (coCount >= 5) absoluteScore = 50;
  else if (coCount >= 3) absoluteScore = 35;
  else absoluteScore = 20;

  return clampScore(
    relativeScore * 0.40 +
    ratioScore * 0.30 +
    absoluteScore * 0.30,
  );
}

// ════════════════════════════════════════════════════════════════════
// SOCIAL METRICS
// ════════════════════════════════════════════════════════════════════

function computeSocialMetrics(
  connections: SocialConnection[],
  input: SocialGraphInput,
): SocialMetrics {
  const significantConnections = connections.filter(
    c => c.strength >= SIGNIFICANT_CONNECTION_THRESHOLD,
  );
  const strongBonds = connections.filter(
    c => c.strength >= STRONG_BOND_THRESHOLD,
  );

  const networkSize = significantConnections.length;

  // Social retention risk: higher if strong bonds are inactive
  const socialRetentionRisk = computeSocialRetentionRisk(strongBonds, connections, input);

  // Community role
  const communityRole = classifyCommunityRole(connections, input);

  return {
    networkSize,
    strongBonds: strongBonds.length,
    socialRetentionRisk,
    communityRole,
  };
}

/**
 * Computa risco de retenção social (0-100).
 * Alto risco = os principais vínculos estão inativos ou saindo.
 */
function computeSocialRetentionRisk(
  strongBonds: SocialConnection[],
  allConnections: SocialConnection[],
  input: SocialGraphInput,
): Score0to100 {
  // No connections at all = high risk
  if (allConnections.length === 0) return 85;

  // No strong bonds = moderate-high risk
  if (strongBonds.length === 0) return 70;

  // Count inactive strong bonds
  const inactiveStrongBonds = strongBonds.filter(c => !c.isActive);
  const inactiveRatio = safeDivide(inactiveStrongBonds.length, strongBonds.length, 0);

  // Base risk from inactive strong bonds
  let risk = inactiveRatio * 80;

  // Adjust by total network size (more connections = more resilient)
  if (allConnections.length >= 5) risk *= 0.8;
  if (allConnections.length >= 10) risk *= 0.7;

  // Adjust by churn risk (already at risk = social risk matters more)
  if (input.churnRisk > 60) risk += 15;

  return clampScore(risk);
}

// ════════════════════════════════════════════════════════════════════
// COMMUNITY ROLE CLASSIFICATION
// ════════════════════════════════════════════════════════════════════

function classifyCommunityRole(
  connections: SocialConnection[],
  input: SocialGraphInput,
): CommunityRole {
  // Newcomer: < 60 days
  if (input.daysSinceEnrollment < 60) return 'newcomer';

  const significantConnections = connections.filter(
    c => c.strength >= SIGNIFICANT_CONNECTION_THRESHOLD,
  );
  const strongBonds = connections.filter(
    c => c.strength >= STRONG_BOND_THRESHOLD,
  );

  // Solo: no significant connections after 60 days
  if (significantConnections.length === 0) return 'solo';

  // Connector: many connections across different classes
  const distinctClasses = new Set(connections.filter(
    c => c.strength >= SIGNIFICANT_CONNECTION_THRESHOLD,
  ).map(c => c.sharedClasses)).size;

  if (significantConnections.length >= 8 && distinctClasses >= 2) {
    return 'connector';
  }

  // Influencer: high engagement + many strong bonds
  if (strongBonds.length >= 3 && input.engagementScore >= 80) {
    return 'influencer';
  }

  // Loyalist: few but very strong connections
  if (strongBonds.length >= 1 && strongBonds.length <= 3 && significantConnections.length <= 5) {
    return 'loyalist';
  }

  // Default: connector if many connections, loyalist if few
  if (significantConnections.length >= 5) return 'connector';
  return 'loyalist';
}

// ════════════════════════════════════════════════════════════════════
// ALERT GENERATION
// ════════════════════════════════════════════════════════════════════

function generateAlerts(
  connections: SocialConnection[],
  metrics: SocialMetrics,
  input: SocialGraphInput,
): SocialAlert[] {
  const alerts: SocialAlert[] = [];

  // ── Isolation alert ─────────────────────────────────────────
  if (metrics.networkSize === 0 && input.daysSinceEnrollment > 60) {
    alerts.push({
      type: 'isolated',
      severity: 'high',
      description: `Aluno sem conexões significativas após ${input.daysSinceEnrollment} dias de matrícula`,
      suggestedAction: 'Incluir em atividades de grupo. Apresentar a colegas com perfil similar.',
    });
  }

  // ── Bond churned alert ──────────────────────────────────────
  const strongBonds = connections.filter(c => c.strength >= STRONG_BOND_THRESHOLD);
  const churnedBonds = strongBonds.filter(c => !c.isActive);

  if (churnedBonds.length > 0) {
    const names = churnedBonds.map(c => c.name).slice(0, 3).join(', ');
    alerts.push({
      type: 'bond_churned',
      severity: churnedBonds.length >= 2 ? 'high' : 'medium',
      description: `${churnedBonds.length} colega(s) próximo(s) saiu(ram) da academia: ${names}`,
      suggestedAction: 'Conectar com novos colegas de nível similar. Monitorar engajamento.',
    });
  }

  // ── Group declining alert ───────────────────────────────────
  // If most connections are in drifting/disconnected status
  const significantConnections = connections.filter(
    c => c.strength >= SIGNIFICANT_CONNECTION_THRESHOLD,
  );
  const inactiveConnections = significantConnections.filter(c => !c.isActive);

  if (
    significantConnections.length >= 3 &&
    inactiveConnections.length >= significantConnections.length * 0.5
  ) {
    alerts.push({
      type: 'group_declining',
      severity: 'high',
      description: 'Maioria do grupo social deste aluno está inativa ou em declínio',
      suggestedAction: 'Apresentar a turmas/horários com comunidade mais ativa.',
    });
  }

  // ── Influencer at risk alert ────────────────────────────────
  if (metrics.communityRole === 'influencer' && input.churnRisk > 50) {
    alerts.push({
      type: 'influencer_at_risk',
      severity: 'high',
      description: `Aluno influenciador com risco de evasão de ${input.churnRisk}% — pode impactar ${metrics.strongBonds} conexões fortes`,
      suggestedAction: 'Atenção especial — retenção deste aluno impacta toda a rede social.',
    });
  }

  // ── Low social retention risk but declining engagement ──────
  if (
    metrics.socialRetentionRisk > 60 &&
    input.engagementScore < 60 &&
    alerts.length === 0
  ) {
    alerts.push({
      type: 'group_declining',
      severity: 'medium',
      description: 'Risco social elevado combinado com engajamento baixo',
      suggestedAction: 'Fortalecer vínculos — incluir em atividades de grupo e desafios em equipe.',
    });
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}
