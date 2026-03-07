'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User, TrendingUp, Award, Target, MessageSquare,
  ClipboardCheck, Calendar, Clock, AlertTriangle,
  CheckCircle, XCircle, MessageCircle,
} from 'lucide-react';
import * as pedagogicoService from '@/lib/api/professor-pedagogico.service';
import type { AlunoPedagogico } from '@/lib/api/professor-pedagogico.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { QuickMessage } from '@/components/shared/QuickMessage';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ConcederConquistaModal } from '@/components/professor/ConcederConquistaModal';
import { QuickProgressUpdate } from '@/components/professor/QuickProgressUpdate';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

type Tab = 'visao' | 'progresso' | 'conquistas' | 'desafios' | 'observacoes' | 'historico';

const NIVEL_COLORS: Record<string, string> = {
  'Branca': '#FFFFFF', 'Cinza': '#9CA3AF', 'Amarela': '#FBBF24',
  'Laranja': '#FB923C', 'Verde': '#4ADE80', 'Azul': '#60A5FA',
  'Roxa': '#A78BFA', 'Marrom': '#A0845C', 'Preta': '#FFFFFF',
};

function AlunoDetalheContent() {
  const t = useTranslations('professor.studentDetail');
  const { formatDate } = useFormatting();

  const STATUS_CONFIG = {
    ativo: { label: t('statusActive'), color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
    alerta: { label: t('statusAlert'), color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    ausente: { label: t('statusAbsent'), color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  };
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const searchParams = useSearchParams();

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'visao', label: t('tabs.overview'), icon: User },
    { id: 'progresso', label: t('tabs.progress'), icon: TrendingUp },
    { id: 'conquistas', label: t('tabs.achievements'), icon: Award },
    { id: 'desafios', label: t('tabs.challenges'), icon: Target },
    { id: 'observacoes', label: t('tabs.notes'), icon: MessageSquare },
    { id: 'historico', label: t('tabs.history'), icon: Calendar },
  ];
  const router = useRouter();
  const alunoId = searchParams.get('id');

  const [aluno, setAluno] = useState<AlunoPedagogico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('visao');
  const [showMessage, setShowMessage] = useState(false);
  const [showMedalModal, setShowMedalModal] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(false);

  useEffect(() => {
    if (!alunoId) { setError(t('studentNotFound')); setLoading(false); return; }
    setLoading(true);
    setError(null);
    pedagogicoService.getAlunoById(alunoId)
      .then(data => {
        if (!data) { setError(t('studentNotFound')); return; }
        setAluno(data);
      })
      .catch(err => setError(handleServiceError(err, 'AlunoDetalhe')))
      .finally(() => setLoading(false));
  }, [alunoId]);

  if (loading) {
    return <PremiumLoader />;
  }

  if (error || !aluno) {
    return <PageError error={error || t('studentNotFound')} onRetry={() => router.back()} />;
  }

  const nivelColor = NIVEL_COLORS[aluno.nivel] || '#FFF';
  const freqColor = aluno.frequencia.presenca30d >= 80 ? '#4ADE80' : aluno.frequencia.presenca30d >= 60 ? '#FBBF24' : '#F87171';

  return (
    <div className="space-y-5 pb-32">
      {/* ─── Back + Header ─── */}
      <div className="prof-enter-1">
        <Breadcrumb dynamicLabel={aluno.nome} />

        <div className="prof-glass-card p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              {aluno.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{aluno.nome}</h1>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium"
                  style={{ background: STATUS_CONFIG[aluno.status].bg, color: STATUS_CONFIG[aluno.status].color }}>
                  {STATUS_CONFIG[aluno.status].label}
                </span>
                {aluno.statusGraduacao === 'APTO' && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>
                    {t('readyForGrad')}
                  </span>
                )}
                {aluno.statusGraduacao === 'EM_AVALIACAO' && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
                    {t('inEvaluation')}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: nivelColor, border: aluno.nivel === 'Branca' ? '1px solid rgba(255,255,255,0.3)' : 'none' }} />
                  {t('level')} {aluno.nivel}
                  {aluno.subniveis > 0 && <span className="text-white/20">· {aluno.subniveis}° {t('sublevel')}</span>}
                </span>
                <span>{aluno.categoria}</span>
                <span>{t('yearsOld', { age: aluno.idade })}</span>
                <span>{aluno.turma}</span>
              </div>
              <p className="text-white/25 text-xs mt-1.5">{t('trainingSince')} {aluno.tempoTreino} · {t('since')} {formatDate(aluno.dataInicio, 'short')}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: t('frequency'), value: `${aluno.frequencia.presenca30d}%`, color: freqColor },
              { label: t('progress'), value: `${aluno.progresso.geral}%`, color: '#D9AF69' },
              { label: t('achievements'), value: aluno.conquistas.length, color: '#FBBF24' },
              { label: t('challenges'), value: aluno.desafios.filter(d => d.status === 'concluido').length, color: '#A78BFA' },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
                <p className="text-white/25 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick message button */}
          <button
            onClick={() => setShowMessage(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', color: '#60A5FA' }}
          >
            <MessageCircle size={14} />
            {t('sendMessage')}
          </button>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide prof-enter-2 -mx-1 px-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(217,175,105,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === tab.id ? 'rgba(217,175,105,0.35)' : 'rgba(255,255,255,0.05)'}`,
              color: activeTab === tab.id ? '#D9AF69' : 'rgba(255,255,255,0.4)',
            }}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <div className="prof-enter-3">
        {/* ═══ Visão Geral ═══ */}
        {activeTab === 'visao' && (
          <div className="space-y-4">
            {/* Frequência detalhada */}
            <div className="prof-glass-card p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Clock size={14} className="text-amber-400" /> {t('frequency')}
                <TrendIndicator current={aluno.frequencia.presenca30d} previous={aluno.frequencia.presenca90d} format="percent" />
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t('freq30d'), value: `${aluno.frequencia.presenca30d}%` },
                  { label: '90d', value: `${aluno.frequencia.presenca90d}%` },
                  { label: t('totalSessions'), value: aluno.frequencia.totalSessões },
                  { label: t('nextSession'), value: aluno.frequencia.ultimaSessao },
                ].map((f, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-base font-bold text-white/80">{f.value}</span>
                    <p className="text-white/25 text-[10px]">{f.label}</p>
                  </div>
                ))}
              </div>
              {aluno.frequencia.diasAusente > 0 && (
                <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
                  <AlertTriangle size={14} className="text-red-400" />
                  <span className="text-red-300 text-xs">{aluno.frequencia.diasAusente}d</span>
                </div>
              )}
            </div>

            {/* Progresso resumido */}
            <div className="prof-glass-card p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-amber-400" /> {t('progress')}
              </h3>
              <div className="space-y-3">
                {aluno.progresso.modulos.map(m => (
                  <div key={m.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/50 text-xs">{m.nome}</span>
                      <span className="text-white/30 text-xs">{m.progresso}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${m.progresso}%`,
                        background: `linear-gradient(90deg, #D9AF69, #F5D89A)`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Últimas observações */}
            {aluno.observacoes.length > 0 && (
              <div className="prof-glass-card p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                  <MessageSquare size={14} className="text-amber-400" /> {t('lastNotes')}
                </h3>
                {aluno.observacoes.slice(0, 2).map(obs => (
                  <div key={obs.id} className="p-3 rounded-xl mb-2" style={{
                    background: obs.tipo === 'positiva' ? 'rgba(74,222,128,0.05)' : obs.tipo === 'atencao' ? 'rgba(248,113,113,0.05)' : 'rgba(255,255,255,0.03)',
                    borderLeft: `3px solid ${obs.tipo === 'positiva' ? '#4ADE80' : obs.tipo === 'atencao' ? '#F87171' : 'rgba(255,255,255,0.15)'}`,
                  }}>
                    <p className="text-white/60 text-xs">{obs.texto}</p>
                    <p className="text-white/20 text-[10px] mt-1">{obs.instrutor} · {obs.data}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ Progresso ═══ */}
        {activeTab === 'progresso' && (
          <div className="space-y-4">
            {/* Quick Update Button */}
            <button
              onClick={() => setShowProgressPanel(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                         bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white hover:from-blue-500 hover:to-blue-400
                         transition-all shadow-lg"
              aria-label={t('updateProgress')}
            >
              <TrendingUp size={16} /> {t('updateProgress')}
            </button>

            <QuickProgressUpdate
              isOpen={showProgressPanel}
              onClose={() => setShowProgressPanel(false)}
              onSaved={() => {}}
              alunoId={aluno.id}
              alunoNome={aluno.nome}
            />

            <div className="prof-glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/70">{t('overallProgress')}</h3>
                <span className="text-xl sm:text-2xl font-bold prof-stat-value">{aluno.progresso.geral}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${aluno.progresso.geral}%`,
                  background: 'linear-gradient(90deg, #D9AF69, #F5D89A)',
                }} />
              </div>

              <h4 className="text-xs text-white/30 uppercase tracking-wider mb-3">{t('modules')} ({aluno.categoria})</h4>
              <div className="space-y-4">
                {aluno.progresso.modulos.map(m => (
                  <div key={m.id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm font-medium">{m.nome}</span>
                      <span className="text-sm font-bold" style={{
                        color: m.progresso >= 70 ? '#4ADE80' : m.progresso >= 40 ? '#FBBF24' : '#F87171'
                      }}>{m.progresso}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${m.progresso}%`,
                        background: m.progresso >= 70 ? 'linear-gradient(90deg, #4ADE80, #22D3EE)' : m.progresso >= 40 ? 'linear-gradient(90deg, #FBBF24, #FB923C)' : 'linear-gradient(90deg, #F87171, #EF4444)',
                      }} />
                    </div>
                    <p className="text-white/15 text-[10px] mt-1">{t('updated')}: {m.ultimaAtualizacao}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Avaliações */}
            {aluno.avaliacoes.length > 0 && (
              <div className="prof-glass-card p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                  <ClipboardCheck size={14} className="text-amber-400" /> {t('evaluations')}
                </h3>
                {aluno.avaliacoes.map(av => (
                  <div key={av.id} className="p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/50 text-xs capitalize">{av.tipo}</span>
                      <div className="flex items-center gap-2">
                        {av.nota && <span className="text-amber-400 text-sm font-bold">{av.nota}</span>}
                        {av.resultado === 'aprovado' ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle size={12} /> {t('challengeStatus.completed')}</span>
                        ) : av.resultado === 'reprovado' ? (
                          <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle size={12} /> {t('challengeStatus.failed')}</span>
                        ) : (
                          <span className="text-amber-400 text-xs">{t('challengeStatus.pending')}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-white/40 text-xs">{av.observacao}</p>
                    <p className="text-white/15 text-[10px] mt-1">{av.instrutor} · {av.data}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ Conquistas ═══ */}
        {activeTab === 'conquistas' && (
          <div className="space-y-4">
            {/* Botão Conceder */}
            <button
              onClick={() => setShowMedalModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                         bg-gradient-to-r from-amber-600/80 to-amber-500/80 text-white hover:from-amber-500 hover:to-amber-400
                         transition-all shadow-lg"
              aria-label={t('grantAchievement')}
            >
              <Award size={16} /> {t('grantAchievement')}
            </button>

            {aluno.conquistas.length === 0 ? (
              <div className="prof-glass-card p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/[0.04] border border-amber-500/[0.1] flex items-center justify-center mb-4">
                  <Award size={28} className="text-white/15" />
                </div>
                <p className="text-white/30 text-sm font-medium">{t('noAchievements')}</p>
              </div>
            ) : (
              <div className="prof-glass-card p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3">{aluno.conquistas.length} {t('achievementCount')}</h3>
                <div className="space-y-3">
                  {aluno.conquistas.map(med => (
                    <div key={med.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)' }}>
                      <span className="text-2xl">{med.emoji}</span>
                      <div>
                        <p className="text-white/80 text-sm font-semibold">{med.nome}</p>
                        <p className="text-white/35 text-xs">{med.descricao}</p>
                        <p className="text-white/15 text-[10px] mt-1">{med.concedidaPor} · {med.dataConquista}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal de Concessão */}
            <ConcederConquistaModal
              isOpen={showMedalModal}
              onClose={() => setShowMedalModal(false)}
              onConcedida={(conquista, obs) => {
                setAluno(prev => prev ? {
                  ...prev,
                  conquistas: [...prev.conquistas, {
                    id: `med-${Date.now()}`,
                    emoji: conquista.emoji,
                    nome: conquista.nome,
                    descricao: conquista.descricao,
                    concedidaPor: t('instructor'),
                    dataConquista: formatDate(new Date(), 'short'),
                  }],
                } : prev);
              }}
              alunoNome={aluno.nome}
              alunoId={aluno.id}
            />
          </div>
        )}

        {/* ═══ Desafios ═══ */}
        {activeTab === 'desafios' && (
          <div className="space-y-4">
            {aluno.desafios.length === 0 ? (
              <div className="prof-glass-card p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Target size={28} className="text-white/15" />
                </div>
                <p className="text-white/30 text-sm font-medium">{t('noChallenges')}</p>
              </div>
            ) : (
              <div className="prof-glass-card p-4">
                {aluno.desafios.map(des => {
                  const statusColors = {
                    pendente: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', label: t('challengeStatus.pending') },
                    em_andamento: { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', label: t('challengeStatus.inProgress') },
                    concluido: { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', label: t('challengeStatus.completed') },
                    reprovado: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', label: t('challengeStatus.failed') },
                  };
                  const sc = statusColors[des.status];
                  return (
                    <div key={des.id} className="p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/70 text-sm font-medium">{des.titulo}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                      <p className="text-white/25 text-xs">{t('deadline')}: {des.prazo}</p>
                      {des.feedback && <p className="text-green-300/60 text-xs mt-1 italic">{des.feedback}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ Observações ═══ */}
        {activeTab === 'observacoes' && (
          <div className="space-y-4">
            {aluno.observacoes.length === 0 ? (
              <div className="prof-glass-card p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <MessageSquare size={28} className="text-white/15" />
                </div>
                <p className="text-white/30 text-sm font-medium">{t('noNotes')}</p>
              </div>
            ) : (
              <div className="prof-glass-card p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3">{aluno.observacoes.length} {t('noteCount')}</h3>
                <div className="space-y-3">
                  {aluno.observacoes.map(obs => (
                    <div key={obs.id} className="p-3 rounded-xl" style={{
                      background: obs.tipo === 'positiva' ? 'rgba(74,222,128,0.05)' : obs.tipo === 'atencao' ? 'rgba(248,113,113,0.05)' : 'rgba(255,255,255,0.03)',
                      borderLeft: `3px solid ${obs.tipo === 'positiva' ? '#4ADE80' : obs.tipo === 'atencao' ? '#F87171' : 'rgba(255,255,255,0.15)'}`,
                    }}>
                      <p className="text-white/60 text-sm">{obs.texto}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-white/20 text-[10px]">{obs.instrutor}</span>
                        <span className="text-white/10 text-[10px]">·</span>
                        <span className="text-white/20 text-[10px]">{obs.data}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] capitalize" style={{
                          background: obs.tipo === 'positiva' ? 'rgba(74,222,128,0.1)' : obs.tipo === 'atencao' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.05)',
                          color: obs.tipo === 'positiva' ? '#4ADE80' : obs.tipo === 'atencao' ? '#F87171' : 'rgba(255,255,255,0.3)',
                        }}>
                          {obs.tipo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Histórico ═══ */}
        {activeTab === 'historico' && (
          <div className="space-y-4">
            {aluno.historicoSessões.length === 0 ? (
              <div className="prof-glass-card p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Calendar size={28} className="text-white/15" />
                </div>
                <p className="text-white/30 text-sm font-medium">{t('noSessions')}</p>
              </div>
            ) : (
              <div className="prof-glass-card p-4">
                <h3 className="text-sm font-semibold text-white/70 mb-3">{t('sessionHistory')}</h3>
                <div className="space-y-2">
                  {aluno.historicoSessões.map(aula => (
                    <div key={aula.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                          background: aula.presente ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        }}>
                          {aula.presente ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">{aula.titulo}</p>
                          <p className="text-white/20 text-[10px]">{aula.turma}</p>
                        </div>
                      </div>
                      <span className="text-white/25 text-xs">{aula.data}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Message Modal */}
      {showMessage && aluno && (
        <QuickMessage
          recipientName={aluno.nome}
          recipientId={aluno.id}
          senderName="Prof. Ricardo"
          senderId="prof-1"
          senderTipo="instrutor"
          conversaId="conv-1"
          onClose={() => setShowMessage(false)}
        />
      )}
    </div>
  );
}

export default function ProfessorAlunoDetalhePage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  return (
    <Suspense fallback={<PremiumLoader />}>
      <AlunoDetalheContent />
    </Suspense>
  );
}
