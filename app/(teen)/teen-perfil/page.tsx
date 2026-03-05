'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TeenCard } from '@/components/teen';
import * as teenService from '@/lib/api/teen.service';
import type { TeenProfile } from '@/lib/api/teen.service';
import { User, Mail, Phone, Calendar, Award, Settings, LogOut , UserX} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

export default function TeenPerfilPage() {
  const t = useTranslations('teen.profile');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();

  const { user, logout } = useAuth();
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
        setError(handleServiceError(err, 'TeenPerfil'));

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
    return <PageEmpty icon={UserX} title={t('notFound')} message={t('notFoundDesc')} />;
  }


  // Dados detalhados vêm do mock (em produção, API dedicada)// Dados prioritários do AuthContext (dados reais do login)
  const nome      = user?.nome      || currentTeen.nome;
  const email     = user?.email     || 'email@blackbelt.com';
  const graduacao = user?.graduacao  || `Nível ${currentTeen.nivel}`;
  const idade     = user?.idade     || currentTeen.idade;
  const avatar    = user?.avatar    || currentTeen.avatar;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold teen-text-heading font-teen">
          {t('title')}
        </h2>
      </div>

      {/* Foto e Info Principal */}
      <TeenCard>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 bg-gradient-to-br from-teen-ocean to-teen-purple rounded-full flex items-center justify-center text-4xl sm:text-5xl md:text-6xl">
            {avatar}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-teen teen-text-heading mb-2">
              {nome}
            </h3>
            <p className="teen-text-muted font-teen mb-3">
              {idade} anos • {graduacao}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-teen-ocean-light text-teen-ocean-dark rounded-lg text-sm font-teen font-semibold">
                {currentTeen.turma.split(' - ')[0]}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-teen font-semibold ${
                currentTeen.status === 'ATIVO'
                  ? 'bg-teen-emerald-light text-teen-emerald-dark'
                  : 'bg-teen-energy-light text-teen-energy-dark'
              }`}>
                {currentTeen.status === 'ATIVO' ? '✓ Ativo' : '⚠ Pendente'}
              </span>
            </div>
          </div>
        </div>
      </TeenCard>

      {/* Informações */}
      <TeenCard>
        <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
          Informações
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-ocean-light rounded-xl">
              <Calendar className="w-5 h-5 text-teen-ocean-dark" />
            </div>
            <div>
              <p className="text-sm font-teen teen-text-muted">{t('dob')}</p>
              <p className="font-teen teen-text-heading">
                {formatDate(currentTeen.dataNascimento)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-purple-light rounded-xl">
              <User className="w-5 h-5 text-teen-purple-dark" />
            </div>
            <div>
              <p className="text-sm font-teen teen-text-muted">{t('professor')}</p>
              <p className="font-teen teen-text-heading">
                {user?.instrutor || currentTeen.instrutor}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-emerald-light rounded-xl">
              <Award className="w-5 h-5 text-teen-emerald-dark" />
            </div>
            <div>
              <p className="text-sm font-teen teen-text-muted">{t('graduation')}</p>
              <p className="font-teen teen-text-heading">{graduacao}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-energy-light rounded-xl">
              <Mail className="w-5 h-5 text-teen-energy-dark" />
            </div>
            <div>
              <p className="text-sm font-teen teen-text-muted">{t('email')}</p>
              <p className="font-teen teen-text-heading">{email}</p>
            </div>
          </div>
        </div>
      </TeenCard>

      {/* Responsável */}
      <TeenCard>
        <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
          {t('legalGuardian')}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-ocean-light rounded-xl">
              <User className="w-5 h-5 text-teen-ocean-dark" />
            </div>
            <div>
              <p className="text-sm font-teen teen-text-muted">{t('name')}</p>
              <p className="font-teen teen-text-heading">{currentTeen.responsavel.nome}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-purple-light rounded-xl">
              <Mail className="w-5 h-5 text-teen-purple-dark" />
            </div>
            <div>
              <p className="text-sm font-teen teen-text-muted">{t('email')}</p>
              <p className="font-teen teen-text-heading">{currentTeen.responsavel.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-emerald-light rounded-xl">
              <Phone className="w-5 h-5 text-teen-emerald-dark" />
            </div>
            <div>
              <p className="text-sm font-teen teen-text-muted">{t('phone')}</p>
              <p className="font-teen teen-text-heading">{currentTeen.responsavel.telefone}</p>
            </div>
          </div>
        </div>
      </TeenCard>

      {/* Preferências */}
      <TeenCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teen-energy-light rounded-xl">
              <Settings className="w-5 h-5 text-teen-energy-dark" />
            </div>
            <div>
              <h3 className="font-bold font-teen teen-text-heading">{t('settingsTitle')}</h3>
              <p className="text-sm teen-text-muted font-teen">{t('settingsDesc')}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-teen-ocean text-white rounded-xl font-teen font-semibold hover:bg-teen-ocean-dark transition-colors text-sm">
            Editar
          </button>
        </div>
      </TeenCard>

      {/* Ajuda */}
      <TeenCard>
        <h3 className="text-lg font-bold font-teen teen-text-heading mb-4">
          {t('needHelp')}
        </h3>
        <div className="space-y-3">
          <button className="w-full p-4 teen-card-subtle rounded-xl text-left hover:teen-card-subtle transition-colors hover-card">
            <p className="font-teen font-semibold teen-text-heading">{t('helpCenter')}</p>
            <p className="text-sm teen-text-muted font-teen">{t('helpCenterDesc')}</p>
          </button>
          <button className="w-full p-4 teen-card-subtle rounded-xl text-left hover:teen-card-subtle transition-colors hover-card">
            <p className="font-teen font-semibold teen-text-heading">{t('contactParent')}</p>
            <p className="text-sm teen-text-muted font-teen">{t('contactParentDesc')}</p>
          </button>
        </div>
      </TeenCard>

      {/* Sair da Conta */}
      <TeenCard>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-teen font-semibold"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </TeenCard>
    </div>
  );
}
