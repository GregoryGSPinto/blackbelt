/**
 * Financial Service — Pagamentos, Faturas e Métricas — FAIL-SAFE
 *
 * PRINCÍPIO: Nunca quebra a UI, sempre retorna dados válidos
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface Fatura {
  id: string;
  academiaId: string;
  alunoId?: string;
  descricao: string;
  valor: number; // em centavos
  vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  dataPagamento?: string;
  metodoPagamento?: 'cartao' | 'pix' | 'boleto' | 'dinheiro';
  createdAt: string;
}

export interface Pagamento {
  id: string;
  faturaId: string;
  valor: number;
  metodo: 'cartao' | 'pix' | 'boleto' | 'dinheiro';
  status: 'aprovado' | 'pendente' | 'recusado';
  data: string;
  gateway?: string;
}

export interface PlanoAssinatura {
  id: string;
  nome: string;
  descricao: string;
  precoMensal: number; // em centavos
  precoAnual: number; // em centavos
  recursos: string[];
  popular?: boolean;
}

export interface MetricasFinanceiras {
  faturamentoMensal: number;
  faturamentoAnual: number;
  inadimplencia: number; // percentual
  ticketMedio: number;
  totalAlunosAtivos: number;
  totalAlunosInadimplentes: number;
  comparativoMesAnterior: {
    faturamento: number; // percentual
    alunos: number; // percentual
  };
}

// ============================================================================
// FALLBACKS
// ============================================================================

const emptyFatura: Fatura = {
  id: '',
  academiaId: '',
  descricao: 'Fatura',
  valor: 0,
  vencimento: new Date().toISOString(),
  status: 'pendente',
  createdAt: new Date().toISOString(),
};

const emptyPlano: PlanoAssinatura = {
  id: '',
  nome: 'Plano Básico',
  descricao: '',
  precoMensal: 0,
  precoAnual: 0,
  recursos: [],
};

const emptyMetricas: MetricasFinanceiras = {
  faturamentoMensal: 0,
  faturamentoAnual: 0,
  inadimplencia: 0,
  ticketMedio: 0,
  totalAlunosAtivos: 0,
  totalAlunosInadimplentes: 0,
  comparativoMesAnterior: {
    faturamento: 0,
    alunos: 0,
  },
};

// ============================================================================
// MOCK HELPERS
// ============================================================================

async function getMock() {
  // Retorna dados de exemplo estruturados
  return {
    faturas: [
      { ...emptyFatura, id: '1', descricao: 'Mensalidade Março', valor: 14900, status: 'pago' as const },
      { ...emptyFatura, id: '2', descricao: 'Mensalidade Abril', valor: 14900, status: 'pendente' as const },
    ],
    planos: [
      { ...emptyPlano, id: '1', nome: 'Start', precoMensal: 14900, precoAnual: 149000 },
      { ...emptyPlano, id: '2', nome: 'Medium', precoMensal: 19900, precoAnual: 199000 },
      { ...emptyPlano, id: '3', nome: 'Pro', precoMensal: 27900, precoAnual: 279000 },
    ],
  };
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

export async function getFaturas(academiaId: string, status?: Fatura['status']): Promise<Fatura[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    let faturas = m.faturas.map(f => ({ ...f, academiaId }));
    if (status) {
      faturas = faturas.filter(f => f.status === status);
    }
    return faturas;
  }
  
  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const { data } = await apiClient.get<Fatura[]>(`/financial/faturas/${academiaId}?${params}`);
    return data || [];
  } catch (err) {
    logger.error('[financial.service]', 'getFaturas failed', err);
    return [];
  }
}

export async function getFaturaById(id: string): Promise<Fatura> {
  if (useMock()) {
    await mockDelay(100);
    const m = await getMock();
    return m.faturas.find(f => f.id === id) || { ...emptyFatura, id };
  }
  
  try {
    const { data } = await apiClient.get<Fatura>(`/financial/faturas/detail/${id}`);
    return data || { ...emptyFatura, id };
  } catch (err) {
    logger.error('[financial.service]', 'getFaturaById failed', err);
    return { ...emptyFatura, id };
  }
}

export async function criarFatura(fatura: Omit<Fatura, 'id' | 'createdAt'>): Promise<Fatura> {
  if (useMock()) {
    await mockDelay(300);
    return {
      ...emptyFatura,
      ...fatura,
      id: `fat_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }
  
  try {
    const { data } = await apiClient.post<Fatura>('/financial/faturas', fatura);
    return data || { ...emptyFatura, ...fatura };
  } catch (err) {
    logger.error('[financial.service]', 'criarFatura failed', err);
    return { ...emptyFatura, ...fatura };
  }
}

export async function registrarPagamento(faturaId: string, pagamento: Omit<Pagamento, 'id' | 'faturaId' | 'data'>): Promise<Pagamento> {
  if (useMock()) {
    await mockDelay(500);
    return {
      id: `pay_${Date.now()}`,
      faturaId,
      ...pagamento,
      data: new Date().toISOString(),
    };
  }
  
  try {
    const { data } = await apiClient.post<Pagamento>(`/financial/pagamentos/${faturaId}`, pagamento);
    return data || { id: '', faturaId, ...pagamento, data: new Date().toISOString() };
  } catch (err) {
    logger.error('[financial.service]', 'registrarPagamento failed', err);
    return { id: '', faturaId, ...pagamento, data: new Date().toISOString() };
  }
}

export async function getPlanos(): Promise<PlanoAssinatura[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.planos;
  }
  
  try {
    const { data } = await apiClient.get<PlanoAssinatura[]>('/financial/planos');
    return data || [];
  } catch (err) {
    logger.error('[financial.service]', 'getPlanos failed', err);
    return [];
  }
}

export async function getPlanoById(id: string): Promise<PlanoAssinatura> {
  if (useMock()) {
    await mockDelay(100);
    const m = await getMock();
    return m.planos.find(p => p.id === id) || { ...emptyPlano, id };
  }
  
  try {
    const { data } = await apiClient.get<PlanoAssinatura>(`/financial/planos/${id}`);
    return data || { ...emptyPlano, id };
  } catch (err) {
    logger.error('[financial.service]', 'getPlanoById failed', err);
    return { ...emptyPlano, id };
  }
}

export async function getMetricasFinanceiras(academiaId: string): Promise<MetricasFinanceiras> {
  if (useMock()) {
    await mockDelay();
    return {
      ...emptyMetricas,
      faturamentoMensal: 150000,
      faturamentoAnual: 1800000,
      inadimplencia: 5.2,
      ticketMedio: 14900,
      totalAlunosAtivos: 120,
      totalAlunosInadimplentes: 6,
      comparativoMesAnterior: {
        faturamento: 12.5,
        alunos: 8.3,
      },
    };
  }
  
  try {
    const { data } = await apiClient.get<MetricasFinanceiras>(`/financial/metricas/${academiaId}`);
    return data || emptyMetricas;
  } catch (err) {
    logger.error('[financial.service]', 'getMetricasFinanceiras failed', err);
    return emptyMetricas;
  }
}

export async function gerarRelatorioMensal(academiaId: string, mes: string, ano: string): Promise<{ url: string; filename: string }> {
  if (useMock()) {
    await mockDelay(1000);
    return {
      url: '#',
      filename: `relatorio-${mes}-${ano}.pdf`,
    };
  }
  
  try {
    const { data } = await apiClient.get<{ url: string; filename: string }>(`/financial/relatorio/${academiaId}?mes=${mes}&ano=${ano}`);
    return data || { url: '#', filename: 'relatorio.pdf' };
  } catch (err) {
    logger.error('[financial.service]', 'gerarRelatorioMensal failed', err);
    return { url: '#', filename: 'relatorio.pdf' };
  }
}
