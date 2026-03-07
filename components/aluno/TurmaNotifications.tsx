// ============================================================
// TurmaNotifications — Dismissable broadcast cards for students
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, MessageSquare, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as broadcastService from '@/lib/api/turma-broadcast.service';
import type { TurmaBroadcast } from '@/lib/api/turma-broadcast.service';

const DISMISSED_KEY = 'blackbelt_dismissed_broadcasts';

function getDismissed(): Set<string> {
  try { const r = sessionStorage.getItem(DISMISSED_KEY); return r ? new Set(JSON.parse(r) as string[]) : new Set(); } catch { return new Set(); }
}

function addDismissed(id: string) {
  try {
    const set = getDismissed();
    set.add(id);
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)));
  } catch { /* */ }
}

export function TurmaNotifications({ alunoId = 'a1' }: { alunoId?: string }) {
  const t = useTranslations('athlete.notifications');
  const [broadcasts, setBroadcasts] = useState<TurmaBroadcast[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDismissed(getDismissed());
    broadcastService.getBroadcastsForAluno(alunoId).then(setBroadcasts).catch(() => {});
  }, [alunoId]);

  const handleDismiss = useCallback((id: string) => {
    addDismissed(id);
    setDismissed((prev: Set<string>) => new Set(Array.from(prev).concat(id)));
    broadcastService.markBroadcastRead(id, alunoId).catch(() => {});
  }, [alunoId]);

  const visible = broadcasts.filter((b: TurmaBroadcast) => !dismissed.has(b.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.slice(0, 3).map((bc: TurmaBroadcast) => {
        const time = new Date(bc.enviadoEm);
        const diff = Math.round((Date.now() - time.getTime()) / 3600000);
        const timeLabel = diff < 1 ? t('now') : diff < 24 ? t('hoursAgo', { hours: diff }) : t('daysAgo', { days: Math.round(diff / 24) });

        return (
          <div
            key={bc.id}
            className="relative rounded-xl p-3 pr-8 transition-all"
            style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.10)' }}
          >
            <button
              onClick={() => handleDismiss(bc.id)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label={t('dismiss')}
            >
              <X size={12} className="text-white/20" />
            </button>
            <div className="flex items-start gap-2.5">
              <MessageSquare size={14} className="text-amber-400/50 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-amber-300/70">{bc.turmaNome}</span>
                  <span className="flex items-center gap-0.5 text-[8px] text-white/15">
                    <Clock size={7} /> {timeLabel}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{bc.conteudo}</p>
                <p className="text-[8px] text-white/15 mt-1">{t('from')} {bc.remetenteNome}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
