// ============================================================
// MINHAS TURMAS — Student's Enrolled Classes
// ============================================================
'use client';

import { GraduationCap, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as turmasService from '@/lib/api/minhas-turmas.service';
import type { TurmaAluno } from '@/lib/api/minhas-turmas.service';
import { useServiceCall, RetryToast } from '@/hooks/useServiceCall';
import { PageError, PageEmpty } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { TurmaCard } from '@/components/aluno/TurmaCard';
import { AnimatedPage } from '@/components/shared/AnimatedPage';
import { AnimatedList } from '@/components/shared/AnimatedList';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

// ── Quick stat pill ──
function StatPill({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Calendar }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon size={14} className="text-white/30" />
      <span className="text-white font-medium text-sm">{value}</span>
      <span className="text-white/30 text-xs">{label}</span>
    </div>
  );
}

export default function MinhasTurmasPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { data: turmas, loading, error, retry, retryInfo } = useServiceCall<TurmaAluno[]>(
    () => turmasService.getMinhasTurmas(),
    { label: 'MinhasTurmas', maxRetries: 3 }
  );

  if (loading) return <PageSkeleton variant="grid" />;
  if (error) return <PageError error={error} onRetry={retry} />;
  if (!turmas || turmas.length === 0) {
    return <PageEmpty icon={GraduationCap} title={t('myClasses.noClasses')} message={t('myClasses.noClassesDesc')} />;
  }

  // Summary stats
  const totalSessões = turmas.reduce((acc, t) => acc + t.diasSemana.length, 0);
  const mediaPresenca = Math.round(turmas.reduce((acc, t) => acc + t.minhaPresenca, 0) / turmas.length);
  const sessõesHoje = turmas.filter(t => t.proximaSessao.dia === 'Hoje').length;

  return (
    <AnimatedPage className="space-y-6 max-w-4xl mx-auto pb-8">
      <RetryToast info={retryInfo} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('myClasses.title')}</h1>
        <p className="text-white/40 text-sm mt-1">{t('myClasses.enrolledCount', { count: turmas.length })}</p>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        <StatPill icon={GraduationCap} value={turmas.length} label="turmas" />
        <StatPill icon={Calendar} value={`${totalSessões}x`} label="por semana" />
        <StatPill icon={TrendingUp} value={`${mediaPresenca}%`} label="presença média" />
        {sessõesHoje > 0 && (
          <StatPill icon={Clock} value={sessõesHoje} label={sessõesHoje === 1 ? 'sessão hoje' : 'sessões hoje'} />
        )}
      </div>

      {/* Cards Grid */}
      <AnimatedList className="grid grid-cols-1 lg:grid-cols-2 gap-4" stagger={80} baseDelay={200}>
        {turmas.map((turma, i) => (
          <TurmaCard key={turma.id} turma={turma} index={i} />
        ))}
      </AnimatedList>
    </AnimatedPage>
  );
}
