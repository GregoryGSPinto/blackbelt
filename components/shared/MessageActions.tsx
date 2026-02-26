// ============================================================
// MessageActions — Report & Block for messaging
// ============================================================
// Dropdown with Denunciar / Bloquear actions.
// Required for Apple/Google Store compliance (social features).
//
// Usage:
//   <MessageActions
//     recipientName="João"
//     recipientId="aluno-1"
//     onBlock={handleBlock}
//   />
// ============================================================
'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Flag, Ban, AlertTriangle, X } from 'lucide-react';
import { logger } from '@/lib/logger';

interface MessageActionsProps {
  recipientName: string;
  recipientId: string;
  onBlock?: (id: string) => void;
}

type ReportReason = 'spam' | 'assedio' | 'conteudo_inapropriado' | 'outro';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam ou mensagens indesejadas' },
  { value: 'assedio', label: 'Assédio ou bullying' },
  { value: 'conteudo_inapropriado', label: 'Conteúdo inapropriado' },
  { value: 'outro', label: 'Outro motivo' },
];

export function MessageActions({ recipientName, recipientId, onBlock }: MessageActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [menuOpen]);

  const handleReport = (reason: ReportReason) => {
    // TODO: Send report to backend
    // await reportService.report({ targetId: recipientId, reason });
    logger.info('[MessageActions]', 'Report:', recipientId, reason);
    setReportSent(true);
    setTimeout(() => { setReportOpen(false); setReportSent(false); setMenuOpen(false); }, 2000);
  };

  const handleBlock = () => {
    // TODO: Block user via backend
    // await blockService.block(recipientId);
    logger.info('[MessageActions]', 'Block:', recipientId);
    setBlocked(true);
    onBlock?.(recipientId);
    setBlockConfirm(false);
    setMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1.5 text-white/20 hover:text-white/50 hover:bg-white/5 rounded-lg transition-colors"
        aria-label="Mais opções"
      >
        <MoreVertical size={16} />
      </button>

      {/* Dropdown */}
      {menuOpen && !reportOpen && !blockConfirm && (
        <div
          className="absolute right-0 top-full mt-1 w-48 rounded-xl overflow-hidden z-50"
          style={{
            background: 'rgba(20,20,28,0.97)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={() => setReportOpen(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-white/60 hover:bg-white/5 transition-colors"
          >
            <Flag size={14} className="text-amber-400/60" />
            Denunciar
          </button>
          <button
            onClick={() => setBlockConfirm(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400/70 hover:bg-red-500/5 transition-colors"
          >
            <Ban size={14} />
            Bloquear {recipientName.split(' ')[0]}
          </button>
        </div>
      )}

      {/* Report flow */}
      {reportOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-64 rounded-xl overflow-hidden z-50 p-3"
          style={{
            background: 'rgba(20,20,28,0.97)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {reportSent ? (
            <div className="text-center py-3">
              <AlertTriangle size={20} className="mx-auto text-amber-400 mb-2" />
              <p className="text-sm text-white/70">Denúncia enviada</p>
              <p className="text-xs text-white/30 mt-1">Nossa equipe irá analisar</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50 font-medium">Motivo da denúncia</span>
                <button onClick={() => { setReportOpen(false); }} className="text-white/20 hover:text-white/50">
                  <X size={14} />
                </button>
              </div>
              {REPORT_REASONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleReport(value)}
                  className="w-full text-left px-2.5 py-2 text-xs text-white/50 hover:bg-white/5 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Block confirmation */}
      {blockConfirm && (
        <div
          className="absolute right-0 top-full mt-1 w-60 rounded-xl overflow-hidden z-50 p-4"
          style={{
            background: 'rgba(20,20,28,0.97)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(248,113,113,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <Ban size={20} className="text-red-400 mb-2" />
          <p className="text-sm text-white/70 mb-1">Bloquear {recipientName}?</p>
          <p className="text-xs text-white/30 mb-3">Você não receberá mais mensagens desta pessoa.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setBlockConfirm(false)}
              className="flex-1 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleBlock}
              className="flex-1 py-1.5 rounded-lg text-xs text-white font-medium bg-red-500/80 hover:bg-red-500 transition-colors"
            >
              Bloquear
            </button>
          </div>
        </div>
      )}

      {/* Blocked indicator */}
      {blocked && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
      )}
    </div>
  );
}
