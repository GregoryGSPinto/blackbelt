'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function AlterarSenhaPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

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
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Background Fixo */}
        <div className="fixed inset-0 z-0">
          <Image
            src="/images/logo-blackbelt.png"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-lg animate-slide-up">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 tracking-tight">{t('changePassword.passwordChanged')}</h2>
              <p className="text-white/70 text-base leading-relaxed mb-6">
                {t('changePassword.passwordChangedDesc')}
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-white/50">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                <span>{t('changePassword.redirectingToLogin')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Fixo - IDÊNTICO ao login */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/logo-blackbelt.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-up">
          {/* Botão Voltar */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-medium">{t('changePassword.backToLogin')}</span>
          </Link>

          {/* Container Principal */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-3 tracking-tight">
                {t('changePassword.title')}
              </h1>
              <p className="text-white/70 text-base leading-relaxed">
                {t('changePassword.description')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-white mb-2.5">
                  {t('changePassword.currentPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    placeholder={t('changePassword.currentPasswordPlaceholder')}
                    autoComplete="current-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2.5">
                  {t('changePassword.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    placeholder={t('changePassword.newPasswordPlaceholder')}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2.5">
                  {t('changePassword.confirmNewPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    placeholder={t('changePassword.confirmPlaceholder')}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('changePassword.changingPassword') : t('changePassword.changeButton')}
              </button>
            </form>

            {/* Dica de Segurança */}
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-sm text-white/70 leading-relaxed">
                <span className="font-semibold text-white">🔒 {t('changePassword.securityTip')}</span> {t('changePassword.securityTipText')}
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-white/10" />

            {/* Link alternativo */}
            <div className="text-center space-y-3">
              <p className="text-sm text-white/60">
                {t('changePassword.havingProblems')}
              </p>
              <Link
                href="/esqueci-senha"
                className="inline-block text-sm font-semibold text-white hover:text-white/80 transition-all duration-300"
              >
                {t('changePassword.recoverPassword')} →
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-white/40 mt-8 animate-fade-in-delay">
            {t('changePassword.needHelp')}{' '}
            <Link href="/esqueci-email" className="text-white hover:text-white/80 transition-colors font-medium">
              {t('changePassword.talkToSupport')}
            </Link>
          </p>
        </div>
      </div>

      {/* Animações CSS */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide-up {
          animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
