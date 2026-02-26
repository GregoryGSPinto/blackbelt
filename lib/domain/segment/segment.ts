/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SEGMENT — O contexto de negócio da unidade                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Cada unidade pertence a um segmento. O segmento determina:    ║
 * ║  • Quais módulos estão disponíveis                              ║
 * ║  • Qual modelo de progressão padrão                             ║
 * ║  • Quais campos de perfil são relevantes                        ║
 * ║  • Qual vocabulário é usado na UI                               ║
 * ║  • Quais emojis/ícones representam o domínio                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type {
  SegmentId, VisualIdentity, LocalizedText,
} from '../shared/kernel';
import type { ProgressionModel } from '../development/track';

// ════════════════════════════════════════════════════════════════════
// SEGMENT TYPE
// ════════════════════════════════════════════════════════════════════

/**
 * Tipos de segmento suportados pela plataforma.
 *
 * Cada segmento é um "template" de configuração.
 * A unidade pode customizar a partir do template.
 */
export type SegmentType =
  | 'martial_arts'    // BJJ, Karate, Judô, MMA
  | 'dance'           // Ballet, Forró, Sertanejo, Contemporâneo
  | 'pilates'         // Pilates, Yoga
  | 'fitness'         // Musculação, CrossFit, Funcional
  | 'self_defense'    // Krav Maga, Defesa pessoal
  | 'education'       // Cursos livres, Escolas técnicas
  | 'music'           // Instrumentos, Canto, Teoria
  | 'custom';         // Configuração totalmente livre

// ════════════════════════════════════════════════════════════════════
// SEGMENT DEFINITION
// ════════════════════════════════════════════════════════════════════

/**
 * Definição completa de um segmento.
 *
 * O segmento é o "DNA" do negócio — define como tudo funciona.
 * Não é um registro de banco de dados: é uma configuração
 * que pode ser padrão (da plataforma) ou customizada (pela unidade).
 */
export interface SegmentDefinition {
  id: SegmentId;
  type: SegmentType;

  /** Nome exibido ("Artes Marciais", "Dança", etc.) */
  displayName: LocalizedText;

  /** Descrição curta */
  description: LocalizedText;

  /** Identidade visual padrão do segmento */
  visual: VisualIdentity;

  /** Modelo de progressão padrão para novas trilhas */
  defaultProgressionModel: ProgressionModel;

  /** Módulos habilitados */
  enabledModules: SegmentModuleConfig;

  /** Vocabulário do domínio — mapeia termos genéricos para termos do segmento */
  vocabulary: SegmentVocabulary;

  /** Campos de perfil do participante relevantes para este segmento */
  profileFields: ProfileFieldConfig[];

  /** Categorias de audiência (faixas etárias ou níveis de experiência) */
  audienceProfiles: AudienceProfile[];

  /** Tipos de evento disponíveis */
  eventTypes: EventTypeConfig[];
}

// ════════════════════════════════════════════════════════════════════
// MODULES — O que está ligado/desligado por segmento
// ════════════════════════════════════════════════════════════════════

/**
 * Cada módulo pode ser: habilitado, desabilitado, ou opcional (admin liga/desliga).
 */
export type ModuleAvailability = 'enabled' | 'disabled' | 'optional';

export interface SegmentModuleConfig {
  /** Trilhas de desenvolvimento / graduação */
  progression: ModuleAvailability;

  /** Gamificação (pontos, ranking, streaks) */
  gamification: ModuleAvailability;

  /** Carteirinha digital */
  digitalCard: ModuleAvailability;

  /** Eventos/Campeonatos */
  events: ModuleAvailability;

  /** Biblioteca de conteúdo (vídeos, materiais) */
  contentLibrary: ModuleAvailability;

  /** Loja/PDV */
  shop: ModuleAvailability;

  /** Plano de sessão (planejamento pedagógico) */
  sessionPlanning: ModuleAvailability;

  /** Cronômetro de atividade */
  activityTimer: ModuleAvailability;

  /** Aulas particulares */
  privateSessions: ModuleAvailability;

  /** CRM / Leads */
  crm: ModuleAvailability;

  /** Financeiro avançado */
  finance: ModuleAvailability;

