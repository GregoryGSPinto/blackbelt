/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  RECOGNITION — Reconhecimento e Gamificação                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  O reconhecimento é OPCIONAL e CONFIGURÁVEL por unidade.       ║
 * ║  Nem todo segmento quer gamificação.                            ║
 * ║                                                                 ║
 * ║  Três subsistemas independentes:                                ║
 * ║  • Achievements — conquistas por ações ou marcos               ║
 * ║  • Points — sistema de pontos (gamificação)                    ║
 * ║  • Ranking — leaderboard entre participantes                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  AchievementId, UnitId, VisualIdentity, LocalizedText,
  TenantScoped, Auditable, ISODate, ISODateTime,
} from '../shared/kernel';

// ════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS — Conquistas
// ════════════════════════════════════════════════════════════════════

/**
 * Definição de conquista — template configurado pelo admin.
 *
 * Conquistas são genéricas: "Primeiro Check-in", "100 Sessões", "Promoção de Nível".
 * O segmento apenas define quais existem e como são desbloqueadas.
 */
export interface AchievementDefinition extends TenantScoped {
  id: AchievementId;
  name: LocalizedText;
  description: LocalizedText;
  visual: VisualIdentity;
  category: string;

  /** Trigger: o que desbloqueia esta conquista */
  trigger: AchievementTrigger;

  /** Pontos concedidos ao desbloquear (se gamificação ativa) */
  pointsAwarded: number;

  /** Ativa? */
  active: boolean;
}

export type AchievementTrigger =
  | { type: 'first_checkin' }
  | { type: 'sessions_count'; threshold: number }
  | { type: 'streak_days'; threshold: number }
  | { type: 'milestone_reached'; milestoneId: string }
  | { type: 'competency_mastered'; competencyId: string; minScore: number }
  | { type: 'hours_accumulated'; threshold: number }
  | { type: 'items_completed'; threshold: number }
  | { type: 'evaluation_passed'; evaluationType: string }
  | { type: 'event_participation'; eventType?: string }
  | { type: 'event_result'; position: number }
  | { type: 'custom'; key: string; condition: unknown };

/** Conquista concedida a um participante */
export interface AchievementAwarded {
  achievementId: AchievementId;
  participantId: string;
  awardedAt: ISODateTime;
  awardedBy?: string;
}

// ════════════════════════════════════════════════════════════════════
// POINTS — Sistema de Pontos (Gamificação)
// ════════════════════════════════════════════════════════════════════

/**
 * Configuração de gamificação — definida por unidade.
 *
 * O admin liga/desliga e configura as regras de pontos.
 */
export interface GamificationConfig extends TenantScoped {
  /** Gamificação está ativa? */
  enabled: boolean;

  /** Regras de pontuação */
  pointRules: PointRule[];

  /** Ranking está ativo? */
  rankingEnabled: boolean;

  /** Períodos de ranking disponíveis */
  rankingPeriods: RankingPeriod[];
}

export interface PointRule {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;

  /** Quantos pontos por ocorrência */
  points: number;

  /** Trigger que gera pontos */
  trigger: 'checkin' | 'session_complete' | 'achievement' | 'milestone_promotion'
         | 'video_watched' | 'streak_weekly' | 'streak_monthly' | 'first_checkin'
         | 'custom';

  /** Ativa? */
  active: boolean;

  /** Audiências onde se aplica (vazio = todas) */
  applicableAudiences?: string[];
}

export type RankingPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';

// ════════════════════════════════════════════════════════════════════
// RANKING — Estado de ranking do participante
// ════════════════════════════════════════════════════════════════════

export interface RankingEntry {
  participantId: string;
  participantName: string;
  avatar?: string;
  currentMilestoneName: string;
  milestoneVisual: VisualIdentity;

  points: number;
  position: number;
  positionChange: number;

  currentStreak: number;
  audience: string;
}

export interface ParticipantPointsSummary {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentStreak: number;
  bestStreak: number;
  breakdown: { source: string; points: number; count: number }[];
}
