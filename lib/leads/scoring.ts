/**
 * Lead Scoring Module - BlackBelt
 * Calcula o score de qualificação de leads baseado em múltiplos critérios
 */

export interface LeadScoringData {
  current_students: number;
  monthly_revenue: number;
  modalities: string[];
  city: string;
  has_phone?: boolean;
  has_email?: boolean;
}

export interface ScoringWeights {
  students: number;
  revenue: number;
  modalities: number;
  city: number;
  completeness: number;
}

// Pesos padrão
const DEFAULT_WEIGHTS: ScoringWeights = {
  students: 30,
  revenue: 25,
  modalities: 20,
  city: 15,
  completeness: 10,
};

// Cidades premium (maior potencial)
const PREMIUM_CITIES = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Curitiba',
  'Porto Alegre',
  'Brasília',
  'Salvador',
  'Fortaleza',
  'Recife',
  'Goiânia',
];

// Modalidades premium (mais lucrativas)
const PREMIUM_MODALITIES = ['bjj', 'muay_thai', 'mma', 'boxing'];

/**
 * Calcula o score de um lead baseado nos critérios configurados
 */
export function calculateLeadScore(
  data: LeadScoringData,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  let score = 0;

  // 1. Score por quantidade de alunos (0-30 pontos)
  score += calculateStudentsScore(data.current_students, weights.students);

  // 2. Score por faturamento (0-25 pontos)
  score += calculateRevenueScore(data.monthly_revenue, weights.revenue);

  // 3. Score por modalidades (0-20 pontos)
  score += calculateModalitiesScore(data.modalities, weights.modalities);

  // 4. Score por cidade (0-15 pontos)
  score += calculateCityScore(data.city, weights.city);

  // 5. Score por completude dos dados (0-10 pontos)
  score += calculateCompletenessScore(data, weights.completeness);

  // Garantir que o score máximo seja 100
  return Math.min(Math.round(score), 100);
}

/**
 * Calcula score baseado na quantidade de alunos
 */
function calculateStudentsScore(students: number, maxPoints: number): number {
  if (students >= 200) return maxPoints;
  if (students >= 100) return maxPoints * 0.7;
  if (students >= 50) return maxPoints * 0.4;
  if (students >= 20) return maxPoints * 0.2;
  return maxPoints * 0.1;
}

/**
 * Calcula score baseado no faturamento mensal
 */
function calculateRevenueScore(revenue: number, maxPoints: number): number {
  if (revenue >= 50000) return maxPoints;
  if (revenue >= 30000) return maxPoints * 0.8;
  if (revenue >= 20000) return maxPoints * 0.6;
  if (revenue >= 10000) return maxPoints * 0.4;
  if (revenue >= 5000) return maxPoints * 0.2;
  return maxPoints * 0.1;
}

/**
 * Calcula score baseado nas modalidades
 */
function calculateModalitiesScore(modalities: string[], maxPoints: number): number {
  if (!modalities || modalities.length === 0) return 0;

  const normalizedModalities = modalities.map(m => m.toLowerCase().replace(/\s+/g, '_'));
  
  // Verifica se tem modalidades premium
  const hasPremium = normalizedModalities.some(m => 
    PREMIUM_MODALITIES.includes(m)
  );

  // Verifica diversidade
  const diversity = Math.min(modalities.length, 3); // Máximo 3 pontos por diversidade

  if (hasPremium && diversity >= 2) return maxPoints;
  if (hasPremium) return maxPoints * 0.8;
  if (diversity >= 2) return maxPoints * 0.6;
  return maxPoints * 0.4;
}

/**
 * Calcula score baseado na cidade
 */
function calculateCityScore(city: string, maxPoints: number): number {
  if (!city) return 0;
  
  const normalizedCity = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const isPremium = PREMIUM_CITIES.some(premium => 
    normalizedCity.includes(premium.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );

  return isPremium ? maxPoints : maxPoints * 0.5;
}

/**
 * Calcula score por completude dos dados
 */
function calculateCompletenessScore(data: LeadScoringData, maxPoints: number): number {
  let completedFields = 0;
  const totalFields = 5;

  if (data.current_students > 0) completedFields++;
  if (data.monthly_revenue > 0) completedFields++;
  if (data.modalities && data.modalities.length > 0) completedFields++;
  if (data.city) completedFields++;
  if (data.has_phone && data.has_email) completedFields++;

  return (completedFields / totalFields) * maxPoints;
}

/**
 * Classifica o lead baseado no score
 */
export function classifyLead(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

/**
 * Retorna recomendação de ação baseada no score
 */
export function getLeadRecommendation(score: number): string {
  if (score >= 80) {
    return 'Lead quente - Priorizar contato imediato e proposta personalizada';
  }
  if (score >= 50) {
    return 'Lead morno - Seguir sequência de nutrição padrão';
  }
  return 'Lead frio - Adicionar à lista de nutrição de longo prazo';
}

/**
 * Calcula score em tempo real para preview
 */
export function calculatePreviewScore(data: Partial<LeadScoringData>): number {
  return calculateLeadScore({
    current_students: data.current_students || 0,
    monthly_revenue: data.monthly_revenue || 0,
    modalities: data.modalities || [],
    city: data.city || '',
    has_phone: data.has_phone,
    has_email: data.has_email,
  });
}
