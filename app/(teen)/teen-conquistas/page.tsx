'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TeenCard, TeenProgressBar } from '@/components/teen';
import * as teenService from '@/lib/api/teen.service';
import type { TeenConquista } from '@/lib/api/teen.service';
import { Award , Trophy} from 'lucide-react';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

export default function TeenConquistasPage() {
  const t = useTranslations('teen.achievements');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();

  const [teenconquistas, setTeenconquistas] = useState<TeenConquista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await teenService.getConquistas();
        setTeenconquistas(data);
      } catch (err) {
        setError(handleServiceError(err, 'TeenConquistas'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (teenconquistas.length === 0) {
    return <PageEmpty icon={Trophy} title={t('noAchievements')} message={t('keepTraining')} />;
  }


  const conquistadas = teenconquistas.filter(c => c.conquistada);
  const emProgresso = teenconquistas.filter(c => !c.conquistada && c.progresso);
  const bloqueadas = teenconquistas.filter(c => !c.conquistada && !c.progresso);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold teen-text-heading font-teen">
          {t('title')}
        </h2>
        <p className="teen-text-muted mt-1 font-teen">
          {t('unlockedCount', { unlocked: conquistadas.length, total: teenconquistas.length })}
        </p>
      </div>

      {/* Resumo */}
      <TeenCard>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teen-ocean-light rounded-full mb-4">
            <Award className="w-10 h-10 text-teen-ocean-dark" />
          </div>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-teen teen-text-heading mb-2">
            {conquistadas.length}
          </p>
          <p className="font-teen teen-text-muted">
            Conquistas Desbloqueadas
          </p>
        </div>
      </TeenCard>

      {/* Conquistadas */}
      {conquistadas.length > 0 && (
        <div>
          <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
            {t('unlockedTab')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conquistadas.map((conquista) => (
              <TeenCard key={conquista.id}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{conquista.icone}</div>
                  <div className="flex-1">
                    <h4 className="font-bold font-teen teen-text-heading mb-1">
                      {conquista.nome}
                    </h4>
                    <p className="text-sm teen-text-muted font-teen mb-2">
                      {conquista.descricao}
                    </p>
                    <p className="text-xs teen-text-muted font-teen">
                      Desbloqueada em {formatDate(conquista.dataConquista!, 'short')}
                    </p>
                  </div>
                </div>
              </TeenCard>
            ))}
          </div>
        </div>
      )}

      {/* Em Progresso */}
      {emProgresso.length > 0 && (
        <div>
          <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
            {t('inProgressTab')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emProgresso.map((conquista) => (
              <TeenCard key={conquista.id}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl opacity-70">{conquista.icone}</div>
                  <div className="flex-1">
                    <h4 className="font-bold font-teen teen-text-heading mb-1">
                      {conquista.nome}
                    </h4>
                    <p className="text-sm teen-text-muted font-teen mb-3">
                      {conquista.descricao}
                    </p>
                    {conquista.requisito && (
                      <p className="text-xs teen-text-muted font-teen mb-2">
                        {conquista.requisito}
                      </p>
                    )}
                    {conquista.progresso && (
                      <TeenProgressBar 
                        progress={conquista.progresso} 
                        color="ocean"
                        height="sm"
                      />
                    )}
                  </div>
                </div>
              </TeenCard>
            ))}
          </div>
        </div>
      )}

      {/* Bloqueadas */}
      {bloqueadas.length > 0 && (
        <div>
          <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
            {t('nextAchievements')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloqueadas.map((conquista) => (
              <TeenCard key={conquista.id}>
                <div className="flex items-start gap-4 opacity-50">
                  <div className="text-4xl">{conquista.icone}</div>
                  <div className="flex-1">
                    <h4 className="font-bold font-teen teen-text-heading mb-1">
                      {conquista.nome}
                    </h4>
                    <p className="text-sm teen-text-muted font-teen mb-2">
                      {conquista.descricao}
                    </p>
                    {conquista.requisito && (
                      <p className="text-xs teen-text-muted font-teen">
                        {conquista.requisito}
                      </p>
                    )}
                  </div>
                </div>
              </TeenCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
