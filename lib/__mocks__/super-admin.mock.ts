/**
 * Mock Data — Super Admin Dashboard
 */

// ============================================================
// TYPES
// ============================================================

export type PlanoAcademia = 'BASICO' | 'PRO' | 'ENTERPRISE';
export type StatusAcademia = 'ATIVA' | 'INADIMPLENTE' | 'BLOQUEADA';

export interface MockAcademy {
  id: string;
  nome: string;
  plano: PlanoAcademia;
  status: StatusAcademia;
  totalAlunos: number;
  totalProfessores: number;
  mrr: number;
  cidade: string;
  estado: string;
  criadoEm: string;
  ultimoPagamento: string;
  email: string;
  telefone: string;
}

export interface MockDashboardMetrics {
  mrr: number;
  mrrCrescimento: number;
  totalAcademias: number;
  academiasAtivas: number;
  academiasInadimplentes: number;
  academiasBloqueadas: number;
  ticketMedio: number;
  totalAlunos: number;
  totalProfessores: number;
  totalVideos: number;
  totalAcessosMes: number;
  crescimentoAlunos: number;
}

export interface MockRevenueByPlan {
  plano: string;
  academias: number;
  receita: number;
  percentual: number;
}

export interface MockMonthlyData {
  mes: string;
  receita: number;
  alunos: number;
}

export interface MockFinancialData {
  receitaTotal: number;
  receitaMesAnterior: number;
  crescimentoReceita: number;
  churnRate: number;
  ltv: number;
  cac: number;
  paybackMonths: number;
  ticketMedio: number;
  inadimplencia: number;
  pagamentos: MockPaymentHistory[];
}

export interface MockPaymentHistory {
  id: string;
  academiaId: string;
  academiaNome: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente' | 'atrasado';
  metodo: 'pix' | 'cartao' | 'boleto';
}

// ============================================================
// ACADEMIAS
// ============================================================

export const MOCK_ACADEMIES: MockAcademy[] = [
  {
    id: 'acad-001',
    nome: 'Academia Força & Honra',
    plano: 'PRO',
    status: 'ATIVA',
    totalAlunos: 45,
    totalProfessores: 3,
    mrr: 4500,
    cidade: 'São Paulo',
    estado: 'SP',
    criadoEm: '2024-03-15',
    ultimoPagamento: '2026-02-01',
    email: 'contato@forcaehonra.com.br',
    telefone: '(11) 99999-0001',
  },
  {
    id: 'acad-002',
    nome: 'CT Warriors',
    plano: 'ENTERPRISE',
    status: 'ATIVA',
    totalAlunos: 120,
    totalProfessores: 6,
    mrr: 12000,
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    criadoEm: '2024-01-10',
    ultimoPagamento: '2026-02-01',
    email: 'admin@ctwarriors.com.br',
    telefone: '(21) 99999-0002',
  },
  {
    id: 'acad-003',
    nome: 'Dojo Samurai Kids',
    plano: 'BASICO',
    status: 'INADIMPLENTE',
    totalAlunos: 18,
    totalProfessores: 2,
    mrr: 900,
    cidade: 'Curitiba',
    estado: 'PR',
    criadoEm: '2024-08-20',
    ultimoPagamento: '2025-12-01',
    email: 'dojo@samuraikids.com.br',
    telefone: '(41) 99999-0003',
  },
  {
    id: 'acad-004',
    nome: 'Studio Vitória',
    plano: 'PRO',
    status: 'ATIVA',
    totalAlunos: 62,
    totalProfessores: 3,
    mrr: 6200,
    cidade: 'Belo Horizonte',
    estado: 'MG',
    criadoEm: '2024-05-05',
    ultimoPagamento: '2026-02-01',
    email: 'contato@studiovitoria.com.br',
    telefone: '(31) 99999-0004',
  },
  {
    id: 'acad-005',
    nome: 'Fight House',
    plano: 'BASICO',
    status: 'BLOQUEADA',
    totalAlunos: 8,
    totalProfessores: 1,
    mrr: 400,
    cidade: 'Salvador',
    estado: 'BA',
    criadoEm: '2025-01-12',
    ultimoPagamento: '2025-10-01',
    email: 'fighthouse@email.com',
    telefone: '(71) 99999-0005',
  },
];

// ============================================================
// MÉTRICAS DO DASHBOARD
// ============================================================

export const MOCK_DASHBOARD_METRICS: MockDashboardMetrics = {
  mrr: 24000,
  mrrCrescimento: 12,
  totalAcademias: 5,
  academiasAtivas: 3,
  academiasInadimplentes: 1,
  academiasBloqueadas: 1,
  ticketMedio: 4800,
  totalAlunos: 253,
  totalProfessores: 15,
  totalVideos: 342,
  totalAcessosMes: 8450,
  crescimentoAlunos: 12,
};

