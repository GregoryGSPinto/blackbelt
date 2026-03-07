// ============================================================
// CheckinCalendar — Visual attendance grid for parent view
// ============================================================
// Compact month calendar showing present/absent/no-class days.
// Used in painel-responsavel/checkin page.
// ============================================================
'use client';

import { useMemo } from 'react';
import { useFormatting } from '@/hooks/useFormatting';

// ── Types ──

export interface CheckinDay {
  data: string;          // YYYY-MM-DD
  presente: boolean;
  turma?: string;
  horario?: string;
  confirmadoPor?: 'app' | 'instrutor' | 'responsavel';
}

interface CheckinCalendarProps {
  days: CheckinDay[];
  /** Schedule: which weekday numbers have class (0=Sun,1=Mon...) */
  classDays: number[];
  month?: Date;
}

// ── Helpers ──

const DIAS_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  const days: Date[] = [];
  for (let d = 1; d <= count; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ── Component ──

type CalendarCell =
  | { key: string; type: 'pad' }
  | { key: string; type: 'presente' | 'ausente' | 'sem_aula' | 'futuro'; day: number; isToday: boolean };

export function CheckinCalendar({ days, classDays, month }: CheckinCalendarProps) {
  const { formatMonthShort } = useFormatting();
  const now = month || new Date();
  const today = toISO(new Date());

  const { grid, stats } = useMemo(() => {
    const allDays = getDaysInMonth(now);
    const dayMap = new Map(days.map(d => [d.data, d]));

    // Pad start of month
    const firstDow = allDays[0].getDay();
    const padded: (Date | null)[] = Array(firstDow).fill(null).concat(allDays);

    let presentes = 0;
    let ausentes = 0;
    let total = 0;

    const cells: CalendarCell[] = padded.map((date, i) => {
      if (!date) return { key: `pad-${i}`, type: 'pad' as const };

      const iso = toISO(date);
      const dow = date.getDay();
      const hasClass = classDays.includes(dow);
      const isFuture = iso > today;
      const record = dayMap.get(iso);

      if (hasClass && !isFuture) {
        total++;
        if (record?.presente) presentes++;
        else ausentes++;
      }

      let type: 'presente' | 'ausente' | 'sem_aula' | 'futuro';
      if (isFuture) type = 'futuro';
      else if (!hasClass) type = 'sem_aula';
      else if (record?.presente) type = 'presente';
      else type = 'ausente';

      return {
        key: iso,
        type,
        day: date.getDate(),
        isToday: iso === today,
      };
    });

    return {
      grid: cells,
      stats: {
        presentes,
        ausentes,
        total,
        pct: total > 0 ? Math.round((presentes / total) * 100) : 0,
      },
    };
  }, [days, classDays, now, today]);

  const monthLabel = formatMonthShort(now);

  return (
    <div className="space-y-4">
      {/* Month label */}
      <p className="text-xs text-white/40 font-medium capitalize text-center">{monthLabel}</p>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DIAS_LABEL.map((label, i) => (
          <div key={i} className="text-center text-[9px] text-white/20 font-medium py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell: CalendarCell) => {
          if (cell.type === 'pad') {
            return <div key={cell.key} />;
          }

          const colors: Record<string, string> = {
            presente: 'bg-green-500/30 text-green-300',
            ausente: 'bg-red-500/20 text-red-300',
            sem_aula: 'bg-white/[0.02] text-white/15',
            futuro: 'bg-white/[0.02] text-white/10',
          };

          return (
            <div
              key={cell.key}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium ${colors[cell.type] || ''}`}
              title={
                cell.type === 'presente' ? 'Presente' :
                cell.type === 'ausente' ? 'Ausente' :
                cell.type === 'sem_aula' ? 'Sem aula' : ''
              }
            >
              {cell.day}
              {cell.isToday && (
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white/50" />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500/40" />
            <span className="text-[10px] text-white/40">{stats.presentes} presentes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/30" />
            <span className="text-[10px] text-white/40">{stats.ausentes} ausentes</span>
          </div>
        </div>
        <span className="text-xs font-medium" style={{ color: stats.pct >= 75 ? '#4ADE80' : stats.pct >= 50 ? '#FBBF24' : '#F87171' }}>
          {stats.pct}%
        </span>
      </div>
    </div>
  );
}
