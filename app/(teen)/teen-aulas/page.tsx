'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TeenCard, TeenProgressBar } from '@/components/teen';
import * as teenService from '@/lib/api/teen.service';
import type { TeenProfile, TeenAula } from '@/lib/api/teen.service';
import { Play, CheckCircle } from 'lucide-react';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

export default function TeenSessõesPage() {
  const t = useTranslations('teen.sessions');
  const [teensessões, setTeensessões] = useState<TeenAula[]>([]);
  const [currentTeen, setCurrentTeen] = useState<TeenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filtro, setFiltro] = useState<'todas' | 'em-andamento' | 'concluidas'>('todas');

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [sessõesData, profilesData] = await Promise.all([
          teenService.getTeenSessões(),
          teenService.getTeenProfiles()
        ]);
        setTeensessões(sessõesData);
        setCurrentTeen(profilesData[0]);
      } catch (err) {
        setError(handleServiceError(err, 'TeenSessões'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading || !currentTeen) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }


  const sessõesFiltradas = teensessões.filter(sessão => {
    if (filtro === 'em-andamento') return sessão.progresso > 0 && !sessão.assistido;
    if (filtro === 'concluidas') return sessão.assistido;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold teen-text-heading font-teen">
          {t('subtitle')}
        </h2>
        <p className="teen-text-muted mt-1 font-teen">
          {t('contentForLevel', { level: currentTeen.nivel })}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-4 py-2 rounded-lg font-teen font-semibold transition-colors ${
            filtro === 'todas'
              ? 'bg-teen-ocean text-white'
              : 'teen-card teen-text-body'
          }`}
        >
          {t('tabs.all')}
        </button>
        <button
          onClick={() => setFiltro('em-andamento')}
          className={`px-4 py-2 rounded-lg font-teen font-semibold transition-colors ${
            filtro === 'em-andamento'
              ? 'bg-teen-ocean text-white'
              : 'teen-card teen-text-body'
          }`}
        >
          {t('tabs.inProgress')}
        </button>
        <button
          onClick={() => setFiltro('concluidas')}
          className={`px-4 py-2 rounded-lg font-teen font-semibold transition-colors ${
            filtro === 'concluidas'
              ? 'bg-teen-ocean text-white'
              : 'teen-card teen-text-body'
          }`}
        >
          {t('tabs.completed')}
        </button>
      </div>

      {/* Lista de Sessões */}
      <div className="space-y-4">
        {sessõesFiltradas.map((aula) => (
          <TeenCard key={aula.id} onClick={() => window.location.href = '/teen-aulas'}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Thumbnail */}
              <div className="w-32 h-32 bg-gradient-to-br from-teen-ocean to-teen-purple rounded-lg flex items-center justify-center flex-shrink-0">
                {aula.assistido ? (
                  <CheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <Play className="w-12 h-12 text-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold font-teen teen-text-heading mb-1">
                  {aula.titulo}
                </h3>
                <p className="text-sm teen-text-muted font-teen mb-2">
                  {aula.instrutor} • {aula.duracao}
                </p>
                <p className="text-sm teen-text-muted font-teen mb-3 line-clamp-2">
                  {aula.descricao}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-teen-ocean-light text-teen-ocean-dark rounded-lg text-xs font-teen font-semibold">
                    {aula.nivel}
                  </span>
                  <span className="px-3 py-1 bg-teen-purple-light text-teen-purple-dark rounded-lg text-xs font-teen font-semibold">
                    {aula.categoria}
                  </span>
                  {aula.assistido && (
                    <span className="px-3 py-1 bg-teen-emerald-light text-teen-emerald-dark rounded-lg text-xs font-teen font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Concluída
                    </span>
                  )}
                </div>

                {/* Progresso */}
                {aula.progresso > 0 && aula.progresso < 100 && (
                  <div>
                    <TeenProgressBar 
                      progress={aula.progresso} 
                      height="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </TeenCard>
        ))}
      </div>

      {sessõesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <p className="teen-text-muted font-teen">
            {t('noSessions')}
          </p>
        </div>
      )}
    </div>
  );
}
