
'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, TrendingUp, Clock, BookOpen,
  Trophy, Target, CheckCircle, User, Edit
} from 'lucide-react';
import Link from 'next/link';
import { useParent } from '@/contexts/ParentContext';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function PerfilFilhoPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('parent.children');
  const ts = useTranslations('common.status');
  const tc = useTranslations('common.actions');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { id } = use(params);
  const { filhos } = useParent();
  const filho = filhos.find(f => f.id === id);

  if (!filho) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t('childNotFound')}</p>
          <Link href="/painel-responsavel/meus-filhos" className="text-blue-400 hover:underline">
            {t('title')}
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'EM_ATRASO': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'BLOQUEADO': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ATIVO': return ts('active');
      case 'EM_ATRASO': return ts('overdue');
      case 'BLOQUEADO': return ts('blocked');
      default: return ts('inactive');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Breadcrumb dynamicLabel={filho.nome} />
      {/* Header com Avatar */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl border-4 border-white/30">
            {filho.avatar}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">{filho.nome}</h1>
                <p className="text-white/60 text-lg">
                  {filho.idade} anos • {filho.categoria === 'teen' ? t('teenLabel') : t('kidsLabel')} • {t('level')} {filho.nivel}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className={`px-4 py-2 rounded-xl font-medium text-sm border text-center ${getStatusColor(filho.status)}`}>
                  {getStatusText(filho.status)}
                </span>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all duration-200 border border-white/20">
                  <Edit size={16} />
                  {t('editProfile')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <User size={20} className="text-white/60" />
                <div>
                  <p className="text-xs text-white/60">{t('professor')}</p>
                  <p className="font-semibold">{filho.instrutor}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <Calendar size={20} className="text-white/60" />
                <div>
                  <p className="text-xs text-white/60">{t('className')}</p>
                  <p className="font-semibold">{filho.turma.split(' - ')[0]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <Clock size={20} className="text-white/60" />
                <div>
                  <p className="text-xs text-white/60">{t('schedule')}</p>
                  <p className="font-semibold">{filho.turma.split(' - ')[1] || 'Seg/Qua 18h'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <TrendingUp size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">{t('monthAttendance')}</p>
              <p className="text-green-400" style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em' }}>{filho.progresso.presenca30dias}%</p>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              style={{ width: `${filho.progresso.presenca30dias}%` }}
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <BookOpen size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">{t('watchedSessions')}</p>
              <p className="text-blue-400" style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em' }}>{filho.progresso.sessõesAssistidas}</p>
            </div>
          </div>
          <p className="text-xs text-white/60">{t('totalCompleted')}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">{t('achievementsCount')}</p>
              <p className="text-yellow-400" style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em' }}>{filho.progresso.conquistasConquistadas}</p>
            </div>
          </div>
          <p className="text-xs text-white/60">{t('achievementsUnlocked')}</p>
        </div>
      </div>

      {/* Progresso Detalhado */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2">
          <Target size={28} />
          {t('activitySummary')}
        </h3>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t('monthlyAttendance')}</span>
              <span className="text-sm text-white/60">{filho.progresso.presenca30dias}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${filho.progresso.presenca30dias}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t('challengesDone')}</span>
              <span className="text-sm text-white/60">{filho.progresso.desafiosConcluidos} {t('challengesCompleted')}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(filho.progresso.desafiosConcluidos * 5, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{t('achievementsCount')}</span>
              <span className="text-sm text-white/60">{filho.progresso.conquistasConquistadas} {t('achievementsUnlocked')}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(filho.progresso.conquistasConquistadas * 5, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ultimas Sessoes */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-2">
          <BookOpen size={28} />
          {t('lastSessions')}
        </h3>

        <div className="space-y-3">
          {['Passagem de Guarda Basica', 'Defesa de Montada', 'Raspagem de Gancho', 'Finalizacao - Armlock'].map((aula, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <div>
                  <p className="font-semibold">{aula}</p>
                  <p className="text-xs text-white/60">{t('daysAgo', { count: index + 1 })}</p>
                </div>
              </div>
              <span className="text-xs text-white/60">12 min</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/painel-responsavel/checkin?kid=${filho.id}`}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all duration-200 hover:scale-105"
        >
          <Clock size={20} />
          {t('doCheckin')}
        </Link>

        <Link
          href="/painel-responsavel/meus-filhos"
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 border border-white/20"
        >
          {t('title')}
        </Link>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
