/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  KIDS INSIGHTS PROJECTOR — ViewModel para Criancas              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function. Zero side effects. Zero fetch.                  ║
 * ║                                                                 ║
 * ║  Tudo POSITIVO, divertido e adventure-themed.                   ║
 * ║  Kids-safe: sem dados negativos, sem risco, sem pressao.        ║
 * ║  Mascote, estrelas, stickers, aventura.                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { StudentDNA } from '@/lib/domain/intelligence/models/student-dna.types';
import type { EngagementScore } from '@/lib/domain/intelligence/models/engagement.types';

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface KidsInsightsVM {
  adventure: {
    currentChapter: string;
    starsCollected: number;
    totalStars: number;
    mascotMessage: string;
    mascotMood: 'happy' | 'excited' | 'encouraging' | 'proud';
  };
  stickers: {
    earned: {
      id: string;
      name: string;
      image: string;
    }[];
    nextToEarn: {
      name: string;
      hint: string;
      progress: number;
    };
  };
  stars: {
    technique: number;
    effort: number;
    behavior: number;
    lastUpdated: string;
  };
  simpleProgress: {
    beltColor: string;
    beltName: string;
    stripesEarned: number;
    stripesTotal: number;
    daysUntilNextStripe: number | null;
    cheerMessage: string;
  };
}

// ════════════════════════════════════════════════════════════════════
// ADVENTURE CHAPTERS
// ════════════════════════════════════════════════════════════════════

const CHAPTERS: { min: number; name: string }[] = [
  { min: 90, name: 'O Grande Mestre' },
  { min: 75, name: 'O Guardiao da Faixa' },
  { min: 60, name: 'A Montanha dos Desafios' },
  { min: 45, name: 'A Floresta dos Treinos' },
  { min: 30, name: 'O Vale da Coragem' },
  { min: 15, name: 'A Trilha do Aprendiz' },
  { min: 0, name: 'O Inicio da Aventura' },
];

// ════════════════════════════════════════════════════════════════════
// MAIN PROJECTOR
// ════════════════════════════════════════════════════════════════════

