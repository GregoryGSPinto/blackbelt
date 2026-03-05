'use client';

// ============================================================
// PAINEL DO RESPONSAVEL — Enhanced with visual frequency,
// behavioral indicator, quick message, and premium design
// ============================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle, AlertCircle, XCircle, Clock, Award,
  TrendingUp, Calendar, MessageCircle,
  Star, Target, X,
} from 'lucide-react';
import Link from 'next/link';
import { useParent } from '@/contexts/ParentContext';
import { AnimatedPage } from '@/components/shared/AnimatedPage';
import { staggerStyle } from '@/lib/animations';
import { QuickMessage } from '@/components/shared/QuickMessage';
import { WelcomeCard } from '@/components/shared/WelcomeCard';
import { ParentCheckinCard } from '@/components/checkin/ParentCheckinCard';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

// ── Status helpers ──

function StatusBadgeHelper(t: ReturnType<typeof useTranslations>) {
  return (status: string) => {
    switch (status) {
      case 'ATIVO': return { text: t('statusActive'), color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25', icon: <CheckCircle size={14} className="text-emerald-400" /> };
      case 'EM_ATRASO': return { text: t('statusOverdue'), color: 'text-amber-400 bg-amber-500/15 border-amber-500/25', icon: <AlertCircle size={14} className="text-amber-400" /> };
      case 'BLOQUEADO': return { text: t('statusBlocked'), color: 'text-red-400 bg-red-500/15 border-red-500/25', icon: <XCircle size={14} className="text-red-400" /> };
      default: return { text: t('statusUnknown'), color: 'text-white/40 bg-white/5 border-white/10', icon: null };
    }
  };
}

// ── Behavioral indicator based on frequency ──

function getBehaviorHelper(t: ReturnType<typeof useTranslations>) {
  return (presenca: number) => {
    if (presenca >= 85) return { emoji: '😊', label: t('statusExcellent'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (presenca >= 60) return { emoji: '😐', label: t('statusRegular'), color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { emoji: '😟', label: t('statusAttention'), color: 'text-red-400', bg: 'bg-red-500/10' };
  };
}

// ── Weekly frequency mock ──

type DayStatus = 'presente' | 'ausente' | 'sem_aula';

function getMockWeeklyFrequency(): DayStatus[] {
  // Simulates this week: present on class days, absent once
  return ['presente', 'sem_aula', 'presente', 'sem_aula', 'ausente'];
}

// ── Page styles ──

const STYLES = `
  @keyframes parent-freq-pop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes parent-slide-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes parent-notification {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

// ══════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════

// ── Weekly Frequency Circles ──

function WeeklyFrequency({ days }: { days: DayStatus[] }) {
  const tw = useTranslations('common.time.weekdays');
  const DIAS_SEMANA = [tw('mon'), tw('tue'), tw('wed'), tw('thu'), tw('fri')];
  return (
    <div className="flex items-center gap-3 justify-center">
      {days.map((status, i) => {
        const colors = status === 'presente'
          ? 'bg-emerald-500 border-emerald-400'
          : status === 'ausente'
          ? 'bg-red-500 border-red-400'
          : 'bg-white/[0.06] border-white/10';
        const icon = status === 'presente'
          ? <CheckCircle size={14} className="text-white" />
          : status === 'ausente'
          ? <X size={14} className="text-white" />
          : null;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${colors}`}
              style={{ animation: `parent-freq-pop 300ms cubic-bezier(0.34,1.56,0.64,1) ${100 + i * 80}ms both` }}
            >
              {icon}
            </div>
            <span className="text-[10px] text-white/30 font-medium">{DIAS_SEMANA[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat Mini Card ──

function StatMini({ icon: Icon, value, label, color }: { icon: typeof Award; value: string | number; label: string; color: string }) {
  return (
    <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.06]">
      <Icon size={16} className={`${color} mb-2`} />
      <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-white/30 text-[10px] mt-0.5">{label}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

export default function PainelResponsavelPage() {
  const t = useTranslations('parent.dashboard');
  const ts = useTranslations('common.status');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { selectedKid, parentProfile } = useParent();
  const [showMessage, setShowMessage] = useState(false);
  const weeklyDays = getMockWeeklyFrequency();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATIVO': return { text: ts('active'), color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25', icon: <CheckCircle size={14} className="text-emerald-400" /> };
      case 'EM_ATRASO': return { text: ts('overdue'), color: 'text-amber-400 bg-amber-500/15 border-amber-500/25', icon: <AlertCircle size={14} className="text-amber-400" /> };
      case 'BLOQUEADO': return { text: ts('blocked'), color: 'text-red-400 bg-red-500/15 border-red-500/25', icon: <XCircle size={14} className="text-red-400" /> };
      default: return { text: ts('inactive'), color: 'text-white/40 bg-white/5 border-white/10', icon: null };
    }
  };

  const getBehavior = (presenca: number) => {
    if (presenca >= 85) return { emoji: '😊', label: t('statusExcellent'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (presenca >= 60) return { emoji: '😐', label: t('statusRegular'), color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { emoji: '😟', label: t('statusAttention'), color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  if (!selectedKid) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60 text-lg">{t('trackProgress', { name: '' })}</p>
      </div>
    );
  }

  const statusBadge = getStatusBadge(selectedKid.status);
  const behavior = getBehavior(selectedKid.progresso.presenca30dias);
  const presenca = selectedKid.progresso.presenca30dias;
  const presencaColor = presenca >= 85 ? 'from-emerald-500 to-green-500' : presenca >= 60 ? 'from-amber-500 to-yellow-500' : 'from-red-500 to-orange-500';

  return (
    <AnimatedPage className="space-y-6 pb-8 max-w-2xl mx-auto px-4 sm:px-6">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── Header ── */}
      <section className="pt-4">
        <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-2">{t('title')}</p>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
          {t('greeting', { name: parentProfile?.nome?.split(' ')[0] || '' })} 👋
        </h1>
        <p className="text-white/50 text-sm mt-1">{t('trackProgress', { name: selectedKid.nome })}</p>
      </section>

      {/* Welcome card — first visit only */}
      <WelcomeCard profileKey="responsavel" userName={parentProfile?.nome} />

      {/* ── Check-in contextual ── */}
      <ParentCheckinCard />

      {/* ── Kid Card + Behavioral ── */}
      <section
        data-tour="parent-frequencia"
        className="rounded-2xl p-5 hover-card"
        style={{ ...staggerStyle(0), background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Top: Avatar + Name + Status */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/15">
            {selectedKid.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{selectedKid.nome}</h2>
            <p className="text-white/40 text-xs">{t('trackProgress', { name: '' }).replace(/ de$/, '')} {selectedKid.nivel} · {selectedKid.idade} anos · {selectedKid.turma.split(' - ')[0]}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge.color}`}>
            {statusBadge.icon}
            {statusBadge.text}
          </div>
        </div>

        {/* Behavioral Indicator */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-5 ${behavior.bg}`}>
          <span className="text-2xl">{behavior.emoji}</span>
          <div>
            <p className={`text-sm font-bold ${behavior.color}`}>{behavior.label}</p>
            <p className="text-white/30 text-[10px]">{t('statusBasedOn')}</p>
          </div>
        </div>

        {/* Weekly Frequency Circles */}
        <div className="mb-5">
          <p className="text-white/40 text-[10px] uppercase tracking-wider text-center mb-3">{t('weekFrequency')}</p>
          <WeeklyFrequency days={weeklyDays} />
        </div>

        {/* Presence bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/50 text-xs">{t('monthAttendance')}</span>
            <span className={`${presenca >= 85 ? 'text-emerald-400' : presenca >= 60 ? 'text-amber-400' : 'text-red-400'} font-bold text-sm tabular-nums`}>{presenca}%</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${presencaColor} rounded-full transition-all duration-1000`}
              style={{ width: `${presenca}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/painel-responsavel/checkin?kid=${selectedKid.id}`}
            className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm text-center hover:bg-white/90 transition-colors active:scale-[0.98]"
          >
            {t('checkinBtn')}
          </Link>
          <button
            data-tour="parent-mensagem"
            onClick={() => setShowMessage(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 font-semibold text-sm hover:bg-blue-500/25 transition-colors active:scale-[0.98]"
          >
            <MessageCircle size={14} />
            {t('professorBtn')}
          </button>
          <Link
            href={`/painel-responsavel/meus-filhos/${selectedKid.id}`}
            className="px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.1] transition-colors active:scale-[0.98]"
          >
            {t('profileBtn')}
          </Link>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section data-tour="parent-progresso" className="grid grid-cols-2 md:grid-cols-4 gap-3" style={staggerStyle(1, undefined, 0, 60)}>
        <StatMini icon={Calendar} value={selectedKid.progresso.sessõesAssistidas} label={t('myChildren')} color="text-blue-400" />
        <StatMini icon={Target} value={selectedKid.progresso.desafiosConcluidos} label={t('myChildren')} color="text-purple-400" />
        <StatMini icon={Award} value={selectedKid.progresso.conquistasConquistadas} label={t('myChildren')} color="text-amber-400" />
        <StatMini icon={TrendingUp} value={`${presenca}%`} label={t('attendance')} color="text-emerald-400" />
      </section>

      {/* ── Simulated Push Notification ── */}
      <section style={staggerStyle(2, undefined, 0, 60)}>
        <div
          className="rounded-xl p-4 border border-emerald-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), transparent)', animation: 'parent-notification 500ms ease 600ms both' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Star size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-bold text-sm">{t('newAchievement')} 🎉</p>
              <p className="text-white/50 text-xs mt-0.5">{selectedKid.nome} desbloqueou a conquista "Estudante Dedicado"!</p>
              <p className="text-white/20 text-[10px] mt-1">2h</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proximas Sessoes ── */}
      <section style={staggerStyle(3, undefined, 0, 60)}>
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-blue-400" />
          {t('nextSessions')}
        </h3>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { dia: 'Hoje', hora: '18:00', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            { dia: 'Amanha', hora: '18:00', badge: 'bg-white/[0.06] text-white/50 border-white/10' },
          ].map((aula, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-3.5 ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
              <div>
                <p className="text-white font-semibold text-sm">{aula.dia}, {aula.hora}</p>
                <p className="text-white/30 text-xs mt-0.5">{selectedKid.turma} · {selectedKid.instrutor}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${aula.badge}`}>
                {aula.dia}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Avisos ── */}
      <section style={staggerStyle(4, undefined, 0, 60)}>
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-400" />
          {t('notices')}
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/15">
            <Clock size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-400 font-semibold text-xs">{t('nextPayment')}</p>
              <p className="text-white/40 text-[11px]">Vencimento em 12 dias — R$ 150,00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Message Modal */}
      {showMessage && (
        <QuickMessage
          recipientName={selectedKid.instrutor}
          recipientId="prof-1"
          senderName={parentProfile?.nome || ''}
          senderId="resp-1"
          senderTipo="responsavel"
          conversaId="conv-2"
          onClose={() => setShowMessage(false)}
        />
      )}
    </AnimatedPage>
  );
}
