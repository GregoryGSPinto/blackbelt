// ============================================================
// GET /api/usage - Get usage quotas and alerts
// ============================================================

import { NextResponse } from 'next/server';
import { quotaTracking } from '@/lib/subscription/services';
import type { UsageAlert } from '@/lib/subscription/types';
import { withBillingManagerAccess } from '@/lib/api/access-context';

export async function GET(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);
    const academyId = membership.academy_id;

    // Get quotas
    const quotas = await quotaTracking.getUsage(academyId);

    // Generate alerts
    const alerts: UsageAlert[] = [];
    quotas.forEach(quota => {
      const percentage = (quota.used_amount / quota.included_amount) * 100;
      
      if (percentage >= 100) {
        alerts.push({
          metric_type: quota.metric_type,
          threshold: 100,
          current_usage: quota.used_amount,
          limit: quota.included_amount,
          message: `Você atingiu 100% da quota de ${formatMetricName(quota.metric_type)}. Overages estão sendo cobrados.`
        });
      } else if (percentage >= 95) {
        alerts.push({
          metric_type: quota.metric_type,
          threshold: 95,
          current_usage: quota.used_amount,
          limit: quota.included_amount,
          message: `Você atingiu 95% da quota de ${formatMetricName(quota.metric_type)}.`
        });
      } else if (percentage >= 80) {
        alerts.push({
          metric_type: quota.metric_type,
          threshold: 80,
          current_usage: quota.used_amount,
          limit: quota.included_amount,
          message: `Você atingiu 80% da quota de ${formatMetricName(quota.metric_type)}.`
        });
      }
    });

    // Get forecast
    const forecast = await quotaTracking.forecastUsage(academyId);

    // Calculate projected overage
    const projectedOverage = forecast.reduce((sum, f) => {
      const quota = quotas.find(q => q.metric_type === f.metricType);
      if (!quota) return sum;
      const projectedOver = Math.max(0, f.projected - quota.included_amount);
      return sum + (projectedOver * quota.overage_rate);
    }, 0);

    return NextResponse.json({
      quotas,
      alerts,
      forecast: {
        projectedOverage: Math.round(projectedOverage * 100) / 100,
        confidence: forecast.length > 0 
          ? forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length 
          : 0
      }
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    console.error('[Usage API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatMetricName(metric: string): string {
  const names: Record<string, string> = {
    custom_reports: 'Relatórios Customizados',
    api_requests: 'Requisições API',
    storage_gb: 'Armazenamento',
    staff_users: 'Usuários Staff',
    history_months: 'Histórico de Dados'
  };
  return names[metric] || metric;
}
