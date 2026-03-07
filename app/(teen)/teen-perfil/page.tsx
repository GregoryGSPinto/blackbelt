'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as teenService from '@/lib/api/teen.service';
import type { TeenProfile } from '@/lib/api/teen.service';
import { User, Mail, Phone, Calendar, Award, UserX } from 'lucide-react';
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

  const { user } = useAuth();
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

  if (loading) return <PremiumLoader text={t('loading')} />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  if (!currentTeen) return <PageEmpty icon={UserX} title={t('notFound')} message={t('notFoundDesc')} />;

  const nome = user?.nome || currentTeen.nome;
  const email = user?.email || 'email@blackbelt.com';
  const graduacao = user?.graduacao || `Nivel ${currentTeen.nivel}`;
  const idade = user?.idade || currentTeen.idade;
  const avatar = user?.avatar || currentTeen.avatar;

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const fieldStyle = { border: '1px solid black' } as const;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg sm:text-xl font-bold font-teen" style={{ color: 'var(--text-primary)' }}>
        {t('title')}
      </h2>

      {/* Avatar + Info */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div
            className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl"
            style={{ background: 'var(--card-bg)', border: '1px solid black' }}
          >
            {avatar}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold font-teen" style={{ color: 'var(--text-primary)' }}>{nome}</h3>
            <p className="text-sm font-teen mt-1" style={{ color: 'var(--text-secondary)' }}>
              {idade} anos · {graduacao}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
              <span className="px-3 py-1 rounded-xl text-sm font-teen font-semibold" style={{ ...fieldStyle, color: 'var(--text-primary)' }}>
                {currentTeen.turma.split(' - ')[0]}
              </span>
              <span className="px-3 py-1 rounded-xl text-sm font-teen font-semibold" style={{ ...fieldStyle, color: 'var(--text-primary)' }}>
                {currentTeen.status === 'ATIVO' ? 'Ativo' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-sm font-bold font-teen mb-4" style={{ color: 'var(--text-primary)' }}>Informacoes</h3>
        <div className="space-y-4">
          {[
            { icon: Calendar, label: t('dob'), value: formatDate(currentTeen.dataNascimento) },
            { icon: User, label: t('professor'), value: user?.instrutor || currentTeen.instrutor },
            { icon: Award, label: t('graduation'), value: graduacao },
            { icon: Mail, label: t('email'), value: email },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-4 px-3 py-3 rounded-xl" style={fieldStyle}>
              <f.icon size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-teen" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
                <p className="text-sm mt-0.5 font-teen" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardian Info */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-sm font-bold font-teen mb-4" style={{ color: 'var(--text-primary)' }}>{t('legalGuardian')}</h3>
        <div className="space-y-4">
          {[
            { icon: User, label: t('name'), value: currentTeen.responsavel.nome },
            { icon: Mail, label: t('email'), value: currentTeen.responsavel.email },
            { icon: Phone, label: t('phone'), value: currentTeen.responsavel.telefone },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-4 px-3 py-3 rounded-xl" style={fieldStyle}>
              <f.icon size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-teen" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
                <p className="text-sm mt-0.5 font-teen" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
