/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SUPER ADMIN HEALTH PROJECTOR — ViewModel do Super Admin        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Pure function. Zero side effects. Zero fetch.                  ║
 * ║                                                                 ║
 * ║  Agrega dados de TODAS as academias para visao de plataforma.   ║
 * ║  Top/bottom academias, saude geral, metricas de IA.             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ════════════════════════════════════════════════════════════════════
// VIEW MODEL
// ════════════════════════════════════════════════════════════════════

export interface SuperAdminHealthVM {
  platformHealth: {
    totalAcademies: number;
    totalMembers: number;
    avgHealthScore: number;
    healthDistribution: {
      healthy: number;   // score >= 70
      attention: number; // score 40-69
      critical: number;  // score < 40
    };
  };
  topAcademies: {
    id: string;
    name: string;
    score: number;
    trend: string;
  }[];
  atRiskAcademies: {
    id: string;
    name: string;
    score: number;
    issues: string[];
  }[];
  aiPlatformMetrics: {
    totalPredictions: number;
    avgAccuracy: number;
    topInsightCategory: string;
    platformChurnRate: number;
  };
}

// ════════════════════════════════════════════════════════════════════
// INPUT TYPE
// ════════════════════════════════════════════════════════════════════

export interface AcademyHealthData {
  academyId: string;
  academyName: string;

  /** Health score 0-100 */
  healthScore: number;

  /** Total active members */
  totalMembers: number;

  /** Retention rate 0-100 */
  retentionRate: number;

  /** Average engagement score 0-100 */
  avgEngagement: number;

  /** Churn count in last 30 days */
  recentChurnCount: number;

  /** Total predictions generated */
  predictionsGenerated: number;

  /** Average confidence of predictions */
  avgPredictionConfidence: number;

  /** Trend direction */
  trend: 'rising' | 'stable' | 'declining';

  /** Top risk factors for this academy */
  topRiskFactors: string[];
}

// ════════════════════════════════════════════════════════════════════
// MAIN PROJECTOR
// ════════════════════════════════════════════════════════════════════

export function projectSuperAdminHealth(
  academyData: AcademyHealthData[],
): SuperAdminHealthVM {
  return {
    platformHealth: buildPlatformHealth(academyData),
    topAcademies: buildTopAcademies(academyData),
    atRiskAcademies: buildAtRiskAcademies(academyData),
    aiPlatformMetrics: buildAIPlatformMetrics(academyData),
  };
}

// ════════════════════════════════════════════════════════════════════
// PLATFORM HEALTH
// ════════════════════════════════════════════════════════════════════

function buildPlatformHealth(
  academyData: AcademyHealthData[],
): SuperAdminHealthVM['platformHealth'] {
  if (academyData.length === 0) {
    return {
      totalAcademies: 0,
      totalMembers: 0,
      avgHealthScore: 0,
      healthDistribution: { healthy: 0, attention: 0, critical: 0 },
    };
  }

  const totalAcademies = academyData.length;
  const totalMembers = academyData.reduce((sum, a) => sum + a.totalMembers, 0);

  // Weighted average health score (by member count)
  const totalWeightedScore = academyData.reduce(
    (sum, a) => sum + a.healthScore * a.totalMembers,
    0,
  );
  const avgHealthScore = totalMembers > 0
    ? Math.round(totalWeightedScore / totalMembers)
    : 0;

  // Health distribution
  const healthy = academyData.filter(a => a.healthScore >= 70).length;
  const critical = academyData.filter(a => a.healthScore < 40).length;
  const attention = totalAcademies - healthy - critical;

  return {
    totalAcademies,
    totalMembers,
    avgHealthScore,
    healthDistribution: { healthy, attention, critical },
  };
}

// ════════════════════════════════════════════════════════════════════
// TOP ACADEMIES
// ════════════════════════════════════════════════════════════════════

function buildTopAcademies(
  academyData: AcademyHealthData[],
): SuperAdminHealthVM['topAcademies'] {
  const trendMap: Record<string, string> = {
    rising: 'Em alta',
    stable: 'Estavel',
    declining: 'Em queda',
  };

  return [...academyData]
    .sort((a, b) => b.healthScore - a.healthScore)
    .slice(0, 10)
    .map(a => ({
      id: a.academyId,
      name: a.academyName,
      score: a.healthScore,
      trend: trendMap[a.trend] ?? 'Estavel',
    }));
}

// ════════════════════════════════════════════════════════════════════
// AT-RISK ACADEMIES
// ════════════════════════════════════════════════════════════════════

function buildAtRiskAcademies(
  academyData: AcademyHealthData[],
): SuperAdminHealthVM['atRiskAcademies'] {
  return academyData
    .filter(a => a.healthScore < 60)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 10)
    .map(a => {
      const issues: string[] = [];

      if (a.retentionRate < 60) {
        issues.push(`Retencao baixa: ${a.retentionRate}%`);
      }
      if (a.avgEngagement < 50) {
        issues.push(`Engajamento baixo: ${a.avgEngagement}/100`);
      }
      if (a.recentChurnCount > a.totalMembers * 0.1) {
        issues.push(`Evasao alta: ${a.recentChurnCount} nos ultimos 30 dias`);
      }
      if (a.trend === 'declining') {
        issues.push('Tendencia de queda');
      }
      if (a.topRiskFactors.length > 0) {
        issues.push(`Fator principal: ${a.topRiskFactors[0]}`);
      }

      if (issues.length === 0) {
        issues.push('Saude geral abaixo do esperado');
      }

      return {
        id: a.academyId,
        name: a.academyName,
        score: a.healthScore,
        issues,
      };
    });
}

// ════════════════════════════════════════════════════════════════════
// AI PLATFORM METRICS
// ════════════════════════════════════════════════════════════════════

function buildAIPlatformMetrics(
  academyData: AcademyHealthData[],
): SuperAdminHealthVM['aiPlatformMetrics'] {
  const totalPredictions = academyData.reduce(
    (sum, a) => sum + a.predictionsGenerated,
    0,
  );

  // Average accuracy (confidence proxy)
  const confidences = academyData
    .filter(a => a.avgPredictionConfidence > 0)
    .map(a => a.avgPredictionConfidence);
  const avgAccuracy = confidences.length > 0
    ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100
    : 0;

  // Top insight category from risk factors
  const factorCounts: Record<string, number> = {};
  for (const academy of academyData) {
    for (const factor of academy.topRiskFactors) {
      factorCounts[factor] = (factorCounts[factor] ?? 0) + 1;
    }
  }
  const topFactor = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  // Platform churn rate
  const totalMembers = academyData.reduce((sum, a) => sum + a.totalMembers, 0);
  const totalChurn = academyData.reduce((sum, a) => sum + a.recentChurnCount, 0);
  const platformChurnRate = totalMembers > 0
    ? Math.round((totalChurn / totalMembers) * 10000) / 100
    : 0;

  return {
    totalPredictions,
    avgAccuracy,
    topInsightCategory: topFactor,
    platformChurnRate,
  };
}
