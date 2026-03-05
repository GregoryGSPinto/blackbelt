'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ErrorAlert } from './ErrorAlert';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import type { DadosUsuario, StepBaseProps } from './types';

interface StepEmailProps extends StepBaseProps {
  dados: DadosUsuario;
  setDados: (d: DadosUsuario) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepEmail({ dados, setDados, onSubmit, error }: StepEmailProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2.5">{t('register.email')}</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="email"
            value={dados.email}
            onChange={e => setDados({ ...dados, email: e.target.value })}
            placeholder="seu@email.com"
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            autoFocus
            autoComplete="email"
            required
          />
        </div>
      </div>
      <ErrorAlert message={error} />
      <button type="submit" className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all">
        {tCommon('actions.continue')}
      </button>
      <SocialLoginButtons mode="signup" />
      <div className="text-center pt-4 border-t border-white/10">
        <p className="text-sm text-white/60 mb-2.5">{t('register.hasAccount')}</p>
        <Link href="/login" className="text-sm font-semibold hover:text-white/80">
          {t('register.login')} →
        </Link>
      </div>
    </form>
  );
}