  /** Comunicações / Mensagens */
  communications: ModuleAvailability;

  /** Relatórios */
  reports: ModuleAvailability;
}

// ════════════════════════════════════════════════════════════════════
// VOCABULÁRIO — A pele linguística do segmento
// ════════════════════════════════════════════════════════════════════

/**
 * Vocabulário do segmento.
 *
 * Permite que a UI fale a língua do negócio sem hardcodar termos.
 * Cada chave é um conceito genérico da plataforma.
 * Cada valor é como esse conceito é chamado no segmento.
 *
 * Exemplo BJJ:      session → "Aula",    milestone → "Faixa"
 * Exemplo Dança:    session → "Ensaio",  milestone → "Nível"
 * Exemplo Pilates:  session → "Sessão",  milestone → "Estágio"
 */
export interface SegmentVocabulary {
  /** O que chamam de sessão de prática */
  session: LocalizedText;
  sessionPlural: LocalizedText;

  /** O que chamam de nível/marco de progressão */
  milestone: LocalizedText;
  milestonePlural: LocalizedText;

  /** O que chamam de subnível/grau dentro do milestone */
  submilestone: LocalizedText;
  submilestonePlural: LocalizedText;

  /** O que chamam de instrutor/professor */
  instructor: LocalizedText;
  instructorPlural: LocalizedText;

  /** O que chamam de participante/aluno */
  participant: LocalizedText;
  participantPlural: LocalizedText;

  /** O que chamam do espaço físico/sala */
  space: LocalizedText;
  spacePlural: LocalizedText;

  /** O que chamam da unidade/local */
  unit: LocalizedText;
  unitPlural: LocalizedText;

  /** O que chamam de conquista/medalha */
  achievement: LocalizedText;
  achievementPlural: LocalizedText;

  /** O que chamam de competência/técnica */
  competency: LocalizedText;
  competencyPlural: LocalizedText;

  /** O que chamam de evento/campeonato */
  event: LocalizedText;
  eventPlural: LocalizedText;

  /** Emoji padrão do segmento (ícone principal) */
  emoji: string;
}

// ════════════════════════════════════════════════════════════════════
// PROFILE FIELDS — Campos do perfil que variam por segmento
// ════════════════════════════════════════════════════════════════════

export interface ProfileFieldConfig {
  /** Identificador do campo */
  key: string;

  /** Label para a UI */
  label: LocalizedText;

  /** Tipo de input */
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean' | 'file';

  /** Opções (para select/multiselect) */
  options?: { value: string; label: LocalizedText }[];

  /** Obrigatório no cadastro? */
  required: boolean;

  /** Visível no perfil público? */
  publicVisible: boolean;
}

// ════════════════════════════════════════════════════════════════════
// AUDIENCE PROFILES — Quem participa
// ════════════════════════════════════════════════════════════════════

/**
 * Perfil de audiência — substitui a categoria fixa Kids/Teen/Adulto.
 *
 * Cada segmento define suas próprias audiências.
 * BJJ pode ter: Kids (6-13), Teen (14-17), Adulto (18+)
 * Dança pode ter: Iniciante, Intermediário, Avançado, Profissional
 * Pilates pode ter: Regular, Gestante, Terceira Idade, Clínico
 */
export interface AudienceProfile {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  visual: VisualIdentity;

  /** Faixa etária (opcional — nem todo segmento segmenta por idade) */
  ageRange?: { min: number; max: number };

  /** Requer responsável? */
  requiresGuardian: boolean;

  /** Layout/theme especial? (ex: Kids tem UI lúdica) */
  themeOverride?: string;

  /** Módulos de progresso técnico para esta audiência */
  progressModules: { id: string; name: LocalizedText }[];
}

// ════════════════════════════════════════════════════════════════════
// EVENT TYPES — Tipos de evento por segmento
// ════════════════════════════════════════════════════════════════════

export interface EventTypeConfig {
  id: string;
  name: LocalizedText;
  icon: string;
  /** Requer categorias (peso, nível, etc.)? */
  hasCategorization: boolean;
  /** Requer resultado (ouro/prata/bronze)? */
  hasResults: boolean;
}
