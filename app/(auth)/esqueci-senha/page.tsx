'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function EsqueciSenhaPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 tracking-tight">{t('forgotPassword.linkSent')}</h2>
              <p className="text-white/70 text-base leading-relaxed mb-6">
                {t('forgotPassword.linkSentDesc', { target: method === 'email' ? 'e-mail' : 'WhatsApp' })}
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-white/50">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                <span>{tCommon('actions.redirecting')}</span>
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
            <span className="text-sm font-medium">{t('forgotEmail.backToLogin')}</span>
          </Link>

          {/* Container Principal */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-3 tracking-tight">
                {t('forgotPassword.title')}
              </h1>
              <p className="text-white/70 text-base leading-relaxed">
                {t('forgotPassword.description')}
              </p>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                  method === 'email'
                    ? 'bg-white/10 border-white/30 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Mail className={`w-8 h-8 mx-auto mb-2 ${method === 'email' ? 'text-white' : 'text-white/60'}`} />
                <span className={`text-sm font-medium ${method === 'email' ? 'text-white' : 'text-white/70'}`}>
                  {t('forgotPassword.emailMethod')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('whatsapp')}
                className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                  method === 'whatsapp'
                    ? 'bg-white/10 border-white/30 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${method === 'whatsapp' ? 'text-white' : 'text-white/60'}`} />
                <span className={`text-sm font-medium ${method === 'whatsapp' ? 'text-white' : 'text-white/70'}`}>
                  {t('forgotPassword.whatsappMethod')}
                </span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2.5">
                  {t('forgotPassword.emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? tCommon('actions.sending') : t('forgotPassword.sendVia', { method: method === 'email' ? t('forgotPassword.emailMethod') : t('forgotPassword.whatsappMethod') })}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 border-t border-white/10" />

            {/* Link alternativo */}
            <div className="text-center space-y-3">
              <p className="text-sm text-white/60">
                {t('forgotPassword.noEmailAccess')}
              </p>
              <Link
                href="/esqueci-email"
                className="inline-block text-sm font-semibold text-white hover:text-white/80 transition-all duration-300"
              >
                {t('forgotPassword.recoverEmail')} →
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-white/40 mt-8 animate-fade-in-delay">
            {t('forgotPassword.needAccount')}{' '}
            <Link href="/cadastro" className="text-white hover:text-white/80 transition-colors font-medium">
              {t('forgotPassword.signUpFree')}
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
