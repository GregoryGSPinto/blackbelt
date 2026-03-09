'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, ArrowUpRight, AlertCircle, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface SubscriptionData {
  subscription: {
    plan: { name: string; student_limit: number | null; };
    student_limit_current: number;
    billing_cycle: 'monthly' | 'annual';
    current_period_ends_at: string;
    student_limit_status: {
      current: number;
      limit: number | null;
      percentage: number;
      exceeded: boolean;
      approaching: boolean;
    };
  };
  upcomingInvoice: {
    subscriptionAmount: number;
    addonsAmount: number;
    overagesAmount: number;
    totalAmount: number;
  } | null;
}

interface SubscriptionCardProps {
  academyId: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function SubscriptionCard({ academyId }: SubscriptionCardProps) {
  const t = useTranslations('subscription');
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscription');

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [academyId]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { subscription, upcomingInvoice } = data;
  const status = subscription.student_limit_status;
  const plan = subscription.plan;

  // Determine progress color
  const getProgressColor = () => {
    if (status.exceeded) return 'bg-red-500';
    if (status.percentage >= 95) return 'bg-amber-500';
    if (status.percentage >= 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStatusIcon = () => {
    if (status.exceeded) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (status.approaching) return <AlertCircle className="w-5 h-5 text-amber-500" />;
    return <Check className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {subscription.billing_cycle === 'annual' ? 'Anual' : 'Mensal'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Próxima cobrança: {new Date(subscription.current_period_ends_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">
            R$ {upcomingInvoice?.totalAmount.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-muted-foreground">/mês</p>
        </div>
      </div>

      {/* Student Limit Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Alunos ativos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              <strong>{status.current}</strong>
              {plan.student_limit && <span className="text-muted-foreground"> / {plan.student_limit}</span>}
            </span>
            {getStatusIcon()}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(status.percentage, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${getProgressColor()}`}
          />
        </div>
        
        {/* Warning messages */}
        {status.exceeded && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Limite excedido! Upgrade automático pode ocorrer.
          </p>
        )}
        {!status.exceeded && status.approaching && (
          <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Próximo do limite. Considere fazer upgrade.
          </p>
        )}
      </div>

      {/* Invoice Breakdown */}
      {upcomingInvoice && (
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Assinatura</span>
            <span>R$ {upcomingInvoice.subscriptionAmount.toFixed(2)}</span>
          </div>
          {upcomingInvoice.addonsAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Add-ons</span>
              <span>R$ {upcomingInvoice.addonsAmount.toFixed(2)}</span>
            </div>
          )}
          {upcomingInvoice.overagesAmount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Overages</span>
              <span>R$ {upcomingInvoice.overagesAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Upgrade CTA */}
      {status.approaching && !status.exceeded && (
        <button className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Upgrade de plano
          <ArrowUpRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
