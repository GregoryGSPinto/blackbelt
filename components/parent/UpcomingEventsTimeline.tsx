// ============================================================
// UpcomingEventsTimeline — Timeline vertical de proximos eventos
// ============================================================
// Mostra datas, tipo de evento (dot colorido) e titulo.
// Linha conectora entre pontos. Empty state incluso.
// ============================================================
'use client';

import type { ParentInsightsVM } from '@/lib/application/intelligence';
import { useFormatting } from '@/hooks/useFormatting';

interface UpcomingEventsTimelineProps {
  events: ParentInsightsVM['upcomingEvents'];
}

// ── Event type styling ──

type EventType = 'class' | 'evaluation' | 'event' | 'promotion';

const EVENT_CONFIG: Record<EventType, { dot: string; badge: string; badgeBg: string; label: string }> = {
  class: {
    dot: 'bg-blue-500',
    badge: 'text-blue-400',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    label: 'Aula',
  },
  evaluation: {
    dot: 'bg-purple-500',
    badge: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    label: 'Avaliacao',
  },
  event: {
    dot: 'bg-emerald-500',
    badge: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    label: 'Evento',
  },
  promotion: {
    dot: 'bg-amber-500',
    badge: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    label: 'Graduacao',
  },
};

// ── Component ──

export function UpcomingEventsTimeline({ events }: UpcomingEventsTimelineProps) {
  const { formatDate } = useFormatting();
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-dark-card/60 p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Proximos Eventos</h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-zinc-500">Nenhum evento proximo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 p-5">
      <h3 className="text-sm font-semibold text-zinc-200 mb-5">Proximos Eventos</h3>

      <div className="relative">
        {events.map((event, i) => {
          const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.event;
          const formatted = formatDate(event.date, 'short');
          const parts = formatted.split('/');
          const day = parts[0] ?? '--';
          const monthYear = parts[1] ?? '---';
          const isLast = i === events.length - 1;

          return (
            <div key={`${event.date}-${event.type}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Date column */}
              <div className="flex flex-col items-center w-10 shrink-0 text-center">
                <span className="text-sm font-medium text-zinc-200 leading-none">{day}</span>
                <span className="text-[10px] text-zinc-500 uppercase mt-0.5">{monthYear}</span>
              </div>

              {/* Timeline dot + line */}
              <div className="relative flex flex-col items-center shrink-0">
                {/* Dot */}
                <div className={`h-3 w-3 rounded-full ${config.dot} ring-2 ring-zinc-900 z-10`} />

                {/* Connecting line */}
                {!isLast && (
                  <div className="absolute top-3 w-px h-full bg-zinc-800" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 -mt-0.5 pb-2">
                <p className="text-sm font-medium text-zinc-300">{event.title}</p>
                <span
                  className={`inline-flex items-center mt-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.badgeBg} ${config.badge}`}
                >
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
