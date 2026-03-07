'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Clock, UserCheck, UserX, Calendar, GraduationCap } from 'lucide-react';
import * as professorService from '@/lib/api/instrutor.service';
import type { TurmaResumo } from '@/lib/api/instrutor.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function ProfessorTurmasPage() {
  const t = useTranslations('professor.classes');
  const tCommon = useTranslations('common');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    professorService.getTurmas()
      .then((data) => {
        setTurmas(data);
      })
      .catch((err) => {
        setError(handleServiceError(err, 'ProfTurmas'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [retryCount]);

  // ─── Search Registration ──────────────────────────────────
  const searchItems = useMemo<SearchItem[]>(() =>
    turmas.map(tr => ({
      id: `turma-${tr.id}`,
      label: tr.nome,
      sublabel: `${tr.dias} · ${tr.horario} · ${tr.totalAlunos} ${t('studentsLabel')}`,
      categoria: t('categoryClass'),
      icon: '🥋',
      href: '/professor-turmas',
      keywords: [tr.categoria, tr.horario, `${tr.totalAlunos} ${t('studentsLabel')}`],
    })),
  [turmas]);

  useSearchRegistration('turmas', searchItems);

  if (loading) {
    return <PageSkeleton variant="grid" />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (turmas.length === 0) {
    return <PageEmpty icon={GraduationCap} title={t('noClasses')} message={t('noClassesDesc')} />;
  }


  return (
    <div className="space-y-8 pt-6 pb-8">
      {/* Header */}
      <section className="prof-enter-1">
        <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">{t('management')}</p>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('yourClasses')}</h1>
        <p className="text-white/55 text-sm mt-2">{turmas.length} {t('activeClasses')} · {turmas.reduce((a, tr) => a + tr.totalAlunos, 0)} {t('enrolledStudents')}</p>
        <div className="prof-gold-line mt-6" />
      </section>

      {/* Turmas Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 prof-enter-2">
        {turmas.map((turma) => {
          const isSelected = selectedTurma === turma.id;
          return (
            <div
              key={turma.id}
              onClick={() => setSelectedTurma(isSelected ? null : turma.id)}
              className={`prof-glass-card hover-card p-6 cursor-pointer transition-all duration-500 ${
                isSelected ? 'ring-1 ring-amber-500/30' : ''
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${turma.cor} flex items-center justify-center shadow-lg`}>
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white/90">{turma.nome}</h3>
                    <p className="text-xs text-white/55 mt-0.5">{turma.categoria}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded-full font-semibold ${
                  turma.proximaSessao.includes('Hoje')
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-white/5 text-white/65'
                }`}>
                  {turma.proximaSessao.includes('Hoje') ? `● ${t('today')}` : turma.proximaSessao}
                </span>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-4 mb-5 text-sm">
                <div className="flex items-center gap-2 text-white/40">
                  <Calendar size={14} />
                  <span>{turma.dias}</span>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  <Clock size={14} />
                  <span>{turma.horario}</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="prof-stat-value text-xl font-bold">{turma.totalAlunos}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{t('enrolled')}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{turma.presentes}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{t('presentToday')}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-400">{turma.presencaMedia}%</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{t('average')}</p>
                </div>
              </div>

              {/* Expanded Detail */}
              {isSelected && (
                <div className="mt-5 pt-5 border-t border-white/5 space-y-3 animate-[prof-fade-up_0.3s_ease]">
                  <p className="text-xs text-amber-400/50 tracking-wider uppercase mb-3">{t('classDetails')}</p>

                  {/* Presence bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/40">{t('attendanceRate')}</span>
                      <span className="text-amber-400/70 font-semibold">{turma.presencaMedia}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${turma.cor} rounded-full transition-all duration-700`}
                        style={{ width: `${turma.presencaMedia}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-400/60">
                      <UserCheck size={12} />
                      <span>{turma.presentes} {t('presentTodayLabel')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-rose-400/60">
                      <UserX size={12} />
                      <span>{turma.totalAlunos - turma.presentes} {t('absentLabel')}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3">
                    <button className="flex-1 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold rounded-xl transition-all duration-300">
                      {t('takeAttendance')}
                    </button>
                    <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 text-xs font-semibold rounded-xl transition-all duration-300">
                      {t('viewStudents')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
