// ============================================================
// AuthorizationToggle — Toggle with legal text and revoke
// ============================================================
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useFormatting } from '@/hooks/useFormatting';

interface AuthorizationToggleProps {
  label: string;
  description: string;
  legalText: string;
  enabled: boolean;
  date?: string;
  onChange: (enabled: boolean) => void;
}

export function AuthorizationToggle({ label, description, legalText, enabled, date, onChange }: AuthorizationToggleProps) {
  const { formatDate } = useFormatting();
  const [expanded, setExpanded] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${enabled ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)'}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-semibold text-white/70">{label}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{description}</p>
        </div>
        <button
          onClick={() => !enabled ? onChange(true) : setRevokeConfirm(true)}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-green-500/40' : 'bg-white/10'}`}
          role="switch"
          aria-checked={enabled}
          aria-label={label}
        >
          <div
            className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
            style={{ left: enabled ? '22px' : '2px' }}
          />
        </button>
      </div>

      {/* Date */}
      {enabled && date && (
        <p className="text-[9px] text-green-400/50">
          ✅ Autorizado em {formatDate(date)}
        </p>
      )}

      {/* Legal text toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[9px] text-white/20 hover:text-white/30 transition-colors"
      >
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        Ver texto legal
      </button>

      {expanded && (
        <p className="text-[9px] text-white/20 leading-relaxed p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {legalText}
        </p>
      )}

      {/* Revoke confirmation */}
      {revokeConfirm && (
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={10} className="text-red-400" />
            <p className="text-[10px] text-red-300">Tem certeza que deseja revogar esta autorização?</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRevokeConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-[10px] text-white/40 bg-white/[0.03]"
            >
              Cancelar
            </button>
            <button
              onClick={() => { onChange(false); setRevokeConfirm(false); }}
              className="px-3 py-1.5 rounded-lg text-[10px] text-red-300 bg-red-500/15"
            >
              Revogar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
