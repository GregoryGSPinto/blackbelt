'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TeenCard, ProgressCircle, TeenProgressBar, StatCard } from '@/components/teen';
import * as teenService from '@/lib/api/teen.service';
import { TEEN_SESSÕES, getProximaMeta } from '@/lib/api/teen.service';
import type { TeenProfile } from '@/lib/api/teen.service';
import { Play, Calendar, TrendingUp, Clock, Target, Video, Flame, ChevronRight, CheckCircle2 , UserX} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

export default function TeenInicioPage() {
  const t = useTranslations('teen.home');
  const tc = useTranslations('common.actions');
  const { user } = useAuth();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [teenprofiles, setTeenprofiles] = useState<TeenProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await teenService.getTeenProfiles();
        setTeenprofiles(data);
      } catch (err) {
        setError(handleServiceError(err, 'TeenInicio'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (teenprofiles.length === 0) {
    return <PageEmpty icon={UserX} title="Nenhum perfil encontrado" message="Não há perfis teen cadastrados." />;
  }


  const currentTeen = teenprofiles[0];
  const aulaEmAndamento = TEEN_SESSÕES.find(a => a.progresso > 0 && !a.assistido);
  const proximaMeta = getProximaMeta(currentTeen.progresso.evolucaoNível);

  const nomeExibicao = user?.nome?.split(' ')[0] || currentTeen.nome.split(' ')[0];
  const graduacao = user?.graduacao || `Nível ${currentTeen.nivel}`;

  const evolucao = currentTeen.progresso.evolucaoNível;

  // Journey milestones
  const milestones = [
    { label: 'Tempo mínimo', done: true, value: 'Completo' },
    { label: 'Técnicas', done: false, value: '45/60' },
    { label: 'Treinos', done: false, value: '80/100' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ═══ SECTION 1: Boas-vindas + Sequência ═══ */}
      <div className="teen-enter-1 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('greeting', { name: nomeExibicao })}
          </h2>
          <p className="text-sm font-teen mt-1.5" style={{ fontWeight: 300, color: tokens.textMuted }}>
            {graduacao} · {currentTeen.turma.split(' - ')[0]}
          </p>
        </div>
        {/* Streak badge */}
        <div className="px-4 py-2.5 flex items-center gap-2.5 flex-shrink-0" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
          <div className="w-9 h-9 flex items-center justify-center" style={{ borderRadius: '12px', background: 'rgba(255,107,53,0.12)' }}>
            <Flame size={18} className="text-teen-energy" />
          </div>
          <div>
            <p className="leading-none" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em', color: tokens.text }}>
              {currentTeen.progresso.sequenciaAtual}
            </p>
            <p className="leading-tight mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{t('consecutiveDays')}</p>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: Continue assistindo + Progresso central ═══ */}
      <div className="teen-enter-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
        {/* Continue assistindo — ocupa mais espaço */}
        {aulaEmAndamento && (
          <TeenCard variant="elevated" className="lg:col-span-3"
            onClick={() => window.location.href = '/teen-aulas'}>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${isDark ? '#006B8F' : '#0088B5'}, ${isDark ? '#5E4FD6' : '#7B68EE'})`,
                }}>
                <Play className="w-10 h-10 text-white drop-shadow-lg" fill="white" fillOpacity={0.3} />
                {/* Mini progress ring */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" />
                  <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.7)" strokeWidth="3" fill="none"
                    strokeDasharray={`${46 * 2 * Math.PI}`}
                    strokeDashoffset={`${46 * 2 * Math.PI * (1 - aulaEmAndamento.progresso / 100)}`}
                    strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {t('continueWatching')}
                </p>
                <h3 className="truncate" style={{ fontWeight: 300, color: tokens.text, fontSize: '1.1rem' }}>
                  {aulaEmAndamento.titulo}
                </h3>
                <p className="text-sm mt-0.5" style={{ fontWeight: 300, color: tokens.textMuted }}>{aulaEmAndamento.instrutor}</p>
                <div className="mt-3">
                  <TeenProgressBar 
                    progress={aulaEmAndamento.progresso} 
                    showPercentage={false}
                    height="sm"
                  />
                </div>
              </div>
            </div>
          </TeenCard>
        )}

        {/* Progresso central — hero visual */}
        <TeenCard variant="glass" className={aulaEmAndamento ? 'lg:col-span-2' : 'lg:col-span-5'}>
          <div className="flex flex-col items-center text-center py-2">
            <ProgressCircle 
              percentage={evolucao} 
              size={130}
              strokeWidth={11}
              color={isDark ? '#4DB8D4' : '#006B8F'}
              trailColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)'}
              label="completo"
              showGlow={true}
            />
            <h3 className="text-base font-semibold font-teen teen-text-heading mt-4">
              {t('journey', { level: graduacao })}
            </h3>
            <p className="text-xs teen-text-muted font-teen mt-1">
              {proximaMeta}
            </p>
          </div>
        </TeenCard>
      </div>

      {/* ═══ SECTION 3: Stats compactos ═══ */}
      <div className="teen-enter-3 grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
        <StatCard 
          icon={<Calendar className="w-5 h-5" />}
          value={`${currentTeen.progresso.presenca30dias}%`}
          label={t('stats.attendance')}
          color="ocean"
        />
        <StatCard 
          icon={<Clock className="w-5 h-5" />}
          value={`${currentTeen.progresso.tempoTreinoTotal}h`}
          label={t('stats.hours')}
          color="purple"
        />
        <StatCard 
          icon={<Video className="w-5 h-5" />}
          value={currentTeen.progresso.sessõesAssistidas}
          label={t('stats.sessions')}
          color="emerald"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5" />}
          value={`${currentTeen.progresso.sequenciaAtual}d`}
          label={t('stats.streak')}
          color="energy"
        />
      </div>

      {/* ═══ SECTION 4: Jornada na nivel — visual contínuo ═══ */}
      <div className="teen-enter-4">
        <TeenCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-teen teen-text-heading">
              {t('levelProgress', { level: graduacao })}
            </h3>
            <span className="text-xs font-teen font-semibold px-2.5 py-1 rounded-lg"
              style={{
                background: isDark ? 'rgba(0,107,143,0.12)' : 'rgba(0,107,143,0.08)',
                color: isDark ? '#4DB8D4' : '#005A78',
              }}>
              {t('percentComplete', { pct: evolucao })}
            </span>
          </div>

          {/* Full-width progress bar */}
          <div className="mb-5">
            <TeenProgressBar progress={evolucao} height="lg" showPercentage={false} />
          </div>

          {/* Milestones as clean rows */}
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-3"
                style={{ borderTop: i > 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)'}` : 'none' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: m.done
                        ? (isDark ? 'rgba(46,204,113,0.15)' : 'rgba(46,204,113,0.1)')
                        : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    }}>
                    {m.done
                      ? <CheckCircle2 size={15} className="text-teen-emerald" />
                      : <div className="w-2 h-2 rounded-full" style={{
                          background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(109,93,75,0.25)',
                        }} />
                    }
                  </div>
                  <span className={`text-sm font-teen font-medium ${m.done ? 'teen-text-heading' : 'teen-text-body'}`}>
                    {m.label}
                  </span>
                </div>
                <span className={`text-sm font-teen font-semibold ${
                  m.done ? 'text-teen-emerald' : 'teen-text-muted'
                }`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </TeenCard>
      </div>

      {/* ═══ SECTION 5: Recomendações — cards amigáveis ═══ */}
      <div className="teen-enter-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold font-teen teen-text-heading">
            {t('recommendedForYou')}
          </h3>
          <button className="flex items-center gap-1 text-xs font-teen font-semibold transition-colors"
            style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(109,93,75,0.5)' }}>
            {tc('viewAll')}
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide">
          {TEEN_SESSÕES.slice(2, 5).map((aula) => (
            <TeenCard key={aula.id} className="min-w-[260px] md:min-w-0 snap-start"
              onClick={() => window.location.href = '/teen-aulas'}>
              <div className="aspect-[16/9] rounded-xl flex items-center justify-center mb-3 overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, ${isDark ? 'rgba(0,107,143,0.25)' : 'rgba(0,107,143,0.12)'}, ${isDark ? 'rgba(123,104,238,0.2)' : 'rgba(123,104,238,0.08)'})`,
                }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(8px)',
                  }}>
                  <Play size={22} className={isDark ? 'text-white' : 'text-teen-ocean'} fill="currentColor" fillOpacity={0.3} />
                </div>
              </div>
              <h4 className="font-semibold font-teen teen-text-heading text-sm mb-1 truncate">
                {aula.titulo}
              </h4>
              <p className="text-xs teen-text-muted font-teen mb-2.5">
                {aula.instrutor}
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-teen font-semibold"
                  style={{
                    background: isDark ? 'rgba(0,107,143,0.12)' : 'rgba(0,107,143,0.08)',
                    color: isDark ? '#4DB8D4' : '#005A78',
                  }}>
                  {aula.nivel}
                </span>
                <span className="text-[10px] teen-text-muted font-teen">
                  {aula.duracao}
                </span>
              </div>
            </TeenCard>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 6: Próximo treino ═══ */}
      <div className="teen-enter-6">
        <TeenCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isDark ? 'rgba(255,107,53,0.12)' : 'rgba(255,107,53,0.08)',
              }}>
              <Target className="w-6 h-6 text-teen-energy" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold font-teen teen-text-heading text-sm">
                {t('nextTraining')}
              </h3>
              <p className="text-xs teen-text-muted font-teen mt-0.5">
                Quinta-feira, 18:00 · {currentTeen.turma.split(' - ')[0]}
              </p>
              <p className="text-xs teen-text-muted font-teen">
                {currentTeen.instrutor}
              </p>
            </div>
            <button className="px-5 py-2.5 rounded-xl text-sm font-teen font-medium transition-all duration-200 flex-shrink-0"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #006B8F, #0088B5)'
                  : 'linear-gradient(135deg, #006B8F, #0080AA)',
                color: '#FFFFFF',
                boxShadow: '0 2px 12px rgba(0,107,143,0.25)',
              }}>
              {t('checkinBtn')}
            </button>
          </div>
        </TeenCard>
      </div>

    </div>
  );
}
