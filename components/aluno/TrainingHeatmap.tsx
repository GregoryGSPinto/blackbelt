// ============================================================
// TrainingHeatmap — GitHub-style Training Activity Grid
// ============================================================
// 52 weeks × 7 days grid showing training activity.
// Color intensity based on number of sessions per day.
// Tooltip on hover with date + session count.
// Mobile: horizontal scroll, Desktop: full width.
// ============================================================
'use client';

import { useState, useMemo } from 'react';

const HEATMAP_STYLES = `
  @keyframes heatmap-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .heatmap-cell {
    animation: heatmap-fade-in 300ms ease both;
  }
  .heatmap-tooltip {
    pointer-events: none;
    animation: heatmap-fade-in 150ms ease;
  }
`;

// ── Types ──
export interface TrainingDay {
  date: string;     // "2025-01-15"
  sessions: number; // 0, 1, 2, 3+
}

interface TrainingHeatmapProps {
  /** Array of training days (last ~365 days) */
  data: TrainingDay[];
  /** Number of weeks to show (default: 52) */
  weeks?: number;
  /** Accent color for filled cells */
  accentColor?: string;
}

// ── Color intensity levels ──
function getCellColor(sessions: number, accent: string): string {
  if (sessions === 0) return 'rgba(255,255,255,0.03)';
  if (sessions === 1) return `${accent}40`;
  if (sessions === 2) return `${accent}80`;
  return `${accent}CC`; // 3+
}

function getCellBorder(sessions: number): string {
  if (sessions === 0) return 'rgba(255,255,255,0.04)';
  return 'rgba(255,255,255,0.06)';
}

// ── Day labels ──
const DAY_LABELS = ['', 'Seg', '', 'Qua', '', 'Sex', ''];
const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function TrainingHeatmap({
  data,
  weeks = 52,
  accentColor = '#22C55E',
}: TrainingHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    sessions: number;
  } | null>(null);

  // Build date→sessions lookup
  const lookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data) {
      map.set(d.date, d.sessions);
    }
    return map;
  }, [data]);

  // Generate grid: weeks × 7 days, ending today
  const grid = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDay(); // 0=Sun
    const totalDays = weeks * 7;

    // Start from (totalDays - 1) days ago, aligned to Sunday
    const startOffset = totalDays - 1 + todayDay;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - startOffset);

    const result: { date: string; sessions: number; month: number; isToday: boolean }[][] = [];

    let currentDate = new Date(startDate);
    for (let w = 0; w < weeks; w++) {
      const week: typeof result[0] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isFuture = currentDate > today;
        week.push({
          date: dateStr,
          sessions: isFuture ? -1 : (lookup.get(dateStr) ?? 0),
          month: currentDate.getMonth(),
          isToday: dateStr === today.toISOString().split('T')[0],
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      result.push(week);
    }

    return result;
  }, [weeks, lookup]);

  // Calculate month labels positions
  const monthMarkers = useMemo(() => {
    const markers: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < grid.length; w++) {
      const month = grid[w][0].month;
      if (month !== lastMonth) {
        markers.push({ label: MONTH_LABELS[month], col: w });
        lastMonth = month;
      }
    }
    return markers;
  }, [grid]);

  // Stats
  const stats = useMemo(() => {
    let totalSessions = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Walk backwards from today to count current streak
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const s = lookup.get(dateStr) ?? 0;
      if (s > 0) {
        totalSessions += s;
        activeDays++;
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        if (i === 0 || currentStreak === i) currentStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    return { totalSessions, activeDays, currentStreak, maxStreak };
  }, [lookup]);

  const CELL_SIZE = 12;
  const CELL_GAP = 2;
  const cellStep = CELL_SIZE + CELL_GAP;

  const handleMouseEnter = (e: React.MouseEvent, date: string, sessions: number) => {
    if (sessions < 0) return; // future
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      date,
      sessions,
    });
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: HEATMAP_STYLES }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">Atividade de Treino</h3>
        <div className="flex items-center gap-3 text-[10px] text-white/30">
          <span>{stats.totalSessions} treinos</span>
          <span>·</span>
          <span>{stats.activeDays} dias ativos</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1" onMouseLeave={() => setTooltip(null)}>
        <div style={{ minWidth: weeks * cellStep + 24 }}>
          {/* Month labels */}
          <div className="flex ml-6 mb-1" style={{ height: 14 }}>
            {monthMarkers.map((m, i) => (
              <span
                key={i}
                className="text-[9px] text-white/20 absolute"
                style={{ marginLeft: m.col * cellStep }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ width: 20 }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-[9px] text-white/15 text-right pr-1"
                  style={{ height: cellStep, lineHeight: `${cellStep}px` }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-[2px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((day, di) => {
                    if (day.sessions < 0) {
                      // Future cell
                      return (
                        <div
                          key={di}
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            borderRadius: 2,
                            background: 'transparent',
                          }}
                        />
                      );
                    }
                    return (
                      <div
                        key={di}
                        className="heatmap-cell cursor-default"
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: 2,
                          background: getCellColor(day.sessions, accentColor),
                          border: `1px solid ${getCellBorder(day.sessions)}`,
                          animationDelay: `${(wi * 7 + di) * 0.5}ms`,
                          outline: day.isToday ? `1px solid rgba(255,255,255,0.3)` : undefined,
                          outlineOffset: -1,
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, day.date, day.sessions)}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 text-[9px] text-white/20">
          <span>Menos</span>
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: getCellColor(level, accentColor),
                border: `1px solid ${getCellBorder(level)}`,
              }}
            />
          ))}
          <span>Mais</span>
        </div>

        {/* Streak info */}
        <div className="flex items-center gap-3 text-[10px]">
          {stats.currentStreak > 0 && (
            <span className="text-white/40">
              🔥 <span className="text-white/70 font-bold">{stats.currentStreak}d</span> streak
            </span>
          )}
          {stats.maxStreak > 0 && (
            <span className="text-white/25">
              Recorde: {stats.maxStreak}d
            </span>
          )}
        </div>
      </div>

      {/* Tooltip (portal-less, uses fixed positioning) */}
      {tooltip && (
        <div
          className="heatmap-tooltip fixed z-[100] px-2.5 py-1.5 rounded-lg text-center"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0,0,0,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p className="text-white text-[11px] font-bold">
            {tooltip.sessions === 0
              ? 'Sem treino'
              : `${tooltip.sessions} ${tooltip.sessions === 1 ? 'treino' : 'treinos'}`}
          </p>
          <p className="text-white/30 text-[9px]">{formatDateLabel(tooltip.date)}</p>
        </div>
      )}
    </div>
  );
}
