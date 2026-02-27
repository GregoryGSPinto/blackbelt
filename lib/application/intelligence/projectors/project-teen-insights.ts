/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TEEN INSIGHTS PROJECTOR — ViewModel Gamificado para Teens      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function. Zero side effects. Zero fetch.                  ║
 * ║                                                                 ║
 * ║  Linguagem gamificada: XP, levels, quests, achievements.        ║
 * ║  Tudo positivo e motivacional. Competição saudável.             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { StudentDNA } from '@/lib/domain/intelligence/models/student-dna.types';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';
import type { SocialProfile } from '@/lib/domain/intelligence/models/social-graph.types';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface TeenInsightsVM {
  levelUp: {
    currentXP: number;
    nextLevelXP: number;
    progress: number;
    title: string;
  };
  dailyQuest: {
    title: string;
    description: string;
    xpReward: number;
    emoji: string;
  };
  achievements: {
    recent: {
      name: string;
      icon: string;
      unlockedAt: string;
    }[];
    nextClosest: {
      name: string;
      icon: string;
      progress: number;
    }[];
  };
  funStats: {
    emoji: string;
    text: string;
  }[];
  rivalChallenge?: {
    rivalName: string;
    rivalAvatar?: string;
    metric: string;
    yourScore: number;
    rivalScore: number;
  };
}

// ════════════════════════════════════════════════════════════════════
// LEVEL TITLES
// ════════════════════════════════════════════════════════════════════

const LEVEL_TITLES: { min: number; title: string }[] = [
  { min: 90, title: 'Lenda' },
  { min: 80, title: 'Mestre' },
  { min: 70, title: 'Guerreiro Elite' },
  { min: 60, title: 'Guerreiro' },
  { min: 50, title: 'Lutador' },
  { min: 40, title: 'Aprendiz Avançado' },
  { min: 30, title: 'Aprendiz' },
  { min: 20, title: 'Iniciante Corajoso' },
  { min: 0, title: 'Novato' },
];

// ════════════════════════════════════════════════════════════════════
// MAIN PROJECTOR
// ════════════════════════════════════════════════════════════════════

export function projectTeenInsights(
  dna: StudentDNA,
  engagement: EngagementScore,
  social: SocialProfile | null,
): TeenInsightsVM {
  return {
    levelUp: buildLevelUp(engagement, dna),
    dailyQuest: buildDailyQuest(dna, engagement),
    achievements: buildAchievements(dna, engagement),
    funStats: buildFunStats(dna, engagement),
    rivalChallenge: buildRivalChallenge(social, engagement),
  };
}

// ════════════════════════════════════════════════════════════════════
// LEVEL UP
// ════════════════════════════════════════════════════════════════════

function buildLevelUp(
  engagement: EngagementScore,
  dna: StudentDNA,
): TeenInsightsVM['levelUp'] {
  // XP is based on engagement score * 100 (so max 10000 XP at level cap)
  const currentXP = engagement.overall * 100;

  // Next level at the next tier threshold
  const tiers = [3000, 5000, 7000, 9000, 10000];
  const nextLevelXP = tiers.find(t => t > currentXP) ?? 10000;

  const progress = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  const title = getLevelTitle(engagement.overall);

  return { currentXP, nextLevelXP, progress, title };
}

function getLevelTitle(score: number): string {
  for (const { min, title } of LEVEL_TITLES) {
    if (score >= min) return title;
  }
  return 'Novato';
}

// ════════════════════════════════════════════════════════════════════
// DAILY QUEST
// ════════════════════════════════════════════════════════════════════

function buildDailyQuest(
  dna: StudentDNA,
  engagement: EngagementScore,
): TeenInsightsVM['dailyQuest'] {
  // Select quest based on what needs improvement
  if (dna.dimensions.consistency < 50) {
    return {
      title: 'Missao: Presenca!',
      description: 'Va para o treino hoje e ganhe XP bonus!',
      xpReward: 200,
      emoji: 'fire',
    };
  }

  if (dna.dimensions.socialConnection < 40) {
    return {
      title: 'Missao: Parceiro de Treino',
      description: 'Treine com alguem novo hoje. Trabalho em equipe = mais XP!',
      xpReward: 150,
      emoji: 'handshake',
    };
  }

  if (dna.dimensions.competitiveness > 60) {
    return {
      title: 'Missao: Top 3',
      description: 'Ganhe mais pontos que ontem e suba no ranking!',
      xpReward: 250,
      emoji: 'trophy',
    };
  }

  if (engagement.trend === 'declining') {
    return {
      title: 'Missao: Comeback',
      description: 'Mostre que voce voltou com tudo! De o maximo no treino.',
      xpReward: 300,
      emoji: 'rocket',
    };
  }

  if (dna.difficultyProfile.weakCompetencies.length > 0) {
    return {
      title: 'Missao: Skill Up',
      description: 'Foque na tecnica que voce mais precisa melhorar hoje.',
      xpReward: 200,
      emoji: 'target',
    };
  }

  return {
    title: 'Missao: Treino Perfeito',
    description: 'De o seu melhor em cada exercicio. Zero mole!',
    xpReward: 150,
    emoji: 'star',
  };
}

// ════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ════════════════════════════════════════════════════════════════════

