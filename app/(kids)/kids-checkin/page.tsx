// ============================================================
// Kids Check-in Page — READ-ONLY (no self check-in)
// ============================================================
// Kids should NOT be able to self check-in.
// Check-in must be performed by a parent (responsavel) or instructor.
// This page shows check-in status in read-only mode only.
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as kidsService from '@/lib/api/kids.service';
import type { KidProfile } from '@/lib/api/kids.service';
import { ShieldAlert, CheckCircle, Clock, UserX, Info } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { getDesignTokens } from '@/lib/design-tokens';

export default function KidsCheckinPage() {
  const t = useTranslations('kids.checkin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { user } = useAuth();
  const [currentKid, setCurrentKid] = useState<KidProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadKid() {
      try {
        setError(null);
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
        setError(handleServiceError(err, 'KidsCheckin'));
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
    green:    isDark ? '#4ADE80' : '#22C55E',
    amber:    isDark ? '#FBBF24' : '#F59E0B',
    blue:     isDark ? '#38BDF8' : '#3B82F6',
    guardBg:  isDark ? 'rgba(251,191,36,0.1)' : 'rgba(254,243,199,0.8)',
    guardBorder: isDark ? 'rgba(251,191,36,0.3)' : 'rgba(245,158,11,0.4)',
    guardText: isDark ? '#FCD34D' : '#92400E',
    infoBg:   isDark ? 'rgba(56,189,248,0.08)' : 'rgba(219,234,254,0.8)',
    infoBorder: isDark ? 'rgba(56,189,248,0.2)' : 'rgba(96,165,250,0.3)',
  };

  // Mock check-in status (read-only display)
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const checkinHoje = false; // Would come from service in production

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <h2
          className="text-2xl sm:text-xl md:text-2xl lg:text-5xl font-black tracking-tight flex items-center justify-center gap-3"
          style={{ color: c.heading }}
        >
          <span>📋</span> {t('title')}
        </h2>
        <p className="text-xl md:text-2xl font-semibold" style={{ color: c.heading }}>
          {t('subtitle')}
        </p>
      </div>

      {/* ═══ GUARD: Self check-in blocked for kids ═══ */}
      <div
        className="rounded-3xl p-6 shadow-md border-2 backdrop-blur-sm"
        style={{
          background: c.guardBg,
          borderColor: c.guardBorder,
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <ShieldAlert size={32} style={{ color: c.guardText }} />
          </div>
          <div className="flex-1 space-y-2">
            <h3
              className="text-lg font-black"
              style={{ color: c.guardText }}
            >
              {t('adultRequired')}
            </h3>
            <p className="text-sm font-semibold" style={{ color: isDark ? '#FDE68A' : '#A16207' }}>
              {t('adultRequiredDesc')}
            </p>
            <p className="text-xs" style={{ color: isDark ? '#FCD34D80' : '#B4590880' }}>
              {t('askAdult')}
            </p>
          </div>
        </div>
      </div>

      {/* Status de Presenca Hoje (read-only) */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{ background: c.cardBg, borderColor: c.border }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📅</span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: c.heading }}>
            {t('todayDate', { date: hoje })}
          </h3>
        </div>

        <div
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={{
            background: checkinHoje
              ? (isDark ? 'rgba(74,222,128,0.08)' : 'rgba(220,252,231,0.8)')
              : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(243,244,246,0.8)'),
            border: `1px solid ${checkinHoje
              ? (isDark ? 'rgba(74,222,128,0.2)' : 'rgba(34,197,94,0.2)')
              : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}`,
          }}
        >
          {checkinHoje ? (
            <>
              <CheckCircle size={28} style={{ color: c.green }} />
              <div>
                <p className="text-lg font-black" style={{ color: c.green }}>{t('confirmed')}</p>
                <p className="text-sm font-semibold" style={{ color: c.label }}>{t('confirmedDesc')}</p>
              </div>
            </>
          ) : (
            <>
              <Clock size={28} style={{ color: c.hint }} />
              <div>
                <p className="text-lg font-black" style={{ color: c.label }}>{t('waitingCheckin')}</p>
                <p className="text-sm font-semibold" style={{ color: c.hint }}>
                  {t('waitingDesc')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resumo de Presenca (read-only) */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{ background: c.cardBg, borderColor: c.border }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📊</span>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black" style={{ color: c.heading }}>
            {t('yourFrequency')}
          </h3>
        </div>

        <div className="space-y-4">
          {/* Presenca mensal */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-bold" style={{ color: c.label }}>{t('monthAttendance')}</span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black" style={{ color: c.green }}>
                {currentKid.progresso.presenca30dias}%
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${currentKid.progresso.presenca30dias}%`,
                  background: `linear-gradient(to right, ${isDark ? '#86EFAC' : '#4ADE80'}, ${c.green})`,
                }}
              />
            </div>
            <p className="text-sm mt-2 font-semibold" style={{ color: c.label }}>
              {currentKid.progresso.presenca30dias >= 80
                ? t('excellentFreq')
                : currentKid.progresso.presenca30dias >= 50
                ? t('goodFreq')
                : t('lowFreq')}
            </p>
          </div>
        </div>
      </div>

      {/* Informational note */}
      <div
        className="rounded-3xl p-6 shadow-md border-2 backdrop-blur-sm"
        style={{
          background: c.infoBg,
          borderColor: c.infoBorder,
        }}
      >
        <div className="flex items-start gap-4">
          <Info size={24} style={{ color: c.blue }} className="flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold" style={{ color: c.heading }}>
              {t('howItWorks')}
            </p>
            <p className="text-sm" style={{ color: c.label }}>
              {t('howItWorksDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Motivational */}
      <div
        className="rounded-3xl p-8 shadow-md border-2 backdrop-blur-sm"
        style={{
          background: isDark ? 'rgba(30,41,59,0.55)' : 'linear-gradient(135deg, rgba(243,232,255,0.8), rgba(252,231,243,0.6), rgba(243,232,255,0.8))',
          borderColor: isDark ? 'rgba(192,132,252,0.2)' : 'rgba(192,132,252,0.3)',
        }}
      >
        <div className="flex items-start gap-6">
          <div className="text-6xl">🥋</div>
          <div className="flex-1 space-y-2">
            <p className="text-lg font-black" style={{ color: c.heading }}>{t('keepTraining')}</p>
            <p className="text-xl font-semibold leading-relaxed" style={{ color: c.label }}>
              {t('keepTrainingDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
