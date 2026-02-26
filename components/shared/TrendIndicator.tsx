// ============================================================
// TrendIndicator — Visual trend arrows (↑↓→)
// ============================================================
// Shows directional trend with color coding.
//
// Usage:
//   <TrendIndicator current={85} previous={78} />
//   <TrendIndicator current={60} previous={80} format="percent" />
// ============================================================
'use client';

interface TrendIndicatorProps {
  current: number;
  previous: number;
  /** Display format */
  format?: 'percent' | 'number';
  /** Show the delta value */
  showDelta?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional className */
  className?: string;
}

export function TrendIndicator({
  current,
  previous,
  format = 'percent',
  showDelta = true,
  size = 'sm',
  className = '',
}: TrendIndicatorProps) {
  if (previous === 0) return null;

  const delta = current - previous;
  const pctChange = Math.round(((current - previous) / previous) * 100);

  const isUp = delta > 0;
  const isDown = delta < 0;
  const isFlat = delta === 0;

  // Color and arrow
  const color = isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-white/30';
  const arrow = isUp ? '↑' : isDown ? '↓' : '→';
  const bg = isUp ? 'bg-emerald-500/10' : isDown ? 'bg-rose-500/10' : 'bg-white/5';

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';

  const deltaStr = format === 'percent'
    ? `${isUp ? '+' : ''}${pctChange}%`
    : `${isUp ? '+' : ''}${delta}`;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-medium ${textSize} ${padding} ${color} ${bg} ${className}`}
      title={`${previous} → ${current} (${deltaStr})`}
    >
      <span className={isFlat ? '' : isUp ? 'translate-y-[-1px]' : 'translate-y-[1px]'}>{arrow}</span>
      {showDelta && <span>{deltaStr}</span>}
    </span>
  );
}
