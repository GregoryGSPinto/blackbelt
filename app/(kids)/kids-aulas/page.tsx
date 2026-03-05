'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as kidsService from '@/lib/api/kids.service';
import type { KidProfile } from '@/lib/api/kids.service';
import { Play, Clock, Star, Lock, UserX } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { getDesignTokens } from '@/lib/design-tokens';

const SESSOES_MOCK = [
  { id: 1, titulo: 'Posicao de Guarda', duracao: '8 min', nivel: 'Facil', thumb: '🛡️', disponivel: true, completada: true },
  { id: 2, titulo: 'Aprendendo a Rolar', duracao: '6 min', nivel: 'Facil', thumb: '🤸', disponivel: true, completada: true },
  { id: 3, titulo: 'Defesa Basica', duracao: '10 min', nivel: 'Facil', thumb: '🛡️', disponivel: true, completada: false },
  { id: 4, titulo: 'Passagem de Guarda Simples', duracao: '12 min', nivel: 'Medio', thumb: '🥋', disponivel: true, completada: false },
  { id: 5, titulo: 'Raspagem Basica', duracao: '9 min', nivel: 'Medio', thumb: '⚡', disponivel: true, completada: false },
  { id: 6, titulo: 'Posicoes de Montada', duracao: '11 min', nivel: 'Medio', thumb: '🎯', disponivel: false, completada: false },
  { id: 7, titulo: 'Finalizacao - Armlock', duracao: '15 min', nivel: 'Dificil', thumb: '🌟', disponivel: false, completada: false },
];

