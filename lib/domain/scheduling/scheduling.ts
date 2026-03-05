/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SCHEDULING — Sessões, Grupos e Presença                      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  O agendamento é agnóstico de segmento.                        ║
 * ║                                                                 ║
 * ║  Uma "Sessão" é qualquer encontro estruturado:                 ║
 * ║  • BJJ:     Aula de Fundamentos                                ║
 * ║  • Dança:   Ensaio de Contemporâneo                            ║
 * ║  • Pilates: Sessão de Solo                                     ║
 * ║  • Música:  Aula de Violão                                     ║
 * ║                                                                 ║
 * ║  Um "Grupo" é um conjunto recorrente de sessões:               ║
 * ║  • BJJ:     Turma Adulto Manhã                                  ║
 * ║  • Dança:   Turma Ballet Avançado                               ║
 * ║  • Pilates: Grupo Mat 19h                                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  SessionId, TrackId,
  TenantScoped, Auditable, LifecycleStatus, ISODateTime, DurationMinutes,
} from '../shared/kernel';

// ════════════════════════════════════════════════════════════════════
// GROUP — Turma / Grupo recorrente
// ════════════════════════════════════════════════════════════════════

/**
 * Group — Agrupamento recorrente de sessões.
 *
 * Substitui a "Turma" com tipagem fixa.
 * Um grupo pode estar vinculado a uma trilha de desenvolvimento
 * ou ser independente (grupo social, aula avulsa).
 */
export interface Group extends TenantScoped, Auditable {
  id: string;

  /** Nome ("Adulto Fundamentos", "Ballet Avançado", "Mat Pilates 19h") */
  name: string;

  /** Descrição */
  description?: string;

  /** Status */
  status: LifecycleStatus;

  /** Trilha de desenvolvimento associada (opcional) */
  trackId?: TrackId;

  /** Perfil de audiência associado */
  audienceProfileId: string;

  /** Instrutor(es) responsável(eis) */
  instructorIds: string[];

  /** Espaço onde acontece */
  spaceId?: string;

  /** Horários recorrentes */
  schedule: RecurringSchedule[];

  /** Capacidade máxima (0 = sem limite) */
  maxCapacity: number;

  /** Participantes inscritos */
  enrolledParticipantIds: string[];
}

export interface RecurringSchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // "19:00"
  endTime: string;   // "20:30"
}

// ════════════════════════════════════════════════════════════════════
// SESSION — Sessão individual
// ════════════════════════════════════════════════════════════════════

/**
 * Session — Uma ocorrência individual de atividade.
 *
 * Pode ser:
 * • Uma aula de uma turma (vinculada a um grupo)
 * • Uma sessão avulsa (workshop, evento especial)
 * • Uma sessão particular (1-on-1)
 */
export interface Session extends TenantScoped, Auditable {
  id: SessionId;

  /** Grupo de origem (se for sessão recorrente) */
  groupId?: string;

  /** Trilha associada (herdada do grupo ou definida diretamente) */
  trackId?: TrackId;

  /** Título da sessão */
  title: string;

  /** Descrição / plano da sessão */
  description?: string;

  /** Instrutor que conduziu */
  instructorId: string;

  /** Espaço onde acontece */
  spaceId?: string;

  /** Data e hora de início */
  startDateTime: ISODateTime;

  /** Duração em minutos */
  durationMinutes: DurationMinutes;

  /** Tipo de sessão */
  type: SessionType;

  /** Status */
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  /** Plano da sessão (conteúdo pedagógico) */
  plan?: SessionPlan;

  /** Registros de presença */
  attendance: AttendanceRecord[];
}

export type SessionType =
  | 'regular'     // Sessão normal do grupo
  | 'private'     // Particular (1-on-1)
  | 'workshop'    // Workshop / Evento especial
  | 'evaluation'  // Sessão de avaliação
  | 'open'        // Sessão aberta (sem grupo fixo)
  | 'trial';      // Aula experimental

// ════════════════════════════════════════════════════════════════════
// SESSION PLAN — Planejamento pedagógico da sessão
// ════════════════════════════════════════════════════════════════════

/**
 * Plano de sessão — Estrutura pedagógica.
 *
 * As fases e atividades são CONFIGURÁVEIS pelo instrutor.
 * Não existe "aquecimento → técnica → sparring" hardcoded.
 *
 * Cada segmento pode ter templates de fases diferentes:
 * BJJ:     Aquecimento → Técnica → Drill → Sparring → Alongamento
 * Dança:   Aquecimento → Barra → Centro → Diagonal → Coreografia
 * Pilates: Centramento → Série → Progressão → Relaxamento
 */
export interface SessionPlan {
  /** Fases da sessão (ordem de execução) */
  phases: SessionPhase[];

  /** Notas gerais do instrutor */
  notes?: string;

  /** Competências trabalhadas nesta sessão */
  targetCompetencyIds: string[];
}

export interface SessionPhase {
  id: string;

  /** Nome da fase ("Aquecimento", "Barra", "Centramento") */
  name: string;

  /** Duração planejada em minutos */
  durationMinutes: number;

  /** Atividades dentro da fase */
  activities: SessionActivity[];
}

export interface SessionActivity {
  id: string;

  /** Nome da atividade ("Guarda Fechada", "Plié", "Roll Up") */
  name: string;

  /** Descrição / instrução */
  description?: string;

  /** Competência associada (para tracking) */
  competencyId?: string;

  /** Nível mínimo sugerido */
  suggestedMilestoneId?: string;
}

// ════════════════════════════════════════════════════════════════════
// ATTENDANCE — Registro de presença
// ════════════════════════════════════════════════════════════════════

/**
 * Registro de presença — participante X sessão.
 *
 * O check-in é agnóstico: pode ser QR, manual, biometria, app.
 * O sistema apenas registra que a pessoa esteve presente.
 */
export interface AttendanceRecord {
  participantId: string;
  participantName: string;
  participantAvatar?: string;

  /** Método usado para registrar presença */
  method: CheckinMethod;

  /** Status do registro */
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';

  /** Horário do check-in */
  checkinTime: ISODateTime;

  /** Quem validou (se manual ou guardian) */
  validatedBy?: string;
}

export type CheckinMethod = 'QR' | 'MANUAL' | 'BIOMETRIC' | 'APP' | 'GUARDIAN_REMOTE';

// ════════════════════════════════════════════════════════════════════
// PRIVATE SESSION — Sessão particular
// ════════════════════════════════════════════════════════════════════

/**
 * Configuração de sessão particular.
 * Estende Session com dados específicos de agendamento 1-on-1.
 */
export interface PrivateSessionConfig {
  /** Participante(s) da sessão */
  participantIds: string[];

  /** Recorrência */
  recurrence: 'once' | 'weekly' | 'biweekly';

  /** Valor cobrado */
  price: number;

  /** Duração padrão */
  defaultDuration: 30 | 45 | 60 | 90;
}
