/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SEGMENT PRESETS — Adaptadores de Segmento                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Cada preset é uma CONFIGURAÇÃO, não código.                   ║
 * ║  O Core Engine é o mesmo — o preset define o comportamento.    ║
 * ║                                                                 ║
 * ║  BJJ não é um módulo.                                           ║
 * ║  BJJ é uma configuração do Domain Engine.                      ║
 * ║                                                                 ║
 * ║  Dança não é outro produto.                                     ║
 * ║  Dança é outra configuração do mesmo engine.                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { SegmentDefinition } from './segment';
import type { HexColor, VisualIdentity, LocalizedText } from '../shared/kernel';

// ════════════════════════════════════════════════════════════════════
// HELPER
// ════════════════════════════════════════════════════════════════════

const t = (text: string): LocalizedText => ({ default: text });
const v = (color: HexColor, icon?: string): VisualIdentity => ({
  color, icon,
} as VisualIdentity);

// ════════════════════════════════════════════════════════════════════
// 🥋 MARTIAL ARTS — Artes Marciais (BJJ, Karate, Judô)
// ════════════════════════════════════════════════════════════════════

export const PRESET_MARTIAL_ARTS: SegmentDefinition = {
  id: 'seg_martial_arts' as any,
  type: 'martial_arts',
  displayName: t('Artes Marciais'),
  description: t('Academias de Jiu-Jitsu, Karatê, Judô, MMA e artes marciais em geral'),
  visual: v('#1F2937' as HexColor, '🥋'),
  defaultProgressionModel: 'hierarchical',

  enabledModules: {
    progression: 'enabled',
    gamification: 'enabled',
    digitalCard: 'enabled',
    events: 'enabled',
    contentLibrary: 'enabled',
    shop: 'optional',
    sessionPlanning: 'enabled',
    activityTimer: 'enabled',
    privateSessions: 'enabled',
    crm: 'enabled',
    finance: 'enabled',
    communications: 'enabled',
    reports: 'enabled',
  },

  vocabulary: {
    session:              t('Aula'),
    sessionPlural:        t('Aulas'),
    milestone:            t('Faixa'),
    milestonePlural:      t('Faixas'),
    submilestone:         t('Grau'),
    submilestonePlural:   t('Graus'),
    instructor:           t('Professor'),
    instructorPlural:     t('Professores'),
    participant:          t('Aluno'),
    participantPlural:    t('Alunos'),
    space:                t('Tatame'),
    spacePlural:          t('Tatames'),
    unit:                 t('Academia'),
    unitPlural:           t('Academias'),
    achievement:          t('Medalha'),
    achievementPlural:    t('Medalhas'),
    competency:           t('Técnica'),
    competencyPlural:     t('Técnicas'),
    event:                t('Campeonato'),
    eventPlural:          t('Campeonatos'),
    emoji: '🥋',
  },

  profileFields: [
    { key: 'weight', label: t('Peso'), type: 'number', required: false, publicVisible: true },
    { key: 'modality', label: t('Modalidade'), type: 'multiselect', required: false, publicVisible: true,
      options: [
        { value: 'gi', label: t('Gi') },
        { value: 'nogi', label: t('No-Gi') },
        { value: 'mma', label: t('MMA') },
        { value: 'judo', label: t('Judô') },
      ],
    },
    { key: 'weight_class', label: t('Categoria de Peso'), type: 'select', required: false, publicVisible: true,
      options: [
        { value: 'galo', label: t('Galo') },
        { value: 'pluma', label: t('Pluma') },
        { value: 'pena', label: t('Pena') },
        { value: 'leve', label: t('Leve') },
        { value: 'medio', label: t('Médio') },
        { value: 'meio_pesado', label: t('Meio-Pesado') },
        { value: 'pesado', label: t('Pesado') },
        { value: 'super_pesado', label: t('Super-Pesado') },
        { value: 'pesadissimo', label: t('Pesadíssimo') },
      ],
    },
    { key: 'medical_clearance', label: t('Atestado Médico'), type: 'file', required: false, publicVisible: false },
    { key: 'injuries', label: t('Lesões'), type: 'text', required: false, publicVisible: false },
  ],

  audienceProfiles: [
    {
      id: 'kids', name: t('Kids'), visual: v('#22C55E' as HexColor, '🌟'),
      ageRange: { min: 4, max: 13 }, requiresGuardian: true, themeOverride: 'kids',
      progressModules: [
        { id: 'coordination', name: t('Coordenação') },
        { id: 'discipline', name: t('Disciplina') },
        { id: 'fundamentals', name: t('Base') },
        { id: 'movements', name: t('Movimentos Fundamentais') },
      ],
    },
    {
      id: 'teen', name: t('Teen'), visual: v('#7B68EE' as HexColor, '⚡'),
      ageRange: { min: 14, max: 17 }, requiresGuardian: true, themeOverride: 'teen',
      progressModules: [
        { id: 'takedowns', name: t('Quedas') },
        { id: 'passing', name: t('Passagens') },
        { id: 'submissions', name: t('Finalizações') },
        { id: 'defense', name: t('Defesa') },
        { id: 'competition', name: t('Competição') },
      ],
    },
    {
      id: 'adult', name: t('Adulto'), visual: v('#3B82F6' as HexColor, '🥋'),
      requiresGuardian: false,
      progressModules: [
        { id: 'takedowns', name: t('Quedas') },
        { id: 'passing', name: t('Passagens') },
        { id: 'submissions', name: t('Finalizações') },
        { id: 'defense', name: t('Defesa') },
        { id: 'strategy', name: t('Estratégia') },
      ],
    },
  ],

  eventTypes: [
    { id: 'championship', name: t('Campeonato'), icon: '🏆', hasCategorization: true, hasResults: true },
    { id: 'interclub', name: t('Interclube'), icon: '🤝', hasCategorization: true, hasResults: true },
    { id: 'seminar', name: t('Seminário'), icon: '📚', hasCategorization: false, hasResults: false },
    { id: 'graduation', name: t('Cerimônia de Graduação'), icon: '🎓', hasCategorization: false, hasResults: false },
  ],
};

