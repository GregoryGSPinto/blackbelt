/**
 * PDV Service — Ponto de Venda + Estoque
 *
 * MOCK:  useMock() === true → __mocks__/pdv.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-065): Implementar endpoints pdv
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { VendaBalcao, ProdutoEstoque, MovimentoEstoque, ContaAluno, ItemVenda, FormaPagamentoPDV } from '@/lib/api/contracts';

export type { VendaBalcao, ProdutoEstoque, MovimentoEstoque, ContaAluno, ItemVenda, FormaPagamentoPDV };

async function getMock() {
  return import('@/lib/__mocks__/pdv.mock');
}

export async function getProdutos(): Promise<ProdutoEstoque[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.PRODUTOS];
  }
  const { data } = await apiClient.get<ProdutoEstoque[]>('/pdv/estoque');
  return data;
}

export async function getVendas(): Promise<VendaBalcao[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.VENDAS].sort((a: VendaBalcao, b: VendaBalcao) => b.data.localeCompare(a.data));
  }
  const { data } = await apiClient.get<VendaBalcao[]>('/pdv/vendas');
  return data;
}

export async function registrarVenda(itens: ItemVenda[], clienteId?: string, clienteNome?: string, formaPagamento?: FormaPagamentoPDV, desconto?: number): Promise<VendaBalcao> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getMock();
    return m.registrarVendaMock(itens, clienteId, clienteNome, formaPagamento, desconto);
  }
  const { data } = await apiClient.post<VendaBalcao>('/pdv/venda', { itens, clienteId, clienteNome, formaPagamento, desconto });
  return data;
}

export async function getMovimentos(): Promise<MovimentoEstoque[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.MOVIMENTOS].sort((a: MovimentoEstoque, b: MovimentoEstoque) => b.data.localeCompare(a.data));
  }
  const { data } = await apiClient.get<MovimentoEstoque[]>('/pdv/estoque/movimentos');
  return data;
}

export async function getContas(): Promise<ContaAluno[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.CONTAS];
  }
  const { data } = await apiClient.get<ContaAluno[]>('/pdv/contas');
  return data;
}

export async function getStats() {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getStats();
  }
  const { data } = await apiClient.get('/pdv/stats');
  return data;
}
