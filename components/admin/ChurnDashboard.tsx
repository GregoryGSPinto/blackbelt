'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useChurnInsights } from '@/hooks/useChurnInsights';
import type {
  AdminChurnOverviewVM,
  AdminChurnStudentVM,
  AggregatedRecommendation,
} from '@/lib/application/intelligence';

// ════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════════

export function ChurnDashboard({ academyId }: { academyId: string }) {
  const t = useTranslations('admin');
  const { overview, loading, error, refetch } = useChurnInsights(academyId);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 mb-2">Erro ao carregar dados de IA</p>
        <p className="text-sm text-zinc-500">{error.message}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-6">
      <ChurnOverviewCards summary={overview.summary} averageScore={overview.averageScore} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChurnRiskList overview={overview} />
        </div>
        <div>
          <ChurnRecommendations recommendations={overview.topRecommendations} />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// OVERVIEW CARDS
// ════════════════════════════════════════════════════════════════════

function ChurnOverviewCards({
  summary,
  averageScore,
}: {
  summary: AdminChurnOverviewVM['summary'];
  averageScore: number;
}) {
  const t = useTranslations('admin');
  const cards = [
    { label: t('churn.critical'), value: summary.critical, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { label: t('churn.atRisk'), value: summary.atRisk, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { label: t('churn.observation'), value: summary.watch, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { label: t('churn.safe'), value: summary.safe, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(card => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 ${card.color}`}
        >
          <p className="text-2xl font-medium">{card.value}</p>
          <p className="text-sm opacity-80">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// RISK LIST
// ════════════════════════════════════════════════════════════════════

function ChurnRiskList({ overview }: { overview: AdminChurnOverviewVM }) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<'critical' | 'at_risk' | 'watch'>('critical');

  const tabs = [
    { key: 'critical' as const, label: t('churn.critical'), count: overview.summary.critical, color: 'text-red-400' },
    { key: 'at_risk' as const, label: t('churn.atRisk'), count: overview.summary.atRisk, color: 'text-orange-400' },
    { key: 'watch' as const, label: t('churn.observation'), count: overview.summary.watch, color: 'text-yellow-400' },
  ];

  const students =
    activeTab === 'critical'
      ? overview.criticalStudents
      : activeTab === 'at_risk'
      ? overview.atRiskStudents
      : overview.watchStudents;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
      <div className="flex border-b border-zinc-700/50">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? `${tab.color} bg-zinc-800/50 border-b-2 border-current`
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="divide-y divide-zinc-800/50">
        {students.length === 0 && (
          <div className="p-6 text-center text-zinc-500 text-sm">
            {t('churn.noStudentsCategory')}
          </div>
        )}
        {students.map(student => (
          <ChurnStudentRow key={student.participantId} student={student} />
        ))}
      </div>
    </div>
  );
}

function ChurnStudentRow({ student }: { student: AdminChurnStudentVM }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
          {student.avatar ? (
            <img src={student.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            student.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">{student.name}</p>
          <p className="text-xs text-zinc-500 truncate">{student.topFactorDescription}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <RiskScoreBadge score={student.score} />
          <span className="text-xs text-zinc-600">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pl-11 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Confiança:</span>
            <span className="text-zinc-400">{Math.round(student.confidence * 100)}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Recomendações:</span>
            <span className="text-zinc-400">{student.recommendationCount} ações sugeridas</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// RECOMMENDATIONS
// ════════════════════════════════════════════════════════════════════

function ChurnRecommendations({
  recommendations,
}: {
  recommendations: AggregatedRecommendation[];
}) {
  const t = useTranslations('admin');
  if (recommendations.length === 0) return null;

  const priorityIcons: Record<string, string> = {
    urgent: '!!',
    high: '!',
    medium: '-',
    low: '~',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-zinc-400',
  };

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4">
      <h3 className="text-sm font-medium text-zinc-300 mb-3">{t('churn.recommendedActions')}</h3>
      <div className="space-y-3">
        {recommendations.slice(0, 5).map((rec, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-xs font-medium mt-0.5 ${priorityColors[rec.priority]}`}>
              {priorityIcons[rec.priority]}
            </span>
            <div className="flex-1">
              <p className="text-xs text-zinc-300">{rec.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-600">
                  {rec.affectedCount} aluno{rec.affectedCount !== 1 ? 's' : ''}
                </span>
                {rec.automatable && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    automatizável
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SHARED: Risk Score Badge
// ════════════════════════════════════════════════════════════════════

export function RiskScoreBadge({ score }: { score: number }) {
  let color = 'bg-green-500/20 text-green-400';
  if (score >= 70) color = 'bg-red-500/20 text-red-400';
  else if (score >= 45) color = 'bg-orange-500/20 text-orange-400';
  else if (score >= 25) color = 'bg-yellow-500/20 text-yellow-400';

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {score}
    </span>
  );
}