// ════════════════════════════════════════════════════════════════════
// 💃 DANCE — Escolas de Dança
// ════════════════════════════════════════════════════════════════════

export const PRESET_DANCE: SegmentDefinition = {
  id: 'seg_dance' as any,
  type: 'dance',
  displayName: t('Dança'),
  description: t('Escolas de ballet, dança contemporânea, forró, sertanejo e outras modalidades'),
  visual: v('#EC4899' as HexColor, '💃'),
  defaultProgressionModel: 'repertoire',

  enabledModules: {
    progression: 'enabled',
    gamification: 'optional',
    digitalCard: 'optional',
    events: 'enabled',
    contentLibrary: 'enabled',
    shop: 'optional',
    sessionPlanning: 'enabled',
    activityTimer: 'disabled',
    privateSessions: 'enabled',
    crm: 'enabled',
    finance: 'enabled',
    communications: 'enabled',
    reports: 'enabled',
  },

  vocabulary: {
    session:              t('Ensaio'),
    sessionPlural:        t('Ensaios'),
    milestone:            t('Nível'),
    milestonePlural:      t('Níveis'),
    submilestone:         t('Estrela'),
    submilestonePlural:   t('Estrelas'),
    instructor:           t('Professor(a)'),
    instructorPlural:     t('Professores'),
    participant:          t('Bailarino(a)'),
    participantPlural:    t('Bailarinos'),
    space:                t('Sala'),
    spacePlural:          t('Salas'),
    unit:                 t('Escola'),
    unitPlural:           t('Escolas'),
    achievement:          t('Conquista'),
    achievementPlural:    t('Conquistas'),
    competency:           t('Habilidade'),
    competencyPlural:     t('Habilidades'),
    event:                t('Espetáculo'),
    eventPlural:          t('Espetáculos'),
    emoji: '💃',
  },

  profileFields: [
    { key: 'dance_style', label: t('Estilo Principal'), type: 'multiselect', required: false, publicVisible: true,
      options: [
        { value: 'ballet', label: t('Ballet Clássico') },
        { value: 'contemporary', label: t('Contemporâneo') },
        { value: 'jazz', label: t('Jazz') },
        { value: 'street', label: t('Street Dance') },
        { value: 'ballroom', label: t('Dança de Salão') },
        { value: 'folk', label: t('Folclórica') },
      ],
    },
    { key: 'shoe_size', label: t('Número do Sapato'), type: 'text', required: false, publicVisible: false },
  ],

  audienceProfiles: [
    {
      id: 'beginner', name: t('Iniciante'), visual: v('#93C5FD' as HexColor, '🌱'),
      requiresGuardian: false,
      progressModules: [
        { id: 'technique', name: t('Técnica') },
        { id: 'musicality', name: t('Musicalidade') },
        { id: 'expression', name: t('Expressão Corporal') },
      ],
    },
    {
      id: 'intermediate', name: t('Intermediário'), visual: v('#A78BFA' as HexColor, '🌿'),
      requiresGuardian: false,
      progressModules: [
        { id: 'technique', name: t('Técnica') },
        { id: 'musicality', name: t('Musicalidade') },
        { id: 'expression', name: t('Expressão Corporal') },
        { id: 'repertoire', name: t('Repertório') },
      ],
    },
    {
      id: 'advanced', name: t('Avançado'), visual: v('#F59E0B' as HexColor, '🔥'),
      requiresGuardian: false,
      progressModules: [
        { id: 'technique', name: t('Técnica Avançada') },
        { id: 'musicality', name: t('Musicalidade') },
        { id: 'expression', name: t('Expressão Corporal') },
        { id: 'repertoire', name: t('Repertório') },
        { id: 'performance', name: t('Performance') },
      ],
    },
    {
      id: 'kids_dance', name: t('Kids'), visual: v('#FB923C' as HexColor, '⭐'),
      ageRange: { min: 4, max: 12 }, requiresGuardian: true, themeOverride: 'kids',
      progressModules: [
        { id: 'rhythm', name: t('Ritmo') },
        { id: 'coordination', name: t('Coordenação') },
        { id: 'creativity', name: t('Criatividade') },
      ],
    },
  ],

  eventTypes: [
    { id: 'recital', name: t('Recital'), icon: '🎭', hasCategorization: false, hasResults: false },
    { id: 'showcase', name: t('Mostra'), icon: '💫', hasCategorization: false, hasResults: false },
    { id: 'competition', name: t('Competição'), icon: '🏆', hasCategorization: true, hasResults: true },
    { id: 'workshop', name: t('Workshop'), icon: '📚', hasCategorization: false, hasResults: false },
  ],
};

