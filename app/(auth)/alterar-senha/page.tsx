'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

// ─── Animation Constants ────────────────────────────────────
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const DURATION_SLOW = 0.6;
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

export default function AlterarSenhaPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const shouldReduceMotion = useReducedMotion();

  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('changePassword.passwordsDontMatch'));
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(t('changePassword.minLength'));
      return;
    }

    setLoading(true);

    // Simulação de alteração
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
                {t('changePassword.passwordChanged')}
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: tokens.textMuted }}>
                {t('changePassword.passwordChangedDesc')}
              </p>
              <div className="inline-flex items-center gap-2 text-sm" style={{ color: tokens.textMuted }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: tokens.textMuted }} />
                <span>{t('changePassword.redirectingToLogin')}</span>
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
              <span className="text-sm font-medium">{t('changePassword.backToLogin')}</span>
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
                {t('changePassword.title')}
              </h1>
              <p className="leading-relaxed" style={{ color: tokens.textMuted }}>
                {t('changePassword.description')}
              </p>
            </motion.div>

            {/* Form */}
            <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                    <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current Password */}
              <motion.div variants={itemVariants}>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2.5" style={{ color: tokens.text }}>
                  {t('changePassword.currentPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: tokens.textMuted }} />
                  <input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 rounded-xl transition-all outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${tokens.cardBorder}`,
                      color: tokens.text,
                    }}
                    placeholder={t('changePassword.currentPasswordPlaceholder')}
                    autoComplete="current-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: tokens.textMuted }}
                  >
                    {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* New Password */}
              <motion.div variants={itemVariants}>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2.5" style={{ color: tokens.text }}>
                  {t('changePassword.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: tokens.textMuted }} />
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 rounded-xl transition-all outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${tokens.cardBorder}`,
                      color: tokens.text,
                    }}
                    placeholder={t('changePassword.newPasswordPlaceholder')}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: tokens.textMuted }}
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2.5" style={{ color: tokens.text }}>
                  {t('changePassword.confirmNewPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: tokens.textMuted }} />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 rounded-xl transition-all outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${tokens.cardBorder}`,
                      color: tokens.text,
                    }}
                    placeholder={t('changePassword.confirmPlaceholder')}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: tokens.textMuted }}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

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
                {loading ? t('changePassword.changingPassword') : t('changePassword.changeButton')}
              </motion.button>
            </motion.form>

            {/* Dica de Segurança */}
            <motion.div
              className="mt-8 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${tokens.cardBorder}` }}
              variants={itemVariants}
            >
              <p className="text-sm leading-relaxed" style={{ color: tokens.textMuted }}>
                <span className="font-semibold" style={{ color: tokens.text }}>🔒 {t('changePassword.securityTip')}</span> {t('changePassword.securityTipText')}
              </p>
            </motion.div>

            {/* Divider */}
            <motion.div className="my-8 border-t" style={{ borderColor: tokens.cardBorder }} variants={itemVariants} />

            {/* Link alternativo */}
            <motion.div className="text-center space-y-3" variants={itemVariants}>
              <p style={{ color: tokens.textMuted }}>
                {t('changePassword.havingProblems')}
              </p>
              <Link
                href="/esqueci-senha"
                className="inline-block text-sm font-semibold transition-all duration-300"
                style={{ color: tokens.text }}
              >
                {t('changePassword.recoverPassword')} →
              </Link>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-sm mt-8"
            style={{ color: tokens.textMuted }}
            variants={itemVariants}
          >
            {t('changePassword.needHelp')}{' '}
            <Link href="/esqueci-email" className="font-medium transition-colors" style={{ color: tokens.text }}>
              {t('changePassword.talkToSupport')}
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
