'use client';

'use client';

import { useEffect, useState } from 'react';
import { User, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ErrorAlert } from './ErrorAlert';
import { calcIdade } from './utils';
import type { DadosUsuario, StepBaseProps } from './types';

interface StepDadosProps extends StepBaseProps {
  dados: DadosUsuario;
  setDados: (d: DadosUsuario) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepDados({ dados, setDados, onSubmit, error, setError }: StepDadosProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [maxBirthDate, setMaxBirthDate] = useState('');

  useEffect(() => {
    setMaxBirthDate(new Date().toISOString().split('T')[0]);
  }, []);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2.5">{t('register.fullName')} *</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={dados.nome}
            onChange={e => setDados({ ...dados, nome: e.target.value })}
            placeholder={t('register.fullNamePlaceholder')}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
            autoFocus
            autoComplete="name"
            required
            minLength={3}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2.5">
          {t('register.dateOfBirth')} <span className="text-white/50 text-xs">{t('register.optional')}</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="date"
            value={dados.dataNascimento}
            onChange={e => { setDados({ ...dados, dataNascimento: e.target.value }); setError(''); }}
            max={maxBirthDate}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]"
          />
        </div>
        {dados.dataNascimento && (
          <p className="text-xs text-white/60 mt-2">{t('register.age', { age: calcIdade(dados.dataNascimento) })}</p>
        )}
      </div>

      <ErrorAlert message={error} />
      <button type="submit" className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all">
        {tCommon('actions.continue')}
      </button>
    </form>
  );
}
