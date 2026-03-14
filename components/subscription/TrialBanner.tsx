'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Sparkles, 
  AlertTriangle, 

  ArrowRight,
  Gift
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TrialBannerProps {
  daysRemaining: number;
  planName: string;
  onConvert?: () => void;
}

export function TrialBanner({ daysRemaining, planName, onConvert }: TrialBannerProps) {
  const tActions = useTranslations('common.actions');
  const [dismissed, setDismissed] = useState(false);

  // Salvar no localStorage se o usuário dismissou
  useEffect(() => {
    const isDismissed = localStorage.getItem('trial_banner_dismissed');
    if (isDismissed) {
      const dismissedDate = new Date(isDismissed);
      const now = new Date();
      // Reset after 24 hours
      if (now.getTime() - dismissedDate.getTime() > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('trial_banner_dismissed');
      } else {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('trial_banner_dismissed', new Date().toISOString());
  };

  if (dismissed) return null;

  // Determinar o estado visual baseado nos dias restantes
  const getState = () => {
    if (daysRemaining <= 3) {
      return {
        variant: 'urgent' as const,
        icon: <AlertTriangle className="w-5 h-5" />,
        bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
        textColor: 'text-white',
        message: daysRemaining === 0
          ? 'Seu trial termina hoje! Após isso, o acesso será suspenso.'
          : `Faltam ${daysRemaining} dias do seu trial. Após o prazo, o acesso será suspenso.`,
      };
    }
    if (daysRemaining <= 7) {
      return {
        variant: 'warning' as const,
        icon: <Clock className="w-5 h-5" />,
        bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
        textColor: 'text-white',
        message: `Faltam ${daysRemaining} dias do seu trial`,
      };
    }
    return {
      variant: 'info' as const,
      icon: <Sparkles className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      textColor: 'text-white',
      message: `Você está no trial ${planName} - ${daysRemaining} dias restantes`,
    };
  };

  const state = getState();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${state.bgColor} ${state.textColor} rounded-xl p-4 shadow-lg mb-6`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {state.icon}
            </div>
            <div>
              <p className="font-semibold">{state.message}</p>
              <p className="text-sm opacity-90">
                Aproveite todas as funcionalidades do plano {planName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {daysRemaining <= 3 && (
              <div className="hidden sm:flex items-center gap-2 text-sm bg-white/20 px-3 py-1.5 rounded-lg">
                <Gift className="w-4 h-4" />
                <span>Setup grátis no plano anual</span>
              </div>
            )}
            
            <button
              onClick={onConvert}
              className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Assinar Agora
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors opacity-60 hover:opacity-100"
            >
              <span className="sr-only">{tActions('close')}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, (daysRemaining / 30) * 100))}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Componente de card de upgrade
interface UpgradeCardProps {
  currentPlan: string;
  recommendedPlan?: string;
  savings?: string;
}

export function UpgradeCard({ currentPlan, recommendedPlan = 'Pro', savings = '2 meses grátis' }: UpgradeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium bg-white/20 px-2 py-0.5 rounded">
              Oferta Especial
            </span>
          </div>
          <h3 className="text-xl font-bold mb-1">
            Upgrade para {recommendedPlan}
          </h3>
          <p className="text-white/80 text-sm">
            Você está no plano {currentPlan}. Ganhe mais recursos e {savings} no plano anual.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Link
          href="/assinatura/upgrade"
          className="flex-1 bg-white text-purple-600 text-center py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Ver Planos
        </Link>
        <Link
          href="/assinatura"
          className="text-white/80 hover:text-white text-sm font-medium"
        >
          Saiba mais
        </Link>
      </div>
    </motion.div>
  );
}

// Componente de limitação de trial
interface TrialLimitationProps {
  feature: string;
  current: number;
  limit: number;
  unit: string;
}

export function TrialLimitationBar({ feature, current, limit, unit }: TrialLimitationProps) {
  const percentage = Math.min((current / limit) * 100, 100);
  
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{feature}</span>
        <span className={`text-sm ${percentage >= 90 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
          {current} / {limit} {unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 90 && (
        <p className="text-xs text-red-500 mt-2">
          Você está próximo do limite. Assine para liberar mais.
        </p>
      )}
    </div>
  );
}
