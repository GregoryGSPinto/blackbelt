'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users, TrendingUp, ClipboardCheck, Play,
  ChevronRight, Eye, Calendar, Timer,
  BarChart3, AlertTriangle, GraduationCap, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import * as professorService from '@/lib/api/instrutor.service';
import * as pedagogicoService from '@/lib/api/professor-pedagogico.service';
import type { ProfessorDashboard } from '@/lib/api/instrutor.service';
import type { EstatisticasPedagogicas, AlunoPedagogico } from '@/lib/api/professor-pedagogico.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, PageEmpty } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { useServiceCall } from '@/hooks/useServiceCall';
import { useCachedServiceCall, TTL } from '@/hooks/useCachedServiceCall';
import { CacheIndicator } from '@/components/shared/CacheIndicator';
import { useContextualMenu, formatMinutosParaInicio } from '@/hooks/useContextualMenu';
import { useActiveClass } from '@/contexts/ActiveClassContext';
import * as alertasService from '@/lib/api/alertas-inteligentes.service';
import type { AlertaInteligente } from '@/lib/api/alertas-inteligentes.service';
import { ProactiveAlertList } from '@/components/shared/ProactiveAlert';
import { TurmaBroadcastPanel } from '@/components/professor/TurmaBroadcastPanel';
import { WelcomeCard } from '@/components/shared/WelcomeCard';
import { ActiveClassMode } from '@/components/professor/ActiveClassMode';
import { StartClassModal } from '@/components/professor/StartClassModal';
import { FeedbackAlerts } from '@/components/professor/FeedbackAlerts';
import { useTranslations } from 'next-intl';

type DashboardData = [ProfessorDashboard, EstatisticasPedagogicas, AlunoPedagogico[]];

