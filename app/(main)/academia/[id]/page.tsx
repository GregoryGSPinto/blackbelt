'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, BookOpen, Target } from 'lucide-react';
import { useEffect } from 'react';
import { getAreaById, useAcademyProgress } from '@/lib/academy';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

export default function AreaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const area = getAreaById(id);
  const { progress, markContentRead, getAreaPercent } = useAcademyProgress();

  // Marcar como lido ao abrir a página
  useEffect(() => {
    if (area) markContentRead(area.id);
  }, [area, markContentRead]);

  if (!area) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold mb-2" style={{ color: 'rgb(var(--color-text))' }}>Área não encontrada</p>
          <button onClick={() => router.push('/unidade')}
            className="text-primary-light text-sm font-medium">
            Voltar à Unidade
          </button>
        </div>
      </div>
    );
  }

  const Icon = area.icon;
  const pct = getAreaPercent(area.id);
  const p = progress[area.id];

  return (
    <div className="min-h-screen px-4 md:px-8 tv:px-16 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Breadcrumb */}
        <Breadcrumb dynamicLabel={area.title} />

        {/* Header */}
        <div className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgb(var(--color-border) / 0.06)',
          }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${area.accentDark}, ${area.accent})`,
                boxShadow: `0 4px 16px ${area.accentDark}40`,
              }}>
              <Icon size={30} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight mb-2"
                style={{ color: 'rgb(var(--color-text))' }}>
                {area.title}
              </h1>
              <p style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
                {area.description}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-border) / 0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${area.accentDark}, ${area.accent})`,
                }} />
            </div>
            <span className="text-sm font-bold" style={{ color: area.accent }}>{pct}%</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400">
              <CheckCircle size={11} /> Conteúdo lido
            </span>
            {p?.testCompleted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400">
                <Target size={11} /> Teste: {p.testScore}/{p.testTotal}
              </span>
            )}
          </div>
        </div>

        {/* ═══ CONTEÚDO TEÓRICO ═══ */}
        <div className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgb(var(--color-border) / 0.06)',
          }}>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={18} style={{ color: area.accent }} />
            <h2 className="text-lg font-bold" style={{ color: 'rgb(var(--color-text) / 0.9)' }}>
              Conteúdo Teórico
            </h2>
          </div>

          {/* Intro quote */}
          <div className="mb-8 p-5 rounded-xl relative"
            style={{
              background: `linear-gradient(135deg, ${area.accentDark}15, ${area.accent}08)`,
              borderLeft: `3px solid ${area.accent}`,
            }}>
            <p className="text-base md:text-lg font-semibold italic leading-relaxed"
              style={{ color: 'rgb(var(--color-text) / 0.8)' }}>
              "{area.content.intro}"
            </p>
          </div>

          {/* Paragraphs */}
          <div className="space-y-5">
            {area.content.paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] leading-[1.8]"
                style={{ color: 'rgb(var(--color-text-subtle) / 0.65)' }}>
                {p}
              </p>
            ))}
          </div>

          {/* Key Points */}
          <div className="mt-8 p-5 rounded-xl" style={{ background: 'rgb(var(--color-border) / 0.04)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4"
              style={{ color: area.accent }}>
              Pontos-Chave
            </h3>
            <div className="space-y-3">
              {area.content.keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${area.accentDark}, ${area.accent})` }}>
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed"
                    style={{ color: 'rgb(var(--color-text) / 0.7)' }}>
                    {kp}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ CTA — Ir para Teste ═══ */}
        <button
          onClick={() => router.push(`/unidade/${area.id}/teste`)}
          className="w-full rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group"
          style={{
            background: `linear-gradient(135deg, ${area.accentDark}, ${area.accent})`,
            boxShadow: `0 8px 24px ${area.accentDark}30`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Target size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-base">
                {p?.testCompleted ? 'Refazer Teste de Conhecimento' : 'Fazer Teste de Conhecimento'}
              </p>
              <p className="text-white/60 text-sm mt-0.5">
                Valide o que você aprendeu
              </p>
            </div>
          </div>
          <ArrowRight size={20} className="text-white/70 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
