/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INTELLIGENCE — Bounded Context de IA/ML                        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Novo bounded context para predição e insights baseados em IA.  ║
 * ║                                                                 ║
 * ║  Fase 1: Churn Prediction (Rule-Based Scoring Inteligente)     ║
 * ║  Fase 2: ML Treinado com Labels Reais (futuro)                 ║
 * ║  Fase 3: Smart Promotion + Feedback Classification (futuro)    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ── Models ─────────────────────────────────────────────────────────
export type {
  ChurnFeatureVector,
  ChurnPrediction,
  ChurnFactor,
  ChurnRiskLevel,
  Recommendation,
  DataQuality,
} from './models/churn-score';

export type {
  RiskFactorType,
  RiskLevel,
  RiskFactorDefinition,
} from './models/risk-factors';
export {
  DEFAULT_RISK_FACTORS,
  RISK_LEVEL_MULTIPLIERS,
} from './models/risk-factors';

// ── Engine ─────────────────────────────────────────────────────────
export { predictChurn } from './engine/churn-engine';
export { resolveWeights, CHURN_LEVEL_THRESHOLDS } from './engine/weights';
