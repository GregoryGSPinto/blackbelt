'use client';

import { useState, useEffect } from 'react';
import { ChurnDashboard } from '@/components/admin/ChurnDashboard';
import { AIInsightsDashboard } from '@/components/admin/AIInsightsDashboard';

type TabKey = 'visao-geral' | 'risco-evasao';

export default function AIInsightsPage() {
  const [academyId, setAcademyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('visao-geral');

  // Fetch academy info
  useEffect(() => {
    fetch('/api/academies')
      .then(res => res.json())
      .then(json => {
        if (json.data?.id) setAcademyId(json.data.id);
      })
      .catch(() => {});
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'visao-geral', label: 'Visao Geral' },
    { key: 'risco-evasao', label: 'Risco de Evasao' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
            IA Insights
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Analise preditiva, DNA comportamental e recomendacoes inteligentes
          </p>
        </div>
        <AIStatusBadge />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'visao-geral' && (
        <div className="space-y-6">
          {academyId ? (
            <AIInsightsDashboard
              academyId={academyId}
              analytics={null}
            />
          ) : (
            <LoadingSkeleton message="Carregando insights de IA..." />
          )}
        </div>
      )}

      {activeTab === 'risco-evasao' && (
        <div>
          {academyId ? (
            <ChurnDashboard academyId={academyId} />
          ) : (
            <LoadingSkeleton message="Carregando academia..." />
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════

function AIStatusBadge() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ai/health')
      .then(res => res.json())
      .then(json => setStatus(json.data?.status))
      .catch(() => setStatus('error'));
  }, []);

  const color =
    status === 'ok'
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : status === 'error'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs border ${color}`}>
      IA {status === 'ok' ? 'Ativa' : status === 'error' ? 'Erro' : '...'}
    </span>
  );
}

function LoadingSkeleton({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
      <p className="text-red-400 text-sm font-medium">Erro ao carregar dados</p>
      <p className="text-red-400/60 text-xs mt-1">{message}</p>
    </div>
  );
}
