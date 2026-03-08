// ============================================================
// Evolução Mock — Timeline events + frequency history
// ============================================================
import type { TimelineEvent } from '@/src/features/students/components/aluno/EvolutionTimeline';

export interface FrequenciaHistorico {
  mes: string;           // "2025-01"
  mesLabel: string;      // "Jan"
  sessõesAssistidas: number;
  metaMensal: number;
  percentual: number;
}

export interface EvolucaoData {
  timeline: TimelineEvent[];
  frequenciaHistorico: FrequenciaHistorico[];
  /** Current month data */
  frequenciaAtual: {
    sessõesAssistidas: number;
    metaMensal: number;
    percentual: number;
    variacao: number;
    tendencia: 'up' | 'down' | 'stable';
    historicoSemanal: number[];
  };
  /** Summary stats */
  resumo: {
    totalSessões: number;
    totalMeses: number;
    melhorStreak: number;
    streakAtual: number;
    mediaFrequencia: number;
    totalConquistas: number;
  };
}

export function getMockEvolucaoData(): EvolucaoData {
  return {
    timeline: [
      {
        id: 'tl-1',
        type: 'graduation',
        title: 'Graduação: Nível Iniciante',
        description: 'Início da jornada no treinamento especializado',
        date: '2022-03-15',
        emoji: '🥋',
        nivelCor: 'Nível Iniciante',
      },
      {
        id: 'tl-2',
        type: 'milestone',
        title: '50 Check-ins',
        description: 'Primeira grande marca de presença',
        date: '2022-08-20',
        emoji: '🎯',
      },
      {
        id: 'tl-3',
        type: 'subnivel',
        title: '1° Subnível — Nível Iniciante',
        description: 'Concedido por Prof. Ricardo',
        date: '2023-01-10',
        emoji: '⭐',
      },
      {
        id: 'tl-4',
        type: 'achievement',
        title: 'Competição: 1° lugar Iniciante',
        description: 'Copa Regional — Categoria Leve',
        date: '2023-04-22',
        emoji: '🏅',
      },
      {
        id: 'tl-5',
        type: 'subnivel',
        title: '2° Subnível — Nível Iniciante',
        description: 'Concedido por Prof. Ricardo',
        date: '2023-07-15',
        emoji: '⭐',
      },
      {
        id: 'tl-6',
        type: 'milestone',
        title: '100 Check-ins',
        description: 'Dedicação comprovada!',
        date: '2023-09-05',
        emoji: '💯',
      },
      {
        id: 'tl-7',
        type: 'medal',
        title: 'Top 10 Ranking',
        description: 'Entrou no Top 10 do ranking geral pela primeira vez',
        date: '2023-11-18',
        emoji: '🏆',
      },
      {
        id: 'tl-8',
        type: 'subnivel',
        title: '3° Subnível — Nível Iniciante',
        description: 'Concedido por Prof. Ricardo',
        date: '2024-02-10',
        emoji: '⭐',
      },
      {
        id: 'tl-9',
        type: 'graduation',
        title: 'Graduação: Nível Básico',
        description: 'Aprovado no exame de graduação — Prof. Ricardo',
        date: '2024-06-20',
        emoji: '🥋',
        nivelCor: 'Nível Básico',
      },
      {
        id: 'tl-10',
        type: 'milestone',
        title: '200 Check-ins',
        description: 'Guerreiro consistente!',
        date: '2024-10-15',
        emoji: '🔥',
      },
      {
        id: 'tl-11',
        type: 'achievement',
        title: 'Competição: 2° lugar Azul',
        description: 'Campeonato Estadual — Categoria Leve',
        date: '2024-12-08',
        emoji: '🥈',
      },
      {
        id: 'tl-12',
        type: 'subnivel',
        title: '1° Subnível — Nível Básico',
        description: 'Concedido por Prof. Ricardo',
        date: '2025-03-20',
        emoji: '⭐',
      },
      {
        id: 'tl-13',
        type: 'medal',
        title: 'Guerreiro Consistente',
        description: '20 sessões consecutivas sem faltas',
        date: '2025-06-10',
        emoji: '🔥',
      },
      {
        id: 'tl-14',
        type: 'subnivel',
        title: '2° Subnível — Nível Básico',
        description: 'Concedido por Prof. Ricardo',
        date: '2025-09-15',
        emoji: '⭐',
      },
      {
        id: 'tl-15',
        type: 'milestone',
        title: '300 Check-ins',
        description: 'Marca lendária atingida!',
        date: '2025-12-01',
        emoji: '💎',
      },
    ],

    frequenciaHistorico: [
      { mes: '2025-07', mesLabel: 'Jul', sessõesAssistidas: 16, metaMensal: 20, percentual: 80 },
      { mes: '2025-08', mesLabel: 'Ago', sessõesAssistidas: 14, metaMensal: 20, percentual: 70 },
      { mes: '2025-09', mesLabel: 'Set', sessõesAssistidas: 19, metaMensal: 20, percentual: 95 },
      { mes: '2025-10', mesLabel: 'Out', sessõesAssistidas: 17, metaMensal: 20, percentual: 85 },
      { mes: '2025-11', mesLabel: 'Nov', sessõesAssistidas: 15, metaMensal: 20, percentual: 75 },
      { mes: '2025-12', mesLabel: 'Dez', sessõesAssistidas: 16, metaMensal: 20, percentual: 80 },
      { mes: '2026-01', mesLabel: 'Jan', sessõesAssistidas: 18, metaMensal: 20, percentual: 90 },
    ],

    frequenciaAtual: {
      sessõesAssistidas: 18,
      metaMensal: 20,
      percentual: 90,
      variacao: 12,
      tendencia: 'up',
      historicoSemanal: [4, 5, 4, 5],
    },

    resumo: {
      totalSessões: 312,
      totalMeses: 34,
      melhorStreak: 28,
      streakAtual: 12,
      mediaFrequencia: 82,
      totalConquistas: 15,
    },
  };
}
