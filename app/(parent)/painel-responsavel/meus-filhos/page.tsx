'use client';

import { useTranslations } from 'next-intl';
import { User, Calendar, Award, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
import { useParent } from '@/contexts/ParentContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function MeusFilhosPage() {
  const t = useTranslations('parent.children');
  const ts = useTranslations('common.status');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { filhos } = useParent();

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
    <div className="space-y-8 animate-fade-in px-4 md:px-0">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2">{t('title')}</h2>
        <p className="text-white/60 text-lg">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filhos.map((filho) => (
          <div
            key={filho.id}
            className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover-card"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl border-4 border-white/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                {filho.avatar}
              </div>
              <h3 className="font-semibold text-white text-xl text-center">{filho.nome}</h3>
              <p className="text-white/60 text-sm mt-1">
                {filho.idade} anos • {filho.categoria === 'teen' ? t('teenLabel') : t('kidsLabel')}
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <span className={`px-4 py-2 rounded-xl font-medium text-sm border ${getStatusColor(filho.status)}`}>
                {getStatusText(filho.status)}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Award size={18} className="text-white/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-white/60">{t('level')}</p>
                  <p className="font-semibold text-white">{filho.nivel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <User size={18} className="text-white/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-white/60">{t('professor')}</p>
                  <p className="font-semibold text-white text-sm">{filho.instrutor}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <Calendar size={18} className="text-white/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-white/60">{t('className')}</p>
                  <p className="font-semibold text-white text-sm">{filho.turma.split(' - ')[0]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <TrendingUp size={18} className="text-white/60 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-white/60">{t('monthAttendance')}</p>
                  <p className="font-semibold text-green-400">{filho.progresso.presenca30dias}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href={`/painel-responsavel/meus-filhos/${filho.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all duration-200 hover:scale-105"
              >
                <Eye size={18} />
                {t('viewFullProfile')}
              </Link>

              <Link
                href={`/painel-responsavel/checkin?kid=${filho.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 border border-white/20"
              >
                {t('doCheckin')}
              </Link>
            </div>
          </div>
        ))}
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
