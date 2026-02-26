/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PARTICIPANT — A pessoa no centro do sistema                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Substitui o modelo rígido Aluno / Professor / Responsável     ║
 * ║  por um modelo flexível baseado em papéis (roles).             ║
 * ║                                                                 ║
 * ║  A mesma pessoa pode ter MÚLTIPLOS papéis em UMA unidade:      ║
 * ║  • João é "Aluno" de BJJ e "Instrutor" de Kids                ║
 * ║  • Maria é "Participante" de Pilates e "Responsável" de Pedro ║
 * ║                                                                 ║
 * ║  A mesma pessoa pode participar de MÚLTIPLAS unidades:         ║
 * ║  • Ana treina na unidade Centro e na unidade Zona Sul          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  ParticipantId, UnitId, TrackId, InstructorId,
  OperationalStatus, VisualIdentity, LocalizedText,
  TenantScoped, Auditable, ISODate, ISODateTime,
} from '../shared/kernel';
import type { ProgressState } from '../development/track';
import type { AchievementAwarded } from '../recognition/recognition';

// ════════════════════════════════════════════════════════════════════
// PARTICIPANT — Entidade central
// ════════════════════════════════════════════════════════════════════

/**
 * Participant — Uma pessoa vinculada a uma unidade.
 *
 * Não é "Aluno". Não é "Professor". É uma Pessoa que tem papéis.
 * O papel determina o que ela pode fazer, não quem ela é.
 */
export interface Participant extends TenantScoped, Auditable {
  id: ParticipantId;

  /** Dados pessoais básicos */
  profile: ParticipantProfile;

  /** Papéis nesta unidade */
  roles: ParticipantRole[];

  /** Status operacional */
  status: OperationalStatus;

  /** Perfil de audiência (ex: "Adulto", "Kids", "Gestante") */
  audienceProfileId: string;

  /** Estado de progressão em cada trilha ativa */
  progressStates: ProgressState[];

  /** Conquistas recebidas */
  achievements: AchievementAwarded[];

  /** Vínculos familiares (responsáveis ↔ dependentes) */
  familyLinks: FamilyLink[];

  /** Dados estendidos (configuráveis por segmento) */
  extendedFields: Record<string, unknown>;

  /** Preferências do participante */
  preferences: ParticipantPreferences;
}

// ════════════════════════════════════════════════════════════════════
// PROFILE — Dados pessoais
// ════════════════════════════════════════════════════════════════════

export interface ParticipantProfile {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  birthDate?: ISODate;
  document?: string;
}

// ════════════════════════════════════════════════════════════════════
// ROLES — Papéis do participante
// ════════════════════════════════════════════════════════════════════

/**
 * Papel do participante na unidade.
 *
 * O papel é atribuído, não herdado. Uma pessoa pode acumular papéis.
 * Os papéis são a base do controle de acesso (RBAC).
 */
export type RoleType =
  | 'learner'           // Quem participa e aprende (aluno)
  | 'instructor'        // Quem conduz sessões (professor/instrutor)
  | 'guardian'          // Responsável por menor
  | 'manager'           // Gestor operacional
  | 'owner'             // Dono da unidade (CEO)
  | 'platform_admin';   // Admin da plataforma BlackBelt

export interface ParticipantRole {
  type: RoleType;

  /** Data de início do papel */
  since: ISODate;

  /** Papel está ativo? */
  active: boolean;

  /** Permissões extras (além das padrão do papel) */
  additionalPermissions?: string[];

  /** Metadata específica do papel */
  metadata?: RoleMetadata;
}

/**
 * Metadata específica por tipo de papel.
 *
 * Learner pode ter: turmas, plano financeiro
 * Instructor pode ter: especialidades, comissão
 * Guardian pode ter: dependentes
 */
export type RoleMetadata =
  | LearnerMetadata
  | InstructorMetadata
  | GuardianMetadata;

export interface LearnerMetadata {
  kind: 'learner';
  /** IDs das turmas/grupos que participa */
  groupIds: string[];
  /** Data de matrícula */
  enrollmentDate: ISODate;
  /** Plano/assinatura */
  subscriptionId?: string;
}

export interface InstructorMetadata {
  kind: 'instructor';
  /** Especialidades/competências que pode avaliar */
  specialties: string[];
  /** Comissão (%) */
  commissionRate?: number;
  /** Trilhas que pode administrar */
  managedTrackIds: TrackId[];
}

export interface GuardianMetadata {
  kind: 'guardian';
  /** IDs dos dependentes */
  dependentIds: ParticipantId[];
  /** Pode autorizar check-in remoto? */
  canRemoteCheckin: boolean;
}

// ════════════════════════════════════════════════════════════════════
// FAMILY LINKS — Vínculos familiares
// ════════════════════════════════════════════════════════════════════

export interface FamilyLink {
  /** ID do outro participante */
  relatedParticipantId: ParticipantId;
  /** Tipo de relação */
  relationship: 'guardian_of' | 'dependent_of' | 'sibling';
  /** Desde quando */
  since: ISODate;
}

// ════════════════════════════════════════════════════════════════════
// PREFERENCES
// ════════════════════════════════════════════════════════════════════

export interface ParticipantPreferences {
  /** Recebe notificações push? */
  pushNotifications: boolean;
  /** Recebe emails de comunicação? */
  emailNotifications: boolean;
  /** Tema visual preferido */
  themePreference: 'light' | 'dark' | 'system';
  /** Idioma preferido */
  locale?: string;
}

// ════════════════════════════════════════════════════════════════════
// PUBLIC PROFILE — Perfil público (compartilhável)
// ════════════════════════════════════════════════════════════════════

/**
 * Perfil público — versão segura para compartilhamento.
 * Sem dados sensíveis.
 */
export interface PublicProfile {
  id: ParticipantId;
  name: string;
  avatar?: string;
  unitName: string;

  /** Estado resumido em cada trilha ativa */
  tracks: {
    trackName: string;
    currentMilestoneName: string;
    milestoneVisual: VisualIdentity;
    sublevels: number;
    monthsActive: number;
  }[];

  /** Total de métricas */
  totalSessions: number;
  totalAchievements: number;
  memberSince: ISODate;

  /** Link público compartilhável */
  publicUrl: string;
}
