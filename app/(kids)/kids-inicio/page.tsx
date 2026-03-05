'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as kidsService from '@/lib/api/kids.service';
import { getRandomTip, MASCOTES } from '@/lib/api/kids.service';
import type { KidProfile } from '@/lib/api/kids.service';
import { Sparkles, UserX } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { getDesignTokens } from '@/lib/design-tokens';

export default function KidsInicioPage() {
  const t = useTranslations('kids.home');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { user } = useAuth();
  const [currentKid, setCurrentKid] = useState<KidProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);

        // Buscar perfil kids pelo userId do AuthContext
        if (user?.id) {
          const profile = await kidsService.getKidProfileByUserId(user.id);
          if (profile) {
            setCurrentKid(profile);
          } else {
            // Fallback: pegar todos e usar o primeiro (compatibilidade)
            const all = await kidsService.getKidsProfiles();
            setCurrentKid(all[0] ?? null);
          }
        } else {
          const all = await kidsService.getKidsProfiles();
          setCurrentKid(all[0] ?? null);
        }
      } catch (err) {
        setError(handleServiceError(err, 'KidsInicio'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount, user?.id]);

  if (loading) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (!currentKid) {
    return <PageEmpty icon={UserX} title="Nenhum perfil encontrado" message="Não há perfis kids cadastrados." />;
  }

  const randomTip = getRandomTip();

  // ─── Theme-aware colors ───
  const headingColor = isDark ? '#F1F5F9' : '#374151';     // same as logo: slate-100 / gray-700
  const labelColor = isDark ? '#CBD5E1' : '#4B5563';       // slate-300 / gray-600
  const hintColor = isDark ? '#94A3B8' : '#9CA3AF';        // slate-400 / gray-400
  const cardBg = isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.7)';
  const cardBorder = isDark ? 'rgba(20,184,166,0.15)' : undefined;

  // Accent colors per category
  const accent = {
    blue:   isDark ? '#38BDF8' : '#3B82F6',   // sky-400 / blue-500
    orange: isDark ? '#FB923C' : '#F97316',   // orange-400 / orange-500
    yellow: isDark ? '#FACC15' : '#EAB308',   // yellow-400 / yellow-500
    green:  isDark ? '#4ADE80' : '#22C55E',   // green-400 / green-500
    teal:   isDark ? '#2DD4BF' : '#14B8A6',   // teal-400 / teal-500
  };

  const iconBg = (from: string, to: string) =>
    isDark ? `rgba(255,255,255,0.06)` : `linear-gradient(to bottom right, ${from}, ${to})`;

  const progressTrail = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Boas-vindas */}
      <div className="text-center space-y-3 py-6">
        <h2
          className="text-2xl sm:text-xl md:text-2xl lg:text-5xl font-black tracking-tight"
          style={{ color: headingColor }}
        >
          {t('greeting', { name: currentKid.nome.split(' ')[0] })}
        </h2>
        <p
          className="text-xl md:text-2xl font-semibold"
          style={{ color: headingColor }}
        >
          {t('greetingSubtitle')}
        </p>
      </div>

      {/* Cards de Ação Principal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { href: '/kids-aulas', emoji: '🎬', title: t('stats.sessions'), sub: '5 Novas!', color: accent.blue, from: '#EFF6FF', to: '#DBEAFE' },
          { href: '/kids-desafios', emoji: '🏆', title: t('stats.challenges'), sub: '2 Ativos', color: accent.orange, from: '#FFF7ED', to: '#FFEDD5' },
          { href: '/kids-medalhas', emoji: '🎖️', title: t('stats.achievements'), sub: `${currentKid.progresso.conquistasConquistadas}`, color: accent.yellow, from: '#FEFCE8', to: '#FEF9C3' },
          { href: '/kids-checkin', emoji: '⭐', title: t('stats.attendance'), sub: `Nível ${currentKid.nivel}`, color: accent.green, from: '#F0FDF4', to: '#DCFCE7' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 backdrop-blur-sm"
            style={{
              background: cardBg,
              borderColor: isDark ? `${card.color}20` : `${card.color}25`,
            }}
          >
            <div className="text-center space-y-3">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full group-hover:scale-110 transition-transform duration-300"
                style={{ background: iconBg(card.from, card.to) }}
              >
                <span className="text-4xl">{card.emoji}</span>
              </div>
              <h3 className="text-xl font-black" style={{ color: headingColor }}>{card.title}</h3>
              <p className="text-sm font-semibold" style={{ color: hintColor }}>{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Progresso Semanal */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{ background: cardBg, borderColor: cardBorder || 'rgba(59,130,246,0.12)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📊</span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: headingColor }}>
            {t('evolving')}
          </h3>
        </div>

        <div className="space-y-6">
          {/* Sessões Assistidas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-bold" style={{ color: labelColor }}>{t('watchedSessions')}</span>
              <span className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: accent.blue }}>{currentKid.progresso.sessõesAssistidas}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: progressTrail }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(currentKid.progresso.sessõesAssistidas / 20) * 100}%`,
                  background: `linear-gradient(to right, ${isDark ? '#38BDF8' : '#60A5FA'}, ${accent.blue})`,
                }}
              />
            </div>
            <p className="text-xs mt-2 font-semibold" style={{ color: labelColor }}>Continue assistindo! Você está indo muito bem! 🌟</p>
          </div>

          {/* Desafios Concluídos */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-bold" style={{ color: labelColor }}>{t('challengesDone')}</span>
              <span className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: accent.orange }}>{currentKid.progresso.desafiosConcluidos}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: progressTrail }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(currentKid.progresso.desafiosConcluidos / 15) * 100}%`,
                  background: `linear-gradient(to right, ${isDark ? '#FDBA74' : '#FB923C'}, ${accent.orange})`,
                }}
              />
            </div>
            <p className="text-xs mt-2 font-semibold" style={{ color: labelColor }}>Você é um guerreiro! Continue treinando! 💪</p>
          </div>

          {/* Presença */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-bold" style={{ color: labelColor }}>{t('trainingAttendance')}</span>
              <span className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: accent.green }}>{currentKid.progresso.presenca30dias}%</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: progressTrail }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${currentKid.progresso.presenca30dias}%`,
                  background: `linear-gradient(to right, ${isDark ? '#86EFAC' : '#4ADE80'}, ${accent.green})`,
                }}
              />
            </div>
            <p className="text-xs mt-2 font-semibold" style={{ color: labelColor }}>Ótima frequência! O treino traz evolução! 🥋</p>
          </div>
        </div>
      </div>

      {/* Mensagem do Tora */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{
          background: isDark
            ? 'rgba(30,41,59,0.55)'
            : 'linear-gradient(to bottom right, rgba(255,237,213,0.8), rgba(254,249,195,0.6), rgba(255,237,213,0.8))',
          borderColor: isDark ? 'rgba(251,146,60,0.2)' : 'rgba(251,146,60,0.3)',
        }}
      >
        <div className="flex items-start gap-6">
          <div className="text-6xl animate-bounce">🐯</div>
          <div className="flex-1 space-y-2">
            <p className="text-lg font-black flex items-center gap-2" style={{ color: headingColor }}>
              Tora, o Tigre, diz:
              <Sparkles size={20} style={{ color: accent.yellow }} />
            </p>
            <p className="text-xl font-semibold leading-relaxed" style={{ color: labelColor }}>
              &ldquo;{randomTip}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Mestres Animais */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{ background: cardBg, borderColor: isDark ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.1)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🐯</span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: headingColor }}>
            {t('animalMasters')}
          </h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          {MASCOTES.map((mascot) => (
            <div
              key={mascot.id}
              className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:scale-110 transition-all duration-300 cursor-pointer hover:shadow-md"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'linear-gradient(to bottom right, #FAF5FF, #FDF2F8)',
              }}
              title={mascot.nome}
            >
              <span className="text-4xl group-hover:scale-125 transition-transform duration-300">
                {mascot.emoji}
              </span>
              <span className="text-xs font-bold text-center leading-tight" style={{ color: labelColor }}>
                {mascot.nome}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Próximas Conquistas */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{ background: cardBg, borderColor: cardBorder || 'rgba(34,197,94,0.1)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🎯</span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: headingColor }}>
            {t('nextAchievements')}
          </h3>
        </div>
        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-5 rounded-2xl hover:scale-[1.02] transition-all duration-300"
            style={{ background: isDark ? 'rgba(56,189,248,0.08)' : 'linear-gradient(to bottom right, #EFF6FF, #DBEAFE)' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🏆</span>
              <div>
                <p className="text-lg font-black" style={{ color: headingColor }}>{t('persistentWarrior')}</p>
                <p className="text-sm font-semibold" style={{ color: hintColor }}>{t('persistentWarriorDesc')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: hintColor }}>{t('remaining')}</p>
              <p className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: accent.blue }}>3 dias</p>
            </div>
          </div>

          <div
            className="flex items-center justify-between p-5 rounded-2xl hover:scale-[1.02] transition-all duration-300"
            style={{ background: isDark ? 'rgba(250,204,21,0.08)' : 'linear-gradient(to bottom right, #FEFCE8, #FEF9C3)' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">⭐</span>
              <div>
                <p className="text-lg font-black" style={{ color: headingColor }}>{t('brilliantStudent')}</p>
                <p className="text-sm font-semibold" style={{ color: hintColor }}>{t('brilliantStudentDesc')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: hintColor }}>{t('remaining')}</p>
              <p className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: accent.yellow }}>5 sessões</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