export default function KidsSessoesPage() {
  const t = useTranslations('kids.sessions');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { user } = useAuth();
  const [currentKid, setCurrentKid] = useState<KidProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [, setSelectedAula] = useState<number | null>(null);

  useEffect(() => {
    async function loadKid() {
      try {
        setError(null);

        // Buscar perfil kids pelo userId do AuthContext
        if (user?.id) {
          const profile = await kidsService.getKidProfileByUserId(user.id);
          if (profile) {
            setCurrentKid(profile);
          } else {
            const all = await kidsService.getKidsProfiles();
            setCurrentKid(all[0] ?? null);
          }
        } else {
          const all = await kidsService.getKidsProfiles();
          setCurrentKid(all[0] ?? null);
        }
      } catch (err) {
        setError(handleServiceError(err, 'KidsSessoes'));
      } finally {
        setLoading(false);
      }
    }
    loadKid();
  }, [retryCount, user?.id]);

  if (loading) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (!currentKid) {
    return <PageEmpty icon={UserX} title={t('loading')} message={t('loading')} />;
  }

  // ─── Theme-aware colors ───
  const c = {
    heading:  isDark ? '#F1F5F9' : '#374151',
    label:    isDark ? '#CBD5E1' : '#4B5563',
    hint:     isDark ? '#94A3B8' : '#9CA3AF',
    cardBg:   isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.7)',
    border:   isDark ? 'rgba(20,184,166,0.15)' : 'rgba(0,0,0,0.06)',
    blue:     isDark ? '#38BDF8' : '#3B82F6',
    trail:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    thumbBg:  isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
    btnBg:    isDark ? 'rgba(20,184,166,0.2)' : '#FFFFFF',
    btnText:  isDark ? '#F1F5F9' : '#374151',
    disabledBg: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB',
    disabledText: isDark ? '#64748B' : '#9CA3AF',
  };

  const getNivelColor = (nivel: string) => {
    if (isDark) {
      switch (nivel) {
        case 'Facil': return { bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)', text: '#4ADE80' };
        case 'Medio': return { bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)', text: '#FACC15' };
        case 'Dificil': return { bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', text: '#FB923C' };
        default: return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#94A3B8' };
      }
    }
    switch (nivel) {
      case 'Facil': return { bg: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)', border: '#86EFAC', text: '#15803D' };
      case 'Medio': return { bg: 'linear-gradient(135deg, #FEF9C3, #FDE68A)', border: '#FCD34D', text: '#A16207' };
      case 'Dificil': return { bg: 'linear-gradient(135deg, #FFEDD5, #FED7AA)', border: '#FDBA74', text: '#C2410C' };
      default: return { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280' };
    }
  };

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'Facil': return t('difficulties.easy');
      case 'Medio': return t('difficulties.medium');
      case 'Dificil': return t('difficulties.hard');
      default: return nivel;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <h2 className="text-2xl sm:text-xl md:text-2xl lg:text-5xl font-black tracking-tight flex items-center justify-center gap-3" style={{ color: c.heading }}>
          <span>🎬</span> {t('title')}
        </h2>
        <p className="text-xl md:text-2xl font-semibold" style={{ color: c.heading }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Progresso Geral */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{ background: c.cardBg, borderColor: c.border }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📚</span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: c.heading }}>{t('yourProgress')}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold" style={{ color: c.label }}>{t('watchedSessions')}</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black" style={{ color: c.blue }}>{currentKid.progresso.sessõesAssistidas}</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: c.trail }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(currentKid.progresso.sessõesAssistidas / SESSOES_MOCK.length) * 100}%`,
                background: `linear-gradient(to right, ${isDark ? '#7DD3FC' : '#60A5FA'}, ${c.blue})`,
              }}
            />
          </div>
          <p className="text-sm font-semibold" style={{ color: c.label }}>{t('progressEncouragement')} 🌟</p>
        </div>
      </div>

      {/* Lista de Sessoes */}
      <div className="space-y-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-black flex items-center gap-2" style={{ color: c.heading }}>
          <span>📖</span> {t('allSessions')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SESSOES_MOCK.map((aula) => {
            const nivel = getNivelColor(aula.nivel);
            const disabled = !aula.disponivel;

            return (
              <div
                key={aula.id}
                className={`group relative overflow-hidden rounded-3xl shadow-md transition-all duration-300 border-2 backdrop-blur-sm ${
                  disabled ? 'opacity-50' : 'hover:scale-[1.03] hover:shadow-xl cursor-pointer'
                }`}
                style={{
                  background: disabled ? c.disabledBg : (isDark ? 'rgba(30,41,59,0.6)' : nivel.bg),
                  borderColor: disabled ? c.border : nivel.border,
                }}
                onClick={() => aula.disponivel && setSelectedAula(aula.id)}
              >
                <div className="p-6 space-y-4">
                  {/* Thumb + Badges */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-md group-hover:scale-110 transition-transform duration-300"
                      style={{ background: c.thumbBg }}
                    >
                      {aula.thumb}
                    </div>
                    {aula.completada && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={14} fill="white" /> {t('completed')}
                      </div>
                    )}
                    {disabled && (
                      <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                        style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#D1D5DB', color: isDark ? '#94A3B8' : '#FFF' }}>
                        <Lock size={14} /> {t('locked')}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-black leading-tight" style={{ color: c.heading }}>
                    {aula.titulo}
                  </h4>

                  {/* Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-bold" style={{ color: c.label }}>
                      <Clock size={16} /> {aula.duracao}
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-black"
                      style={{
                        background: isDark ? nivel.bg : 'rgba(255,255,255,0.85)',
                        color: nivel.text,
                      }}
                    >
                      {getNivelLabel(aula.nivel)}
                    </div>
                  </div>

                  {/* Button */}
                  {aula.disponivel ? (
                    <button
                      className="w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:opacity-90"
                      style={{ background: c.btnBg, color: c.btnText }}
                    >
                      <Play size={20} fill="currentColor" />
                      {aula.completada ? t('watchAgain') : t('startLesson')}
                    </button>
                  ) : (
                    <div
                      className="w-full py-4 rounded-2xl font-black text-lg text-center"
                      style={{ background: c.disabledBg, color: c.disabledText }}
                    >
                      {t('askParent')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mensagem Motivacional */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{
          background: isDark ? 'rgba(30,41,59,0.55)' : 'linear-gradient(135deg, rgba(243,232,255,0.8), rgba(252,231,243,0.6), rgba(243,232,255,0.8))',
          borderColor: isDark ? 'rgba(192,132,252,0.2)' : 'rgba(192,132,252,0.3)',
        }}
      >
        <div className="flex items-start gap-6">
          <div className="text-6xl">💪</div>
          <div className="flex-1 space-y-2">
            <p className="text-lg font-black" style={{ color: c.heading }}>{t('youAreAwesome')}</p>
            <p className="text-xl font-semibold leading-relaxed" style={{ color: c.label }}>
              {t('awesomeDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
