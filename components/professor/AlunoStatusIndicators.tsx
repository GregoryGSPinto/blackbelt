// ============================================================
// AlunoStatusIndicators — Inline visual status for student lists
// ============================================================
// Compact, single-line indicators showing:
// - Mini frequency bar (40px, color by %)
// - Payment dot (green/yellow/red)
// - "APTO" badge (if aptoGraduacao)
// - "Última sessão: Xd" text (hidden on mobile)
// ============================================================
'use client';

// ── Types ──

interface AlunoStatusIndicatorsProps {
  presenca30d: number;
  statusPagamento?: 'em_dia' | 'pendente' | 'atrasado';
  aptoGraduacao?: boolean;
  ultimaSessao?: string;
  compact?: boolean;
}

// ── Color helpers ──

function getFreqColor(pct: number): string {
  if (pct >= 75) return '#4ADE80';
  if (pct >= 50) return '#FBBF24';
  return '#F87171';
}

const PAGAMENTO_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  em_dia: { bg: '#4ADE8030', border: '#4ADE8040', label: 'Em dia' },
  pendente: { bg: '#FBBF2430', border: '#FBBF2440', label: 'Pendente' },
  atrasado: { bg: '#F8717130', border: '#F8717140', label: 'Atrasado' },
};

function getDaysAgo(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  return diff;
}

// ── Component ──

export function AlunoStatusIndicators({
  presenca30d,
  statusPagamento,
  aptoGraduacao,
  ultimaSessao,
  compact = false,
}: AlunoStatusIndicatorsProps) {
  const freqColor = getFreqColor(presenca30d);
  const pagConf = statusPagamento ? PAGAMENTO_COLORS[statusPagamento] : null;
  const daysAgo = getDaysAgo(ultimaSessao);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Frequency mini bar */}
      <div className="flex items-center gap-1.5" title={`Frequência: ${presenca30d}%`}>
        <div className="w-10 h-1 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(presenca30d, 100)}%`, background: freqColor }}
          />
        </div>
        <span className="text-[9px] font-medium" style={{ color: freqColor }}>{presenca30d}%</span>
      </div>

      {/* Payment dot */}
      {pagConf && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          title={`Pagamento: ${pagConf.label}`}
          style={{ background: pagConf.bg, boxShadow: `0 0 4px ${pagConf.border}` }}
        />
      )}

      {/* APTO badge */}
      {aptoGraduacao && (
        <span
          className="text-[7px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.18)' }}
          title="Apto para graduação"
        >
          APTO
        </span>
      )}

      {/* Last class (hidden on mobile if compact) */}
      {daysAgo !== null && !compact && (
        <span className="hidden sm:inline text-[8px] text-white/20" title={`Última sessão: ${ultimaSessao}`}>
          {daysAgo === 0 ? 'Hoje' : daysAgo === 1 ? 'Ontem' : `${daysAgo}d`}
        </span>
      )}
    </div>
  );
}

// ── Expanded version for detail pages ──

export function AlunoStatusExpanded({
  presenca30d,
  statusPagamento,
  aptoGraduacao,
  ultimaSessao,
}: AlunoStatusIndicatorsProps) {
  const freqColor = getFreqColor(presenca30d);
  const pagConf = statusPagamento ? PAGAMENTO_COLORS[statusPagamento] : null;
  const daysAgo = getDaysAgo(ultimaSessao);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Frequency bar */}
      <div className="flex items-center gap-2" title={`Frequência 30d: ${presenca30d}%`}>
        <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(presenca30d, 100)}%`, background: freqColor }}
          />
        </div>
        <span className="text-[10px] font-medium" style={{ color: freqColor }}>{presenca30d}%</span>
      </div>

      {/* Payment status */}
      {pagConf && (
        <span
          className="text-[9px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: pagConf.bg, color: pagConf.border.replace('40', 'FF'), border: `1px solid ${pagConf.border}` }}
        >
          {pagConf.label}
        </span>
      )}

      {/* APTO badge */}
      {aptoGraduacao && (
        <span
          className="text-[8px] font-medium uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.18)' }}
        >
          APTO p/ Graduação
        </span>
      )}

      {/* Last class */}
      {daysAgo !== null && (
        <span className="text-[10px] text-white/30">
          Última sessão: {daysAgo === 0 ? 'Hoje' : daysAgo === 1 ? 'Ontem' : `${daysAgo} dias atrás`}
        </span>
      )}
    </div>
  );
}
