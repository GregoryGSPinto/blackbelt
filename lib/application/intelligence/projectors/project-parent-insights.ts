/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PARENT INSIGHTS PROJECTOR — ViewModel para Pais/Responsaveis   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function. Zero side effects. Zero fetch.                  ║
 * ║                                                                 ║
 * ║  Foco em: progresso educacional, desenvolvimento comportamental,║
 * ║  frequencia, alertas positivos e dicas para pais.               ║
 * ║  Linguagem profissional e acolhedora.                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { StudentDNA } from '@/lib/domain/intelligence/models/student-dna.types';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';
import type { TrendIndicator } from '@/lib/domain/intelligence/core/types';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface ParentInsightsVM {
  childId: string;
  childName: string;
  summary: {
    headline: string;
    engagementLevel: string;
    attendanceThisMonth: number;
    totalClassesThisMonth: number;
  };
  learningProgress: {
    currentBelt: string;
    nextBelt: string;
    progressToNext: number;
    strongAreas: string[];
    growthAreas: string[];
  };
  behavioralDevelopment: {
    discipline: TrendIndicator;
    respect: TrendIndicator;
    teamwork: TrendIndicator;
    confidence: TrendIndicator;
    focusAndAttention: TrendIndicator;
  };
  parentAlerts: {
    type: 'positive' | 'attention' | 'info';
    message: string;
  }[];
  parentTips: string[];
  upcomingEvents: {
    date: string;
    type: 'class' | 'evaluation' | 'event' | 'promotion';
    title: string;
  }[];
}

// ════════════════════════════════════════════════════════════════════
// MAIN PROJECTOR
// ════════════════════════════════════════════════════════════════════

