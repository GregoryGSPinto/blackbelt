'use client';

// ============================================================
// CHAMADA RÁPIDA — Diário de classe do instrutor
//
// Fluxo: Selecionar turma → Lista alunos → Toggle presença/falta
//        → Finalizar → Resumo
//
// Tema: amber/gold instrutor. Mobile-first.
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, Users, Search, CheckCheck,
  RotateCcw, ChevronLeft, Send, UserCheck, UserX,
} from 'lucide-react';
import * as professorService from '@/lib/api/instrutor.service';
import type { TurmaResumo, AlunoPresenca, ChamadaResumo } from '@/lib/api/instrutor.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

type PresencaStatus = 'presente' | 'falta' | 'nao_marcado';
type ViewState = 'select_turma' | 'chamada' | 'resumo';
type AlunoComStatus = AlunoPresenca & { status: PresencaStatus };

export default function ProfessorChamadaPage() {
  const t = useTranslations('professor.attendance');
  const { formatDateFull, formatDate } = useFormatting();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  // ── State ──
  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<TurmaResumo | null>(null);
  const [alunos, setAlunos] = useState<AlunoComStatus[]>([]);
  const [busca, setBusca] = useState('');
  const [observacao, setObservacao] = useState('');
  const [viewState, setViewState] = useState<ViewState>('select_turma');
  const [resumo, setResumo] = useState<ChamadaResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ── Load turmas ──
  useEffect(() => {
    setError(null);
    setLoading(true);
    professorService.getTurmas()
      .then(setTurmas)
      .catch((err: unknown) => setError(handleServiceError(err, 'Chamada')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  // ── Search registration ──
  const searchItems = useMemo<SearchItem[]>(() =>
    alunos.map((a: AlunoComStatus) => ({
      id: `chamada-${a.id}`,
      label: a.nome,
      sublabel: `${t('level')} ${a.nivel}`,
      categoria: t('title'),
      icon: a.avatar,
      href: '/professor-chamada',
      keywords: [a.nivel],
    })),
  [alunos]);
  useSearchRegistration('chamada', searchItems);

  // ── Select turma & load alunos ──
  const handleSelectTurma = useCallback(async (turma: TurmaResumo) => {
    setSelectedTurma(turma);
    setLoading(true);
    try {
      const data = await professorService.getChamadaAlunos(turma.id);
      setAlunos(data.map((a: AlunoPresenca) => ({ ...a, status: 'nao_marcado' as PresencaStatus })));
      setViewState('chamada');
      setBusca('');
      setObservacao('');
    } catch (err: unknown) {
      setError(handleServiceError(err, 'Chamada'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Toggle individual presence ──
  const togglePresenca = useCallback((alunoId: string) => {
    setAlunos((prev: AlunoComStatus[]) =>
      prev.map((a: AlunoComStatus) => {
        if (a.id !== alunoId) return a;
        const next: PresencaStatus =
          a.status === 'nao_marcado' ? 'presente' :
          a.status === 'presente' ? 'falta' : 'presente';
        return { ...a, status: next };
      })
    );
  }, []);

  // ── Bulk actions ──
  const marcarTodosPresentes = useCallback(() => {
    setAlunos((prev: AlunoComStatus[]) => prev.map((a: AlunoComStatus) => ({ ...a, status: 'presente' as PresencaStatus })));
  }, []);

  const resetarChamada = useCallback(() => {
    setAlunos((prev: AlunoComStatus[]) => prev.map((a: AlunoComStatus) => ({ ...a, status: 'nao_marcado' as PresencaStatus })));
  }, []);

  // ── Save ──
  const handleFinalizar = useCallback(async () => {
    if (!selectedTurma) return;
    setSaving(true);
    try {
      const presencas = alunos
        .filter((a: AlunoComStatus) => a.status !== 'nao_marcado')
        .map((a: AlunoComStatus) => ({ alunoId: a.id, status: a.status as 'presente' | 'falta' }));

      const result = await professorService.salvarChamada({
        turmaId: selectedTurma.id,
        data: new Date().toISOString().split('T')[0],
        presencas,
        observacao: observacao.trim() || undefined,
      });
      setResumo(result);
      setViewState('resumo');
    } catch (err: unknown) {
      setError(handleServiceError(err, 'Salvar Chamada'));
    } finally {
      setSaving(false);
    }
  }, [selectedTurma, alunos, observacao]);

  // ── Counts ──
  const presentes = alunos.filter((a: AlunoComStatus) => a.status === 'presente').length;
  const faltas = alunos.filter((a: AlunoComStatus) => a.status === 'falta').length;
  const naoMarcados = alunos.filter((a: AlunoComStatus) => a.status === 'nao_marcado').length;

  // ── Filtered list ──
  const filteredAlunos = useMemo(() => {
    if (!busca.trim()) return alunos;
    const q = busca.toLowerCase();
    return alunos.filter((a: AlunoComStatus) => a.nome.toLowerCase().includes(q));
  }, [alunos, busca]);

  // ── Loading ──
  if (loading && viewState === 'select_turma') {
    return <PageSkeleton variant="grid" />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;
  }

  // ============================================================
  // VIEW: RESUMO
  // ============================================================
  if (viewState === 'resumo' && resumo) {
    return (
      <div className="space-y-8 pt-6 pb-8">
        <section className="prof-enter-1">
          <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">{t('attendanceFinished')}</p>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('summary')}</h1>
          <div className="prof-gold-line mt-6" />
        </section>

        {/* Success card */}
        <section className="prof-enter-2 prof-glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{resumo.turmaNome}</h2>
          <p className="text-white/50 text-sm">{formatDateFull(resumo.data)}</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 prof-enter-3">
          <div className="prof-glass-card p-5 text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-medium prof-stat-value">{resumo.presentes}</p>
            <p className="text-white/40 text-xs mt-1">{t('presentCount')}</p>
          </div>
          <div className="prof-glass-card p-5 text-center">
            <p className="text-red-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{resumo.faltas}</p>
            <p className="text-white/40 text-xs mt-1">{t('absentCount')}</p>
          </div>
          <div className="prof-glass-card p-5 text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-white">{resumo.percentual}%</p>
            <p className="text-white/40 text-xs mt-1">{t('frequency')}</p>
          </div>
        </section>

        {resumo.observacao && (
          <section className="prof-enter-4 prof-glass-card p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{t('sessionNote')}</p>
            <p className="text-white/80 text-sm">{resumo.observacao}</p>
          </section>
        )}

        {/* Actions */}
        <section className="flex gap-3 prof-enter-5">
          <button
            onClick={() => { setViewState('select_turma'); setSelectedTurma(null); setResumo(null); }}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {t('quickAttendance')}
          </button>
        </section>
      </div>
    );
  }

  // ============================================================
  // VIEW: CHAMADA (attendance)
  // ============================================================
  if (viewState === 'chamada' && selectedTurma) {
    return (
      <div className="space-y-5 pt-6 pb-32">
        {/* Header */}
        <section className="prof-enter-1">
          <button
            onClick={() => { setViewState('select_turma'); setSelectedTurma(null); }}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-3 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">{t('quickAttendance')}</p>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedTurma.nome}</h1>
          <p className="text-white/50 text-sm mt-1">
            {selectedTurma.dias} · {selectedTurma.horario} · {formatDate(new Date(), 'short')}
          </p>
          <div className="prof-gold-line mt-5" />
        </section>

        {/* Counters */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 prof-enter-2">
          <div className="prof-glass-card p-3 text-center">
            <p className="text-xl font-medium text-green-400">{presentes}</p>
            <p className="text-white/40 text-[10px]">{t('presentCount')}</p>
          </div>
          <div className="prof-glass-card p-3 text-center">
            <p className="text-xl font-medium text-red-400">{faltas}</p>
            <p className="text-white/40 text-[10px]">{t('absentCount')}</p>
          </div>
          <div className="prof-glass-card p-3 text-center">
            <p className="text-xl font-medium text-white/40">{naoMarcados}</p>
            <p className="text-white/40 text-[10px]">{t('pendingCount')}</p>
          </div>
        </section>

        {/* Bulk + Search */}
        <section className="flex flex-col gap-3 prof-enter-3">
          <div className="flex gap-2">
            <button
              onClick={marcarTodosPresentes}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
            >
              <CheckCheck size={14} /> {t('allPresent')}
            </button>
            <button
              onClick={resetarChamada}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-white/40 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <RotateCcw size={14} /> {t('clearAll')}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={busca}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
              placeholder={t('searchStudent')}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-amber-500/30"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </section>

        {/* Attendance list */}
        <section className="space-y-1.5 prof-enter-4">
          {filteredAlunos.map((aluno: AlunoComStatus) => {
            const isPresente = aluno.status === 'presente';
            const isFalta = aluno.status === 'falta';

            return (
              <div
                key={aluno.id}
                onClick={() => togglePresenca(aluno.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer min-h-[44px] transition-all duration-200 select-none active:scale-[0.98] ${
                  isPresente
                    ? 'bg-green-500/10 border border-green-500/20'
                    : isFalta
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'border border-white/5 hover:border-white/10'
                }`}
                style={!isPresente && !isFalta ? { background: 'rgba(255,255,255,0.02)' } : undefined}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border"
                  style={{ borderColor: aluno.nivelCor, backgroundColor: `${aluno.nivelCor}15` }}
                >
                  {aluno.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${isPresente ? 'text-green-300' : isFalta ? 'text-red-300' : 'text-white/90'}`}>
                    {aluno.nome}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: aluno.nivelCor }}
                    />
                    <span className="text-white/40 text-[11px]">{t('level')} {aluno.nivel}</span>
                  </div>
                </div>

                {/* Toggle indicator */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isPresente
                    ? 'bg-green-500/20'
                    : isFalta
                    ? 'bg-red-500/20'
                    : 'bg-white/5'
                }`}>
                  {isPresente && <UserCheck size={18} className="text-green-400" />}
                  {isFalta && <UserX size={18} className="text-red-400" />}
                  {!isPresente && !isFalta && <div className="w-3 h-3 rounded-full bg-white/10" />}
                </div>
              </div>
            );
          })}
        </section>

        {/* Observation */}
        <section className="prof-enter-5">
          <textarea
            value={observacao}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservacao(e.target.value)}
            placeholder={t('sessionNote')}
            rows={3}
            className="w-full p-4 rounded-xl text-sm text-white placeholder-white/25 resize-none outline-none focus:ring-1 focus:ring-amber-500/30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </section>

        {/* Fixed bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)' }}
        >
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleFinalizar}
              disabled={saving || naoMarcados === alunos.length}
              className="w-full py-4 rounded-2xl font-medium text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: naoMarcados === alunos.length
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #D9AF69, #c9a05c)',
                color: naoMarcados === alunos.length ? 'rgba(255,255,255,0.3)' : '#0d0a06',
              }}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {t('savingAttendance')}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {t('finishAttendance')} ({presentes}/{alunos.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW: SELECT TURMA
  // ============================================================
  return (
    <div className="space-y-8 pt-6 pb-8">
      {/* Header */}
      <section className="prof-enter-1">
        <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">{t('title')}</p>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('quickAttendance')}</h1>
        <p className="text-white/55 text-sm mt-2">{t('selectClass')}</p>
        <div className="prof-gold-line mt-6" />
      </section>

      {/* Turma cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 prof-enter-2">
        {turmas.map((turma: TurmaResumo) => (
          <button
            key={turma.id}
            onClick={() => handleSelectTurma(turma)}
            className="prof-glass-card hover-card p-5 text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${turma.cor} flex items-center justify-center shadow-lg`}>
                <Users size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-base">{turma.nome}</h3>
                <p className="text-white/40 text-xs mt-0.5">{turma.dias} · {turma.horario}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-medium prof-stat-value">{turma.totalAlunos}</p>
                <p className="text-white/30 text-[10px]">{t('studentsCount')}</p>
              </div>
            </div>

            {/* Presence bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-white/30">{t('avgAttendance')}</span>
                <span className="text-amber-400/60">{turma.presencaMedia}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${turma.cor} rounded-full transition-all duration-700`}
                  style={{ width: `${turma.presencaMedia}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Today's date */}
      <section className="prof-enter-3 text-center">
        <p className="text-white/25 text-xs">
          {formatDateFull(new Date())}
        </p>
      </section>
    </div>
  );
}
