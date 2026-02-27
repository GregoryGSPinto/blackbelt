/**
 * GET /api/ai/health — Health check do sistema de IA
 *
 * Auth: nenhum (public, como /api/health)
 */

import { apiOk } from '@/lib/api/route-helpers';

export async function GET() {
  const status = {
    status: 'ok',
    version: '1.0.0',
    phase: 1,
    phaseName: 'Rule-Based Churn Scoring',
    capabilities: [
      'churn_prediction',
      'risk_factor_analysis',
      'recommendation_engine',
    ],
    models: {
      churn: {
        type: 'rule_based_weighted_scoring',
        factors: 7,
        segmentAware: true,
        mlReady: false,
      },
    },
    dependencies: {
      externalML: false,
      gpu: false,
      additionalPackages: [],
    },
    timestamp: new Date().toISOString(),
  };

  return apiOk(status);
}
