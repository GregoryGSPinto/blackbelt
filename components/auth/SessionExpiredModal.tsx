// ============================================================
// SessionExpiredModal — Elegant modal for expired sessions
// ============================================================
'use client';

import { createPortal } from 'react-dom';
import { Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface SessionExpiredModalProps {
  isOpen: boolean;
}

export function SessionExpiredModal({ isOpen }: SessionExpiredModalProps) {
  const router = useRouter();
  const t = useTranslations('auth');

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative w-full max-w-[calc(100%-2rem)] sm:max-w-sm mx-4 rounded-2xl overflow-hidden p-4 sm:p-6 md:p-8 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(30,25,18,0.98), rgba(20,16,10,0.99))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
        role="alertdialog"
        aria-modal="true"
        aria-label={t('session.expired')}
        aria-describedby="session-expired-desc"
      >
        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-600/15 flex items-center justify-center mb-5"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        >
          <Lock size={28} className="text-amber-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{t('session.expired')}</h2>
        <p id="session-expired-desc" className="text-sm text-white/45 mb-8">
          {t('session.expiredMessage')}
        </p>

        <button
          onClick={() => router.push('/login')}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm
                     bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400
                     transition-all shadow-lg"
          aria-label={t('session.loginAgain')}
        >
          <LogIn size={18} /> {t('session.loginAgain')}
        </button>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    </div>,
    document.body,
  );
}