/**
 * Projeta insights kids-safe para criancas.
 *
 * @param dna - DNA do aluno
 * @param engagement - Score de engajamento
 * @param snapshot - Snapshot do participante (any para flexibilidade)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function projectKidsInsights(
  dna: StudentDNA,
  engagement: EngagementScore,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
): KidsInsightsVM {
  return {
    adventure: buildAdventure(engagement, dna),
    stickers: buildStickers(dna, engagement),
    stars: buildStars(dna, engagement),
    simpleProgress: buildSimpleProgress(dna, engagement, snapshot),
  };
}

// ════════════════════════════════════════════════════════════════════
// ADVENTURE
// ════════════════════════════════════════════════════════════════════

function buildAdventure(
  engagement: EngagementScore,
  dna: StudentDNA,
): KidsInsightsVM['adventure'] {
  const currentChapter = getChapter(engagement.overall);

  // Stars: based on total engagement * progression
  const starsCollected = Math.round(
    (engagement.overall / 100) * 50 + (dna.dimensions.progression / 100) * 50,
  );
  const totalStars = 100;

  const { message, mood } = getMascotState(engagement, dna);

  return {
    currentChapter,
    starsCollected,
    totalStars,
    mascotMessage: message,
    mascotMood: mood,
  };
}

function getChapter(score: number): string {
  for (const { min, name } of CHAPTERS) {
    if (score >= min) return name;
  }
  return 'O Inicio da Aventura';
}

function getMascotState(
  engagement: EngagementScore,
  dna: StudentDNA,
): { message: string; mood: KidsInsightsVM['adventure']['mascotMood'] } {
  // Always positive! Never negative messages for kids.

  if (engagement.tier === 'champion') {
    return {
      message: 'Voce e incrivel! Estou super orgulhoso de voce!',
      mood: 'proud',
    };
  }

  if (engagement.trend === 'rising') {
    return {
      message: 'Uau! Voce esta ficando mais forte a cada treino!',
      mood: 'excited',
    };
  }

  if (dna.dimensions.consistency >= 70) {
    return {
      message: 'Voce sempre vem treinar! Isso me deixa muito feliz!',
      mood: 'happy',
    };
  }

  if (dna.dimensions.resilience >= 70) {
    return {
      message: 'Voce nunca desiste! Isso e o espirito de um verdadeiro guerreiro!',
      mood: 'proud',
    };
  }

  // Encouraging for everyone else (always positive)
  return {
    message: 'Vamos treinar juntos! Cada treino te deixa mais forte!',
    mood: 'encouraging',
  };
}

// ════════════════════════════════════════════════════════════════════
// STICKERS
// ════════════════════════════════════════════════════════════════════

function buildStickers(
  dna: StudentDNA,
  engagement: EngagementScore,
): KidsInsightsVM['stickers'] {
  const earned: KidsInsightsVM['stickers']['earned'] = [];

  // Stickers earned based on positive achievements
  if (dna.dimensions.consistency >= 60) {
    earned.push({ id: 'sticker_consistent', name: 'Sempre Presente', image: 'sticker_star' });
  }
  if (dna.dimensions.resilience >= 60) {
    earned.push({ id: 'sticker_brave', name: 'Super Corajoso', image: 'sticker_hero' });
  }
  if (dna.dimensions.socialConnection >= 60) {
    earned.push({ id: 'sticker_friend', name: 'Melhor Amigo', image: 'sticker_heart' });
  }
  if (engagement.overall >= 70) {
    earned.push({ id: 'sticker_warrior', name: 'Guerreiro', image: 'sticker_sword' });
  }
  if (dna.dimensions.responsiveness >= 70) {
    earned.push({ id: 'sticker_listener', name: 'Bom Ouvinte', image: 'sticker_ear' });
  }

  // Next sticker to earn (always achievable!)
  let nextToEarn: KidsInsightsVM['stickers']['nextToEarn'];

  if (dna.dimensions.consistency < 60) {
    nextToEarn = {
      name: 'Sempre Presente',
      hint: 'Continue vindo treinar e voce ganha!',
      progress: Math.round((dna.dimensions.consistency / 60) * 100),
    };
  } else if (engagement.overall < 80) {
    nextToEarn = {
      name: 'Super Guerreiro',
      hint: 'De o seu melhor em cada treino!',
      progress: Math.round((engagement.overall / 80) * 100),
    };
  } else {
    nextToEarn = {
      name: 'Lenda da Academia',
      hint: 'Voce esta quase la! Continue sendo incrivel!',
      progress: Math.round((engagement.overall / 100) * 100),
    };
  }

  return {
    earned: earned.slice(0, 5),
    nextToEarn,
  };
}

// ════════════════════════════════════════════════════════════════════
// STARS
// ════════════════════════════════════════════════════════════════════

function buildStars(
  dna: StudentDNA,
  engagement: EngagementScore,
): KidsInsightsVM['stars'] {
  // Stars are always 1-5 (kid-friendly scale)
  // Minimum 1 star for everything (never zero — always positive!)

  return {
    technique: Math.max(1, Math.min(5, Math.round(dna.dimensions.progression / 20))),
    effort: Math.max(1, Math.min(5, Math.round(engagement.dimensions.physical / 20))),
    behavior: Math.max(1, Math.min(5, Math.round(dna.dimensions.responsiveness / 20))),
    lastUpdated: engagement.metadata.computedAt,
  };
}

// ════════════════════════════════════════════════════════════════════
// SIMPLE PROGRESS
// ════════════════════════════════════════════════════════════════════

function buildSimpleProgress(
  dna: StudentDNA,
  engagement: EngagementScore,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any,
): KidsInsightsVM['simpleProgress'] {
  // Extract belt info from snapshot
  const currentMilestone = snapshot?.currentMilestone ?? snapshot?.time?.currentMilestone;
  const beltColor = extractBeltColor(currentMilestone);
  const beltName = currentMilestone?.name ?? beltColor;

  // Stripes: from sublevels
  const stripesEarned = snapshot?.sublevels?.current ?? 0;
  const stripesTotal = snapshot?.sublevels?.total ?? 4;

  // Days until next stripe estimate
  let daysUntilNextStripe: number | null = null;
  if (dna.predictions.nextMilestoneWeeks !== null) {
    const stripesRemaining = Math.max(1, stripesTotal - stripesEarned);
    daysUntilNextStripe = Math.round((dna.predictions.nextMilestoneWeeks * 7) / stripesRemaining);
  }

  // Cheer message — always encouraging!
  const cheerMessage = buildCheerMessage(engagement, stripesEarned, stripesTotal);

  return {
    beltColor,
    beltName,
    stripesEarned,
    stripesTotal,
    daysUntilNextStripe,
    cheerMessage,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBeltColor(milestone: any): string {
  if (!milestone) return 'Branca';

  const name = (milestone.name ?? milestone ?? '').toString().toLowerCase();

  if (name.includes('preta') || name.includes('black')) return 'Preta';
  if (name.includes('marrom') || name.includes('brown')) return 'Marrom';
  if (name.includes('roxa') || name.includes('purple')) return 'Roxa';
  if (name.includes('azul') || name.includes('blue')) return 'Azul';
  if (name.includes('verde') || name.includes('green')) return 'Verde';
  if (name.includes('amarela') || name.includes('yellow')) return 'Amarela';
  if (name.includes('laranja') || name.includes('orange')) return 'Laranja';
  if (name.includes('cinza') || name.includes('gray') || name.includes('grey')) return 'Cinza';

  return 'Branca';
}

function buildCheerMessage(
  engagement: EngagementScore,
  stripesEarned: number,
  stripesTotal: number,
): string {
  if (stripesEarned >= stripesTotal) {
    return 'Voce completou todas as faixinhas! A proxima faixa esta chegando!';
  }

  if (stripesEarned >= stripesTotal - 1) {
    return 'Falta so mais uma faixinha! Voce consegue!';
  }

  if (engagement.tier === 'champion' || engagement.tier === 'committed') {
    return 'Voce esta indo super bem! Continue assim, campeao!';
  }

  if (engagement.trend === 'rising') {
    return 'Voce esta melhorando muito! Que orgulho!';
  }

  return 'Cada treino te deixa mais perto da proxima faixinha! Vamos la!';
}
