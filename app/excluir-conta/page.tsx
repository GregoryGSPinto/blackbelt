'use client';

// ============================================================
// /excluir-conta — Página pública de exclusão de conta
// Google Play exige URL web acessível para exclusão.
// ============================================================

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

type FormState = 'form' | 'loading' | 'success' | 'error';

export default function ExcluirContaPage() {
  const t = useTranslations('deleteAccount');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [state, setState] = useState<FormState>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit() {
    if (!isValidEmail) return;
    setState('loading');
    try {
      const { createRequest } = await import('@/lib/persistence/lgpd');
      await createRequest('delete', email, reason || '');
      setState('success');
    } catch {
      setErrorMsg(t('errorMessage'));
      setState('error');
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield size={28} className="text-blue-400" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">BlackBelt</h1>
          <p className="text-white/50 text-sm mt-1">{t('pageTitle')}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">

          {/* ── Form ── */}
          {(state === 'form' || state === 'error') && (
            <div className="p-6 space-y-5">
              <div className="p-4 bg-yellow-600/10 border border-yellow-600/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-300 font-medium mb-1">{t('beforeContinue')}</p>
                    <p style={{ fontWeight: 300, color: tokens.textMuted }}>
                      {t('deleteViaApp')}
                      <span className="text-white/70"> {t('deleteViaAppPath')}</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-2">
                  {t('registeredEmail')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 block mb-2">
                  {t('reason')} <span className="text-white/30">({t('optional')})</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('reasonPlaceholder')}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-blue-500/50"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="text-xs text-white/40 space-y-1">
                <p>{t('disclaimerTitle')}</p>
                <p>• {t('disclaimerDeactivate')}</p>
                <p>• {t('disclaimerCancel')}</p>
                <p>• {t('disclaimerAnonymize')}</p>
                <p>• {t('disclaimerConfirmEmail')}</p>
              </div>

              {state === 'error' && (
                <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                  <p className="text-sm text-red-300">{errorMsg}</p>
                </div>
              )}

              <button
                onClick={() => setShowConfirm(true)}
                disabled={!isValidEmail}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('submitButton')}
              </button>

              <ConfirmModal
                open={showConfirm}
                title={t('confirmTitle')}
                message={t('confirmMessage')}
                confirmLabel={t('confirmLabel')}
                cancelLabel={t('cancelLabel')}
                variant="danger"
                requireTyping="EXCLUIR"
                loading={false}
                onConfirm={() => { setShowConfirm(false); handleSubmit(); }}
                onCancel={() => setShowConfirm(false)}
              />
            </div>
          )}

          {/* ── Loading ── */}
          {state === 'loading' && (
            <div className="p-12 text-center">
              <Loader2 size={32} className="mx-auto text-red-400 animate-spin mb-4" />
              <p className="text-white/60 text-sm">{t('processing')}</p>
            </div>
          )}

          {/* ── Success ── */}
          {state === 'success' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-600/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">{t('successTitle')}</h2>
              <div className="text-sm text-white/60 space-y-2">
                <p>{t('successEmailSent', { email })}</p>
                <p>{t('successDeactivation')}</p>
                <p>{t('successAnonymize')}</p>
              </div>
              <p className="text-xs text-white/30 pt-4">
                {t('contactDpo')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <a
            href="/politica-privacidade.html"
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            {t('privacyPolicy')}
          </a>
          <span className="text-white/20 mx-2">•</span>
          <a
            href="/termos-de-uso.html"
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            {t('termsOfUse')}
          </a>
        </div>
      </div>
    </div>
  );
}
