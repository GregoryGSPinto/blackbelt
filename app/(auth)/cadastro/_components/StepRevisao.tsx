'use client';

import { useState } from 'react';
import { Check, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';
import { ErrorAlert } from './ErrorAlert';
import { calcIdade } from './utils';
import type { DadosUsuario, DadosKid, StepBaseProps } from './types';

interface StepRevisaoProps extends StepBaseProps {
  dados: DadosUsuario;
  kids: DadosKid[];
  onFinalizar: (aceite: boolean) => void;
  onOpenModal: (title: string) => void;
}

export function StepRevisao({ dados, kids, onFinalizar, onOpenModal, error }: StepRevisaoProps) {
  const t = useTranslations('auth');
  const { formatDate } = useFormatting();
  const [aceite, setAceite] = useState(false);

  const perfilLabel = dados.perfilAutomatico === 'adulto'
    ? (kids.length > 0 ? t('review.parentWithKids') : t('register.profileAdult'))
    : dados.perfilAutomatico === 'adolescente' ? t('register.profileTeen') : t('register.profileKids');

  return (
    <div className="space-y-6">
      {/* Dados do usuário */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{t('review.reviewTitle')}</h3>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            {dados.avatarFile ? (
              <img src={dados.avatarFile} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                {dados.avatar}
              </div>
            )}
            <div>
              <p className="font-semibold">{dados.nome}</p>
              <p className="text-sm text-white/60">{dados.email}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 space-y-2 text-sm">
            {dados.dataNascimento && (
              <>
                <p className="text-white/70">
                  <span className="text-white/50">{t('review.dateOfBirth')}</span>{' '}
                  {formatDate(dados.dataNascimento)}
                </p>
                <p className="text-white/70">
                  <span className="text-white/50">{t('review.ageLabel')}</span> {dados.idade} anos
                </p>
              </>
            )}
            <p className="text-white/70">
              <span className="text-white/50">{t('review.profileLabel')}</span> {perfilLabel}
            </p>
            {dados.perfilAutomatico === 'adolescente' && dados.nomeResponsavel && (
              <>
                <p className="text-white/70">
                  <span className="text-white/50">{t('review.parentLabel')}</span> {dados.nomeResponsavel}
                </p>
                <p className="text-white/70">
                  <span className="text-white/50">{t('review.parentEmailLabel')}</span> {dados.emailResponsavel}
                </p>
                <p className="text-green-400/70 text-xs flex items-center gap-1">
                  {t('review.consentAuthorized')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Filhos vinculados */}
        {kids.length > 0 && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm font-medium mb-3">{t('review.linkedKids', { count: kids.length })}</p>
            <div className="space-y-2">
              {kids.map((k, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {k.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white">{k.nome}</p>
                    <p className="text-xs text-white/60">{calcIdade(k.dataNascimento)} anos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Termos e Condições */}
      <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4">
        <h3 className="text-base font-semibold mb-3">{t('review.termsTitle')}</h3>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input type="checkbox" checked={aceite} onChange={e => setAceite(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-white checked:border-white appearance-none cursor-pointer transition-all" />
            {aceite && (
              <Check size={16} className="absolute top-0.5 left-0.5 text-black pointer-events-none" />
            )}
          </div>
          <div className="flex-1 text-sm text-white/80 leading-relaxed">
            {t('review.termsAcceptance', {
              termsLink: '',
              privacyLink: '',
              contractLink: '',
              text: t('review.andOtherPolicies'),
            }).split(t('review.andOtherPolicies'))[0]}
            <button type="button" onClick={() => onOpenModal(t('consent.termsOfUse'))}
              className="text-white font-medium hover:underline">{t('consent.termsOfUse')}</button>
            , {' '}
            <button type="button" onClick={() => onOpenModal(t('consent.privacyPolicy'))}
              className="text-white font-medium hover:underline">{t('consent.privacyPolicy')}</button>
            , {' '}
            <button type="button" onClick={() => onOpenModal(t('review.subscriptionContract'))}
              className="text-white font-medium hover:underline">{t('review.subscriptionContract')}</button>
            {' '}{t('review.andOtherPolicies')}
          </div>
        </label>
      </div>

      <ErrorAlert message={error} />

      <button onClick={() => onFinalizar(aceite)} disabled={!aceite}
        className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          aceite ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}>
        <CheckCircle size={20} /> {t('register.createButton')}
      </button>
    </div>
  );
}