/**
 * Projeta insights para pais/responsaveis sobre o progresso do filho.
 *
 * @param childDNA - DNA comportamental da crianca
 * @param childEngagement - Score de engajamento da crianca
 * @param snapshot - Snapshot de desenvolvimento do participante
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function projectParentInsights(
  childDNA: StudentDNA,
  childEngagement: EngagementScore,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
): ParentInsightsVM {
  const childId = childDNA.participantId;
  const childName = snapshot?.participantName ?? 'Seu filho(a)';

  return {
    childId,
    childName,
    summary: buildSummary(childEngagement, snapshot),
    learningProgress: buildLearningProgress(childDNA, snapshot),
    behavioralDevelopment: buildBehavioralDevelopment(childDNA, childEngagement),
    parentAlerts: buildParentAlerts(childDNA, childEngagement),
    parentTips: buildParentTips(childDNA, childEngagement),
    upcomingEvents: buildUpcomingEvents(childDNA, snapshot),
  };
}

// ════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════

function buildSummary(
  engagement: EngagementScore,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
): ParentInsightsVM['summary'] {
  // Headline
  let headline: string;
  if (engagement.tier === 'champion' || engagement.tier === 'committed') {
    headline = 'Excelente desenvolvimento! Seu filho(a) esta muito dedicado(a).';
  } else if (engagement.trend === 'rising') {
    headline = 'Em evolucao! O engajamento do seu filho(a) esta crescendo.';
  } else if (engagement.tier === 'active') {
    headline = 'Bom progresso. Seu filho(a) esta participando regularmente.';
  } else if (engagement.trend === 'declining') {
    headline = 'Atencao: a participacao diminuiu recentemente. Veja como ajudar.';
  } else {
    headline = 'Acompanhe o progresso do seu filho(a) na arte marcial.';
  }

  // Engagement level in parent-friendly language
  const engagementLevelMap: Record<string, string> = {
    champion: 'Excelente',
    committed: 'Muito Bom',
    active: 'Bom',
    drifting: 'Precisa de Atencao',
    disconnected: 'Precisa de Incentivo',
  };

  const engagementLevel = engagementLevelMap[engagement.tier] ?? 'Regular';

  // Attendance estimate from physical dimension
  const attendanceThisMonth = Math.round((engagement.dimensions.physical / 100) * 12);
  const totalClassesThisMonth = 12; // ~3x/week assumption

  return {
    headline,
    engagementLevel,
    attendanceThisMonth,
    totalClassesThisMonth,
  };
}

// ════════════════════════════════════════════════════════════════════
// LEARNING PROGRESS
// ════════════════════════════════════════════════════════════════════

function buildLearningProgress(
  dna: StudentDNA,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
): ParentInsightsVM['learningProgress'] {
  const currentBelt = snapshot?.currentMilestone?.name ?? 'Faixa Branca';
  const nextBelt = snapshot?.nextMilestone?.name ?? 'Proxima Faixa';

  // Progress to next belt
  const progressToNext = dna.predictions.nextMilestoneWeeks !== null
    ? Math.min(95, Math.max(5, 100 - (dna.predictions.nextMilestoneWeeks * 3)))
    : 50;

  // Strong areas from competencies
  const strongAreas = dna.difficultyProfile.strongCompetencies.length > 0
    ? dna.difficultyProfile.strongCompetencies.slice(0, 3)
    : ['Participacao', 'Esforco'];

  // Growth areas (careful language - not "weak areas")
  const growthAreas = dna.difficultyProfile.weakCompetencies.length > 0
    ? dna.difficultyProfile.weakCompetencies.slice(0, 3)
    : ['Em desenvolvimento'];

  return {
    currentBelt,
    nextBelt,
    progressToNext,
    strongAreas,
    growthAreas,
  };
}

// ════════════════════════════════════════════════════════════════════
// BEHAVIORAL DEVELOPMENT
// ════════════════════════════════════════════════════════════════════

function buildBehavioralDevelopment(
  dna: StudentDNA,
  engagement: EngagementScore,
): ParentInsightsVM['behavioralDevelopment'] {
  return {
    discipline: buildTrendIndicator(dna.dimensions.consistency, engagement.trend, 'Disciplina e constancia nos treinos'),
    respect: buildTrendIndicator(dna.dimensions.responsiveness, engagement.trend, 'Respeito a instrucoes e regras'),
    teamwork: buildTrendIndicator(dna.dimensions.socialConnection, engagement.trend, 'Trabalho em equipe e cooperacao'),
    confidence: buildTrendIndicator(dna.dimensions.competitiveness, engagement.trend, 'Autoconfianca e atitude'),
    focusAndAttention: buildTrendIndicator(dna.dimensions.intensity, engagement.trend, 'Foco e atencao durante as aulas'),
  };
}

function buildTrendIndicator(
  score: number,
  overallTrend: string,
  description: string,
): TrendIndicator {
  let level: TrendIndicator['level'];
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'good';
  else if (score >= 40) level = 'developing';
  else level = 'needs_attention';

  // Derive trend from overall engagement trend and individual score
  let trend: TrendIndicator['trend'];
  if (overallTrend === 'rising' && score >= 50) trend = 'rising';
  else if (overallTrend === 'declining' && score < 50) trend = 'declining';
  else trend = 'stable';

  return { level, trend, description };
}

// ════════════════════════════════════════════════════════════════════
// PARENT ALERTS
// ════════════════════════════════════════════════════════════════════

function buildParentAlerts(
  dna: StudentDNA,
  engagement: EngagementScore,
): ParentInsightsVM['parentAlerts'] {
  const alerts: ParentInsightsVM['parentAlerts'] = [];

  // Positive alerts first!
  if (engagement.tier === 'champion') {
    alerts.push({
      type: 'positive',
      message: 'Seu filho(a) esta entre os alunos mais dedicados da academia!',
    });
  }

  if (engagement.trend === 'rising') {
    alerts.push({
      type: 'positive',
      message: 'O engajamento esta em tendencia de alta. Otima evolucao!',
    });
  }

  if (dna.dimensions.resilience >= 80) {
    alerts.push({
      type: 'positive',
      message: 'Demonstra excelente resiliencia — sempre retorna apos ausencias.',
    });
  }

  if (dna.dimensions.socialConnection >= 70) {
    alerts.push({
      type: 'positive',
      message: 'Desenvolvendo otimos vinculos sociais com os colegas de treino.',
    });
  }

  // Attention alerts
  if (engagement.tier === 'drifting' || engagement.tier === 'disconnected') {
    alerts.push({
      type: 'attention',
      message: 'A frequencia diminuiu recentemente. Converse sobre como esta se sentindo nos treinos.',
    });
  }

  if (engagement.trend === 'declining' && engagement.trendDelta < -15) {
    alerts.push({
      type: 'attention',
      message: 'Queda significativa no engajamento. Vale verificar se ha algo incomodando.',
    });
  }

  if (dna.dimensions.socialConnection < 30 && dna.dataPoints > 20) {
    alerts.push({
      type: 'attention',
      message: 'Seu filho(a) pode se beneficiar de mais interacao com colegas. Que tal incentivar?',
    });
  }

  // Info alerts
  if (dna.predictions.nextMilestoneWeeks !== null && dna.predictions.nextMilestoneWeeks <= 6) {
    alerts.push({
      type: 'info',
      message: `Proximo de uma graduacao! Estimativa: ${dna.predictions.nextMilestoneWeeks} semanas.`,
    });
  }

  alerts.push({
    type: 'info',
    message: `Estilo de aprendizagem identificado: ${mapLearningStyle(dna.patterns.learningStyle)}.`,
  });

  return alerts.slice(0, 6);
}

function mapLearningStyle(style: string): string {
  const map: Record<string, string> = {
    consistent_grinder: 'Constante e disciplinado',
    intensity_burst: 'Explosoes de energia e dedicacao',
    social_learner: 'Aprende melhor em grupo',
    goal_oriented: 'Focado em objetivos',
    explorer: 'Curioso e versatil',
    routine_follower: 'Segue a rotina com disciplina',
  };
  return map[style] ?? 'Em desenvolvimento';
}

// ════════════════════════════════════════════════════════════════════
// PARENT TIPS
// ════════════════════════════════════════════════════════════════════

function buildParentTips(
  dna: StudentDNA,
  engagement: EngagementScore,
): string[] {
  const tips: string[] = [];

  // Always include general positive tip
  tips.push('Celebre cada pequena conquista. O reconhecimento em casa reforca a motivacao na academia.');

  // Consistency-based tips
  if (dna.dimensions.consistency < 50) {
    tips.push(
      'Manter uma rotina fixa de treinos ajuda a criar o habito. Tente definir dias fixos na semana.',
    );
  }

  // Social tips
  if (dna.dimensions.socialConnection < 40) {
    tips.push(
      'Incentive a participacao em atividades de grupo. Amizades na academia sao forte motivador.',
    );
  }

  // Engagement declining
  if (engagement.trend === 'declining') {
    tips.push(
      'Se perceber desanimo, pergunte o que mais gosta nas aulas. Falar com o professor pode ajudar.',
    );
  }

  // High engagement
  if (engagement.tier === 'champion' || engagement.tier === 'committed') {
    tips.push(
      'O comprometimento esta alto! Certifique-se de que ha tempo para descanso e recuperacao tambem.',
    );
  }

  // Progression
  if (dna.dimensions.progression < 50) {
    tips.push(
      'Cada crianca tem seu ritmo. Comparar com outros pode desmotivar. Foque na evolucao individual.',
    );
  }

  // Learning style specific
  if (dna.patterns.learningStyle === 'social_learner') {
    tips.push(
      'Seu filho(a) aprende melhor em grupo. Que tal combinar caronas com colegas de treino?',
    );
  }

  return tips.slice(0, 5);
}

// ════════════════════════════════════════════════════════════════════
// UPCOMING EVENTS
// ════════════════════════════════════════════════════════════════════

function buildUpcomingEvents(
  dna: StudentDNA,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
): ParentInsightsVM['upcomingEvents'] {
  const events: ParentInsightsVM['upcomingEvents'] = [];

  // Next class (based on preferred days)
  if (dna.patterns.preferredDays.length > 0) {
    const nextClassDay = getNextClassDay(dna.patterns.preferredDays[0]);
    events.push({
      date: nextClassDay,
      type: 'class',
      title: 'Proxima Aula',
    });
  }

  // Promotion estimate
  if (dna.predictions.nextPromotionEstimate) {
    events.push({
      date: dna.predictions.nextPromotionEstimate,
      type: 'promotion',
      title: 'Estimativa de Graduacao',
    });
  }

  return events;
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function getNextClassDay(preferredDayOfWeek: number): string {
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = preferredDayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  const nextDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
  return nextDate.toISOString().split('T')[0];
}