// ════════════════════════════════════════════════════════════════════
// 🧘 PILATES — Estúdios de Pilates / Yoga
// ════════════════════════════════════════════════════════════════════

export const PRESET_PILATES: SegmentDefinition = {
  id: 'seg_pilates' as any,
  type: 'pilates',
  displayName: t('Pilates & Yoga'),
  description: t('Estúdios de pilates, yoga, e práticas de bem-estar'),
  visual: v('#14B8A6' as HexColor, '🧘'),
  defaultProgressionModel: 'accumulative',

  enabledModules: {
    progression: 'optional',
    gamification: 'disabled',
    digitalCard: 'optional',
    events: 'optional',
    contentLibrary: 'enabled',
    shop: 'optional',
    sessionPlanning: 'enabled',
    activityTimer: 'disabled',
    privateSessions: 'enabled',
    crm: 'enabled',
    finance: 'enabled',
    communications: 'enabled',
    reports: 'enabled',
  },

  vocabulary: {
    session:              t('Sessão'),
    sessionPlural:        t('Sessões'),
    milestone:            t('Estágio'),
    milestonePlural:      t('Estágios'),
    submilestone:         t('Módulo'),
    submilestonePlural:   t('Módulos'),
    instructor:           t('Instrutor(a)'),
    instructorPlural:     t('Instrutores'),
    participant:          t('Praticante'),
    participantPlural:    t('Praticantes'),
    space:                t('Estúdio'),
    spacePlural:          t('Estúdios'),
    unit:                 t('Estúdio'),
    unitPlural:           t('Estúdios'),
    achievement:          t('Marco'),
    achievementPlural:    t('Marcos'),
    competency:           t('Capacidade'),
    competencyPlural:     t('Capacidades'),
    event:                t('Workshop'),
    eventPlural:          t('Workshops'),
    emoji: '🧘',
  },

  profileFields: [
    { key: 'practice_type', label: t('Tipo de Prática'), type: 'multiselect', required: false, publicVisible: true,
      options: [
        { value: 'mat', label: t('Solo (Mat)') },
        { value: 'reformer', label: t('Reformer') },
        { value: 'cadillac', label: t('Cadillac') },
        { value: 'chair', label: t('Chair') },
        { value: 'yoga', label: t('Yoga') },
      ],
    },
    { key: 'health_conditions', label: t('Condições de Saúde'), type: 'text', required: false, publicVisible: false },
    { key: 'goals', label: t('Objetivos'), type: 'text', required: false, publicVisible: false },
  ],

  audienceProfiles: [
    {
      id: 'regular', name: t('Regular'), visual: v('#14B8A6' as HexColor, '🧘'),
      requiresGuardian: false,
      progressModules: [
        { id: 'alignment', name: t('Alinhamento') },
        { id: 'core', name: t('Core') },
        { id: 'flexibility', name: t('Flexibilidade') },
        { id: 'breathing', name: t('Respiração') },
      ],
    },
    {
      id: 'prenatal', name: t('Gestante'), visual: v('#F472B6' as HexColor, '🤰'),
      requiresGuardian: false,
      progressModules: [
        { id: 'pelvic', name: t('Assoalho Pélvico') },
        { id: 'breathing', name: t('Respiração') },
        { id: 'mobility', name: t('Mobilidade') },
      ],
    },
    {
      id: 'senior', name: t('Terceira Idade'), visual: v('#8B5CF6' as HexColor, '🌿'),
      requiresGuardian: false,
      progressModules: [
        { id: 'balance', name: t('Equilíbrio') },
        { id: 'mobility', name: t('Mobilidade') },
        { id: 'strength', name: t('Fortalecimento') },
      ],
    },
    {
      id: 'clinical', name: t('Clínico'), visual: v('#EF4444' as HexColor, '⚕️'),
      requiresGuardian: false,
      progressModules: [
        { id: 'rehabilitation', name: t('Reabilitação') },
        { id: 'posture', name: t('Postura') },
        { id: 'pain_management', name: t('Manejo de Dor') },
      ],
    },
  ],

  eventTypes: [
    { id: 'workshop', name: t('Workshop'), icon: '📚', hasCategorization: false, hasResults: false },
    { id: 'immersion', name: t('Imersão'), icon: '🧘', hasCategorization: false, hasResults: false },
  ],
};

