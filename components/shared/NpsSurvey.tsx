'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

const NPS_STORAGE_KEY = 'bb_nps_last_shown';
const NPS_FIRST_USE_KEY = 'bb_first_use_date';
const DAYS_BEFORE_SHOW = 7;
const DAYS_BETWEEN_SURVEYS = 90; // quarterly

function shouldShowNps(): boolean {
  if (typeof window === 'undefined') return false;

  const now = Date.now();

  // Track first use
  const firstUse = localStorage.getItem(NPS_FIRST_USE_KEY);
  if (!firstUse) {
    localStorage.setItem(NPS_FIRST_USE_KEY, now.toString());
    return false;
  }

  const firstUseDate = parseInt(firstUse, 10);
  const daysSinceFirstUse = (now - firstUseDate) / (1000 * 60 * 60 * 24);
  if (daysSinceFirstUse < DAYS_BEFORE_SHOW) return false;

  // Check last shown
  const lastShown = localStorage.getItem(NPS_STORAGE_KEY);
  if (lastShown) {
    const daysSinceLastShown = (now - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastShown < DAYS_BETWEEN_SURVEYS) return false;
  }

  return true;
}

export function NpsSurvey() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowNps()) {
        setVisible(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(NPS_STORAGE_KEY, Date.now().toString());
  }, []);

  const handleSubmit = useCallback(async () => {
    if (score === null) return;
    setSubmitting(true);
    try {
      await fetch('/api/feedback/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ score, comment, userId: user?.id }),
      });
      setSubmitted(true);
      localStorage.setItem(NPS_STORAGE_KEY, Date.now().toString());
      setTimeout(() => setVisible(false), 2000);
    } catch {
      // Silently fail - NPS should never block the user
      dismiss();
    } finally {
      setSubmitting(false);
    }
  }, [score, comment, user?.id, dismiss]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ background: 'var(--card-bg, #1a1a2e)', border: '1px solid var(--card-border)' }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Obrigado!</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Seu feedback nos ajuda a melhorar.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              O que voce acha do BlackBelt?
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              De 0 a 10, quanto voce recomendaria o BlackBelt?
            </p>

            {/* Score buttons */}
            <div className="flex gap-1.5 mb-5 justify-center flex-wrap">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className="w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: score === i
                      ? (i <= 6 ? '#ef4444' : i <= 8 ? '#f59e0b' : '#10b981')
                      : 'rgba(255,255,255,0.06)',
                    color: score === i ? '#fff' : 'var(--text-secondary)',
                    border: score === i ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    transform: score === i ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>

            {/* Labels */}
            <div className="flex justify-between mb-5 px-1">
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Nada provavel</span>
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Muito provavel</span>
            </div>

            {/* Comment */}
            {score !== null && (
              <div className="mb-4">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Algum comentario? (opcional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <button
                onClick={dismiss}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
              >
                Agora nao
              </button>
              <button
                onClick={handleSubmit}
                disabled={score === null || submitting}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors disabled:opacity-40"
              >
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
