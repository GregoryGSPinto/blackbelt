'use client';

import { useState } from 'react';
import { useChurnInsights } from '@/hooks/useChurnInsights';
import type { AdminAIAnalyticsVM } from '@/lib/application/intelligence';
import { AcademyHealthScore } from './AcademyHealthScore';
import { RiskMapVisualization } from './RiskMapVisualization';
import { PredictionsCards } from './PredictionsCards';
import { ActionableInsightsList } from './ActionableInsightsList';
import { InstructorPerformanceTable } from './InstructorPerformanceTable';
import { AISystemROI } from './AISystemROI';

// ════════════════════════════════════════════════════════════════════
// AI INSIGHTS DASHBOARD — Container principal do admin AI
// ════════════════════════════════════════════════════════════════════

interface AIInsightsDashboardProps {
  academyId: string;
  analytics: AdminAIAnalyticsVM | null;
  analyticsLoading?: boolean;
  analyticsError?: Error | null;
  onRefresh?: () => void;
}

type TabKey = 'overview' | 'risk' | 'instructors' | 'roi';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Visao Geral' },
  { key: 'risk', label: 'Mapa de Risco' },
  { key: 'instructors', label: 'Instrutores' },
  { key: 'roi', label: 'ROI da IA' },
];

export function AIInsightsDashboard({
  academyId,
  analytics,
  analyticsLoading,
  analyticsError,
  onRefresh,
}: AIInsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { overview: churnOverview } = useChurnInsights(academyId);

  // Loading state
  if (analyticsLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-zinc-800/50 rounded-xl w-96" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-zinc-800/50 rounded-xl" />
          <div className="h-64 bg-zinc-800/50 rounded-xl" />
        </div>
        <div className="h-48 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  // Error state
  if (analyticsError) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 mb-2">Erro ao carregar analytics de IA</p>
        <p className="text-sm text-zinc-500">{analyticsError.message}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AcademyHealthScore
            overallScore={analytics.academyHealth.overallScore}
            trend={analytics.academyHealth.trend}
            breakdown={{
              retention: analytics.academyHealth.retention,
              engagement: analytics.academyHealth.engagement,
              revenue: analytics.academyHealth.revenue,
              growth: analytics.academyHealth.growth,
            }}
          />

          <PredictionsCards
            predictions={{
              expectedChurnNext30Days: analytics.predictions.expectedChurnNext30Days,
              expectedRevenueImpact: analytics.predictions.expectedRevenueImpact,
              highestRiskFactor: analytics.predictions.highestRiskFactor,
              avgChurnScore: analytics.predictions.avgChurnScore,
              trendVsLastMonth: analytics.predictions.trendVsLastMonth,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskMapVisualization riskMap={analytics.riskMap} />
            <ActionableInsightsList insights={analytics.actionableInsights} />
          </div>
        </div>
      )}

      {/* Risk tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          <RiskMapVisualization riskMap={analytics.riskMap} />
          <ActionableInsightsList insights={analytics.actionableInsights} />
        </div>
      )}

      {/* Instructors tab */}
      {activeTab === 'instructors' && (
        <InstructorPerformanceTable instructors={analytics.instructorPerformance} />
      )}

      {/* ROI tab */}
      {activeTab === 'roi' && (
        <AISystemROI
          metrics={{
            predictionsGenerated: analytics.aiSystemMetrics.predictionsGenerated,
            alertsGenerated: analytics.aiSystemMetrics.alertsGenerated,
            alertsActedUpon: Math.round(analytics.aiSystemMetrics.alertsGenerated * 0.6),
            churnsPrevented: Math.round(analytics.predictions.expectedChurnNext30Days * 0.3),
            estimatedRevenueSaved: Math.round(analytics.predictions.expectedChurnNext30Days * 0.3 * 150),
          }}
        />
      )}
    </div>
  );
}
