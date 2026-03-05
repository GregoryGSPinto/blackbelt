'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, AlertCircle, Award, BarChart3, Plus, Minus,
} from 'lucide-react';
import * as gradService from '@/lib/api/graduacao.service';
import type { ExameGraduacao, RequisitoGraduacao, SubnivelAluno } from '@/lib/api/graduacao.service';
import { BeltStripes } from '@/components/shared/BeltStripes';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

type TabView = 'exames' | 'subniveis' | 'requisitos';

const NIVEL_COLORS: Record<string, string> = {
  'Nível Iniciante': '#E5E7EB', 'Nível Cinza': '#9CA3AF', 'Nível Amarelo': '#EAB308',
  'Nível Laranja': '#F97316', 'Nível Verde': '#22C55E',
  'Nível Básico': '#3B82F6', 'Nível Intermediário': '#8B5CF6', 'Nível Avançado': '#92400E',
  'Nível Máximo': '#374151',
};

const STATUS_CFG: Record<string, { Icon: typeof Clock; color: string; bg: string; labelKey: string }> = {
  AGENDADO: { Icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', labelKey: 'graduations.scheduled' },
  APROVADO: { Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', labelKey: 'graduations.approved' },
  REPROVADO: { Icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', labelKey: 'graduations.rejected' },
  CANCELADO: { Icon: AlertCircle, color: 'text-white/30', bg: 'bg-white/5', labelKey: 'graduations.cancelled' },
};

export default function GraduacoesAdminPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();

  const [exames, setExames] = useState<ExameGraduacao[]>([]);
  const [requisitos, setRequisitos] = useState<RequisitoGraduacao[]>([]);
  const [subniveis, setSubniveis] = useState<SubnivelAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabView>('exames');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([gradService.getExames(), gradService.getRequisitos(), gradService.getSubniveisAlunos()])
      .then(([e, r, g]) => { setExames(e); setRequisitos(r); setSubniveis(g); })
      .catch((err: unknown) => setError(handleServiceError(err, 'Graduações')))
      .finally(() => setLoading(false));
  }, []);

  const handleAvaliar = useCallback(async (id: string, status: 'APROVADO' | 'REPROVADO') => {
    try {
      const updated = await gradService.avaliarExame(id, status);
      setExames(prev => prev.map(e => e.id === id ? updated : e));
    } catch { /* noop */ }
  }, []);

  const handleAddSubnivel = useCallback(async (alunoId: string) => {
    try {
      const updated = await gradService.adicionarSubnivel(alunoId, 'Prof. Ricardo');
      setSubniveis(prev => prev.map(g => g.alunoId === alunoId ? updated : g));
    } catch { /* noop */ }
  }, []);

  const handleRemoveSubnivel = useCallback(async (alunoId: string) => {
    try {
      const updated = await gradService.removerSubnivel(alunoId, 'Correção');
      setSubniveis(prev => prev.map(g => g.alunoId === alunoId ? updated : g));
    } catch { /* noop */ }
  }, []);

  const agendados = exames.filter(e => e.status === 'AGENDADO');
  const historico = exames.filter(e => e.status !== 'AGENDADO');

  if (error) return <PageError error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
          <GraduationCap size={24} className="text-purple-400" />
          {t('graduations.title')}
        </h1>
        <p className="text-sm text-white/40 mt-1">{t('graduations.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Agendados" value={String(agendados.length)} icon={Clock} color="text-amber-400" />
        <StatCard label="Aprovados" value={String(exames.filter(e => e.status === 'APROVADO').length)} icon={CheckCircle} color="text-emerald-400" />
        <StatCard label="Reprovados" value={String(exames.filter(e => e.status === 'REPROVADO').length)} icon={XCircle} color="text-red-400" />
        <StatCard label="Total exames" value={String(exames.length)} icon={Award} color="text-purple-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/30 backdrop-blur-xl rounded-xl p-1 w-fit">
        <button onClick={() => setTab('exames')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === 'exames' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
          <Award size={13} /> {t('graduations.tabs.exams')}
        </button>
        <button onClick={() => setTab('subniveis')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === 'subniveis' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
          <GraduationCap size={13} /> {t('graduations.tabs.sublevels')}
        </button>
        <button onClick={() => setTab('requisitos')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${tab === 'requisitos' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
          <BarChart3 size={13} /> {t('graduations.tabs.requirements')}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-black/30 animate-pulse" />)}</div>
      ) : tab === 'exames' ? (
        <div className="space-y-4">
          {agendados.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.75rem', fontWeight: 400 }}>{t('graduations.upcomingExams')}</h2>
              <div className="space-y-2">
                {agendados.map(exam => (
                  <ExamCard key={exam.id} exam={exam} expanded={expandedId === exam.id}
                    onToggle={() => setExpandedId(expandedId === exam.id ? null : exam.id)}
                    onAvaliar={handleAvaliar} />
                ))}
              </div>
            </div>
          )}
          {historico.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.75rem', fontWeight: 400 }}>{t('graduations.history')}</h2>
              <div className="space-y-2">
                {historico.map(exam => (
                  <ExamCard key={exam.id} exam={exam} expanded={expandedId === exam.id}
                    onToggle={() => setExpandedId(expandedId === exam.id ? null : exam.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : tab === 'subniveis' ? (
        <div className="space-y-3">
          <p className="text-xs text-white/25">Gerencie os subniveis (stripes) de cada aluno. Máximo 4 subniveis por nível.</p>
          {subniveis.map(g => (
            <div key={g.alunoId} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/70">{g.alunoNome}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <BeltStripes nivel={g.nivelAtual} subniveis={g.subniveisAtuais} size="md" />
                  <span className="text-[10px] text-white/25">{g.nivelAtual} · {g.subniveisAtuais}/4 subniveis</span>
                </div>
                <div className="flex gap-3 text-[9px] text-white/15 mt-1">
                  <span>Presença: {g.presencaPct}%</span>
                  <span>Tempo: {g.tempoNivelMeses}m</span>
                  {g.dataUltimoSubnivel && <span>Último: {formatDate(g.dataUltimoSubnivel, 'short')}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleRemoveSubnivel(g.alunoId)} disabled={g.subniveisAtuais === 0}
                  className="p-2 rounded-lg bg-black/30 border border-white/10 text-white/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-20 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="text-lg font-black text-white w-6 text-center">{g.subniveisAtuais}</span>
                <button onClick={() => handleAddSubnivel(g.alunoId)} disabled={g.subniveisAtuais >= 4}
                  className="p-2 rounded-lg bg-black/30 border border-white/10 text-white/30 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-20 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/25">Requisitos mínimos para promoção de nivel na unidade.</p>
          {requisitos.map((req, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: NIVEL_COLORS[req.nivelDe] }} />
                <span className="text-xs text-white/30">→</span>
                <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: NIVEL_COLORS[req.nivelPara] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/60">{req.nivelDe} → {req.nivelPara}</p>
              </div>
              <div className="flex gap-4 text-[10px] text-white/30 shrink-0">
                <span>{req.tempoMinimoMeses}m mín.</span>
                <span>{req.presencaMinimaPct}% freq.</span>
                <span>{req.sessõesMinimas} sessões</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam, expanded, onToggle, onAvaliar }: {
  exam: ExameGraduacao; expanded: boolean; onToggle: () => void;
  onAvaliar?: (id: string, status: 'APROVADO' | 'REPROVADO') => void;
}) {
  const t = useTranslations('admin');
  const { formatDate } = useFormatting();
  const cfg = STATUS_CFG[exam.status];
  const StatusIcon = cfg.Icon;
  return (
    <div className={`rounded-xl border overflow-hidden bg-black/30 backdrop-blur-xl border-white/10'}`}>
      <button onClick={onToggle} className="flex items-center gap-3 p-4 w-full text-left">
        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: NIVEL_COLORS[exam.nivelAlvo] }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white/70">{exam.alunoNome}</p>
          <p className="text-[10px] text-white/25">{exam.nivelAtual} → {exam.nivelAlvo}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>{t(cfg.labelKey)}</span>
        <span className="text-[10px] text-white/20">{formatDate(exam.dataExame, 'short')}</span>
        {expanded ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
      </button>
      {expanded && (
        <div className="border-t border-white/[0.04] p-4 space-y-3 bg-black/20 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniCell label="Presença" value={`${exam.presencaPct}%`} />
            <MiniCell label="Tempo no nível" value={`${exam.tempoNivelMeses} meses`} />
            <MiniCell label="Avaliador" value={exam.professorAvaliador} />
            <MiniCell label="Data" value={formatDate(exam.dataExame, 'short')} />
          </div>
          {exam.observacao && <p className="text-xs text-white/30 italic">"{exam.observacao}"</p>}
          {exam.status === 'AGENDADO' && onAvaliar && (
            <div className="flex gap-2">
              <button onClick={() => onAvaliar(exam.id, 'APROVADO')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-colors">
                <CheckCircle size={14} /> {t('graduations.approve')}
              </button>
              <button onClick={() => onAvaliar(exam.id, 'REPROVADO')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/20 transition-colors">
                <XCircle size={14} /> {t('graduations.reject')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Clock; color: string }) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <div className="hover-card rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-1"><Icon size={12} className={color} /><span className="text-[9px] text-white/25 uppercase tracking-wider">{label}</span></div>
      <p style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em', color: tokens.text }}>{value}</p>
    </div>
  );
}

function MiniCell({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 px-3 py-2"><p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p><p className="text-xs text-white/50 font-medium mt-0.5">{value}</p></div>;
}
