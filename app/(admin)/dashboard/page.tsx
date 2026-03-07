'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users, UserCheck, AlertCircle, Ban, ClipboardCheck, GraduationCap,
  TrendingUp, TrendingDown, ArrowRight, Clock, BarChart3, UserPlus,
  AlertTriangle, Snowflake, Cake, Award, DollarSign, CreditCard,
  ChevronDown, ChevronUp, UserX, LayoutDashboard, Crown,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import * as adminService from '@/lib/api/admin.service';
import type { EstatisticasDashboard, Alerta } from '@/lib/api/admin.service';
import Link from 'next/link';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, PageEmpty } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { useServiceCall } from '@/hooks/useServiceCall';
import { useCachedServiceCall, TTL } from '@/hooks/useCachedServiceCall';
import { CacheIndicator } from '@/components/shared/CacheIndicator';
import * as alertasIntService from '@/lib/api/alertas-inteligentes.service';
import type { AlertaInteligente } from '@/lib/api/alertas-inteligentes.service';
import { ProactiveAlertList } from '@/components/shared/ProactiveAlert';
import ExecutiveDashboard from '@/components/admin/ExecutiveDashboard';
import OwnerExecutiveDashboard from '@/components/admin/OwnerExecutiveDashboard';
import { WelcomeCard } from '@/components/shared/WelcomeCard';
import { useFormatting } from '@/hooks/useFormatting';

// ── Nivel colors ──────────────────────────────────────────

const NIVEL_COLORS: Record<string, string> = {
  'Nível Iniciante': '#E5E7EB', 'Nível Cinza': '#9CA3AF', 'Nível Amarelo': '#EAB308',
  'Nível Básico': '#3B82F6', 'Nível Intermediário': '#8B5CF6', 'Nível Avançado': '#92400E',
  'Nível Máximo': '#374151',
};

type AdminDashData = [EstatisticasDashboard, Alerta[]];

