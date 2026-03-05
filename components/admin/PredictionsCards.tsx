'use client';

import { useTranslations } from 'next-intl';

// ════════════════════════════════════════════════════════════════════
// PREDICTIONS CARDS — Previsoes de curto prazo da academia
// ════════════════════════════════════════════════════════════════════

interface PredictionsCardsProps {
  predictions: {
    expectedChurnNext30Days: number;
    expectedRevenueImpact: number;
    highestRiskFactor: string;
    avgChurnScore: number;
    trendVsLastMonth: string;
  };
}

const PREDICTION_ICONS: Record<string, string> = {
  churn: '!!',
  revenue: 'R$',
  factor: '?',
  score: '#',
};

export function PredictionsCards({ predictions }: PredictionsCardsProps) {
  const t = useTranslations('admin');
  const cards = [
    {
      icon: PREDICTION_ICONS.churn,
      label: t('predictions.churn30d'),
      value: predictions.expectedChurnNext30Days.toString(),
      sublabel: 'alunos em risco de saida',
      color: predictions.expectedChurnNext30Days > 5
        ? 'border-red-500/30 bg-red-500/10'
        : predictions.expectedChurnNext30Days > 2
        ? 'border-orange-500/30 bg-orange-500/10'
        : 'border-green-500/30 bg-green-500/10',
      valueColor: predictions.expectedChurnNext30Days > 5
        ? 'text-red-400'
        : predictions.expectedChurnNext30Days > 2
        ? 'text-orange-400'
        : 'text-green-400',
    },
    {
      icon: PREDICTION_ICONS.revenue,
      label: t('predictions.revenueImpact'),
      value: `R$ ${predictions.expectedRevenueImpact.toLocaleString('pt-BR')}`,
      sublabel: 'potencial perda mensal',
      color: predictions.expectedRevenueImpact > 1000
        ? 'border-red-500/30 bg-red-500/10'
        : predictions.expectedRevenueImpact > 500
        ? 'border-orange-500/30 bg-orange-500/10'
        : 'border-green-500/30 bg-green-500/10',
      valueColor: predictions.expectedRevenueImpact > 1000
        ? 'text-red-400'
        : predictions.expectedRevenueImpact > 500
        ? 'text-orange-400'
        : 'text-green-400',
    },
    {
      icon: PREDICTION_ICONS.factor,
      label: t('predictions.highestRiskFactor'),
      value: predictions.highestRiskFactor,
      sublabel: 'causa mais comum de evasao',
      color: 'border-yellow-500/30 bg-yellow-500/10',
      valueColor: 'text-yellow-400',
    },
    {
      icon: PREDICTION_ICONS.score,
      label: t('predictions.avgRiskScore'),
      value: predictions.avgChurnScore.toString(),
      sublabel: predictions.trendVsLastMonth,
      color: predictions.avgChurnScore > 50
        ? 'border-red-500/30 bg-red-500/10'
        : predictions.avgChurnScore > 30
        ? 'border-yellow-500/30 bg-yellow-500/10'
        : 'border-green-500/30 bg-green-500/10',
      valueColor: predictions.avgChurnScore > 50
        ? 'text-red-400'
        : predictions.avgChurnScore > 30
        ? 'text-yellow-400'
        : 'text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 ${card.color}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold ${card.valueColor} bg-zinc-800/50 px-1.5 py-0.5 rounded`}>
              {card.icon}
            </span>
            <span className="text-[11px] text-zinc-500">{card.label}</span>
          </div>
          <p className={`text-xl font-bold ${card.valueColor} truncate`}>{card.value}</p>
          <p className="text-[10px] text-zinc-600 mt-1">{card.sublabel}</p>
        </div>
      ))}
    </div>
  );
}
