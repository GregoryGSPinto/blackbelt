'use client';

import { useState, useEffect, useMemo } from 'react';
import { Timer, CheckCircle, Award, BookOpen, Heart } from 'lucide-react';
import * as professorService from '@/lib/api/instrutor.service';
import type { AvaliacaoPendente } from '@/lib/api/instrutor.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function ProfessorAvaliacoesPage() {
  const t = useTranslations('professor.evaluations');

  const TIPO_CONFIG = {
    graduacao: { label: t('types.graduation'), icon: Award, bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/20' },
    tecnica: { label: t('types.technique'), icon: BookOpen, bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/20' },
    comportamento: { label: t('types.behavior'), icon: Heart, bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/20' },
  };

  const PRIORIDADE_CONFIG = {
    alta: { label: t('priorityHigh'), color: 'text-rose-400', bg: 'bg-rose-500/15', dot: 'bg-rose-500' },
    media: { label: t('priorityMedium'), color: 'text-amber-400', bg: 'bg-amber-500/15', dot: 'bg-amber-500' },
    baixa: { label: t('priorityLow'), color: 'text-white/55', bg: 'bg-white/5', dot: 'bg-white/30' },
  };
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [filtro, setFiltro] = useState<'todas' | 'graduacao' | 'tecnica' | 'comportamento'>('todas');

  useEffect(() => {
    setError(null);
    setLoading(true);
    professorService.getAvaliacoes()
      .then((a) => {
        setAvaliacoes(a);
      })
      .catch((err) => {
        setError(handleServiceError(err, 'ProfAvaliacoes'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [retryCount]);

  // ─── Search Registration ──────────────────────────────────
  const searchItems = useMemo<SearchItem[]>(() =>
    avaliacoes.map(a => ({
      id: `aval-${a.id}`,
      label: a.aluno,
      sublabel: `${a.turma} · ${TIPO_CONFIG[a.tipo].label} · ${t('deadline')}: ${a.prazo}`,
      categoria: t('evaluationsTitle'),
      icon: a.avatar,
      href: '/professor-avaliacoes',
      keywords: [a.tipo, a.turma, a.prioridade, TIPO_CONFIG[a.tipo].label],
    })),
  [avaliacoes]);

  useSearchRegistration('avaliacoes', searchItems);

  const filtered = filtro === 'todas' ? avaliacoes : avaliacoes.filter(a => a.tipo === filtro);

  if (loading) {
    return <PageSkeleton variant="list" />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  return (
    <div className="space-y-8 pt-6 pb-8">
      {/* Header */}
      <section className="prof-enter-1">
        <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">{t('pendingTitle')}</p>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('evaluationsTitle')}</h1>
        <p className="text-white/55 text-sm mt-2">{avaliacoes.length} {t('pendingCount')} · {avaliacoes.filter(a => a.prioridade === 'alta').length} {t('urgentCount')}</p>
        <div className="prof-gold-line mt-6" />
      </section>

      {/* Filters */}
      <section className="prof-enter-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: 'todas' as const, label: t('filterAll') },
            { key: 'graduacao' as const, label: t('types.graduation') },
            { key: 'tecnica' as const, label: t('types.technique') },
            { key: 'comportamento' as const, label: t('types.behavior') },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 flex-shrink-0 ${
                filtro === f.key
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                  : 'bg-white/5 text-white/65 border border-white/5 hover:bg-white/10'
              }`}
            >
              {f.label}
              {f.key !== 'todas' && (
                <span className="ml-1.5 opacity-50">
                  {avaliacoes.filter(a => a.tipo === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Avaliações List */}
      <section className="space-y-3 prof-enter-3">
        {filtered.map((aval) => {
          const tipoConf = TIPO_CONFIG[aval.tipo];
          const prioConf = PRIORIDADE_CONFIG[aval.prioridade];
          const TipoIcon = tipoConf.icon;

          return (
            <div key={aval.id} className="prof-glass-card hover-card p-5 group">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {aval.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white/90">{aval.aluno}</h3>
                      <p className="text-xs text-white/55 mt-0.5">{aval.turma}</p>
                    </div>

                    {/* Priority */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${prioConf.dot}`} />
                      <span className={`text-[10px] font-medium ${prioConf.color}`}>{prioConf.label}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${tipoConf.bg} ${tipoConf.text}`}>
                      <TipoIcon size={10} />
                      {tipoConf.label}
                    </span>
                    <span className="text-[10px] text-white/45 flex items-center gap-1">
                      <Timer size={10} />
                      {aval.prazo}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold rounded-xl transition-all duration-300">
                      {t('evaluateNow')}
                    </button>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 text-xs font-medium rounded-xl transition-all duration-300">
                      {t('postpone')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="prof-glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/[0.12] flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-emerald-500/40" />
            </div>
            <p className="text-white/55 text-sm font-medium">{t('noPending')}</p>
            <p className="text-white/25 text-xs mt-1.5">{t('filterAll')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