export default function DashboardPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('admin');
  const { formatDate, formatTime } = useFormatting();
  const { data: result, loading, error, retry, cacheInfo, refreshing, refresh } = useCachedServiceCall<AdminDashData>(
    'admin:dashboard',
    () => Promise.all([
      adminService.getEstatisticas(),
      adminService.getAlertas(),
    ]),
    { label: 'AdminDashboard', maxRetries: 3, ttl: TTL.MEDIUM }
  );

  const stats = result?.[0] ?? null;
  const alertasAtivos = result?.[1] ?? [];

  // Proactive smart alerts
  const { data: alertasInteligentes } = useServiceCall<AlertaInteligente[]>(
    () => alertasIntService.getAlertas(),
    { label: 'AdminAlertasInt', maxRetries: 1 }
  );

  // View mode toggle: operational vs executive vs owner
  const [viewMode, setViewMode] = useState<'operational' | 'executive' | 'owner'>('operational');

  // ─── Search Registration ──────────────────────────────
  const searchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];
    alertasAtivos.forEach((a) => items.push({
      id: `alerta-${a.id}`, label: a.titulo, sublabel: a.mensagem,
      categoria: 'Alerta', icon: '🔔', href: '/alertas', keywords: [a.tipo, a.prioridade],
    }));
    items.push(
      { id: 'nav-usuarios', label: 'Gerenciar Usuários', sublabel: 'Lista completa de alunos e staff', categoria: 'Navegação', icon: '👥', href: '/usuarios' },
      { id: 'nav-turmas', label: 'Gerenciar Turmas', sublabel: 'Classes, horários e instrutores', categoria: 'Navegação', icon: '🥋', href: '/turmas' },
      { id: 'nav-checkin', label: 'Check-in / Presença', sublabel: 'Registro de presenças', categoria: 'Navegação', icon: '✅', href: '/check-in' },
      { id: 'nav-financeiro', label: 'Financeiro', sublabel: 'Pagamentos e mensalidades', categoria: 'Navegação', icon: '💰', href: '/financeiro' },
      { id: 'nav-agenda', label: 'Agenda', sublabel: 'Calendário de sessões e eventos', categoria: 'Navegação', icon: '📅', href: '/agenda' },
      { id: 'nav-config', label: 'Configurações', sublabel: 'Configurações da unidade', categoria: 'Navegação', icon: '⚙️', href: '/configuracoes' },
    );
    return items;
  }, [alertasAtivos]);

  useSearchRegistration('admin-dashboard', searchItems);

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (error) return <PageError error={error} onRetry={retry} />;
  if (!stats) return <PageEmpty icon={BarChart3} title={t('dashboard.unavailable')} message={t('dashboard.cannotLoadStats')} />;

  return (
    <div className="space-y-8">
      {/* Retry feedback */}
      <CacheIndicator cacheInfo={cacheInfo} refreshing={refreshing} onRefresh={refresh} />

      {/* Welcome card — first visit only */}
      <WelcomeCard profileKey="admin" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {viewMode === 'executive' ? t('dashboard.executiveView') : t('dashboard.advancedDashboard')}
          </h1>
          <p style={{ fontWeight: 300, color: tokens.textMuted }} className="text-sm mt-1">
            {viewMode === 'executive' ? t('dashboard.executiveViewDesc') : t('dashboard.advancedDashboard')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={() => setViewMode('operational')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${
                viewMode === 'operational'
                  ? 'bg-white/10 text-white'
                  : 'text-white/30 hover:text-white/50'
              }`}
              aria-label={t('dashboard.operationalView')}
            >
              <LayoutDashboard size={13} />
              <span className="hidden md:inline">{t('dashboard.operational')}</span>
            </button>
            <button
              onClick={() => setViewMode('executive')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${
                viewMode === 'executive'
                  ? 'bg-white/10 text-white'
                  : 'text-white/30 hover:text-white/50'
              }`}
              aria-label={t('dashboard.executiveView')}
            >
              <Crown size={13} />
              <span className="hidden md:inline">{t('dashboard.executive')}</span>
            </button>
            <button
              onClick={() => setViewMode('owner')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${
                viewMode === 'owner'
                  ? 'bg-white/10 text-white'
                  : 'text-white/30 hover:text-white/50'
              }`}
              aria-label="Visao Owner"
            >
              <BarChart3 size={13} />
              <span className="hidden md:inline">Owner</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: tokens.textMuted }}>
            <Clock size={14} />
            <span className="hidden sm:inline">{t('dashboard.updatedNow')}</span>
          </div>
        </div>
      </div>

      {/* ── Owner View ── */}
      {viewMode === 'owner' ? (
        <OwnerExecutiveDashboard />
      ) : viewMode === 'executive' ? (
        <ExecutiveDashboard stats={stats} />
      ) : (
      <>

      {/* CRITICAL ALERTS BANNER */}
      {alertasAtivos.length > 0 && (
        <div style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)' }} className="rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={22} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 style={{ fontWeight: 300, color: tokens.text }} className="text-base mb-1">
                {t('dashboard.operationalAlerts', { count: alertasAtivos.length })}
              </h3>
              <p className="text-sm text-red-300/70 mb-3">{t('dashboard.immediateActionNeeded')}</p>
              <Link href="/alertas" style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, borderRadius: '12px', color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem' }} className="inline-flex items-center gap-2 transition-colors">
                {t('dashboard.viewAlerts')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* STATUS OPERACIONAL CRÍTICO */}
      <Section title={t('dashboard.operationalStatus')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <CriticalCard title={t('dashboard.activeStudents')} value={stats.alunosAtivos} total={stats.totalAlunos}
            percentage={Math.round((stats.alunosAtivos / stats.totalAlunos) * 100)}
            icon={UserCheck} link="/usuarios?status=ativo" status="success" />
          <CriticalCard title={t('dashboard.overdue')} value={stats.alunosEmAtraso} icon={AlertCircle}
            link="/usuarios?status=atraso" status={stats.alunosEmAtraso > 5 ? 'warning' : 'info'}
            alert={stats.alunosEmAtraso > 0} />
          <CriticalCard title={t('dashboard.blocked')} value={stats.alunosBloqueados} icon={Ban}
            link="/usuarios?status=bloqueado" status={stats.alunosBloqueados > 0 ? 'critical' : 'info'}
            alert={stats.alunosBloqueados > 0} />
          <CriticalCard title={t('dashboard.frozen')} value={stats.alunosCongelados} icon={Snowflake}
            link="/usuarios?status=congelado" status={stats.alunosCongelados > 0 ? 'frozen' : 'info'} />
          <CriticalCard title={t('dashboard.inactive')} value={stats.alunosInativos} icon={UserX}
            link="/usuarios?status=inativo" status={stats.alunosInativos > 0 ? 'inactive' : 'info'} />
        </div>
      </Section>

      {/* MÉTRICAS OPERACIONAIS */}
      <Section title={t('dashboard.operationalMetrics')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard title={t('dashboard.todayCheckins')} value={stats.checkInsHoje} icon={ClipboardCheck}
            link="/check-in" comparison={{ value: stats.checkInsOntem, label: t('dashboard.vsYesterday') }} />
          <MetricCard title={t('dashboard.activeClasses')} value={stats.turmasAtivas} icon={GraduationCap} link="/turmas" />
          <MetricCard title={t('dashboard.totalStudents')} value={stats.totalAlunos} icon={Users} link="/usuarios" />
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════
          SEÇÕES AVANÇADAS (Prompt 4.2)
          ═══════════════════════════════════════════════════ */}

      {/* 1. ALERTAS DE GESTÃO */}
      <Section title={t('dashboard.managementAlerts')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GestaoCard title={t('dashboard.newStudents30d')} count={stats.novatos.quantidade}
            icon={UserPlus} color="#3B82F6" emptyText={t('dashboard.noRecentNewcomers')}>
            {stats.novatos.lista.map(n => (
              <div key={n.id} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-white/60">{n.nome}</span>
                <span className="text-[10px] text-white/25">{n.turma}</span>
              </div>
            ))}
          </GestaoCard>

          <GestaoCard title={t('dashboard.churnRisk')} count={stats.riscoEvasao.quantidade}
            icon={AlertTriangle} color="#F97316" emptyText={t('dashboard.noStudentsAtRisk')}>
            {stats.riscoEvasao.lista.map(r => (
              <div key={r.id} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-white/60">{r.nome}</span>
                <div className="flex gap-0.5">
                  {r.frequenciaSemanas.map((f, i) => (
                    <span key={i} className={`w-5 h-5 rounded text-[9px] font-medium flex items-center justify-center ${
                      f >= 3 ? 'bg-emerald-500/20 text-emerald-400' :
                      f >= 2 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </GestaoCard>

          <GestaoCard title={t('dashboard.frozenPlans')} count={stats.congelados.quantidade}
            icon={Snowflake} color="#06B6D4" emptyText={t('dashboard.noFrozenPlans')}>
            {stats.congelados.lista.map(c => (
              <div key={c.id} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-white/60">{c.nome}</span>
                <span className="text-[10px] text-white/25">desde {formatDate(c.dataCongelamento, 'short')}</span>
              </div>
            ))}
          </GestaoCard>

          <GestaoCard title={t('dashboard.birthdaysMonth')} count={stats.aniversariantes.quantidade}
            icon={Cake} color="#EC4899" emptyText={t('dashboard.noBirthdays')}>
            {stats.aniversariantes.lista.map(a => (
              <div key={a.id} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-white/60">{a.nome}</span>
                <span className="text-[10px] text-white/25">
                  {formatDate(a.dataNascimento, 'short')}
                </span>
              </div>
            ))}
          </GestaoCard>
        </div>
      </Section>

      {/* 2. MAPA DE CALOR */}
      <Section title={t('dashboard.heatMap')}>
        <HeatmapChart data={stats.mapaCalor} />
      </Section>

      {/* 3. GRADUAÇÕES */}
      <Section title={t('dashboard.graduations')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: tokens.cardBg, border: '1px solid black' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-white/70">{t('dashboard.readyForExam')}</h3>
              <span className="ml-auto text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
                {stats.aptosExame.quantidade}
              </span>
            </div>
            <div className="space-y-2.5">
              {stats.aptosExame.lista.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/25">
                  <span className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: NIVEL_COLORS[a.nivelAtual] || '#E5E7EB' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/70">{a.nome}</p>
                    <p className="text-[10px] text-white/25">{a.nivelAtual} → {a.proximaNível}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50 font-medium">{a.presencaPct}%</p>
                    <p className="text-[9px] text-white/20">{a.tempoNivelMeses}m no nível</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: tokens.cardBg, border: '1px solid black' }}>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white/70">{t('dashboard.avgTimePerLevel')}</h3>
            </div>
            <div className="space-y-3">
              {stats.tempoMedioPorNível.map((item, i) => {
                const maxMeses = Math.max(...stats.tempoMedioPorNível.map(x => x.meses));
                const pct = (item.meses / maxMeses) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50">{item.nivel}</span>
                      <span className="text-xs text-white/60 font-medium">{item.meses} {t('dashboard.months')}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500/50 to-purple-400/70 transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-white/15 mt-3">{t('dashboard.basedOnAverage')}</p>
          </div>
        </div>
      </Section>

      {/* 4. FINANCEIRO RESUMO */}
      <Section title={t('dashboard.financialSummary')}>
        <FinanceiroResumo data={stats.financeiroResumo} />
      </Section>

      {/* ALERTAS INTELIGENTES */}
      {alertasInteligentes && alertasInteligentes.length > 0 && (
        <ProactiveAlertList alertas={alertasInteligentes} maxVisible={5} />
      )}

      {/* AÇÕES RÁPIDAS */}
      <Section title={t('dashboard.quickActions')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <QuickAction href="/check-in" icon={ClipboardCheck} title={t('dashboard.validateCheckin')} subtitle={t('dashboard.confirmPresence')} />
          <QuickAction href="/usuarios" icon={Users} title={t('dashboard.manageUsers')} subtitle={t('dashboard.seeAllStudents')} />
          <QuickAction href="/agenda" icon={GraduationCap} title={t('dashboard.dayAgenda')} subtitle={t('dashboard.seeTodayClasses')} />
        </div>
      </Section>

      {/* ALERTAS RECENTES */}
      {alertasAtivos.length > 0 && (
        <Section title={t('dashboard.recentAlerts')} action={{ label: t('dashboard.seeAll'), href: '/alertas' }}>
          <div className="space-y-2">
            {alertasAtivos.slice(0, 3).map((alerta) => (
              <div key={alerta.id} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: tokens.cardBg, border: '1px solid black' }}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alerta.prioridade === 'ALTA' ? 'bg-red-400' :
                  alerta.prioridade === 'MEDIA' ? 'bg-yellow-400' : 'bg-white/30'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{alerta.titulo}</p>
                  <p className="text-xs text-white/30 mt-1">{alerta.mensagem}</p>
                </div>
                <span className="text-xs text-white/20 shrink-0">
                  {formatTime(alerta.data)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
      </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: { label: string; href: string } }) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <div>
      <div className="gold-accent-bar mb-4" />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs" style={{ color: 'var(--text-secondary)' }}>{title}</h2>
        {action && (
          <Link href={action.href} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {action.label} <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function CriticalCard({ title, value, total, percentage, icon: Icon, link, status, alert }: {
  title: string; value: number; total?: number; percentage?: number;
  icon: typeof Users; link: string; status: 'success' | 'warning' | 'critical' | 'info' | 'frozen' | 'inactive'; alert?: boolean;
}) {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const isW = status === 'warning'; const isC = status === 'critical';
  const isF = status === 'frozen'; const isI = status === 'inactive';
  const borderColor = isC ? 'rgba(239,68,68,0.2)' : isW ? 'rgba(234,179,8,0.2)' : isF ? 'rgba(6,182,212,0.2)' : isI ? 'rgba(255,255,255,0.06)' : tokens.cardBorder;
  const iconBg = isC ? 'bg-red-500/15 border border-red-500/20' : isW ? 'bg-yellow-500/15 border border-yellow-500/20' : isF ? 'bg-cyan-500/15 border border-cyan-500/20' : isI ? 'bg-white/5 border border-white/[0.06]' : 'bg-white/10 border border-white/10';
  const iconColor = isC ? 'text-red-400' : isW ? 'text-yellow-400' : isF ? 'text-cyan-400' : isI ? 'text-white/30' : 'text-white/70';
  const valueColor = isC ? 'text-red-400' : isW ? 'text-yellow-400' : isF ? 'text-cyan-400' : isI ? 'text-white/30' : '';
  return (
    <Link href={link} className="hover-card group relative p-5 transition-all hover:bg-white/5 rounded-xl" style={{ background: tokens.cardBg, border: '1px solid ' + borderColor, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)' }}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <h3 className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      <div className="flex items-end justify-between mb-3">
        <p className={`${valueColor}`} style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.02em', color: valueColor ? undefined : tokens.text }}>{value}</p>
        {total !== undefined && percentage !== undefined && (
          <div className="text-right">
            <p className="text-xs" style={{ color: tokens.textMuted }}>de {total}</p>
            <p className="text-lg" style={{ fontWeight: 200, color: tokens.textMuted }}>{percentage}%</p>
          </div>
        )}
      </div>
      {alert && (
        <div style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, borderRadius: '12px', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const }} className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${isC ? 'text-red-400' : 'text-yellow-400'}`}>
          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" /> {t('dashboard.requiresAttention')}
        </div>
      )}
    </Link>
  );
}

function MetricCard({ title, value, icon: Icon, link, comparison }: {
  title: string; value: number; icon: typeof Users; link: string; comparison?: { value: number; label: string };
}) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <Link href={link} className="hover-card group p-5 hover:bg-white/5 transition-all rounded-xl" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)' }}>
      <div className="w-11 h-11 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors">
        <Icon size={20} className="text-white/70" />
      </div>
      <h3 className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      <div className="flex items-end justify-between">
        <p style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em', color: tokens.text }}>{value}</p>
        {comparison && (
          <div className="flex items-center gap-1">
            {comparison.value < value ? <TrendingUp size={16} className="text-green-400" /> :
             comparison.value > value ? <TrendingDown size={16} className="text-red-400" /> : null}
            <div className="text-right">
              <p className="text-xs" style={{ color: tokens.textMuted }}>{comparison.label}</p>
              <p className={`text-sm font-medium ${comparison.value < value ? 'text-green-400' : comparison.value > value ? 'text-red-400' : ''}`} style={comparison.value >= value && comparison.value <= value ? { color: tokens.textMuted } : undefined}>{comparison.value}</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function GestaoCard({ title, count, icon: Icon, color, emptyText, children }: {
  title: string; count: number; icon: typeof Users; color: string; emptyText: string; children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [expanded, setExpanded] = useState(count <= 3);
  return (
    <div className="rounded-xl p-5" style={{ background: tokens.cardBg, border: '1px solid black' }}>
      <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-2 w-full text-left mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-medium text-white/70 flex-1">{title}</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{count}</span>
        {count > 0 && (expanded ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />)}
      </button>
      {expanded && count > 0 ? (
        <div className="divide-y divide-white/[0.04]">{children}</div>
      ) : count === 0 ? (
        <div className="empty-state-premium"><p className="text-xs text-white/20">{emptyText}</p></div>
      ) : null}
    </div>
  );
}

function QuickAction({ href, icon: Icon, title, subtitle }: { href: string; icon: typeof Users; title: string; subtitle: string }) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <Link href={href} className="hover-card flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group" style={{ background: tokens.cardBg, border: '1px solid black' }}>
      <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/15 transition-colors">
        <Icon size={18} className="text-white/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/30">{subtitle}</p>
      </div>
      <ArrowRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
    </Link>
  );
}

// ── Heatmap ───────────────────────────────────────────────

function HeatmapChart({ data }: { data: { dia: string; horario: string; checkins: number }[] }) {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const horarios = Array.from(new Set(data.map(d => d.horario))).sort();
  const maxCheckins = Math.max(...data.map(d => d.checkins), 1);

  const getCellColor = (checkins: number) => {
    if (checkins === 0) return 'bg-black/20';
    const intensity = checkins / maxCheckins;
    if (intensity > 0.75) return 'bg-emerald-500/60';
    if (intensity > 0.5) return 'bg-emerald-500/40';
    if (intensity > 0.25) return 'bg-emerald-500/20';
    return 'bg-emerald-500/10';
  };

  const getCell = (dia: string, horario: string) =>
    data.find(d => d.dia === dia && d.horario === horario);

  return (
    <div className="rounded-xl p-5 overflow-x-auto" style={{ background: tokens.cardBg, border: '1px solid black' }}>
      <div className="min-w-[600px]">
        <div className="flex gap-1 mb-1">
          <div className="w-10 shrink-0" />
          {horarios.map(h => (
            <div key={h} className="flex-1 text-center text-[9px] text-white/20">{h}</div>
          ))}
        </div>
        {dias.map(dia => (
          <div key={dia} className="flex gap-1 mb-1">
            <div className="w-10 shrink-0 text-[10px] text-white/30 flex items-center">{dia}</div>
            {horarios.map(h => {
              const cell = getCell(dia, h);
              const count = cell?.checkins ?? 0;
              return (
                <div key={`${dia}-${h}`} className={`flex-1 h-7 rounded ${getCellColor(count)} flex items-center justify-center`}
                  title={`${dia} ${h}: ${count} check-ins`}>
                  {count > 0 && <span className="text-[8px] text-white/40 font-mono">{count}</span>}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[9px] text-white/20">{t('dashboard.less')}</span>
          {['bg-black/20', 'bg-emerald-500/10', 'bg-emerald-500/20', 'bg-emerald-500/40', 'bg-emerald-500/60'].map((c, i) => (
            <div key={i} className={`w-4 h-4 rounded ${c}`} />
          ))}
          <span className="text-[9px] text-white/20">{t('dashboard.more')}</span>
        </div>
      </div>
    </div>
  );
}

// ── Financeiro ────────────────────────────────────────────

function FinanceiroResumo({ data }: { data: EstatisticasDashboard['financeiroResumo'] }) {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const receitaDiff = data.receitaMes - data.receitaMesAnterior;
  const receitaPct = data.receitaMesAnterior > 0 ? Math.round((receitaDiff / data.receitaMesAnterior) * 100) : 0;
  const isUp = receitaDiff >= 0;
  const maxPlano = Math.max(...data.distribuicaoPlanos.map(p => p.quantidade));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl p-5 space-y-4" style={{ background: tokens.cardBg, border: '1px solid black' }}>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white/70">{t('dashboard.indicators')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FinKpi label={t('dashboard.monthlyRevenueLabel')} value={`R$ ${(data.receitaMes / 1000).toFixed(1)}k`} sub={
            <span className={`flex items-center gap-0.5 text-[10px] ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {isUp ? '+' : ''}{receitaPct}% vs anterior
            </span>
          } />
          <FinKpi label={t('dashboard.avgTicket')} value={`R$ ${data.ticketMedio}`} />
          <FinKpi label={t('dashboard.defaultRate')} value={`${data.inadimplenciaPct}%`}
            sub={<span className={`text-[10px] ${data.inadimplenciaPct > 10 ? 'text-red-400' : 'text-emerald-400'}`}>
              {data.inadimplenciaPct > 10 ? t('dashboard.aboveIdeal') : t('dashboard.healthy')}
            </span>} />
          <FinKpi label={t('dashboard.forecast')} value={`R$ ${(data.previsaoCaixa / 1000).toFixed(1)}k`} />
        </div>
        <div className="pt-3 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/25 mb-1">{t('dashboard.bestSellingPlan')}</p>
          <p className="text-sm text-white/60">
            <span className="font-medium text-white/80">{data.planoMaisVendido.nome}</span>
            <span className="ml-2 text-white/30">({data.planoMaisVendido.quantidade} alunos)</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: tokens.cardBg, border: '1px solid black' }}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white/70">{t('dashboard.planDistribution')}</h3>
        </div>
        <div className="space-y-3">
          {data.distribuicaoPlanos.map((p, i) => {
            const pct = Math.round((p.quantidade / maxPlano) * 100);
            const colors = ['from-blue-500/50 to-blue-400/70', 'from-purple-500/50 to-purple-400/70', 'from-amber-500/50 to-amber-400/70', 'from-emerald-500/50 to-emerald-400/70'];
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/50">{p.plano}</span>
                  <span className="text-xs text-white/60 font-medium">{p.quantidade}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all duration-500`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-white/15 mt-3">Total: {data.distribuicaoPlanos.reduce((s, p) => s + p.quantidade, 0)} alunos com plano ativo</p>
      </div>
    </div>
  );
}

function FinKpi({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: tokens.cardBg, border: '1px solid black' }}>
      <p className="text-[9px] text-white/25 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-medium text-white mt-0.5">{value}</p>
      {sub}
    </div>
  );
}

