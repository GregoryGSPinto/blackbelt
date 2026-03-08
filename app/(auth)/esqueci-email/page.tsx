'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MessageCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { ACADEMY_CONTACT } from '@/lib/academy/contactInfo';

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

          {/* Container */}
          <motion.div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background: tokens.cardBg,
              border: `1px solid ${tokens.cardBorder}`,
              backdropFilter: 'blur(12px)',
            }}
            variants={itemVariants}
          >
            {/* Header */}
            <motion.div className="mb-8" variants={itemVariants}>
              <h1 className="text-2xl font-semibold mb-3" style={{ color: tokens.text }}>
                {t('forgotEmail.title')}
              </h1>
              <p className="leading-relaxed" style={{ color: tokens.textMuted }}>
                {t('forgotEmail.description')}
              </p>
            </motion.div>

            {/* Opções */}
            <motion.div className="space-y-4 mb-8" variants={itemVariants}>
              {/* Telefone */}
              <motion.button
                onClick={() => setSelectedOption(selectedOption === 'phone' ? null : 'phone')}
                className="w-full p-5 rounded-xl border text-left transition-all duration-300"
                style={{
                  background: selectedOption === 'phone' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedOption === 'phone' ? 'rgba(59,130,246,0.3)' : tokens.cardBorder,
                }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(59,130,246,0.2)' }}
                  >
                    <Phone size={20} style={{ color: '#60a5fa' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold mb-1" style={{ color: tokens.text }}>
                      {t('forgotEmail.recoverByPhone')}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: tokens.textMuted }}>
                      {t('forgotEmail.recoverByPhoneDesc')}
                    </p>
                    <AnimatePresence>
                      {selectedOption === 'phone' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-3 rounded-xl"
                          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
                        >
                          <p className="text-sm font-medium" style={{ color: '#60a5fa' }}>{t('forgotEmail.inDevelopment')}</p>
                          <p className="text-xs mt-1" style={{ color: '#60a5fa', opacity: 0.7 }}>
                            {t('forgotEmail.contactSupportDesc')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>

              {/* Suporte */}
              <motion.button
                onClick={() => setSelectedOption(selectedOption === 'support' ? null : 'support')}
                className="w-full p-5 rounded-xl border text-left transition-all duration-300"
                style={{
                  background: selectedOption === 'support' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                  borderColor: selectedOption === 'support' ? 'rgba(16,185,129,0.3)' : tokens.cardBorder,
                }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(16,185,129,0.2)' }}
                  >
                    <MessageCircle size={20} style={{ color: '#34d399' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold mb-1" style={{ color: tokens.text }}>
                      {t('forgotEmail.contactSupport')}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: tokens.textMuted }}>
                      {t('forgotEmail.contactSupportDesc')}
                    </p>
                    <AnimatePresence>
                      {selectedOption === 'support' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-3 rounded-xl"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                        >
                          <p className="text-sm font-semibold mb-3" style={{ color: '#34d399' }}>{t('forgotEmail.supportChannels')}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail size={14} style={{ color: '#34d399' }} />
                              <span style={{ color: tokens.textMuted }}>
                                Email: <span style={{ color: tokens.text, fontWeight: 500 }}>{ACADEMY_CONTACT.email}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle size={14} style={{ color: '#34d399' }} />
                              <span style={{ color: tokens.textMuted }}>
                                WhatsApp: <span style={{ color: tokens.text, fontWeight: 500 }}>{ACADEMY_CONTACT.whatsapp}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} style={{ color: '#34d399' }} />
                              <span style={{ color: tokens.textMuted }}>
                                Telefone: <span style={{ color: tokens.text, fontWeight: 500 }}>{ACADEMY_CONTACT.telefone}</span>
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] mt-3" style={{ color: tokens.textMuted, opacity: 0.6 }}>
                            {t('forgotEmail.avgResponseTime')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* Dica */}
            <motion.div
              className="p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${tokens.cardBorder}` }}
              variants={itemVariants}
            >
              <p className="text-sm leading-relaxed" style={{ color: tokens.textMuted }}>
                <span className="font-semibold" style={{ color: tokens.text }}>{t('forgotEmail.tip')}</span> {t('forgotEmail.tipText')}
              </p>
            </motion.div>

            {/* Divider + Link */}
            <motion.div
              className="mt-8 pt-6 border-t text-center space-y-2"
              style={{ borderColor: tokens.cardBorder }}
              variants={itemVariants}
            >
              <p className="text-sm" style={{ color: tokens.textMuted }}>{t('forgotEmail.rememberedEmail')}</p>
              <Link
                href="/login"
                className="inline-block text-sm font-semibold transition-all duration-300"
                style={{ color: tokens.text }}
              >
                {t('forgotEmail.backToLogin')} →
              </Link>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-sm mt-8"
            style={{ color: tokens.textMuted }}
            variants={itemVariants}
          >
            {t('forgotPassword.needAccount')}{' '}
            <Link href="/cadastro" className="font-medium transition-colors" style={{ color: tokens.text }}>
              {t('forgotPassword.signUpFree')}
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
