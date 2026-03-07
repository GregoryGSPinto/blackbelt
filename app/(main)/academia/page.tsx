'use client';

import {
  ArrowRight, CheckCircle, Target, Trophy,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ACADEMY_AREAS, useAcademyProgress } from '@/lib/academy';
export default function UnidadePage() {
  const t = useTranslations('athlete');

  const { progress, getAreaPercent, getOverallPercent } = useAcademyProgress();
  const avgProgress = getOverallPercent();

  return (
    <div className="min-h-screen">
      {/* ═══ HERO Mobile ═══ */}
      <div className="md:hidden relative pt-6 pb-8 px-4 mb-2">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{ background: 'var(--card-bg)' }}>
            <Trophy size={14} className="text-primary-light" />
            <span className="text-xs font-semibold text-primary-light">{t('unit.title')}</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-2 leading-tight tracking-tight"
            style={{ color: 'var(--text-primary)' }}>
            {t('unit.subtitle')}
          </h1>
          <p className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            {t('unit.fullSubtitle')}
          </p>
        </div>
      </div>

      {/* ═══ HERO Desktop ═══ */}
      <div className="hidden md:block pt-8 tv:pt-12 pb-6 px-8 tv:px-16 mb-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-5"
            style={{ background: 'var(--card-bg)', border: '1px solid black' }}>
            <Trophy size={16} className="text-primary-light" />
            <span className="text-xs font-semibold text-primary-light tracking-wider uppercase">
              {t('unit.title')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4"
            style={{ color: 'var(--text-primary)' }}>
            {t('unit.subtitle')}
          </h1>
          <p className="text-lg font-medium max-w-xl leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            {t('unit.fullSubtitle')}
          </p>
        </div>
      </div>

      {/* ═══ ÁREAS DE CONHECIMENTO ═══ */}
      <section className="px-4 md:px-8 tv:px-16 pb-10 md:pb-14">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {t('unit.knowledgeAreas')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('unit.knowledgeAreasDesc')}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl"
            style={{ background: 'var(--card-bg)', border: '1px solid black' }}>
            <Trophy size={15} className="text-primary-light" />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {t('unit.average')} <span className="text-primary-light">{avgProgress}%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {ACADEMY_AREAS.map((area) => {
            const Icon = area.icon;
            const pct = getAreaPercent(area.id);
            const p = progress[area.id];

            return (
              <Link key={area.id} href={`/academia/${area.id}`}
                className="group/card relative rounded-xl p-5 md:p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'var(--card-bg)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid black',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'black';
                  (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'black';
                  (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)';
                }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${area.accentDark}, ${area.accent})`,
                    boxShadow: `0 4px 16px ${area.accentDark}40`,
                  }}>
                  <Icon size={26} className="text-white" />
                </div>

                <h3 className="text-[17px] font-bold mb-2 group-hover/card:text-primary-light transition-colors leading-snug"
                  style={{ color: 'var(--text-primary)' }}>
                  {area.title}
                </h3>
                <p className="text-[13px] leading-relaxed mb-5"
                  style={{ color: 'var(--text-secondary)' }}>
                  {area.description}
                </p>

                {/* Status badges */}
                <div className="flex items-center gap-2 mb-4">
                  {p?.contentRead && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                      <CheckCircle size={10} /> {t('unit.read')}
                    </span>
                  )}
                  {p?.testCompleted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400">
                      <Target size={10} /> {p.testScore}/{p.testTotal}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }} className="font-medium">{t('unit.progressLabel')}</span>
                    <span className="font-bold" style={{ color: area.accent }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${area.accentDark}, ${area.accent})`,
                      }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary-light/60 group-hover/card:text-primary-light group-hover/card:gap-3 transition-all">
                  <span>Acessar conteúdo</span>
                  <ArrowRight size={14} className="group-hover/card:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ TESTES DE CONHECIMENTO ═══ */}
      <section className="px-4 md:px-8 tv:px-16 pb-10 md:pb-14">
        <div className="rounded-xl p-6 md:p-8"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid black',
          }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6B4423, #8C6239)', boxShadow: '0 4px 16px rgba(107,68,35,0.3)' }}>
              <Target size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('unit.knowledgeTests')}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('unit.knowledgeTestsDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {ACADEMY_AREAS.map((area) => {
              const p = progress[area.id];
              const completed = p?.testCompleted;

              return (
                <Link key={area.id} href={`/academia/${area.id}/teste`}
                  className="p-4 rounded-xl transition-all hover:scale-[1.02] hover-card"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid black',
                  }}>
                  <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {area.title}
                  </h3>
                  {completed ? (
                    <div className="flex items-center gap-2 text-sm mb-3" style={{ color: '#8FAF7A' }}>
                      <CheckCircle size={15} />
                      <span className="font-medium">{p.testScore}/{p.testTotal} ✓</span>
                    </div>
                  ) : (
                    <div className="text-sm mb-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {t('unit.notTaken')}
                    </div>
                  )}
                  <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-all active:scale-95"
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid black',
                      color: 'var(--text-primary)',
                    }}>
                    {completed ? t('unit.retake') : t('unit.startTest')}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid black' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              💡 <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Lembre-se:</span>{' '}
              Aqui ninguém é avaliado. Aqui todo mundo evolui.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ PROGRESSO GERAL ═══ */}
      <section className="px-4 md:px-8 tv:px-16 pb-16 md:pb-24">
        <div className="rounded-xl p-6 md:p-8"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid black',
          }}>
          <div className="flex items-center gap-3 mb-6">
            <Trophy size={20} className="text-primary-light" />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('unit.yourProgress')}</h2>
          </div>

          <div className="space-y-4">
            {ACADEMY_AREAS.map((area) => {
              const pct = getAreaPercent(area.id);
              return (
                <div key={area.id} className="flex items-center gap-4">
                  <div className="w-36 md:w-44 text-[13px] font-medium truncate"
                    style={{ color: 'var(--text-secondary)' }}>
                    {area.title}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-bg)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${area.accentDark}, ${area.accent})`,
                      }} />
                  </div>
                  <div className="w-12 text-right text-[13px] font-bold" style={{ color: area.accent }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid black' }}>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              {t('unit.overallAvg')} <span className="text-primary-light font-bold text-lg">{avgProgress}%</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