// ════════════════════════════════════════════════════════════════════
// 🏋️ FITNESS — Academias de Musculação / CrossFit / Funcional
// ════════════════════════════════════════════════════════════════════

export const PRESET_FITNESS: SegmentDefinition = {
  id: 'seg_fitness' as any,
  type: 'fitness',
  displayName: t('Fitness'),
  description: t('Academias de musculação, CrossFit, treino funcional e condicionamento'),
  visual: v('#EF4444' as HexColor, '🏋️'),
  defaultProgressionModel: 'accumulative',

  enabledModules: {
    progression: 'optional',
    gamification: 'enabled',
    digitalCard: 'enabled',
    events: 'optional',
    contentLibrary: 'optional',
    shop: 'enabled',
    sessionPlanning: 'optional',
    activityTimer: 'enabled',
    privateSessions: 'enabled',
    crm: 'enabled',
    finance: 'enabled',
    communications: 'enabled',
    reports: 'enabled',
  },

  vocabulary: {
    session:              t('Treino'),
    sessionPlural:        t('Treinos'),
    milestone:            t('Fase'),
    milestonePlural:      t('Fases'),
    submilestone:         t('Nível'),
    submilestonePlural:   t('Níveis'),
    instructor:           t('Personal'),
    instructorPlural:     t('Personais'),
    participant:          t('Aluno'),
    participantPlural:    t('Alunos'),
    space:                t('Sala'),
    spacePlural:          t('Salas'),
    unit:                 t('Academia'),
    unitPlural:           t('Academias'),
    achievement:          t('Conquista'),
    achievementPlural:    t('Conquistas'),
    competency:           t('Meta'),
    competencyPlural:     t('Metas'),
    event:                t('Desafio'),
    eventPlural:          t('Desafios'),
    emoji: '🏋️',
  },

  profileFields: [
    { key: 'goal', label: t('Objetivo'), type: 'select', required: false, publicVisible: true,
      options: [
        { value: 'hypertrophy', label: t('Hipertrofia') },
        { value: 'weight_loss', label: t('Emagrecimento') },
        { value: 'conditioning', label: t('Condicionamento') },
        { value: 'health', label: t('Saúde') },
        { value: 'performance', label: t('Performance') },
      ],
    },
    { key: 'medical_clearance', label: t('Atestado Médico'), type: 'file', required: false, publicVisible: false },
  ],

  audienceProfiles: [
    {
      id: 'general', name: t('Geral'), visual: v('#EF4444' as HexColor, '🏋️'),
      requiresGuardian: false,
      progressModules: [
        { id: 'strength', name: t('Força') },
        { id: 'cardio', name: t('Cardio') },
        { id: 'flexibility', name: t('Flexibilidade') },
        { id: 'consistency', name: t('Consistência') },
      ],
    },
  ],

  eventTypes: [
    { id: 'challenge', name: t('Desafio'), icon: '🔥', hasCategorization: false, hasResults: true },
    { id: 'workshop', name: t('Workshop'), icon: '📚', hasCategorization: false, hasResults: false },
  ],
};

