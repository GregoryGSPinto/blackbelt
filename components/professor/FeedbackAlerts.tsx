'use client';

// ============================================================
// FeedbackAlerts — Professor receives student feedback alerts
// ============================================================
// Shows when students mark "Tive dúvida" or "Quero revisar".
// AI classification shows category + suggested action.
// ============================================================

import { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, PlayCircle, Brain, ChevronRight, Check } from 'lucide-react';
import { getProfessorFeedbackAlerts } from '@/lib/api/daily-feedback.service';
import type { FeedbackAlert } from '@/lib/api/daily-feedback.service';
import { useFormatting } from '@/hooks/useFormatting';

export function FeedbackAlerts() {
  const { formatDate } = useFormatting();
  const [alerts, setAlerts] = useState<FeedbackAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfessorFeedbackAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false));
  }, []);

  const unread = alerts.filter((a) => !a.read);

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  };

  const fmtDate = (iso: string) => formatDate(iso, 'short');

  if (loading) {
    return (
      <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse">
        <div className="h-4 bg-white/5 rounded w-40 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-white/5 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Feedback Pós-Sessão</h3>
          {unread.length > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded-full">
              {unread.length} novo{unread.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border transition-colors ${
              alert.read
                ? 'bg-white/[0.01] border-white/[0.04]'
                : 'bg-amber-500/[0.03] border-amber-500/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{alert.studentAvatar}</span>
                  <span className="text-xs font-semibold text-white/80">{alert.studentName}</span>
                  {alert.response === 'DUVIDA' ? (
                    <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <p className="text-[10px] text-white/40 mt-0.5">
                  {alert.className} • {fmtDate(alert.classDate)}
                </p>
                {alert.doubtDescription && (
                  <p className="text-[11px] text-white/60 mt-1 italic">&ldquo;{alert.doubtDescription}&rdquo;</p>
                )}

                {/* AI Classification */}
                {alert.aiClassification && (
                  <div className="mt-2 p-2 bg-purple-500/[0.05] border border-purple-500/10 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3 h-3 text-purple-400" />
                      <span className="text-[9px] text-purple-400 font-semibold uppercase">IA Suggestion</span>
                      <span className="text-[9px] text-white/20">
                        ({Math.round(alert.aiClassification.confidence * 100)}% conf)
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-1">
                      <span className="text-white/30">Categoria:</span> {alert.aiClassification.category}
                    </p>
                    <p className="text-[10px] text-white/50">
                      <span className="text-white/30">Ação:</span> {alert.aiClassification.suggestedAction}
                    </p>
                    {alert.aiClassification.suggestedVideo && (
                      <button className="flex items-center gap-1 mt-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
                        <PlayCircle className="w-3 h-3" />
                        {alert.aiClassification.suggestedVideo.title}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Mark read */}
              {!alert.read && (
                <button
                  onClick={() => markRead(alert.id)}
                  className="p-1.5 text-white/20 hover:text-emerald-400 transition-colors shrink-0"
                  title="Marcar como lido"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
