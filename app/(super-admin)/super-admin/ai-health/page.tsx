'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Server, Database, Cpu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';
import { AnimatedCounter } from '@/components/transitions/AnimatedCounter';
import { StaggerList, StaggerItem } from '@/components/transitions/StaggerList';
import { Badge } from '@/components/ui/Badge';

interface PlatformHealth {
  status: string;
  uptime: number;
  totalAcademies: number;
  activeAcademies: number;
  totalPredictions: number;
  avgResponseTime: number;
  errorRate: number;
  modelsActive: string[];
  topAcademies: { id: string; name: string; usage: number }[];
  atRiskAcademies: { id: string; name: string; issue: string }[];
}

export default function SuperAdminAIHealthPage() {
  const t = useTranslations('superAdmin.aiHealth');
  const { formatNumber } = useFormatting();

  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/ai/health?scope=platform')
      .then(res => {
        if (!res.ok) throw new Error(`Load error: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          setHealth(json.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-10 bg-[var(--bg-secondary)] rounded-xl w-1/3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-32 rounded-xl stat-card animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="premium-card rounded-xl border border-red-500/20 p-8 text-center">
          <p className="text-red-400 text-sm font-medium">
            {t('loadError')}
          </p>
          <p className="text-[var(--text-secondary)] text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const healthScore =
    health
      ? Math.round(
          100 -
            (health.errorRate || 0) * 100 -
            (health.atRiskAcademies?.length || 0) * 2
        )
      : 0;

  const scoreColor =
    healthScore >= 90
      ? 'text-emerald-400'
      : healthScore >= 70
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {t('pageTitle')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('pageSubtitle')}
          </p>
        </div>
        <Badge variant={health?.status === 'ok' ? 'success' : 'error'}>
          {health?.status === 'ok' ? t('operational') : t('degraded')}
        </Badge>
      </div>

      {/* Health Score */}
      <div className="premium-card rounded-xl p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-2">
          {t('healthScore')}
        </p>
        <p className={`text-5xl font-medium ${scoreColor}`}>
          <AnimatedCounter value={healthScore} />
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          {t('healthScoreDesc')}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <HealthMetricCard
          icon={<Server size={18} className="text-gold-500" />}
          label={t('uptime')}
          value={health?.uptime ? `${health.uptime.toFixed(2)}%` : '--'}
        />
        <HealthMetricCard
          icon={<Database size={18} className="text-gold-500" />}
          label={t('activeAcademies')}
          value={
            health
              ? `${health.activeAcademies}/${health.totalAcademies}`
              : '--'
          }
        />
        <HealthMetricCard
          icon={<Activity size={18} className="text-emerald-400" />}
          label={t('totalPredictions')}
          value={
            health?.totalPredictions
              ? formatNumber(health.totalPredictions)
              : '--'
          }
        />
        <HealthMetricCard
          icon={<Cpu size={18} className="text-amber-400" />}
          label={t('avgTime')}
          value={
            health?.avgResponseTime
              ? `${health.avgResponseTime}ms`
              : '--'
          }
        />
        <HealthMetricCard
          icon={<AlertTriangle size={18} className="text-red-400" />}
          label={t('errorRate')}
          value={
            health?.errorRate != null
              ? `${(health.errorRate * 100).toFixed(2)}%`
              : '--'
          }
        />
        <HealthMetricCard
          icon={<CheckCircle size={18} className="text-emerald-400" />}
          label={t('activeModels')}
          value={
            health?.modelsActive
              ? String(health.modelsActive.length)
              : '--'
          }
        />
      </div>

      {/* Active Models */}
      {health?.modelsActive && health.modelsActive.length > 0 && (
        <div className="premium-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            {t('modelsInProduction')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {health.modelsActive.map(model => (
              <Badge key={model} variant="gold">
                {model}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Two Column: Top + At-Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Academies */}
        <div className="premium-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            {t('topUsageAcademies')}
          </h2>
          {health?.topAcademies && health.topAcademies.length > 0 ? (
            <StaggerList className="space-y-3">
              {health.topAcademies.map((academy, i) => (
                <StaggerItem key={academy.id}>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] hover-card">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gold-500 w-5">
                        #{i + 1}
                      </span>
                      <span className="text-sm text-[var(--text-primary)]">
                        {academy.name}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">
                      {formatNumber(academy.usage)} {t('predictions')}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <p className="text-[var(--text-secondary)] text-xs">
              {t('noDataAvailable')}
            </p>
          )}
        </div>

        {/* At-Risk Academies */}
        <div className="premium-card rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            {t('atRiskAcademies')}
          </h2>
          {health?.atRiskAcademies && health.atRiskAcademies.length > 0 ? (
            <StaggerList className="space-y-3">
              {health.atRiskAcademies.map(academy => (
                <StaggerItem key={academy.id}>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <span className="text-sm text-[var(--text-primary)]">
                      {academy.name}
                    </span>
                    <Badge variant="error">{academy.issue}</Badge>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400">
                {t('allHealthy')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════

function HealthMetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="stat-card hover-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-[var(--bg-secondary)]">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-medium text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-1">{label}</p>
    </div>
  );
}