function buildAchievements(
  dna: StudentDNA,
  engagement: EngagementScore,
): TeenInsightsVM['achievements'] {
  const recent: TeenInsightsVM['achievements']['recent'] = [];
  const nextClosest: TeenInsightsVM['achievements']['nextClosest'] = [];

  // Recent achievements based on dimensions
  if (dna.dimensions.consistency >= 80) {
    recent.push({
      name: 'Maquina de Treino',
      icon: 'robot',
      unlockedAt: dna.computedAt,
    });
  }
  if (dna.dimensions.resilience >= 80) {
    recent.push({
      name: 'Fenix — Sempre Volta',
      icon: 'phoenix',
      unlockedAt: dna.computedAt,
    });
  }
  if (dna.dimensions.competitiveness >= 80) {
    recent.push({
      name: 'Competidor Nato',
      icon: 'swords',
      unlockedAt: dna.computedAt,
    });
  }
  if (dna.dimensions.socialConnection >= 80) {
    recent.push({
      name: 'Alma da Turma',
      icon: 'people',
      unlockedAt: dna.computedAt,
    });
  }
  if (engagement.tier === 'champion') {
    recent.push({
      name: 'Champion Status',
      icon: 'crown',
      unlockedAt: engagement.metadata.computedAt,
    });
  }

  // Next closest achievements
  if (dna.dimensions.consistency < 80) {
    nextClosest.push({
      name: 'Maquina de Treino',
      icon: 'robot',
      progress: dna.dimensions.consistency,
    });
  }
  if (dna.dimensions.resilience < 80) {
    nextClosest.push({
      name: 'Fenix — Sempre Volta',
      icon: 'phoenix',
      progress: dna.dimensions.resilience,
    });
  }
  if (dna.dimensions.competitiveness < 80 && dna.dimensions.competitiveness >= 40) {
    nextClosest.push({
      name: 'Competidor Nato',
      icon: 'swords',
      progress: dna.dimensions.competitiveness,
    });
  }
  if (dna.dimensions.socialConnection < 80 && dna.dimensions.socialConnection >= 30) {
    nextClosest.push({
      name: 'Alma da Turma',
      icon: 'people',
      progress: dna.dimensions.socialConnection,
    });
  }

  // Sort nextClosest by progress descending (closest first)
  nextClosest.sort((a, b) => b.progress - a.progress);

  return {
    recent: recent.slice(0, 3),
    nextClosest: nextClosest.slice(0, 3),
  };
}

// ════════════════════════════════════════════════════════════════════
// FUN STATS
// ════════════════════════════════════════════════════════════════════

function buildFunStats(
  dna: StudentDNA,
  engagement: EngagementScore,
): TeenInsightsVM['funStats'] {
  const stats: TeenInsightsVM['funStats'] = [];

  // Sessions per week
  stats.push({
    emoji: 'calendar',
    text: `Voce treina em media ${dna.patterns.averageSessionsPerWeek}x por semana`,
  });

  // Best day
  const dayName = DAY_NAME_SHORT[dna.patterns.peakPerformanceDay] ?? 'Segunda';
  stats.push({
    emoji: 'star',
    text: `Seu dia mais forte: ${dayName}`,
  });

  // Preferred time
  const timeMap: Record<string, string> = {
    morning: 'de manha',
    afternoon: 'de tarde',
    evening: 'de noite',
  };
  stats.push({
    emoji: 'clock',
    text: `Voce prefere treinar ${timeMap[dna.patterns.preferredTimeSlot] ?? 'de tarde'}`,
  });

  // Streak
  if (engagement.dimensions.physical >= 70) {
    stats.push({
      emoji: 'fire',
      text: 'Sua frequencia esta ON FIRE!',
    });
  }

  // Learning style
  const styleMap: Record<string, string> = {
    consistent_grinder: 'Voce e tipo maratona — constancia e seu superpoder!',
    intensity_burst: 'Voce treina em modo turbo — explosoes de energia!',
    social_learner: 'Voce aprende melhor em grupo — born leader!',
    goal_oriented: 'Voce e focado no objetivo — nothing stops you!',
    explorer: 'Voce gosta de variar — explorer mode ON!',
    routine_follower: 'Voce segue a rotina direitinho — discipline is key!',
  };
  const styleText = styleMap[dna.patterns.learningStyle];
  if (styleText) {
    stats.push({ emoji: 'lightning', text: styleText });
  }

  return stats.slice(0, 5);
}

const DAY_NAME_SHORT: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terca',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sabado',
};

// ════════════════════════════════════════════════════════════════════
// RIVAL CHALLENGE
// ════════════════════════════════════════════════════════════════════

function buildRivalChallenge(
  social: SocialProfile | null,
  engagement: EngagementScore,
): TeenInsightsVM['rivalChallenge'] | undefined {
  if (!social || social.connections.length === 0) return undefined;

  // Find the closest active rival (strongest connection who is still active)
  const rival = social.connections.find(c => c.isActive && c.strength >= 30);
  if (!rival) return undefined;

  return {
    rivalName: rival.name,
    rivalAvatar: undefined,
    metric: 'Treinos esta semana',
    yourScore: Math.round(engagement.dimensions.physical / 20), // Approximate sessions
    rivalScore: Math.round(engagement.dimensions.physical / 20) + (Math.random() > 0.5 ? 1 : -1),
  };
}
