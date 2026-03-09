'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { ACADEMY_CONTACT } from '@/lib/academy/contactInfo';
import { transitions } from '@/styles/transitions';

// ─── Animation Constants ────────────────────────────────────
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const STAGGER_DELAY = 0.08;

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE_OUT_EXPO,
    },
  },
};

// SVG Icons
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

export default function EsqueciEmailPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const shouldReduceMotion = useReducedMotion();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: isDark ? '#0a0a0a' : '#f5f5f5' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)'
              : 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          {/* Voltar */}
          <motion.div variants={itemVariants}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mb-8 group transition-colors duration-300"
              style={{ color: tokens.textMuted }}
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="text-sm font-medium">{t('forgotEmail.backToLogin')}</span>
            </Link>
          </motion.div>

          {/* Unified Container - Padrão do Sistema */}
          <motion.div
            style={{
              border: `1px solid ${tokens.cardBorder}`,
              borderRadius: 12,
              background: tokens.cardBg,
              backdropFilter: 'blur(12px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
              transition: `${transitions.theme}, border-color 0.25s ease`,
            }}
            variants={itemVariants}
          >
            {/* Header Content */}
            <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
              {/* Title */}
              <motion.div className="mb-6" variants={itemVariants}>
                <h1
                  className="text-xl font-semibold mb-2 text-center"
                  style={{
                    color: tokens.text,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('forgotEmail.title')}
                </h1>
                <p className="text-sm text-center leading-relaxed" style={{ color: tokens.textMuted }}>
                  {t('forgotEmail.description')}
                </p>
              </motion.div>

              {/* Opções */}
              <motion.div className="space-y-3 mb-6" variants={itemVariants}>
                {/* Suporte */}
                <motion.button
                  onClick={() => setSelectedOption(selectedOption === 'support' ? null : 'support')}
                  className="w-full p-4 rounded-xl border text-left transition-all duration-300"
                  style={{
                    background: selectedOption === 'support' ? 'rgba(16,185,129,0.1)' : 'transparent',
                    borderColor: selectedOption === 'support' ? 'rgba(16,185,129,0.3)' : tokens.cardBorder,
                  }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(16,185,129,0.2)' }}
                    >
                      <MessageCircle size={18} style={{ color: '#34d399' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-0.5" style={{ color: tokens.text }}>
                        {t('forgotEmail.contactSupport')}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: tokens.textMuted }}>
                        {t('forgotEmail.contactSupportDesc')}
                      </p>
                      <AnimatePresence>
                        {selectedOption === 'support' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 rounded-lg"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                          >
                            <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>
                              {t('forgotEmail.supportChannels')}
                            </p>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-2">
                                <Mail size={12} style={{ color: '#34d399' }} />
                                <span style={{ color: tokens.textMuted }}>
                                  {ACADEMY_CONTACT.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MessageCircle size={12} style={{ color: '#34d399' }} />
                                <span style={{ color: tokens.textMuted }}>
                                  {ACADEMY_CONTACT.whatsapp}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>

                {/* Dica */}
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.cardBorder}` }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: tokens.textMuted }}>
                    <span className="font-semibold" style={{ color: tokens.text }}>{t('forgotEmail.tip')}</span>{' '}
                    {t('forgotEmail.tipText')}
                  </p>
                </div>
              </motion.div>

              {/* Link para login */}
              <motion.div
                className="text-center"
                variants={itemVariants}
              >
                <p className="text-xs mb-1.5" style={{ color: tokens.textMuted }}>
                  {t('forgotEmail.rememberedEmail')}
                </p>
                <Link
                  href="/login"
                  className="inline-block text-xs font-semibold transition-all duration-300"
                  style={{ color: tokens.text }}
                >
                  {t('forgotEmail.backToLogin')} →
                </Link>
              </motion.div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: tokens.cardBorder, transition: transitions.theme }} />

            {/* SSO buttons at bottom - Padrão do Sistema */}
            <motion.div
              style={{ display: 'flex' }}
              variants={itemVariants}
            >
              <Link
                href="/login"
                style={{
                  flex: 1,
                  height: 52,
                  border: 'none',
                  borderRight: `1px solid ${tokens.cardBorder}`,
                  borderRadius: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'background-color 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <GoogleIcon />
              </Link>
              <Link
                href="/login"
                style={{
                  flex: 1,
                  height: 52,
                  border: 'none',
                  borderRadius: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition: 'background-color 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <AppleIcon color={tokens.text} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-xs mt-6"
            style={{ color: tokens.textMuted }}
            variants={itemVariants}
          >
            {t('login.termsAgreement')}
          </motion.p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