// ════════════════════════════════════════════════════════════════════
// 🎵 MUSIC — Escolas de Música
// ════════════════════════════════════════════════════════════════════

export const PRESET_MUSIC: SegmentDefinition = {
  id: 'seg_music' as any,
  type: 'music',
  displayName: t('Música'),
  description: t('Escolas de música, instrumento, canto e teoria musical'),
  visual: v('#8B5CF6' as HexColor, '🎵'),
  defaultProgressionModel: 'evaluation',

  enabledModules: {
    progression: 'enabled',
    gamification: 'optional',
    digitalCard: 'optional',
    events: 'enabled',
    contentLibrary: 'enabled',
    shop: 'optional',
    sessionPlanning: 'enabled',
    activityTimer: 'enabled',
    privateSessions: 'enabled',
    crm: 'enabled',
    finance: 'enabled',
    communications: 'enabled',
    reports: 'enabled',
  },

  vocabulary: {
    session:              t('Aula'),
    sessionPlural:        t('Aulas'),
    milestone:            t('Módulo'),
    milestonePlural:      t('Módulos'),
    submilestone:         t('Unidade'),
    submilestonePlural:   t('Unidades'),
    instructor:           t('Professor(a)'),
    instructorPlural:     t('Professores'),
    participant:          t('Aluno(a)'),
    participantPlural:    t('Alunos'),
    space:                t('Sala'),
    spacePlural:          t('Salas'),
    unit:                 t('Escola'),
    unitPlural:           t('Escolas'),
    achievement:          t('Certificação'),
    achievementPlural:    t('Certificações'),
    competency:           t('Habilidade'),
    competencyPlural:     t('Habilidades'),
    event:                t('Recital'),
    eventPlural:          t('Recitais'),
    emoji: '🎵',
  },

  profileFields: [
    { key: 'instrument', label: t('Instrumento'), type: 'multiselect', required: false, publicVisible: true,
      options: [
        { value: 'guitar', label: t('Violão/Guitarra') },
        { value: 'piano', label: t('Piano/Teclado') },
        { value: 'drums', label: t('Bateria') },
        { value: 'bass', label: t('Baixo') },
        { value: 'voice', label: t('Canto') },
        { value: 'violin', label: t('Violino') },
        { value: 'saxophone', label: t('Saxofone') },
        { value: 'flute', label: t('Flauta') },
      ],
    },
    { key: 'theory_level', label: t('Nível de Teoria'), type: 'select', required: false, publicVisible: true,
      options: [
        { value: 'none', label: t('Sem base') },
        { value: 'basic', label: t('Básico') },
        { value: 'intermediate', label: t('Intermediário') },
        { value: 'advanced', label: t('Avançado') },
      ],
    },
  ],

  audienceProfiles: [
    {
      id: 'kids_music', name: t('Musicalização Infantil'), visual: v('#FB923C' as HexColor, '🎶'),
      ageRange: { min: 4, max: 10 }, requiresGuardian: true, themeOverride: 'kids',
      progressModules: [
        { id: 'rhythm', name: t('Ritmo') },
        { id: 'ear_training', name: t('Percepção Auditiva') },
        { id: 'motor', name: t('Coordenação Motora') },
      ],
    },
    {
      id: 'regular_music', name: t('Regular'), visual: v('#8B5CF6' as HexColor, '🎵'),
      requiresGuardian: false,
      progressModules: [
        { id: 'technique', name: t('Técnica') },
        { id: 'reading', name: t('Leitura Musical') },
        { id: 'repertoire', name: t('Repertório') },
        { id: 'improvisation', name: t('Improvisação') },
      ],
    },
  ],

  eventTypes: [
    { id: 'recital', name: t('Recital'), icon: '🎵', hasCategorization: false, hasResults: false },
    { id: 'jam_session', name: t('Jam Session'), icon: '🎸', hasCategorization: false, hasResults: false },
    { id: 'exam', name: t('Prova de Nível'), icon: '📋', hasCategorization: true, hasResults: true },
  ],
};

// ════════════════════════════════════════════════════════════════════
// PRESET REGISTRY
// ════════════════════════════════════════════════════════════════════

import type { SegmentType } from './segment';

/**
 * Registro de todos os presets disponíveis.
 *
 * Quando uma nova unidade é criada, o admin escolhe um segmento
 * e recebe o preset correspondente como ponto de partida.
 * Pode customizar tudo depois.
 */
export const SEGMENT_PRESETS: Record<SegmentType, SegmentDefinition | null> = {
  martial_arts: PRESET_MARTIAL_ARTS,
  dance:        PRESET_DANCE,
  pilates:      PRESET_PILATES,
  fitness:      PRESET_FITNESS,
  music:        PRESET_MUSIC,
  self_defense: null, // TODO: criar preset
  education:    null, // TODO: criar preset
  custom:       null, // Configuração manual
};

/**
 * Retorna o preset para um tipo de segmento.
 * Se o segmento é 'custom' ou não tem preset, retorna null.
 */
export function getSegmentPreset(type: SegmentType): SegmentDefinition | null {
  return SEGMENT_PRESETS[type] ?? null;
}
