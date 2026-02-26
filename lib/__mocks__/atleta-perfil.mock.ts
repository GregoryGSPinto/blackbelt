// ============================================================
// Training Heatmap Mock — Generates realistic training data
// ============================================================
import type { TrainingDay } from '@/components/aluno/TrainingHeatmap';

/**
 * Generates ~365 days of training data with realistic patterns:
 * - Higher frequency on weekdays (Mon/Wed/Fri)
 * - Occasional Saturday sessions
 * - Rest days on Sundays
 * - Vacation gaps (2 weeks in Dec, 1 week in Jul)
 * - Gradual increase in frequency over time (new student → consistent)
 */
export function generateMockTrainingData(months = 12): TrainingDay[] {
  const today = new Date();
  const data: TrainingDay[] = [];

  for (let i = months * 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay(); // 0=Sun
    const month = date.getMonth();
    const dateStr = date.toISOString().split('T')[0];

    // Skip future
    if (date > today) continue;

    // Vacation gaps
    const isVacation =
      (month === 11 && date.getDate() >= 20) || // Dec 20-31
      (month === 0 && date.getDate() <= 5) ||    // Jan 1-5
      (month === 6 && date.getDate() >= 10 && date.getDate() <= 20); // Jul 10-20

    if (isVacation) {
      data.push({ date: dateStr, sessions: 0 });
      continue;
    }

    // Sunday = always rest
    if (dayOfWeek === 0) {
      data.push({ date: dateStr, sessions: 0 });
      continue;
    }

    // Consistency improves over time (first months: ~50%, recent: ~85%)
    const monthsAgo = i / 30;
    const consistency = Math.min(0.9, 0.45 + (months - monthsAgo) * 0.04);

    // Training days: Mon(1), Wed(3), Fri(5) are primary
    // Tue(2), Thu(4) are secondary, Sat(6) occasional
    let probability: number;
    if ([1, 3, 5].includes(dayOfWeek)) {
      probability = consistency;
    } else if ([2, 4].includes(dayOfWeek)) {
      probability = consistency * 0.5;
    } else {
      // Saturday
      probability = consistency * 0.3;
    }

    const trained = Math.random() < probability;
    if (!trained) {
      data.push({ date: dateStr, sessions: 0 });
      continue;
    }

    // Number of sessions (usually 1, sometimes 2 on competition days)
    const sessions = Math.random() < 0.1 ? 2 : 1;
    data.push({ date: dateStr, sessions });
  }

  return data;
}

export interface AtletaPerfilCompleto {
  id: string;
  nome: string;
  avatar?: string;
  nivelAtual: string;
  unidade: string;
  mesesTreinando: number;
  totalCheckins: number;
  conquistasRecebidas: number;
  graduacoes: { nivel: string; data: string; professorNome?: string }[];
  linkPublico: string;
  /** Heatmap data */
  trainingData: TrainingDay[];
  /** Additional stats for enhanced profile */
  stats: {
    sessõesEsteMes: number;
    metaMensal: number;
    streakAtual: number;
    melhorStreak: number;
    posicaoRanking: number;
    pontosTotal: number;
    competicoes: number;
    mediaPresenca: number;
  };
}

export function getMockAtletaPerfil(id: string): AtletaPerfilCompleto {
  return {
    id,
    nome: 'Rafael Santos',
    avatar: undefined,
    nivelAtual: 'Nível Básico',
    unidade: 'BlackBelt — São Paulo',
    mesesTreinando: 34,
    totalCheckins: 312,
    conquistasRecebidas: 8,
    graduacoes: [
      { nivel: 'Nível Iniciante', data: '2022-03-15', professorNome: 'Prof. Ricardo' },
      { nivel: 'Nível Básico', data: '2024-06-20', professorNome: 'Prof. Ricardo' },
    ],
    linkPublico: `https://blackbelt.com/atleta/${id}`,
    trainingData: generateMockTrainingData(12),
    stats: {
      sessõesEsteMes: 18,
      metaMensal: 20,
      streakAtual: 12,
      melhorStreak: 28,
      posicaoRanking: 7,
      pontosTotal: 1250,
      competicoes: 4,
      mediaPresenca: 87,
    },
  };
}
