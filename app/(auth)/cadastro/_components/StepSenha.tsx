'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ErrorAlert } from './ErrorAlert';
import { validaSenha } from './utils';
import type { DadosUsuario, StepBaseProps } from './types';

interface StepSenhaProps extends StepBaseProps {
  dados: DadosUsuario;
  setDados: (d: DadosUsuario) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepSenha({ dados, setDados, onSubmit, error }: StepSenhaProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2.5">{t('register.password')}</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type={showSenha ? 'text' : 'password'}
            value={dados.senha}
            onChange={e => setDados({ ...dados, senha: e.target.value })}
            placeholder={t('register.passwordPlaceholder')}
            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            autoFocus
            autoComplete="new-password"
            required
            minLength={6}
          />
          <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
            {showSenha ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {dados.senha && (
          <p className={`text-xs mt-2 ${validaSenha(dados.senha).ok ? 'text-green-400' : 'text-red-400'}`}>
            {validaSenha(dados.senha).msg}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2.5">{t('register.confirmPassword')}</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type={showConfirmar ? 'text' : 'password'}
            value={dados.confirmarSenha}
            onChange={e => setDados({ ...dados, confirmarSenha: e.target.value })}
            placeholder={t('register.confirmPasswordPlaceholder')}
            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            autoComplete="new-password"
            required
            minLength={6}
          />
          <button type="button" onClick={() => setShowConfirmar(!showConfirmar)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
            {showConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {dados.confirmarSenha && dados.senha && (
          <p className={`text-xs mt-2 ${dados.senha === dados.confirmarSenha ? 'text-green-400' : 'text-red-400'}`}>
            {dados.senha === dados.confirmarSenha ? `✓ ${t('register.passwordsMatch')}` : `✗ ${t('register.passwordsDontMatch')}`}
          </p>
        )}
      </div>

      <ErrorAlert message={error} />
      <button type="submit" className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all">
        {tCommon('actions.continue')}
      </button>
    </form>
  );
}
