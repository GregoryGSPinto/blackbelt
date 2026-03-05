'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TeenCard, ProgressCircle, TeenProgressBar } from '@/components/teen';
import * as teenService from '@/lib/api/teen.service';
import type { TeenProfile } from '@/lib/api/teen.service';
import { TrendingUp, Calendar, Clock, Target , UserX} from 'lucide-react';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function TeenProgressoPage() {
  const t = useTranslations('teen.progress');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [currentTeen, setCurrentTeen] = useState<TeenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadTeen() {
      try {
        setError(null);
        const profiles = await teenService.getTeenProfiles();
        setCurrentTeen(profiles[0]);
      } catch (err) {
        setError(handleServiceError(err, 'TeenProgresso'));

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
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (!currentTeen) {
    return <PageEmpty icon={UserX} title={t('loading')} message={t('loading')} />;
  }


return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold teen-text-heading font-teen">
          {t('title')}
        </h2>
        <p className="teen-text-muted mt-1 font-teen">
          {t('subtitle')}
        </p>
      </div>

      {/* Evolução do Nível */}
      <TeenCard>
        <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
          {t('levelEvolution', { level: currentTeen.nivel })}
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <ProgressCircle 
              percentage={currentTeen.progresso.evolucaoNível}
              size={160}
              color="#006B8F"
            />
          </div>
          <div className="flex-1 w-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-teen teen-text-body">{t('minTime')}</span>
                  <span className="text-sm font-teen font-semibold text-teen-emerald">✓ {t('monthsComplete', { months: 12 })}</span>
                </div>
                <TeenProgressBar progress={100} color="emerald" showPercentage={false} height="sm" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-teen teen-text-body">{t('techniquesMastered')}</span>
                  <span className="text-sm font-teen font-semibold text-teen-ocean">45/60</span>
                </div>
                <TeenProgressBar progress={75} color="ocean" showPercentage={false} height="sm" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-teen teen-text-body">{t('trainingsDone')}</span>
                  <span className="text-sm font-teen font-semibold text-teen-purple">80/100</span>
                </div>
                <TeenProgressBar progress={80} color="purple" showPercentage={false} height="sm" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-teen-ocean-light rounded-lg">
          <p className="text-sm font-teen text-teen-ocean-dark text-center">
            {t('onTrack')}
          </p>
        </div>
      </TeenCard>

      {/* Estatísticas do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeenCard>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teen-emerald-light rounded-lg">
              <Calendar className="w-6 h-6 text-teen-emerald-dark" />
            </div>
            <div className="flex-1">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-teen teen-text-heading">
                {currentTeen.progresso.presenca30dias}%
              </p>
              <p className="text-sm font-teen teen-text-muted mt-1">
                {t('last30Days')}
              </p>
              <div className="mt-3">
                <TeenProgressBar 
                  progress={currentTeen.progresso.presenca30dias} 
                  color="emerald"
                  showPercentage={false}
                  height="sm"
                />
              </div>
            </div>
          </div>
        </TeenCard>

        <TeenCard>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teen-purple-light rounded-lg">
              <Clock className="w-6 h-6 text-teen-purple-dark" />
            </div>
            <div className="flex-1">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-teen teen-text-heading">
                {currentTeen.progresso.tempoTreinoTotal}h
              </p>
              <p className="text-sm font-teen teen-text-muted mt-1">
                {t('totalTime')}
              </p>
              <p className="text-xs font-teen teen-text-muted mt-2">
                {t('sinceStart')}
              </p>
            </div>
          </div>
        </TeenCard>
      </div>

      {/* Sequência Atual */}
      <TeenCard>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teen-energy-light rounded-lg">
            <TrendingUp className="w-6 h-6 text-teen-energy-dark" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold font-teen teen-text-heading mb-2">
              {t('streakTitle')}
            </h3>
            <p className="teen-text-muted font-teen mb-4">
              {t('streakDesc', { count: currentTeen.progresso.sequenciaAtual })}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-teen font-bold text-sm ${
                    i < currentTeen.progresso.sequenciaAtual
                      ? 'bg-teen-energy text-white'
                      : 'teen-progress-track teen-text-muted'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-xs teen-text-muted font-teen mt-3">
              {t('unlockStreak')}
            </p>
          </div>
        </div>
      </TeenCard>

      {/* Histórico Recente */}
      <TeenCard>
        <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
          {t('last7Days')}
        </h3>
        <div className="space-y-3">
          {[
            { dia: 'Hoje', presente: true },
            { dia: 'Ontem', presente: true },
            { dia: 'Sábado', presente: false },
            { dia: 'Sexta', presente: true },
            { dia: 'Quinta', presente: true },
            { dia: 'Quarta', presente: false },
            { dia: 'Terça', presente: true },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 teen-card-subtle rounded-lg">
              <span className="font-teen teen-text-body">{item.dia}</span>
              <span className={`px-3 py-1 rounded-lg font-teen text-sm font-semibold ${
                item.presente
                  ? 'bg-teen-emerald-light text-teen-emerald-dark'
                  : 'teen-progress-track teen-text-muted'
              }`}>
                {item.presente ? `✓ ${t('presentMark')}` : `－ ${t('absentMark')}`}
              </span>
            </div>
          ))}
        </div>
      </TeenCard>

      {/* Próximas Metas */}
      <TeenCard>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teen-ocean-light rounded-lg">
            <Target className="w-6 h-6 text-teen-ocean-dark" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold font-teen teen-text-heading mb-2">
              {t('nextGoals')}
            </h3>
            <ul className="space-y-2 text-sm font-teen teen-text-body">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teen-ocean rounded-full"></div>
                {t('goals.trainings')}
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teen-purple rounded-full"></div>
                {t('goals.techniques')}
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teen-emerald rounded-full"></div>
                {t('goals.competition')}
              </li>
            </ul>
          </div>
        </div>
      </TeenCard>
    </div>
  );
}
