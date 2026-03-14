'use client';

import { useTranslations } from 'next-intl';

// ════════════════════════════════════════════════════════════════════
// ACADEMY HEALTH SCORE — Gauge visual da saude da academia
// ════════════════════════════════════════════════════════════════════

interface HealthBreakdown {
  retention: { value: number; label: string };
  engagement: { value: number; label: string };
  revenue: { value: number; label: string };
  growth: { value: number; label: string };
}

interface AcademyHealthScoreProps {
  overallScore: number;
  trend: string;
  breakdown: HealthBreakdown;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function getBarColor(value: number): string {
  if (value >= 70) return 'bg-green-500';
  if (value >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getBarBgColor(value: number): string {
  if (value >= 70) return 'bg-green-500/20';
  if (value >= 40) return 'bg-yellow-500/20';
  return 'bg-red-500/20';
}

function getTrendIcon(trend: string): string {
  if (trend.toLowerCase().includes('alta')) return '^';
  if (trend.toLowerCase().includes('queda')) return 'v';
  return '~';
}

export function AcademyHealthScore({ overallScore, trend, breakdown }: AcademyHealthScoreProps) {
  const t = useTranslations('admin');
  const scoreColor = getScoreColor(overallScore);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const dimensions = [
    { key: 'retention', ...breakdown.retention, label: t('academyHealth.retention') },
    { key: 'engagement', ...breakdown.engagement, label: t('academyHealth.engagement') },
    { key: 'revenue', ...breakdown.revenue, label: t('academyHealth.revenue') },
    { key: 'growth', ...breakdown.growth, label: t('academyHealth.growth') },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 p-6">
      <h3 className="text-sm font-medium text-zinc-300 mb-4">{t('academyHealth.title')}</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular progress indicator */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-zinc-800"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={scoreColor}
              style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-medium ${scoreColor}`}>{overallScore}</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">{t('academyHealth.outOf100')}</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-3">
          {dimensions.map((dim) => (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">{dim.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-zinc-300">{dim.value}</span>
                  <span className="text-[10px] text-zinc-600">{dim.label}</span>
                </div>
              </div>
              <div className={`h-2 rounded-full ${getBarBgColor(dim.value)}`}>
                <div
                  className={`h-2 rounded-full ${getBarColor(dim.value)} transition-all duration-500`}
                  style={{ width: `${Math.min(100, dim.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend */}
      <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center gap-2">
        <span className="text-xs text-zinc-500">{t('academyHealth.trend')}:</span>
        <span className={`text-xs font-medium ${
          trend.toLowerCase().includes('alta') ? 'text-green-400' :
          trend.toLowerCase().includes('queda') ? 'text-red-400' :
          'text-zinc-400'
        }`}>
          {getTrendIcon(trend)} {trend}
        </span>
      </div>
    </div>
  );
}
