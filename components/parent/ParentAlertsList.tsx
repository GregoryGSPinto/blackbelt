// ============================================================
// ParentAlertsList — Lista de alertas para pais/responsaveis
// ============================================================
// Alertas categorizados: positivo (verde), atencao (laranja),
// info (azul). Empty state quando nao ha alertas.
// ============================================================
'use client';

import type { ParentInsightsVM } from '@/lib/application/intelligence';

interface ParentAlertsListProps {
  alerts: ParentInsightsVM['parentAlerts'];
}

// ── Alert type styling ──

const ALERT_CONFIG: Record<
  'positive' | 'attention' | 'info',
  { border: string; iconBg: string; iconColor: string; icon: string }
> = {
  positive: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    icon: '✓',
  },
  attention: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    icon: '!',
  },
  info: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    icon: 'i',
  },
};

// ── Component ──

export function ParentAlertsList({ alerts }: ParentAlertsListProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Alertas</h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-zinc-500">Nenhum alerta no momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-5">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">Alertas</h3>

      <div className="space-y-2.5">
        {alerts.map((alert, i) => {
          const config = ALERT_CONFIG[alert.type];

          return (
            <div
              key={`${alert.type}-${i}`}
              className={`flex items-start gap-3 rounded-lg border border-zinc-800 border-l-[3px] ${config.border} bg-zinc-800/30 px-4 py-3`}
            >
              {/* Icon */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.iconBg} mt-0.5`}
              >
                <span className={`text-xs font-medium ${config.iconColor}`}>
                  {config.icon}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {alert.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
