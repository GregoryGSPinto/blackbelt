'use client';

import { useState } from 'react';
import {
  GraduationCap, Brain, BookOpen, Shield, Users, Heart,
  ArrowRight, CheckCircle2, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { TeenCard, ProgressCircle, TeenProgressBar } from '@/components/teen';
import { useTheme } from '@/contexts/ThemeContext';

// ============================================================
// TODO(FE-027): Substituir dados inline por GET /teen/unidade/areas
// ============================================================
const knowledgeAreas = [
  {
    id: 'fundamentos',
    icon: GraduationCap,
    title: 'Fundamentos do treinamento especializado',
    description: 'As bases essenciais para evoluir com segurança no ambiente.',
    progress: 80,
    questions: 5,
    answered: 5,
    accent: 'ocean' as const,
  },
  {
    id: 'conceitos',
    icon: Brain,
    title: 'Conceitos Essenciais',
    description: 'Os conceitos por trás de cada movimento no ambiente.',
    progress: 40,
    questions: 5,
    answered: 2,
    accent: 'purple' as const,
  },
  {
    id: 'regras',
    icon: Users,
    title: 'Regras e Ética',
    description: 'As regras que fazem do ambiente um lugar de respeito.',
    progress: 60,
    questions: 5,
    answered: 3,
    accent: 'emerald' as const,
  },
  {
    id: 'historia',
    icon: BookOpen,
    title: 'História e Filosofia',
    description: 'A história do treinamento especializado e seus valores fundamentais.',
    progress: 55,
    questions: 5,
    answered: 2,
    accent: 'energy' as const,
  },
  {
    id: 'mental',
    icon: Heart,
    title: 'Preparação Mental',
    description: 'Como sua mente pode acelerar sua evolução.',
    progress: 75,
    questions: 5,
    answered: 4,
    accent: 'purple' as const,
  },
  {
    id: 'seguranca',
    icon: Shield,
    title: 'Segurança e Prevenção',
    description: 'Treinar forte e seguro, sem se machucar.',
    progress: 65,
    questions: 5,
    answered: 3,
    accent: 'ocean' as const,
  },
] as const;

// Cores para texto em dark mode (mais claras para legibilidade)
const ACCENT_TEXT: Record<string, { dark: string; light: string }> = {
  ocean:   { dark: '#4DB8D4', light: '#005A78' },
  purple:  { dark: '#9B8BFF', light: '#5E4FD6' },
  emerald: { dark: '#5BD88A', light: '#27AE60' },
  energy:  { dark: '#FF8A5C', light: '#E85521' },
};

const BAR_COLOR: Record<string, 'ocean' | 'purple' | 'emerald' | 'energy'> = {
  ocean: 'ocean', purple: 'purple', emerald: 'emerald', energy: 'energy',
};

export default function TeenUnidadePage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'areas' | 'testes'>('areas');

  const average = Math.round(
    knowledgeAreas.reduce((s, a) => s + a.progress, 0) / knowledgeAreas.length
  );

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ═══════════════════════════════════════════════ */}
      {/* HERO                                            */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="teen-enter-1">
        <TeenCard variant="glass" className="relative overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: isDark ? 'rgba(0,107,143,0.06)' : 'rgba(0,107,143,0.04)' }} />
          <div className="absolute -bottom-14 -left-14 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: isDark ? 'rgba(123,104,238,0.04)' : 'rgba(123,104,238,0.03)' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 py-2">
            {/* Icon — CSS class cuida do dark/light */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 teen-accent-icon-ocean">
              <GraduationCap size={36} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-teen teen-text-heading">
                Unidade de Conhecimento
              </h1>
              <p className="text-sm md:text-base font-teen teen-text-muted mt-1.5 max-w-lg">
                Dominar esses conceitos vai acelerar sua evolução no ambiente.
              </p>
            </div>

            {/* Average progress */}
            <div className="flex-shrink-0">
              <ProgressCircle
                percentage={average}
                size={100}
                strokeWidth={9}
                color={isDark ? '#4DB8D4' : '#006B8F'}
                trailColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)'}
                label="média geral"
              />
            </div>
          </div>
        </TeenCard>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB SWITCHER                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="teen-enter-2 flex gap-2">
        {(['areas', 'testes'] as const).map((tab) => {
          const active = activeTab === tab;
          const label = tab === 'areas' ? 'Áreas de Conhecimento' : 'Testes';
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-sm font-teen font-semibold transition-all duration-200"
              style={{
                background: active
                  ? (isDark ? 'rgba(0,107,143,0.15)' : 'rgba(0,107,143,0.08)')
                  : 'transparent',
                color: active
                  ? (isDark ? '#4DB8D4' : '#005A78')
                  : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(109,93,75,0.5)'),
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* ÁREAS DE CONHECIMENTO                           */}
      {/* ═══════════════════════════════════════════════ */}
      {activeTab === 'areas' && (
        <>
          <div className="teen-enter-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {knowledgeAreas.map((area) => {
                const Icon = area.icon;
                const textColor = ACCENT_TEXT[area.accent];

                return (
                  <Link key={area.id} href={`/teen-unidade/${area.id}`} className="group">
                    <TeenCard className="h-full">
                      <div className="flex items-start gap-3.5">
                        {/* Icon — teen-accent-icon-* cuida dark/light automaticamente */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 teen-accent-icon-${area.accent}`}>
                          <Icon size={22} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold font-teen teen-text-heading truncate">
                            {area.title}
                          </h3>
                          <p className="text-xs font-teen teen-text-muted mt-1 leading-relaxed line-clamp-2">
                            {area.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <TeenProgressBar
                          progress={area.progress}
                          color={BAR_COLOR[area.accent]}
                          height="sm"
                          label="Progresso"
                        />
                      </div>

                      {/* Action hint */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-teen font-semibold transition-all duration-200 group-hover:gap-2.5"
                        style={{ color: isDark ? textColor.dark : textColor.light }}>
                        <span>Continuar</span>
                        <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </TeenCard>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ═══ PROGRESSO GERAL ═══ */}
          <div className="teen-enter-3">
            <TeenCard>
              <h2 className="text-base font-bold font-teen teen-text-heading mb-5">
                Progresso por Área
              </h2>

              <div className="space-y-0">
                {knowledgeAreas.map((area, i) => {
                  const textColor = ACCENT_TEXT[area.accent];
                  return (
                    <div key={area.id} className="flex items-center gap-3.5 py-3"
                      style={{
                        borderTop: i > 0
                          ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)'}`
                          : 'none',
                      }}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 teen-accent-icon-${area.accent}`}>
                        <area.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium font-teen teen-text-body truncate pr-2">
                            {area.title}
                          </span>
                          <span className="text-sm font-bold font-teen flex-shrink-0"
                            style={{ color: isDark ? textColor.dark : textColor.light }}>
                            {area.progress}%
                          </span>
                        </div>
                        <TeenProgressBar
                          progress={area.progress}
                          color={BAR_COLOR[area.accent]}
                          height="sm"
                          showPercentage={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Average footer */}
              <div className="mt-4 pt-4 text-center"
                style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)'}` }}>
                <p className="text-xs font-teen teen-text-muted mb-1">Média geral</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-teen"
                  style={{ color: isDark ? '#4DB8D4' : '#006B8F' }}>
                  {average}%
                </p>
                <p className="text-xs font-teen teen-text-muted mt-1.5">
                  Continue no seu ritmo — cada passo conta.
                </p>
              </div>
            </TeenCard>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* TESTES DE CONHECIMENTO                          */}
      {/* ═══════════════════════════════════════════════ */}
      {activeTab === 'testes' && (
        <div className="teen-enter-2 space-y-4">
          {/* Info banner */}
          <TeenCard variant="subtle" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 teen-accent-icon-ocean">
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-teen teen-text-body">
              Teste o que você aprendeu. Sem pressão — só evolução.
            </p>
          </TeenCard>

          {/* Test cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {knowledgeAreas.map((area) => {
              const textColor = ACCENT_TEXT[area.accent];
              const completed = area.answered >= area.questions;

              return (
                <TeenCard key={area.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 teen-accent-icon-${area.accent}`}>
                      <area.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold font-teen teen-text-heading truncate">
                        {area.title}
                      </h3>
                      {completed ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 size={12} className="text-teen-emerald" />
                          <span className="text-[11px] font-teen font-semibold text-teen-emerald">
                            {area.answered}/{area.questions} Completo
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-teen teen-text-muted">
                          {area.answered}/{area.questions} perguntas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini progress */}
                  <div className="mb-4">
                    <TeenProgressBar
                      progress={(area.answered / area.questions) * 100}
                      color={BAR_COLOR[area.accent]}
                      height="sm"
                      showPercentage={false}
                    />
                  </div>

                  {/* Action button */}
                  <button className="w-full py-2.5 rounded-xl text-sm font-teen font-bold transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: completed
                        ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                        : (isDark
                            ? `linear-gradient(135deg, ${textColor.light}, ${textColor.dark})`
                            : textColor.light),
                      color: completed
                        ? (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(109,93,75,0.6)')
                        : '#FFFFFF',
                      boxShadow: completed ? 'none' : '0 2px 10px rgba(0,107,143,0.15)',
                    }}>
                    {completed ? 'Refazer Teste' : 'Iniciar Teste'}
                  </button>
                </TeenCard>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
