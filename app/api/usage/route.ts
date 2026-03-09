// ============================================================
// GET /api/usage - Get usage quotas and alerts
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { quotaTracking } from '@/lib/subscription/services';
import type { UsageAlert } from '@/lib/subscription/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// SECURITY: service role key bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('academia_id')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    const academyId = userAcademy.academia_id;

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