export default function ProfessorDashboardPage() {
  const t = useTranslations('professor.dashboard');
  const tCommon = useTranslations('common');
  const tQuick = useTranslations('professor.quickActions');
  const tEval = useTranslations('professor.evaluations');
  const { user } = useAuth();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { isActive: isClassActive } = useActiveClass();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showActiveClass, setShowActiveClass] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const { data: result, loading, error, retry, cacheInfo, refreshing, refresh } = useCachedServiceCall<DashboardData>(
    'prof:dashboard',
    () => Promise.all([
      professorService.getDashboard(),
      pedagogicoService.getEstatisticas(),
      pedagogicoService.getAlunosBaixaFrequencia(60),
    ]),
    { label: 'ProfDashboard', maxRetries: 3, ttl: TTL.MEDIUM }
  );

  const data = result?.[0] ?? null;
  const pedStats = result?.[1] ?? null;
  const alertAlunos = result?.[2] ?? [];

  // Fetch proactive alerts
  const { data: alertasData } = useServiceCall<AlertaInteligente[]>(
    () => alertasService.getAlertas(),
    { label: 'ProfAlertas', maxRetries: 1 }
  );

  // ─── Search Registration ──────────────────────────────────
  const searchItems = useMemo<SearchItem[]>(() => {
    if (!data) return [];
    return [
      // Alunos destaque
      ...data.alunosDestaque.map(a => ({
        id: `aluno-${a.id}`,
        label: a.nome,
        sublabel: `${t('level')} ${a.nivel} · ${a.presenca30d}% ${t('presence')}`,
        categoria: t('categoryStudent'),
        icon: a.avatar,
        href: '/professor-turmas',
        keywords: [a.nivel, a.status],
      })),
      // Turmas
      ...data.turmas.map(t => ({
        id: `turma-${t.id}`,
        label: t.nome,
        sublabel: `${t.dias} · ${t.horario} · ${t.totalAlunos} ${tCommon('menu.students').toLowerCase()}`,
        categoria: tCommon('menu.classes'),
        icon: '🥋',
        href: '/professor-turmas',
        keywords: [t.categoria, t.horario],
      })),
      // Vídeos
      ...data.videosRecentes.map(v => ({
        id: `video-${v.id}`,
        label: v.titulo,
        sublabel: `${v.turma} · ${v.duracao}`,
        categoria: t('categoryVideo'),
        icon: '🎬',
        href: '/professor-videos',
        keywords: [v.tipo, v.turma],
      })),
      // Avaliações
      ...data.avaliacoesPendentes.map(a => ({
        id: `aval-${a.id}`,
        label: `${tEval('evaluationsTitle')}: ${a.aluno}`,
        sublabel: `${a.turma} · ${a.tipo} · ${t('deadline')}: ${a.prazo}`,
        categoria: tEval('evaluationsTitle'),
        icon: '📋',
        href: '/professor-avaliacoes',
        keywords: [a.tipo, a.turma, a.aluno, a.prioridade],
      })),
    ];
  }, [data]);

  useSearchRegistration('dashboard', searchItems);

  const primeiroNome = user?.nome?.split(' ')[0] || t('defaultInstructor');
  const horaAtual = new Date().getHours();
  const saudacao = horaAtual < 12 ? tCommon('greeting.goodMorning') : horaAtual < 18 ? tCommon('greeting.goodAfternoon') : tCommon('greeting.goodEvening');

  // Contextual menu - must be before early returns (Rules of Hooks)
  const { turmaAtual, proximaTurma, turmasContextuais, temAulaHoje } = useContextualMenu(data?.turmas ?? []);

  if (loading) {
    return <PageSkeleton variant="instrutor" />;
  }

  if (error) {
    return <PageError error={error} onRetry={retry} />;
  }
  if (!data) {
    return <PageEmpty icon={BarChart3} title={t('title')} message={tCommon('errors.loadError')} />;
  }


  const { estatisticas, turmas, avaliacoesPendentes, videosRecentes, alunosDestaque, atividadesRecentes } = data;

  return (
    <div className="space-y-8 pb-8">

      {/* Cache status + Active Class overlays */}
      <CacheIndicator cacheInfo={cacheInfo} refreshing={refreshing} onRefresh={refresh} />

      {/* Welcome card — first visit only */}
      <WelcomeCard profileKey="instrutor" userName={user?.nome} />

      {/* Active Class Mode overlay */}
      {(showActiveClass || isClassActive) && (
        <ActiveClassMode onClose={() => setShowActiveClass(false)} />
      )}

      {/* Start Class Modal */}
      {showStartModal && data && (
        <StartClassModal
          turmas={turmas}
          onClose={() => setShowStartModal(false)}
          onStarted={() => { setShowStartModal(false); setShowActiveClass(true); }}
        />
      )}

      {/* Resume active class banner */}
      {isClassActive && !showActiveClass && (
        <button
          onClick={() => setShowActiveClass(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 group hover:bg-emerald-500/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-sm font-semibold">{t('sessionInProgress')}</span>
          </div>
          <span className="text-emerald-400/60 text-xs group-hover:text-emerald-400 transition-colors">
            {t('resume')} →
          </span>
        </button>
      )}
      {/* HERO GREETING — Entrada cinematográfica                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pt-6 md:pt-8 prof-enter-1" data-tour="prof-dashboard">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }} className="mb-3">
              {saudacao}
            </p>
            <h1 style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em', color: tokens.text }} className="md:text-2xl lg:text-4xl tracking-tight leading-tight">
              {primeiroNome}
              <span className="text-amber-400/60 font-extralight ml-0.5">.</span>
            </h1>
            <p style={{ fontWeight: 300, color: tokens.textMuted }} className="text-sm mt-2.5 max-w-md leading-relaxed">
              {user?.graduacao || t('maxLevel')} · {t('activeClassesCount', { count: estatisticas.totalTurmas })} · {t('studentsCount', { count: estatisticas.totalAlunos })}
            </p>
          </div>

          {/* Status pill + Start Class */}
          <div className="flex items-center gap-3 flex-wrap">
            {!isClassActive && (
              <button
                data-tour="prof-chamada"
                onClick={() => setShowStartModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500/90 text-black font-bold text-xs flex items-center gap-2 hover:bg-amber-400 transition-colors active:scale-[0.97]"
              >
                <Play size={14} fill="black" />
                {turmaAtual ? `${t('attendance')} · ${turmaAtual.nome}` : t('startSession')}
              </button>
            )}
            <div className="px-4 py-2.5 prof-glass-card flex items-center gap-2.5">
              {turmaAtual ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-amber-400/80 font-medium tracking-wide">
                    {turmaAtual.nome} — {t('sessionInProgress')}
                  </span>
                </>
              ) : proximaTurma ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs text-blue-400/70 font-medium tracking-wide">
                    {t('nextClass')}: {proximaTurma.nome} {formatMinutosParaInicio(proximaTurma.minutosParaInicio)}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400/70 font-medium tracking-wide">
                    {turmas.filter(tr => tr.proximaSessao.includes('Hoje')).length} {t('classesToday')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="prof-gold-line mt-7" />
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ALERTAS PROATIVOS — Banners inteligentes                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {alertasData && alertasData.length > 0 && (
        <div data-tour="prof-alertas">
          <ProactiveAlertList alertas={alertasData} maxVisible={4} className="prof-enter-2" />

          {/* Feedback Pós-Sessão (dúvidas dos alunos) */}
          <FeedbackAlerts />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* AÇÕES RÁPIDAS — Atalhos de 1 toque                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 prof-enter-2" data-tour="prof-quick-actions">
        {[
          { href: '/professor-alunos', icon: GraduationCap, label: tCommon('menu.students'), color: '#60A5FA' },
          { href: '/professor-chamada', icon: ClipboardCheck, label: t('attendance'), color: '#4ADE80' },
          { href: '/professor-cronometro', icon: Timer, label: tQuick('timer'), color: '#FB923C' },
          { href: '/professor-avaliacoes', icon: ClipboardCheck, label: t('evaluations'), color: '#F87171' },
          { href: '/professor-plano-aula', icon: BookOpen, label: tQuick('lessonPlan'), color: '#A78BFA' },
          { href: '/professor-videos', icon: Play, label: tQuick('video'), color: '#FBBF24' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className="prof-glass-card hover-card flex flex-col items-center gap-1.5 py-3 px-1 hover:bg-white/5 active:scale-[0.96] transition-all"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${color}12`, border: `1px solid ${color}20` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: tokens.textMuted }} className="font-medium truncate w-full text-center">{label}</span>
          </Link>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* STATS GRID — Cards com profundidade premium            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 prof-enter-2">
        {[
          { label: t('activeStudents'), value: estatisticas.totalAlunos, icon: Users, accent: 'text-sky-400', bg: 'bg-sky-500/10', ring: 'ring-sky-500/20' },
          { label: t('avgAttendance'), value: `${estatisticas.presencaMedia}%`, icon: TrendingUp, accent: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
          { label: t('monthSessions'), value: estatisticas.sessõesEsteMes, icon: Calendar, accent: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
          {
            label: t('evaluations'),
            value: estatisticas.avaliacoesPendentes,
            icon: ClipboardCheck,
            accent: estatisticas.avaliacoesPendentes > 0 ? 'text-rose-400' : 'text-emerald-400',
            bg: estatisticas.avaliacoesPendentes > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
            ring: estatisticas.avaliacoesPendentes > 0 ? 'ring-rose-500/20' : 'ring-emerald-500/20',
          },
        ].map((stat) => (
          <div key={stat.label} className="p-4 md:p-5 group cursor-default" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 ${stat.bg} ring-1 ${stat.ring} transition-all duration-500 group-hover:scale-110 group-hover:ring-2`} style={{ borderRadius: '12px' }}>
                <stat.icon size={18} className={stat.accent} />
              </div>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 200, color: tokens.text }} className="leading-none">{stat.value}</p>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }} className="mt-2">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ANÁLISE PEDAGÓGICA — Gráficos + Alertas               */}
      {/* ═══════════════════════════════════════════════════════ */}
      {pedStats && (
        <section className="space-y-4 prof-enter-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 style={{ fontWeight: 300, color: tokens.text }} className="text-lg tracking-tight">{t('pedagogicalAnalysis')}</h2>
              <span className="text-[10px] text-amber-400/60 tracking-[0.2em] uppercase font-medium">{t('studentsCount', { count: pedStats.totalAlunos })}</span>
            </div>
            <Link href="/professor-alunos" className="text-xs text-amber-400/40 hover:text-amber-400/80 transition-colors duration-300 flex items-center gap-1 group">
              {tCommon('actions.seeAll')} <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Pedagógico stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { label: t('highlight'), value: pedStats.alunosDestaque, color: '#4ADE80' },
              { label: t('lowFreq'), value: pedStats.alunosBaixaFrequencia, color: '#F87171' },
              { label: t('readyForGrad'), value: pedStats.alunosAptoGraduacao, color: '#A78BFA' },
              { label: t('achievementsMonth'), value: pedStats.conquistasConcedidasMes, color: '#FBBF24' },
              { label: t('challengesPending'), value: pedStats.desafiosPendentes, color: '#60A5FA' },
              { label: t('avgFreq'), value: `${pedStats.frequenciaMedia}%`, color: '#22D3EE' },
            ].map((s, i) => (
              <div key={i} className="p-3 text-center" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 200 }} className="leading-none" >{s.value}</span>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }} className="mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Evolução Mensal */}
            <div className="p-4" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>{t('monthlyEvolution')}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pedStats.evolucaoMensal} barCategoryGap="20%">
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} width={30} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(20,15,8,0.95)', border: '1px solid rgba(217,175,105,0.2)', borderRadius: 12, fontSize: 12 }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                    labelStyle={{ color: '#D9AF69', fontWeight: 600 }}
                  />
                  <Bar dataKey="ativos" name={t('chartActive')} fill="#D9AF69" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="frequencia" name={t('chartFreqPercent')} fill="rgba(74,222,128,0.5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Frequência Semanal */}
            <div className="p-4" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>{t('weeklyFrequency')}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pedStats.frequenciaSemanal} barCategoryGap="15%">
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} width={30} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(20,15,8,0.95)', border: '1px solid rgba(217,175,105,0.2)', borderRadius: 12, fontSize: 12 }}
                    itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
                    labelStyle={{ color: '#D9AF69', fontWeight: 600 }}
                  />
                  <Bar dataKey="presentes" name={t('chartPresent')} radius={[4, 4, 0, 0]}>
                    {pedStats.frequenciaSemanal.map((entry, index) => (
                      <Cell key={index} fill={entry.presentes / entry.total >= 0.75 ? '#4ADE80' : entry.presentes / entry.total >= 0.6 ? '#FBBF24' : '#F87171'} fillOpacity={0.7} />
                    ))}
                  </Bar>
                  <Bar dataKey="total" name={t('chartTotal')} fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Nível */}
          <div className="p-4" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }} className="mb-4">{t('levelDistribution')}</h3>
            <div className="flex items-end gap-2 h-24">
              {pedStats.distribuicaoNiveis.map((f) => {
                const maxVal = Math.max(...pedStats.distribuicaoNiveis.map(x => x.total));
                const heightPct = maxVal > 0 ? (f.total / maxVal) * 100 : 0;
                const nivelColor: Record<string, string> = {
                  'Branca': '#E5E7EB', 'Cinza': '#9CA3AF', 'Amarela': '#FBBF24',
                  'Laranja': '#FB923C', 'Verde': '#4ADE80', 'Azul': '#60A5FA',
                  'Roxa': '#A78BFA', 'Marrom': '#A0845C', 'Preta': '#FFFFFF',
                };
                return (
                  <div key={f.nivel} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-white/40">{f.total}</span>
                    <div
                      className="w-full rounded-t-md transition-all duration-700"
                      style={{
                        height: `${Math.max(heightPct, 8)}%`,
                        background: nivelColor[f.nivel] || '#D9AF69',
                        opacity: 0.6,
                      }}
                    />
                    <span className="text-[9px] text-white/30 truncate w-full text-center">{f.nivel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas Pedagógicos */}
          {alertAlunos.length > 0 && (
            <div className="prof-glass-card p-4" style={{ borderColor: 'rgba(248,113,113,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-red-400" />
                <h3 className="text-sm font-semibold text-red-300/80">{t('pedagogicalAttention')}</h3>
                <span className="ml-auto text-[10px] text-white/25">{t('studentsCount', { count: alertAlunos.length })}</span>
              </div>
              <div className="space-y-2">
                {alertAlunos.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={`/professor-aluno-detalhe?id=${a.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{a.avatar}</span>
                      <div>
                        <p className="text-white/70 text-xs font-medium">{a.nome}</p>
                        <p className="text-white/25 text-[10px]">{a.categoria} · {t('level')} {a.nivel}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: a.frequencia.presenca30d < 50 ? '#F87171' : '#FBBF24' }}>
                        {a.frequencia.presenca30d}%
                      </span>
                      <p className="text-white/20 text-[9px]">
                        {a.frequencia.diasAusente > 0 ? `${a.frequencia.diasAusente}${t('daysAbsent')}` : t('lowFrequency')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TURMAS — Cards com indicador visual premium            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="prof-enter-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white/85 tracking-tight">{t('yourClasses')}</h2>
            <span className="text-[10px] text-amber-400/60 tracking-[0.2em] uppercase font-medium">{t('activeCount', { count: turmas.length })}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBroadcast(true)}
              className="text-[10px] text-amber-400/40 hover:text-amber-400/80 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-500/10"
            >
              📢 {t('broadcast')}
            </button>
            <Link href="/professor-turmas" className="text-xs text-amber-400/40 hover:text-amber-400/80 transition-colors duration-300 flex items-center gap-1 group">
            {tCommon('actions.viewAll')} <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {turmasContextuais.map((turma) => (
            <Link key={turma.id} href="/professor-turmas"
              className={`prof-glass-card hover-card p-5 flex items-center gap-4 group cursor-pointer ${
                turma.emAndamento ? 'ring-1 ring-amber-500/30' : ''
              }`}
              style={turma.emAndamento ? { background: 'rgba(217,175,105,0.06)' } : undefined}
            >
              {/* Accent orb */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${turma.cor} flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                {turma.totalAlunos}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white/85 text-sm truncate">{turma.nome}</h3>
                  {turma.emAndamento ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex-shrink-0 bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      {t('now')}
                    </span>
                  ) : turma.minutosParaInicio > 0 && turma.minutosParaInicio <= 120 ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wider uppercase flex-shrink-0 bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {formatMinutosParaInicio(turma.minutosParaInicio)}
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 flex-shrink-0 font-medium tracking-wider uppercase">
                      {turma.categoria}
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-xs mt-1.5 tracking-wide">{turma.dias} · {turma.horario}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-emerald-400/70 text-sm font-bold">{turma.presencaMedia}%</p>
                <p className="text-white/35 text-[10px] mt-0.5 tracking-wider">{t('attendanceLabel')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TWO COLUMNS — Avaliações + Atividades                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">

        {/* AVALIAÇÕES PENDENTES */}
        <section className="lg:col-span-3 prof-enter-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white/85 tracking-tight">{t('pendingEvals')}</h2>
              {avaliacoesPendentes.length > 0 && (
                <span className="w-5 h-5 bg-rose-500/70 rounded-full flex items-center justify-center text-[10px] font-bold text-white prof-badge-urgent">
                  {avaliacoesPendentes.length}
                </span>
              )}
            </div>
            <Link href="/professor-avaliacoes" className="text-xs text-amber-400/40 hover:text-amber-400/80 transition-colors duration-300 flex items-center gap-1 group">
              {tCommon('actions.viewAll')} <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-2">
            {avaliacoesPendentes.slice(0, 4).map((aval) => (
              <div key={aval.id} className="prof-glass-card p-4 flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {aval.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/75 truncate">{aval.aluno}</p>
                  <p className="text-xs text-white/50 mt-0.5">{aval.turma}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide ${
                    aval.tipo === 'graduacao' ? 'bg-amber-500/12 text-amber-300/80 ring-1 ring-amber-500/15' :
                    aval.tipo === 'tecnica' ? 'bg-blue-500/12 text-blue-300/80 ring-1 ring-blue-500/15' :
                    'bg-purple-500/12 text-purple-300/80 ring-1 ring-purple-500/15'
                  }`}>
                    {aval.tipo === 'graduacao' ? tEval('types.graduation') : aval.tipo === 'tecnica' ? tEval('types.technique') : tEval('types.behavior')}
                  </span>
                  <span className={`text-[10px] flex items-center gap-1 ${
                    aval.prioridade === 'alta' ? 'text-rose-400/70' :
                    aval.prioridade === 'media' ? 'text-amber-400/60' :
                    'text-white/50'
                  }`}>
                    <Timer size={10} />
                    {aval.prazo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ATIVIDADE RECENTE */}
        <section className="lg:col-span-2 prof-enter-6">
          <h2 className="text-lg font-bold text-white/85 tracking-tight mb-5">{t('recentActivity')}</h2>

          <div className="prof-glass-card p-4">
            {atividadesRecentes.map((ativ, i) => (
              <div key={ativ.id}
                className={`flex items-start gap-3 py-3.5 ${i < atividadesRecentes.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                <span className="text-base mt-0.5 opacity-80">{ativ.icone}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/50 leading-relaxed">{ativ.descricao}</p>
                  <p className="text-[10px] text-white/35 mt-1.5 tracking-wide">{ativ.tempo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ALUNOS EM DESTAQUE — Scroll horizontal premium         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="prof-enter-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white/85 tracking-tight">{t('highlightStudents')}</h2>
          <Link href="/professor-alunos" className="text-xs text-amber-400/40 hover:text-amber-400/80 transition-colors duration-300 flex items-center gap-1 group">
            {tCommon('actions.seeAll')} <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {alunosDestaque.map((aluno) => (
            <div key={aluno.id}
              className="prof-glass-card p-5 min-w-[165px] md:min-w-[180px] flex-shrink-0 text-center group cursor-default">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.06] flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/[0.06]">
                {aluno.avatar}
              </div>
              <p className="text-sm font-semibold text-white/75 truncate">{aluno.nome}</p>
              <p className="text-[10px] text-amber-400/65 mt-1 tracking-wider uppercase font-medium">{t('level')} {aluno.nivel}</p>

              <div className="mt-3.5 flex items-center justify-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  aluno.status === 'em_dia' ? 'bg-emerald-500' :
                  aluno.status === 'atencao' ? 'bg-amber-500' :
                  'bg-rose-500'
                }`} />
                <span className={`text-[10px] font-medium tracking-wide ${
                  aluno.status === 'em_dia' ? 'text-emerald-400/60' :
                  aluno.status === 'atencao' ? 'text-amber-400/60' :
                  'text-rose-400/60'
                }`}>
                  {aluno.presenca30d}% {t('presence')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* VÍDEOS RECENTES — Cards estilo streaming               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="prof-enter-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white/85 tracking-tight">{t('latestVideos')}</h2>
          <Link href="/professor-videos" className="text-xs text-amber-400/40 hover:text-amber-400/80 transition-colors duration-300 flex items-center gap-1 group">
            {tCommon('actions.seeAll')} <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {videosRecentes.map((video) => (
            <Link key={video.id} href="/professor-videos"
              className="prof-glass-card hover-card overflow-hidden group cursor-pointer">
              {/* Thumbnail */}
              <div className="relative h-36 md:h-40 bg-gradient-to-br from-[#1a150e] to-[#0d0a06] overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${video.thumbnail})`, opacity: 0.2 }} />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/[0.06] backdrop-blur-sm flex items-center justify-center group-hover:bg-amber-500/15 group-hover:scale-110 transition-all duration-500 ring-1 ring-white/[0.08] group-hover:ring-amber-400/20">
                    <Play size={20} className="text-white/70 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                {/* Duration */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white/60 font-mono tracking-wider">
                  {video.duracao}
                </div>
                {/* Type badge */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-black/30 backdrop-blur-sm rounded-md text-[10px] text-amber-300/70 font-medium tracking-wide">
                  {video.tipo === 'aula' ? t('videoTypes.session') : video.tipo === 'analise' ? t('videoTypes.analysis') : t('videoTypes.demo')}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white/75 truncate group-hover:text-amber-200/90 transition-colors duration-300">
                  {video.titulo}
                </h3>
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-[10px] text-white/50 tracking-wide">{video.turma}</p>
                  <div className="flex items-center gap-1 text-[10px] text-white/35">
                    <Eye size={10} />
                    <span>{video.visualizacoes}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TURMA BROADCAST PANEL                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <TurmaBroadcastPanel isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FOOTER — Linha dourada de fechamento                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="prof-enter-8">
        <div className="prof-gold-line" />
        <p className="text-center text-white/50 text-[10px] tracking-[0.3em] uppercase mt-4 font-medium">
          {t('excellence')}
        </p>
      </div>
    </div>
  );
}
