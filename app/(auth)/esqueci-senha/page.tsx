'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

// ─── Animation Constants ────────────────────────────────────
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const DURATION_SLOW = 0.6;
const DURATION_NORMAL = 0.5;
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

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_SLOW,
      ease: EASE_OUT_EXPO,
    },
  },
};

export default function EsqueciSenhaPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const shouldReduceMotion = useReducedMotion();

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'email' | 'whatsapp'>('email');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de envio
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen overflow-hidden" style={{ background: isDark ? '#0a0a0a' : '#f5f5f5' }}>
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <Image
            src="/images/logo-blackbelt.png"
            alt="Background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0" style={{ background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            className="w-full max-w-md"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <div
              className="rounded-2xl p-8 shadow-2xl text-center"
              style={{
                background: tokens.cardBg,
                border: `1px solid ${tokens.cardBorder}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(34,197,94,0.2)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <svg className="w-10 h-10" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-xl font-semibold mb-3" style={{ color: tokens.text }}>
                {t('forgotPassword.linkSent')}
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: tokens.textMuted }}>
                {t('forgotPassword.linkSentDesc', { target: method === 'email' ? 'e-mail' : 'WhatsApp' })}
              </p>
              <div className="inline-flex items-center gap-2 text-sm" style={{ color: tokens.textMuted }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: tokens.textMuted }} />
                <span>{tCommon('actions.redirecting')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: isDark ? '#0a0a0a' : '#f5f5f5' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/logo-blackbelt.png"
          alt="Background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0" style={{ background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          {/* Botão Voltar */}
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

          {/* Container Principal */}
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
                {t('forgotPassword.title')}
              </h1>
              <p className="leading-relaxed" style={{ color: tokens.textMuted }}>
                {t('forgotPassword.description')}
              </p>
            </motion.div>

            {/* Method Selection */}
            <motion.div className="grid grid-cols-2 gap-4 mb-8" variants={itemVariants}>
              <motion.button
                type="button"
                onClick={() => setMethod('email')}
                className="p-5 rounded-xl border-2 transition-all duration-300"
                style={{
                  background: method === 'email' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  borderColor: method === 'email' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <Mail className="w-8 h-8 mx-auto mb-2" style={{ color: method === 'email' ? tokens.text : tokens.textMuted }} />
                <span className="text-sm font-medium" style={{ color: method === 'email' ? tokens.text : tokens.textMuted }}>
                  {t('forgotPassword.emailMethod')}
                </span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setMethod('whatsapp')}
                className="p-5 rounded-xl border-2 transition-all duration-300"
                style={{
                  background: method === 'whatsapp' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  borderColor: method === 'whatsapp' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: method === 'whatsapp' ? tokens.text : tokens.textMuted }} />
                <span className="text-sm font-medium" style={{ color: method === 'whatsapp' ? tokens.text : tokens.textMuted }}>
                  {t('forgotPassword.whatsappMethod')}
                </span>
              </motion.button>
            </motion.div>

            {/* Form */}
            <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2.5" style={{ color: tokens.text }}>
                  {t('forgotPassword.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: tokens.textMuted }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl transition-all outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${tokens.cardBorder}`,
                      color: tokens.text,
                    }}
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff',
                }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                {loading ? tCommon('actions.sending') : t('forgotPassword.sendVia', { method: method === 'email' ? t('forgotPassword.emailMethod') : t('forgotPassword.whatsappMethod') })}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div className="my-8 border-t" style={{ borderColor: tokens.cardBorder }} variants={itemVariants} />

            {/* Link alternativo */}
            <motion.div className="text-center space-y-3" variants={itemVariants}>
              <p style={{ color: tokens.textMuted }}>
                {t('forgotPassword.noEmailAccess')}
              </p>
              <Link
                href="/esqueci-email"
                className="inline-block text-sm font-semibold transition-all duration-300"
                style={{ color: tokens.text }}
              >
                {t('forgotPassword.recoverEmail')} →
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
