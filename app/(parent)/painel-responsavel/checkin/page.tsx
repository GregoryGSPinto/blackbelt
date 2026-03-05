// ============================================================
// Check-in do Filho — History, Calendar, Summary
// ============================================================
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Calendar, BarChart3 } from 'lucide-react';
import { useParent, type FilhoUnificado } from '@/contexts/ParentContext';
import { CheckinCalendar, type CheckinDay } from '@/components/parent/CheckinCalendar';
import { getMockCheckinHistory, getMockClassDays } from '@/lib/__mocks__/parent-checkin.mock';
import { AnimatedPage } from '@/components/shared/AnimatedPage';
import { staggerStyle } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function CheckinPage() {
  const t = useTranslations('parent.checkin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const searchParams = useSearchParams();
  const kidIdFromUrl = searchParams.get('kid');
  const { filhos, selectedKid: contextKid } = useParent();

  const [selectedKidId, setSelectedKidId] = useState('');
  const [history, setHistory] = useState<CheckinDay[]>([]);

  // Set initial kid
  useEffect(() => {
    if (kidIdFromUrl && filhos.find((f: FilhoUnificado) => f.id === kidIdFromUrl)) {
      setSelectedKidId(kidIdFromUrl);
    } else if (contextKid) {
      setSelectedKidId(contextKid.id);
    } else if (filhos.length > 0 && !selectedKidId) {
      setSelectedKidId(filhos[0].id);
    }
  }, [kidIdFromUrl, filhos, contextKid, selectedKidId]);

  // Load history when kid changes
  useEffect(() => {
    if (selectedKidId) {
      setHistory(getMockCheckinHistory(selectedKidId, 45));
    }
  }, [selectedKidId]);

  const selectedKid = filhos.find((f: FilhoUnificado) => f.id === selectedKidId);
  const classDays = useMemo(() => getMockClassDays(selectedKidId), [selectedKidId]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthHistory = history.filter(h => h.data >= monthStart);
    const presentes = monthHistory.filter(h => h.presente).length;
    const total = monthHistory.length;
    return { presentes, total, pct: total > 0 ? Math.round((presentes / total) * 100) : 0 };
  }, [history]);

  // Recent list (last 10)
  const recentCheckins = useMemo(() => {
    return [...history].reverse().slice(0, 10);
  }, [history]);

  if (!selectedKid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-yellow-400/50" />
          <p className="text-lg font-bold text-white/60">{t('noChildSelected')}</p>
        </div>
      </div>
    );
  }

  const primeiroNome = selectedKid.nome.split(' ')[0];

  return (
    <AnimatedPage className="space-y-6 pb-8 max-w-2xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <section className="pt-4" style={staggerStyle(0)}>
        <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-2">{t('title')}</p>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('checkinOf', { name: primeiroNome })}</h1>
      </section>

      {/* Kid selector (if multiple) */}
      {filhos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={staggerStyle(1)}>
          {filhos.map((filho: FilhoUnificado) => (
            <button
              key={filho.id}
              onClick={() => setSelectedKidId(filho.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                selectedKidId === filho.id
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'bg-white/[0.03] text-white/40 border border-white/[0.05]'
              }`}
            >
              <span>{filho.avatar}</span>
              <span>{filho.nome.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={staggerStyle(2)}>
        <StatCard label={t('present')} value={String(stats.presentes)} color="#4ADE80" />
        <StatCard label={t('absent')} value={String(stats.total - stats.presentes)} color="#F87171" />
        <StatCard label={t('frequency')} value={`${stats.pct}%`}
          color={stats.pct >= 75 ? '#4ADE80' : stats.pct >= 50 ? '#FBBF24' : '#F87171'}
        />
      </div>

      {/* Summary text */}
      <p className="text-sm text-white/40 text-center" style={staggerStyle(3)}>
        {t('attendedCount', { name: primeiroNome, attended: stats.presentes, total: stats.total })}
      </p>

      {/* Calendar */}
      <section
        className="rounded-2xl p-5"
        style={{
          ...staggerStyle(4),
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={14} className="text-white/30" />
          <p className="text-xs font-medium text-white/40">{t('attendanceCalendar')}</p>
        </div>
        <CheckinCalendar days={history} classDays={classDays} />
      </section>

      {/* Recent history */}
      <section style={staggerStyle(5)}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} className="text-white/30" />
          <p className="text-xs font-medium text-white/40">{t('lastRecords')}</p>
        </div>
        <div className="space-y-1.5">
          {recentCheckins.map((item) => {
            const d = new Date(item.data + 'T12:00:00');
            const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
            return (
              <div
                key={item.data}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-2.5">
                  {item.presente ? (
                    <CheckCircle size={14} className="text-green-400/70" />
                  ) : (
                    <AlertCircle size={14} className="text-red-400/60" />
                  )}
                  <span className="text-xs text-white/50 capitalize">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.confirmadoPor && (
                    <span className="text-[9px] text-white/20">
                      {item.confirmadoPor === 'responsavel' ? t('viaParent') : `via ${item.confirmadoPor}`}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: item.presente ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      color: item.presente ? '#4ADE80' : '#F87171',
                    }}
                  >
                    {item.presente ? t('presentStatus') : t('absentStatus')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AnimatedPage>
  );
}

// ── Sub-component ──

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ background: `${color}08`, border: `1px solid ${color}12` }}
    >
      <p className="text-lg font-black" style={{ color }}>{value}</p>
      <p className="text-[9px] text-white/30 mt-0.5">{label}</p>
    </div>
  );
}
