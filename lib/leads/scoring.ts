import type { LeadScoreCategory } from '@/lib/leads/types';

export interface LeadScoreInput {
  current_students?: number | null;
  monthly_revenue?: number | null;
  modalities?: string[] | null;
  city?: string | null;
  state?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  address?: string | null;
  responsible_name?: string | null;
}

export interface LeadScoreBreakdown {
  score: number;
  category: LeadScoreCategory;
  pillars: {
    students: number;
    revenue: number;
    modalities: number;
    citySize: number;
    completeness: number;
  };
}

const TIER_1_CITIES = new Set([
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Brasília',
  'Curitiba',
  'Porto Alegre',
  'Salvador',
  'Fortaleza',
  'Recife',
  'Campinas',
]);

const TIER_2_STATES = new Set(['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'DF']);
const STRATEGIC_MODALITIES = ['bjj', 'jiu-jitsu', 'muay thai', 'mma', 'boxe'];

export function categorizeLeadScore(score: number): LeadScoreCategory {
  if (score >= 75) return 'HOT';
  if (score >= 45) return 'WARM';
  return 'COLD';
}

export function calculateLeadScore(input: LeadScoreInput): LeadScoreBreakdown {
  const students = input.current_students ?? 0;
  const revenue = input.monthly_revenue ?? 0;
  const modalities = (input.modalities ?? []).map((item) => item.toLowerCase());

  const studentsPoints =
    students >= 300 ? 30 :
    students >= 180 ? 24 :
    students >= 90 ? 18 :
    students >= 40 ? 10 :
    4;

  const revenuePoints =
    revenue >= 80_000 ? 25 :
    revenue >= 40_000 ? 20 :
    revenue >= 20_000 ? 14 :
    revenue >= 10_000 ? 8 :
    3;

  let modalitiesPoints =
    modalities.length >= 4 ? 15 :
    modalities.length >= 2 ? 11 :
    modalities.length === 1 ? 7 :
    0;

  if (modalities.some((item) => STRATEGIC_MODALITIES.includes(item))) {
    modalitiesPoints = Math.min(modalitiesPoints + 5, 15);
  }

  const cityPoints = TIER_1_CITIES.has(input.city ?? '')
    ? 15
    : TIER_2_STATES.has(input.state ?? '')
      ? 10
      : 5;

  const completenessFields = [
    input.email,
    input.phone,
    input.website,
    input.instagram,
    input.address,
    input.responsible_name,
  ];
  let completenessPoints = completenessFields.filter(Boolean).length * 2;
  if (input.city && input.state) completenessPoints += 3;
  completenessPoints = Math.min(completenessPoints, 15);

  const score = Math.min(
    studentsPoints + revenuePoints + modalitiesPoints + cityPoints + completenessPoints,
    100,
  );

  return {
    score,
    category: categorizeLeadScore(score),
    pillars: {
      students: studentsPoints,
      revenue: revenuePoints,
      modalities: modalitiesPoints,
      citySize: cityPoints,
      completeness: completenessPoints,
    },
  };
}
