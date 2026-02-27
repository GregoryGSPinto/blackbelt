/**
 * GET /api/ai/insights — Aggregated AI insights para a academia
 *
 * Auth: admin ou professor
 * Retorna: resumo de insights de IA (atualmente apenas churn)
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { membership } = await withAuth(req);

    if (!membership || !['admin', 'owner', 'professor'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a administradores e instrutores');
    }

    // For now, insights are a summary of available AI capabilities
    // In the future, this will aggregate churn + smart promotion + feedback
    const insights = {
      academyId: membership.academy_id,
      modules: {
        churnPrediction: {
          enabled: true,
          endpoint: '/api/ai/churn',
          description: 'Predição de risco de evasão de alunos',
        },
        smartPromotion: {
          enabled: false,
          endpoint: null,
          description: 'Predição de tempo para próxima graduação (Fase 3)',
        },
        feedbackClassification: {
          enabled: false,
          endpoint: null,
          description: 'Classificação automática de feedback (Fase 3)',
        },
      },
      timestamp: new Date().toISOString(),
    };

    return apiOk(insights);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
