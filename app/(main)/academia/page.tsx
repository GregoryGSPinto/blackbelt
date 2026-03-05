'use client';

import {
  ArrowRight, CheckCircle, Target, Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { ACADEMY_AREAS, useAcademyProgress } from '@/lib/academy';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function UnidadePage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { progress, getAreaPercent, getOverallPercent } = useAcademyProgress();
  const avgProgress = getOverallPercent();

  return (
    <div className="min-h-screen">
      {/* ═══ HERO Mobile ═══ */}
      <div className="md:hidden relative pt-6 pb-8 px-4 mb-2">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{ background: 'rgb(var(--color-border) / 0.12)' }}>
            <Trophy size={14} className="text-primary-light" />
            <span className="text-xs font-semibold text-primary-light">Unidade</span>
          </div>
          <h1 className="text-2xl font-extrabold mb-2 leading-tight tracking-tight"
            style={{ color: 'rgb(var(--color-text))' }}>
            Conhecimento que Sustenta a Evolução
          </h1>
          <p className="text-sm leading-relaxed"
            style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
            Fundamentos, conceitos e filosofia para sua jornada no treinamento especializado
          </p>
        </div>
      </div>

      {/* ═══ HERO Desktop ═══ */}
      <div className="hidden md:block pt-8 tv:pt-12 pb-6 px-8 tv:px-16 mb-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-5"
            style={{ background: 'rgb(var(--color-border) / 0.1)', border: '1px solid rgb(var(--color-border) / var(--color-border-alpha))' }}>
            <Trophy size={16} className="text-primary-light" />
            <span className="text-xs font-semibold text-primary-light tracking-wider uppercase">
              Unidade do Conhecimento
            </span>
          </div>
          <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4"
            style={{ color: 'rgb(var(--color-text))' }}>
            Conhecimento que Sustenta
            <br />
            <span className="text-primary-light">a Evolução no Ambiente</span>
          </h1>
          <p className="text-lg font-medium max-w-xl leading-relaxed"
            style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
            Fundamentos, conceitos e filosofia para sua jornada no treinamento especializado
          </p>
        </div>
      </div>

      {/* ═══ ÁREAS DE CONHECIMENTO ═══ */}
      <section className="px-4 md:px-8 tv:px-16 pb-10 md:pb-14">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'rgb(var(--color-text) / 0.9)' }}>
              Áreas de Conhecimento
            </h2>
            <p className="text-sm" style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
              Aprenda conceitos fundamentais e evolua tecnicamente
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl"
            style={{ background: 'rgb(var(--color-border) / 0.06)', border: '1px solid rgb(var(--color-border) / 0.06)' }}>
            <Trophy size={15} className="text-primary-light" />
            <span className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
              Média: <span className="text-primary-light">{avgProgress}%</span>
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
                className="group/card relative rounded-2xl p-5 md:p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgb(var(--color-border) / 0.06)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--color-border) / 0.15)';
                  (e.currentTarget as HTMLElement).style.background = 'rgb(var(--glass-bg) / var(--glass-hover-alpha))';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--color-border) / 0.06)';
                  (e.currentTarget as HTMLElement).style.background = 'rgb(var(--glass-bg) / var(--glass-alpha))';
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
                  style={{ color: 'rgb(var(--color-text) / 0.85)' }}>
                  {area.title}
                </h3>
                <p className="text-[13px] leading-relaxed mb-5"
                  style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                  {area.description}
                </p>

                {/* Status badges */}
                <div className="flex items-center gap-2 mb-4">
                  {p?.contentRead && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                      <CheckCircle size={10} /> Lido
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
                    <span style={{ color: 'rgb(var(--color-text-subtle) / 0.35)' }} className="font-medium">Progresso</span>
                    <span className="font-bold" style={{ color: area.accent }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-border) / 0.08)' }}>
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
        <div className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgb(var(--color-border) / 0.06)',
          }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6B4423, #8C6239)', boxShadow: '0 4px 16px rgba(107,68,35,0.3)' }}>
              <Target size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1" style={{ color: 'rgb(var(--color-text) / 0.9)' }}>Testes de Conhecimento</h2>
              <p className="text-sm" style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                Reforce o que aprendeu com perguntas e feedback construtivo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {ACADEMY_AREAS.map((area) => {
              const p = progress[area.id];
              const completed = p?.testCompleted;

              return (
                <Link key={area.id} href={`/academia/${area.id}/teste`}
                  className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: 'rgb(var(--color-border) / 0.03)',
                    border: `1px solid ${completed ? 'rgba(143,175,122,0.12)' : 'rgb(var(--color-border) / 0.06)'}`,
                  }}>
                  <h3 className="font-semibold mb-2 text-sm" style={{ color: 'rgb(var(--color-text) / 0.8)' }}>
                    {area.title}
                  </h3>
                  {completed ? (
                    <div className="flex items-center gap-2 text-sm mb-3" style={{ color: '#8FAF7A' }}>
                      <CheckCircle size={15} />
                      <span className="font-medium">{p.testScore}/{p.testTotal} ✓</span>
                    </div>
                  ) : (
                    <div className="text-sm mb-3 font-medium" style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                      Não realizado
                    </div>
                  )}
                  <div className="w-full py-2.5 rounded-lg text-sm font-medium text-center transition-all active:scale-95"
                    style={{
                      background: 'rgb(var(--color-border) / 0.08)',
                      border: '1px solid rgb(var(--color-border) / 0.1)',
                      color: 'rgba(184,154,106,0.8)',
                    }}>
                    {completed ? 'Refazer' : 'Iniciar Teste'}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid rgb(var(--color-border) / 0.06)' }}>
            <p className="text-sm" style={{ color: 'rgb(var(--color-text-subtle) / 0.35)' }}>
              💡 <span className="font-medium" style={{ color: 'rgb(var(--color-text-subtle) / 0.5)' }}>Lembre-se:</span>{' '}
              Aqui ninguém é avaliado. Aqui todo mundo evolui.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ PROGRESSO GERAL ═══ */}
      <section className="px-4 md:px-8 tv:px-16 pb-16 md:pb-24">
        <div className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgb(var(--color-border) / 0.06)',
          }}>
          <div className="flex items-center gap-3 mb-6">
            <Trophy size={20} className="text-primary-light" />
            <h2 className="text-xl font-bold" style={{ color: 'rgb(var(--color-text) / 0.9)' }}>Seu Progresso na Unidade</h2>
          </div>

          <div className="space-y-4">
            {ACADEMY_AREAS.map((area) => {
              const pct = getAreaPercent(area.id);
              return (
                <div key={area.id} className="flex items-center gap-4">
                  <div className="w-36 md:w-44 text-[13px] font-medium truncate"
                    style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                    {area.title}
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-border) / 0.08)' }}>
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

          <div className="mt-6 pt-5 text-center" style={{ borderTop: '1px solid rgb(var(--color-border) / 0.06)' }}>
            <p style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }} className="text-sm">
              Média geral: <span className="text-primary-light font-bold text-lg">{avgProgress}%</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
