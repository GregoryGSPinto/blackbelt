/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STUDENT INSIGHTS PROJECTOR — ViewModel do Aluno Adulto         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function. Zero side effects. Zero fetch.                  ║
 * ║                                                                 ║
 * ║  Transforma StudentDNA + EngagementScore + PromotionPrediction  ║
 * ║  + SocialProfile em ViewModel motivacional e personalizado      ║
 * ║  para o aluno adulto.                                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { StudentDNA } from '@/lib/domain/intelligence/models/student-dna.types';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';
import type { PromotionPrediction } from '@/lib/domain/intelligence/models/promotion.types';
import type { SocialProfile } from '@/lib/domain/intelligence/models/social-graph.types';
import type { MotivationDriver } from '@/lib/domain/intelligence/core/types';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface StudentInsightsVM {
  motivationalMessage: string;
  motivationDriver: MotivationDriver;
  nextSteps: {
    icon: string;
    title: string;
    description: string;
    progress: number;
    estimatedDate?: string;
  }[];
  personalInsights: {
    bestDay: string;
    optimalFrequency: string;
    strongPoint: string;
    improvementArea: string;
    funFact: string;
  };
  weeklyChallenge: {
    title: string;
    description: string;
    reward: number;
    basedOn: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  socialContext: {
    trainingBuddies: {
      name: string;
      avatar?: string;
      lastTrained: string;
    }[];
    communityRole: string;
    networkStrength: string;
  };
}

// ════════════════════════════════════════════════════════════════════
// DAY NAME MAPPING
// ════════════════════════════════════════════════════════════════════

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

// ════════════════════════════════════════════════════════════════════
// MAIN PROJECTOR
// ════════════════════════════════════════════════════════════════════

export function projectStudentInsights(
  dna: StudentDNA,
  engagement: EngagementScore,
  promotion: PromotionPrediction | null,
  social: SocialProfile | null,
): StudentInsightsVM {
  const primaryDriver = dna.patterns.motivationDrivers[0] ?? 'mastery';

  return {
    motivationalMessage: buildMotivationalMessage(dna, engagement, promotion, primaryDriver),
    motivationDriver: primaryDriver,
    nextSteps: buildNextSteps(dna, engagement, promotion),
    personalInsights: buildPersonalInsights(dna),
    weeklyChallenge: buildWeeklyChallenge(dna, engagement, primaryDriver),
    socialContext: buildSocialContext(social),
  };
}

// ════════════════════════════════════════════════════════════════════
// MOTIVATIONAL MESSAGE
// ════════════════════════════════════════════════════════════════════

function buildMotivationalMessage(
  dna: StudentDNA,
  engagement: EngagementScore,
  promotion: PromotionPrediction | null,
  driver: MotivationDriver,
): string {
  // Champion / high engagement students
  if (engagement.tier === 'champion') {
    return 'Você é uma referência na academia! Sua dedicação inspira outros alunos. Continue liderando pelo exemplo.';
  }

  // Near promotion
  if (promotion && promotion.estimatedDaysToPromotion !== null && promotion.estimatedDaysToPromotion <= 30) {
    return `Você está a caminho da próxima faixa! Faltam aproximadamente ${promotion.estimatedDaysToPromotion} dias. Mantenha o foco nos requisitos pendentes.`;
  }

  // Returning after decline
  if (engagement.trend === 'declining' && engagement.trendDelta < -10) {
    return 'Notamos que você diminuiu o ritmo recentemente. Cada treino conta — volte com tudo e retome sua evolução!';
  }

  // Rising engagement
  if (engagement.trend === 'rising') {
    return 'Sua evolução está acelerando! O progresso recente mostra que você está no caminho certo. Continue assim!';
  }

  // Driver-based messages
  switch (driver) {
    case 'ranking':
    case 'competition':
      return 'Sua posição no ranking pode subir com mais consistência. Cada sessão de treino te aproxima do topo!';
    case 'badges':
      return 'Você está perto de desbloquear novas conquistas. Continue treinando para colecionar mais!';
    case 'promotion':
      return 'Sua próxima graduação está chegando. Foque nos requisitos e surpreenda na avaliação!';
    case 'social':
      return 'Treinar com seus colegas fortalece o aprendizado. Combine um treino com seu parceiro favorito!';
    case 'streak':
      return `Sua sequência de ${dna.dimensions.consistency > 70 ? 'treinos está incrível' : 'treinos pode melhorar'}. Cada dia conta!`;
    case 'mastery':
      return 'A busca pela excelência é um caminho contínuo. Cada técnica dominada é uma conquista permanente.';
    case 'health':
      return 'Manter a regularidade nos treinos é o melhor investimento na sua saúde. Seu corpo agradece cada sessão!';
    default:
      return 'Continue treinando com dedicação. Cada sessão te torna melhor do que ontem!';
  }
}

// ════════════════════════════════════════════════════════════════════
// NEXT STEPS
// ════════════════════════════════════════════════════════════════════

function buildNextSteps(
  dna: StudentDNA,
  engagement: EngagementScore,
  promotion: PromotionPrediction | null,
): StudentInsightsVM['nextSteps'] {
  const steps: StudentInsightsVM['nextSteps'] = [];

  // Promotion progress
  if (promotion) {
    steps.push({
      icon: 'belt',
      title: 'Próxima Graduação',
      description: promotion.estimatedDate
        ? `Previsão: ${formatDate(promotion.estimatedDate)}`
        : 'Continue treinando para avançar',
      progress: promotion.readinessScore,
      estimatedDate: promotion.estimatedDate ?? undefined,
    });
  }

  // Consistency improvement
  if (dna.dimensions.consistency < 70) {
    const target = Math.round(dna.patterns.averageSessionsPerWeek + 1);
    steps.push({
      icon: 'calendar',
      title: 'Melhorar Consistência',
      description: `Tente treinar ${target}x por semana para acelerar sua evolução`,
      progress: dna.dimensions.consistency,
    });
  }

  // Technique mastery
  if (dna.difficultyProfile.weakCompetencies.length > 0) {
    steps.push({
      icon: 'target',
      title: 'Competência para Focar',
      description: `Dedique atenção extra a ${dna.difficultyProfile.weakCompetencies[0]}`,
      progress: Math.round(100 - (dna.difficultyProfile.weakCompetencies.length / Math.max(1, dna.difficultyProfile.strongCompetencies.length + dna.difficultyProfile.weakCompetencies.length)) * 100),
    });
  }

  // Engagement recovery
  if (engagement.tier === 'drifting' || engagement.tier === 'disconnected') {
    steps.push({
      icon: 'flame',
      title: 'Retomar o Ritmo',
      description: 'Venha para 3 aulas esta semana e recupere seu engajamento',
      progress: Math.max(10, engagement.overall),
    });
  }

  // Social bonding
  if (dna.dimensions.socialConnection < 40) {
    steps.push({
      icon: 'users',
      title: 'Treinar em Grupo',
      description: 'Treine com colegas para aprender mais rápido e se divertir',
      progress: dna.dimensions.socialConnection,
    });
  }

  return steps.slice(0, 4);
}

// ════════════════════════════════════════════════════════════════════
// PERSONAL INSIGHTS
// ════════════════════════════════════════════════════════════════════

function buildPersonalInsights(dna: StudentDNA): StudentInsightsVM['personalInsights'] {
  const bestDay = DAY_NAMES[dna.patterns.peakPerformanceDay] ?? 'Segunda-feira';

  const optimalFrequency = dna.patterns.averageSessionsPerWeek >= 4
    ? `${dna.patterns.averageSessionsPerWeek}x/semana — ritmo excelente!`
    : dna.patterns.averageSessionsPerWeek >= 2
      ? `${dna.patterns.averageSessionsPerWeek}x/semana — bom ritmo, tente uma a mais!`
      : `${dna.patterns.averageSessionsPerWeek}x/semana — aumente para evoluir mais rápido`;

  // Find strongest dimension
  const dimensions = dna.dimensions;
  const dimEntries = Object.entries(dimensions) as [string, number][];
  const sorted = dimEntries.sort((a, b) => b[1] - a[1]);
  const strongPoint = mapDimensionName(sorted[0]?.[0] ?? 'consistency');
  const improvementArea = mapDimensionName(sorted[sorted.length - 1]?.[0] ?? 'consistency');

  const funFact = buildFunFact(dna);

  return {
    bestDay,
    optimalFrequency,
    strongPoint,
    improvementArea,
    funFact,
  };
}

function mapDimensionName(dimension: string): string {
  const names: Record<string, string> = {
    consistency: 'Regularidade',
    intensity: 'Intensidade',
    progression: 'Velocidade de Evolução',
    resilience: 'Resiliência',
    socialConnection: 'Conexão Social',
    competitiveness: 'Competitividade',
    curiosity: 'Versatilidade',
    responsiveness: 'Receptividade ao Feedback',
  };
  return names[dimension] ?? dimension;
}

function buildFunFact(dna: StudentDNA): string {
  if (dna.dimensions.resilience > 80) {
    return 'Você é incrivelmente resiliente! Sempre volta com tudo depois de uma pausa.';
  }
  if (dna.dimensions.competitiveness > 80) {
    return 'Sua veia competitiva é sua maior aliada na evolução!';
  }
  if (dna.dimensions.socialConnection > 80) {
    return 'Você é uma peça-chave na comunidade. Seus colegas adoram treinar com você!';
  }
  if (dna.patterns.learningStyle === 'consistent_grinder') {
    return 'Seu estilo de treino constante é o segredo dos campeões.';
  }
  if (dna.patterns.learningStyle === 'intensity_burst') {
    return 'Você treina em rajadas de energia — use isso a seu favor nas semanas de avaliação!';
  }
  if (dna.patterns.preferredTimeSlot === 'morning') {
    return 'Alunos matutinos como você tendem a ter 20% mais consistência!';
  }
  return 'Cada treino é uma vitória. Continue assim!';
}

// ════════════════════════════════════════════════════════════════════
// WEEKLY CHALLENGE
// ════════════════════════════════════════════════════════════════════

function buildWeeklyChallenge(
  dna: StudentDNA,
  engagement: EngagementScore,
  driver: MotivationDriver,
): StudentInsightsVM['weeklyChallenge'] {
  // Determine challenge difficulty based on engagement
  const difficulty: 'easy' | 'medium' | 'hard' =
    engagement.overall >= 70 ? 'hard' : engagement.overall >= 40 ? 'medium' : 'easy';

  // Select challenge based on motivation driver and weak areas
  if (dna.dimensions.consistency < 60) {
    return {
      title: 'Semana de Consistência',
      description: `Treine ${difficulty === 'easy' ? '2' : difficulty === 'medium' ? '3' : '4'}x esta semana sem falhar`,
      reward: difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150,
      basedOn: 'Seu padrão de consistência pode melhorar',
      difficulty,
    };
  }

  if (driver === 'social' || dna.dimensions.socialConnection < 40) {
    return {
      title: 'Desafio Social',
      description: 'Treine com pelo menos 2 parceiros diferentes esta semana',
      reward: difficulty === 'easy' ? 40 : difficulty === 'medium' ? 80 : 120,
      basedOn: 'Treinar em grupo fortalece seu aprendizado',
      difficulty,
    };
  }

  if (driver === 'ranking' || driver === 'competition') {
    return {
      title: 'Subida no Ranking',
      description: `Ganhe ${difficulty === 'easy' ? '100' : difficulty === 'medium' ? '200' : '300'} pontos extras esta semana`,
      reward: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 120 : 180,
      basedOn: 'Sua competitividade é um motor de evolução',
      difficulty,
    };
  }

  if (dna.difficultyProfile.weakCompetencies.length > 0) {
    return {
      title: 'Foco Técnico',
      description: `Dedique tempo extra para praticar suas competências em desenvolvimento`,
      reward: difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150,
      basedOn: 'Focar em pontos fracos acelera a evolução geral',
      difficulty,
    };
  }

  return {
    title: 'Semana de Superação',
    description: `Dê o seu melhor em cada treino desta semana`,
    reward: difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150,
    basedOn: 'Sua dedicação faz a diferença',
    difficulty,
  };
}

// ════════════════════════════════════════════════════════════════════
// SOCIAL CONTEXT
// ════════════════════════════════════════════════════════════════════

function buildSocialContext(social: SocialProfile | null): StudentInsightsVM['socialContext'] {
  if (!social || social.connections.length === 0) {
    return {
      trainingBuddies: [],
      communityRole: 'Faça amigos na academia e evolua mais rápido!',
      networkStrength: 'Em construção',
    };
  }

  // Top 3 training buddies (strongest active connections)
  const buddies = social.connections
    .filter(c => c.isActive)
    .slice(0, 3)
    .map(c => ({
      name: c.name,
      avatar: undefined,
      lastTrained: `${c.sharedSessions} treinos juntos`,
    }));

  // Community role in Portuguese
  const roleMap: Record<string, string> = {
    connector: 'Conector — Você conecta pessoas na academia!',
    loyalist: 'Leal — Seus vínculos são fortes e duradouros',
    solo: 'Independente — Que tal treinar mais com colegas?',
    influencer: 'Influenciador — Outros seguem seu exemplo!',
    newcomer: 'Novato — Ainda construindo sua rede',
  };

  const communityRole = roleMap[social.metrics.communityRole] ?? 'Membro da comunidade';

  // Network strength
  let networkStrength: string;
  if (social.metrics.strongBonds >= 3) {
    networkStrength = 'Rede forte — seus vínculos são um escudo contra desânimo!';
  } else if (social.metrics.networkSize >= 3) {
    networkStrength = 'Rede em crescimento — continue treinando com colegas!';
  } else {
    networkStrength = 'Rede em construção — cada treino em grupo fortalece seus vínculos';
  }

  return {
    trainingBuddies: buddies,
    communityRole,
    networkStrength,
  };
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}
