/**
 * PDV Service — Ponto de Venda + Estoque — FAIL-SAFE
 *
 * Retorna dados mock automaticamente se API não estiver implementada (501)
 * ou qualquer outro erro ocorrer.
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { VendaBalcao, ProdutoEstoque, MovimentoEstoque, ContaAluno, ItemVenda, FormaPagamentoPDV } from '@/lib/api/contracts';

export type { VendaBalcao, ProdutoEstoque, MovimentoEstoque, ContaAluno, ItemVenda, FormaPagamentoPDV };

async function getMock() {
  return import('@/lib/__mocks__/pdv.mock');
}

/** Fallback silencioso para mock quando API falhar */
async function withMockFallback<T>(
  operation: () => Promise<T>,
  mockGetter: (m: any) => T | Promise<T>,
  endpoint: string
): Promise<T> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return await mockGetter(m);
  }

  try {
    return await operation();
  } catch (err) {
    const status = (err as any)?.status;
    logger.warn(`[PDVService] API ${endpoint} falhou (${status || 'error'}), usando mock`);
    await mockDelay(200);
    const m = await getMock();
    return await mockGetter(m);
  }
}

export async function getProdutos(): Promise<ProdutoEstoque[]> {
  return withMockFallback(
    () => apiClient.get<ProdutoEstoque[]>('/pdv/estoque').then(r => r.data),
    (m) => [...m.PRODUTOS],
    '/pdv/estoque'
  );
}

export async function getVendas(): Promise<VendaBalcao[]> {
  return withMockFallback(
    () => apiClient.get<VendaBalcao[]>('/pdv/vendas').then(r => r.data),
    (m) => [...m.VENDAS].sort((a: VendaBalcao, b: VendaBalcao) => b.data.localeCompare(a.data)),
    '/pdv/vendas'
  );
}

export async function registrarVenda(itens: ItemVenda[], clienteId?: string, clienteNome?: string, formaPagamento?: FormaPagamentoPDV, desconto?: number): Promise<VendaBalcao> {
  return withMockFallback(
    () => apiClient.post<VendaBalcao>('/pdv/venda', { itens, clienteId, clienteNome, formaPagamento, desconto }).then(r => r.data),
    async (m) => m.registrarVendaMock(itens, clienteId, clienteNome, formaPagamento, desconto),
    '/pdv/venda'
  );
}

export async function getMovimentos(): Promise<MovimentoEstoque[]> {
  return withMockFallback(
    () => apiClient.get<MovimentoEstoque[]>('/pdv/estoque/movimentos').then(r => r.data),
    (m) => [...m.MOVIMENTOS].sort((a: MovimentoEstoque, b: MovimentoEstoque) => b.data.localeCompare(a.data)),
    '/pdv/estoque/movimentos'
  );
}

export async function getContas(): Promise<ContaAluno[]> {
  return withMockFallback(
    () => apiClient.get<ContaAluno[]>('/pdv/contas').then(r => r.data),
    (m) => [...m.CONTAS],
    '/pdv/contas'
  );
}

export interface PDVStats {
  vendasHoje: number;
  receitaHoje: number;
  vendasSemana: number;
  receitaSemana: number;
  produtosBaixoEstoque: number;
  produtosSemEstoque: number;
}

export async function getStats(): Promise<PDVStats> {
  return withMockFallback(
    () => apiClient.get<PDVStats>('/pdv/stats').then(r => r.data),
    (m) => m.getStats(),
    '/pdv/stats'
  );
}
