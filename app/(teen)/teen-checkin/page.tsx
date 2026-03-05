'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TeenCard } from '@/components/teen';
import * as teenService from '@/lib/api/teen.service';
import type { TeenProfile } from '@/lib/api/teen.service';
import { CheckCircle, XCircle, AlertTriangle, Clock, MapPin, UserX, Info } from 'lucide-react';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function TeenCheckinPage() {
  const t = useTranslations('teen.checkin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [currentTeen, setCurrentTeen] = useState<TeenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState<{
    tipo: 'sucesso' | 'pendente' | 'negado' | null;
    mensagem: string;
  }>({ tipo: null, mensagem: '' });

  useEffect(() => {
    async function loadTeen() {
      try {
        setError(null);
        const profiles = await teenService.getTeenProfiles();
        setCurrentTeen(profiles[0]);
      } catch (err) {
        setError(handleServiceError(err, 'TeenCheckin'));

      } finally {
        setLoading(false);
      }
    }
    loadTeen();
  }, [retryCount]);

  if (loading) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;
  }
  if (!currentTeen) {
    return <PageEmpty icon={UserX} title={t('loading')} message={t('loading')} />;
  }


  const handleCheckin = () => {
    setSubmitting(true);

    // Simular validação do sistema
    setTimeout(() => {
      // Validar baseado no status
      if (currentTeen.status === 'ATIVO') {
        setResultado({
          tipo: 'sucesso',
          mensagem: t('confirmedDesc'),
        });
      } else if (currentTeen.status === 'EM_ATRASO') {
        setResultado({
          tipo: 'pendente',
          mensagem: t('validationDesc'),
        });
      } else {
        setResultado({
          tipo: 'negado',
          mensagem: t('accessSuspended'),
        });
      }
      setSubmitting(false);
    }, 1500);
  };

  const resetCheckin = () => {
    setResultado({ tipo: null, mensagem: '' });
  };

  // Tela de resultado
  if (resultado.tipo) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold teen-text-heading font-teen">
            {t('resultTitle')}
          </h2>
        </div>

        {resultado.tipo === 'sucesso' && (
          <div className="bg-teen-emerald-light border-2 border-teen-emerald rounded-xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-12 h-12 text-teen-emerald-dark flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold font-teen text-teen-emerald-dark mb-2">
                  {t('confirmed')}
                </h3>
                <p className="teen-text-body font-teen">
                  {resultado.mensagem}
                </p>
              </div>
            </div>
          </div>
        )}

        {resultado.tipo === 'pendente' && (
          <div className="bg-teen-energy-light border-2 border-teen-energy rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-12 h-12 text-teen-energy-dark flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold font-teen text-teen-energy-dark mb-2">
                  {t('validationNeeded')}
                </h3>
                <p className="teen-text-body font-teen mb-3">
                  {resultado.mensagem}
                </p>
                <p className="text-sm teen-text-muted font-teen">
                  {t('contactReception')}
                </p>
              </div>
            </div>
          </div>
        )}

        {resultado.tipo === 'negado' && (
          <>
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-teen text-red-900 mb-2">
                    {t('checkinUnavailable')}
                  </h3>
                  <p className="text-red-800 font-teen">
                    {resultado.mensagem}
                  </p>
                </div>
              </div>
            </div>

            <TeenCard>
              <h3 className="font-bold font-teen teen-text-heading mb-3">
                {t('howToResolve')}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm teen-text-body font-teen">
                <li>{t('resolveSteps.contactParent')}</li>
                <li>{t('resolveSteps.contactUnit')}</li>
                <li>{t('resolveSteps.waitRegularization')}</li>
              </ol>
            </TeenCard>
          </>
        )}

        <button
          onClick={resetCheckin}
          className="w-full px-6 py-3 bg-teen-ocean text-white rounded-lg font-teen font-semibold hover:bg-teen-ocean-dark transition-colors"
        >
          {t('newCheckin')}
        </button>
      </div>
    );
  }

  // Tela de check-in
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold teen-text-heading font-teen">
          {t('checkinTitle')}
        </h2>
        <p className="teen-text-muted mt-1 font-teen">
          {t('confirmPresence')}
        </p>
      </div>

      {/* ═══ Parental Notification Banner (minors) ═══ */}
      <div className="flex items-start gap-3 rounded-xl p-4 bg-teen-ocean-light border border-teen-ocean/20">
        <Info className="w-5 h-5 text-teen-ocean-dark flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold font-teen text-teen-ocean-dark">
            {t('parentNotified')}
          </p>
          <p className="text-xs font-teen text-teen-ocean-dark/70 mt-0.5">
            {t('parentNotice')}
          </p>
        </div>
      </div>

      {/* Info do Treino */}
      <TeenCard>
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-teen-ocean-light rounded-lg">
            <Clock className="w-6 h-6 text-teen-ocean-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold font-teen teen-text-heading mb-1">
              {t('nextTraining')}
            </h3>
            <p className="teen-text-muted font-teen">
              {t('nextTrainingTime')}
            </p>
            <p className="text-sm teen-text-muted font-teen">
              {currentTeen.turma}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-teen-purple-light rounded-lg">
            <MapPin className="w-6 h-6 text-teen-purple-dark" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold font-teen teen-text-heading mb-1">
              {t('locationLabel')}
            </h3>
            <p className="teen-text-muted font-teen">
              {t('locationValue')}
            </p>
            <p className="text-sm teen-text-muted font-teen">
              {currentTeen.instrutor}
            </p>
          </div>
        </div>
      </TeenCard>

      {/* Status */}
      <TeenCard>
        <h3 className="font-bold font-teen teen-text-heading mb-3">
          {t('yourStatus')}
        </h3>
        <div className="flex items-center justify-between">
          <span className="teen-text-body font-teen">{t('accessStatus')}</span>
          <span className={`px-4 py-2 rounded-lg font-teen font-semibold ${
            currentTeen.status === 'ATIVO'
              ? 'bg-teen-emerald-light text-teen-emerald-dark'
              : currentTeen.status === 'EM_ATRASO'
              ? 'bg-teen-energy-light text-teen-energy-dark'
              : 'bg-red-100 text-red-700'
          }`}>
            {currentTeen.status === 'ATIVO' ? `✓ ${t('ready')}` :
             currentTeen.status === 'EM_ATRASO' ? `⚠ ${t('pendingStatus')}` :
             `✕ ${t('suspended')}`}
          </span>
        </div>
      </TeenCard>

      {/* Botão de Check-in */}
      <button
        onClick={handleCheckin}
        disabled={submitting}
        className="w-full px-6 py-4 bg-teen-ocean text-white rounded-lg font-teen font-semibold text-lg hover:bg-teen-ocean-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('validating')}
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6" />
            {t('confirmCheckin')}
          </>
        )}
      </button>

      {/* Dica */}
      <div className="teen-card-subtle rounded-xl p-4">
        <p className="text-sm teen-text-muted font-teen text-center">
          💡 {t('checkinTip')}
        </p>
      </div>
    </div>
  );
}