// ============================================================
// RECEITA POR PLANO
// ============================================================

export const MOCK_REVENUE_BY_PLAN: MockRevenueByPlan[] = [
  { plano: 'Enterprise', academias: 1, receita: 12000, percentual: 50 },
  { plano: 'Pro', academias: 2, receita: 10700, percentual: 44.6 },
  { plano: 'Básico', academias: 2, receita: 1300, percentual: 5.4 },
];

// ============================================================
// DADOS MENSAIS (12 meses)
// ============================================================

export const MOCK_MONTHLY_DATA: MockMonthlyData[] = [
  { mes: 'Mar/25', receita: 8200, alunos: 95 },
  { mes: 'Abr/25', receita: 9100, alunos: 108 },
  { mes: 'Mai/25', receita: 10500, alunos: 122 },
  { mes: 'Jun/25', receita: 11200, alunos: 135 },
  { mes: 'Jul/25', receita: 12800, alunos: 148 },
  { mes: 'Ago/25', receita: 14500, alunos: 162 },
  { mes: 'Set/25', receita: 16200, alunos: 175 },
  { mes: 'Out/25', receita: 18000, alunos: 190 },
  { mes: 'Nov/25', receita: 19500, alunos: 208 },
  { mes: 'Dez/25', receita: 20800, alunos: 220 },
  { mes: 'Jan/26', receita: 22100, alunos: 238 },
  { mes: 'Fev/26', receita: 24000, alunos: 253 },
];

// ============================================================
// DADOS FINANCEIROS DETALHADOS
// ============================================================

export const MOCK_FINANCIAL_DATA: MockFinancialData = {
  receitaTotal: 24000,
  receitaMesAnterior: 22100,
  crescimentoReceita: 8.6,
  churnRate: 2.1,
  ltv: 28800,
  cac: 350,
  paybackMonths: 2.1,
  ticketMedio: 4800,
  inadimplencia: 5.4,
  pagamentos: [
    {
      id: 'pay-001', academiaId: 'acad-001', academiaNome: 'Academia Força & Honra',
      valor: 4500, data: '2026-02-01', status: 'pago', metodo: 'pix',
    },
    {
      id: 'pay-002', academiaId: 'acad-002', academiaNome: 'CT Warriors',
      valor: 12000, data: '2026-02-01', status: 'pago', metodo: 'cartao',
    },
    {
      id: 'pay-003', academiaId: 'acad-003', academiaNome: 'Dojo Samurai Kids',
      valor: 900, data: '2026-01-01', status: 'atrasado', metodo: 'boleto',
    },
    {
      id: 'pay-004', academiaId: 'acad-004', academiaNome: 'Studio Vitória',
      valor: 6200, data: '2026-02-01', status: 'pago', metodo: 'pix',
    },
    {
      id: 'pay-005', academiaId: 'acad-005', academiaNome: 'Fight House',
      valor: 400, data: '2025-10-01', status: 'atrasado', metodo: 'boleto',
    },
    {
      id: 'pay-006', academiaId: 'acad-001', academiaNome: 'Academia Força & Honra',
      valor: 4500, data: '2026-01-01', status: 'pago', metodo: 'pix',
    },
    {
      id: 'pay-007', academiaId: 'acad-002', academiaNome: 'CT Warriors',
      valor: 12000, data: '2026-01-01', status: 'pago', metodo: 'cartao',
    },
    {
      id: 'pay-008', academiaId: 'acad-004', academiaNome: 'Studio Vitória',
      valor: 6200, data: '2026-01-01', status: 'pago', metodo: 'pix',
    },
  ],
};

// ============================================================
// TOP 5 ACADEMIAS POR ALUNOS
// ============================================================

export const MOCK_TOP_ACADEMIES = MOCK_ACADEMIES
  .sort((a, b) => b.totalAlunos - a.totalAlunos)
  .slice(0, 5)
  .map(a => ({
    nome: a.nome,
    alunos: a.totalAlunos,
    plano: a.plano,
    status: a.status,
  }));

// ============================================================
// FUNÇÕES DE MOCK PARA SERVICES
// ============================================================

export function mockGetSuperAdminStats() {
  return {
    metrics: MOCK_DASHBOARD_METRICS,
    monthlyData: MOCK_MONTHLY_DATA,
    revenueByPlan: MOCK_REVENUE_BY_PLAN,
    topAcademies: MOCK_TOP_ACADEMIES,
  };
}

export function mockGetSuperAdminAcademies() {
  return [...MOCK_ACADEMIES];
}
