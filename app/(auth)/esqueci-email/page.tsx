'use client';

// ============================================================
// Esqueci Email — Padronizado com design system BlackBelt
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MessageCircle } from 'lucide-react';
import CinematicBackground from '@/components/ui/CinematicBackground';
import { ACADEMY_CONTACT } from '@/lib/academy/contactInfo';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function EsqueciEmailPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <CinematicBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-up">
          {/* Voltar */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-medium">{t('forgotEmail.backToLogin')}</span>
          </Link>

          {/* Container */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold mb-3 tracking-tight">
                {t('forgotEmail.title')}
              </h1>
              <p className="text-white/60 text-base leading-relaxed">
                {t('forgotEmail.description')}
              </p>
            </div>

            {/* Opções */}
            <div className="space-y-4 mb-8">
              {/* Telefone */}
              <button
                onClick={() => setSelectedOption(selectedOption === 'phone' ? null : 'phone')}
                className={`w-full p-5 rounded-xl border transition-all duration-300 text-left ${
                  selectedOption === 'phone'
                    ? 'bg-white/10 border-white/25 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">
                      {t('forgotEmail.recoverByPhone')}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {t('forgotEmail.recoverByPhoneDesc')}
                    </p>
                    {selectedOption === 'phone' && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-sm text-blue-400 font-medium">{t('forgotEmail.inDevelopment')}</p>
                        <p className="text-xs text-blue-400/70 mt-1">
                          {t('forgotEmail.contactSupportDesc')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Suporte */}
              <button
                onClick={() => setSelectedOption(selectedOption === 'support' ? null : 'support')}
                className={`w-full p-5 rounded-xl border transition-all duration-300 text-left ${
                  selectedOption === 'support'
                    ? 'bg-white/10 border-white/25 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle size={20} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">
                      {t('forgotEmail.contactSupport')}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {t('forgotEmail.contactSupportDesc')}
                    </p>
                    {selectedOption === 'support' && (
                      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <p className="text-sm text-emerald-400 font-semibold mb-3">{t('forgotEmail.supportChannels')}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-emerald-400" />
                            <span className="text-white/70">
                              Email: <span style={{ color: tokens.text, fontWeight: 500 }}>{ACADEMY_CONTACT.email}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle size={14} className="text-emerald-400" />
                            <span className="text-white/70">
                              WhatsApp: <span style={{ color: tokens.text, fontWeight: 500 }}>{ACADEMY_CONTACT.whatsapp}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-emerald-400" />
                            <span className="text-white/70">
                              Telefone: <span style={{ color: tokens.text, fontWeight: 500 }}>{ACADEMY_CONTACT.telefone}</span>
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-white/30 mt-3">
                          {t('forgotEmail.avgResponseTime')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Dica */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-sm text-white/60 leading-relaxed">
                <span className="font-semibold text-white">{t('forgotEmail.tip')}</span> {t('forgotEmail.tipText')}
              </p>
            </div>

            {/* Divider + Link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
              <p className="text-sm" style={{ color: tokens.textMuted }}>{t('forgotEmail.rememberedEmail')}</p>
              <Link
                href="/login"
                className="inline-block text-sm font-semibold text-white hover:text-white/80 transition-all duration-300 hover:translate-x-1"
              >
                {t('forgotEmail.backToLogin')} →
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-white/40 mt-8">
            {t('forgotPassword.needAccount')}{' '}
            <Link href="/cadastro" className="text-white hover:text-white/80 transition-colors font-medium">
              {t('forgotPassword.signUpFree')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
