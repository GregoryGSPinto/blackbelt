'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { 
  BarChart3, 
  Database, 
  HardDrive, 
  Users, 
  History,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { MetricType } from '@/lib/subscription/types';

interface Quota {
  metric_type: MetricType;
  included_amount: number;
  used_amount: number;
  overage_amount: number;
  overage_charges: number;
  overage_rate: number;
}

interface UsageQuotasProps {
  academyId: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const METRIC_CONFIG: Record<MetricType, { label: string; icon: React.ReactNode; unit: string }> = {
  custom_reports: { 
    label: 'Relatórios Customizados', 
    icon: <BarChart3 className="w-4 h-4" />,
    unit: 'relatórios'
  },
  api_requests: { 
    label: 'Requisições API', 
    icon: <Database className="w-4 h-4" />,
    unit: 'req'
  },
  storage_gb: { 
    label: 'Armazenamento', 
    icon: <HardDrive className="w-4 h-4" />,
    unit: 'GB'
  },
  staff_users: { 
    label: 'Usuários Staff', 
    icon: <Users className="w-4 h-4" />,
    unit: 'usuários'
  },
  history_months: { 
    label: 'Histórico de Dados', 
    icon: <History className="w-4 h-4" />,
    unit: 'meses'
  }
};

function QuotaItem({ quota }: { quota: Quota }) {
  const config = METRIC_CONFIG[quota.metric_type];
  const percentage = Math.min((quota.used_amount / quota.included_amount) * 100, 100);
  
  const getStatusColor = () => {
    if (percentage >= 100) return 'text-red-500 bg-red-500';
    if (percentage >= 95) return 'text-amber-500 bg-amber-500';
    if (percentage >= 80) return 'text-yellow-500 bg-yellow-500';
    return 'text-emerald-500 bg-emerald-500';
  };

  const getStatusIcon = () => {
    if (percentage >= 100) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (percentage >= 80) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  };

  const colorClass = getStatusColor();

  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-muted rounded-lg">
            {config.icon}
          </div>
          <div>
            <p className="font-medium text-sm">{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {quota.included_amount} {config.unit} incluídos
            </p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      {/* Usage bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className={percentage >= 100 ? 'text-red-500 font-medium' : ''}>
            {quota.used_amount} {config.unit} usados
          </span>
          <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${colorClass.split(' ')[1]}`}
          />
        </div>
      </div>

      {/* Overage info */}
      {quota.overage_amount > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-red-500">Excedente</span>
            <span className="text-red-500 font-medium">
              {quota.overage_amount} {config.unit}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Cobrança extra</span>
            <span className="text-red-500">
              R$ {quota.overage_charges.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function UsageQuotas({ academyId }: UsageQuotasProps) {
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Array<{ metric_type: MetricType; threshold: number }>>([]);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch('/api/usage', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setQuotas(result.quotas);
          setAlerts(result.alerts);
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [academyId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <motion.div
              key={`${alert.metric_type}-${idx}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                alert.threshold === 100 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                  : alert.threshold === 95
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>
                {METRIC_CONFIG[alert.metric_type].label}: {alert.threshold}% do limite atingido
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quotas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotas.map(quota => (
          <QuotaItem key={quota.metric_type} quota={quota} />
        ))}
      </div>
    </div>
  );
}
