/**
 * Mock Data — PDV (Ponto de Venda) + Estoque
 *
 * TODO(BE-065): Substituir por endpoints reais
 *   POST   /pdv/venda
 *   GET    /pdv/vendas
 *   GET    /pdv/estoque
 *   POST   /pdv/estoque/entrada
 *   POST   /pdv/estoque/ajuste
 *   GET    /pdv/conta/:alunoId
 */

import type { ProdutoEstoque, VendaBalcao, MovimentoEstoque, ContaAluno, ItemVenda, FormaPagamentoPDV } from '@/lib/api/contracts';

export const PRODUTOS: ProdutoEstoque[] = [
  { id: 'pd01', nome: 'Água Mineral 500ml', categoria: 'conveniencia', preco: 5.00, precoCusto: 1.80, estoque: 48, estoqueMinimo: 10, ativo: true, sku: 'CONV-001', fornecedor: 'Distribuidora Águas MG', ultimaEntrada: '2026-02-10', curvaABC: 'A' },
  { id: 'pd02', nome: 'Açaí 300ml', categoria: 'conveniencia', preco: 15.00, precoCusto: 7.50, estoque: 12, estoqueMinimo: 5, ativo: true, sku: 'CONV-002', fornecedor: 'Açaí Express BH', ultimaEntrada: '2026-02-10', curvaABC: 'A' },
  { id: 'pd03', nome: 'Açaí 500ml', categoria: 'conveniencia', preco: 22.00, precoCusto: 11.00, estoque: 8, estoqueMinimo: 5, ativo: true, sku: 'CONV-003', fornecedor: 'Açaí Express BH', ultimaEntrada: '2026-02-10', curvaABC: 'B' },
  { id: 'pd04', nome: 'Isotônico 500ml', categoria: 'conveniencia', preco: 8.00, precoCusto: 3.50, estoque: 30, estoqueMinimo: 10, ativo: true, sku: 'CONV-004', fornecedor: 'Distribuidora Águas MG', ultimaEntrada: '2026-02-08', curvaABC: 'A' },
  { id: 'pd05', nome: 'Barra de Proteína', categoria: 'conveniencia', preco: 12.00, precoCusto: 6.00, estoque: 24, estoqueMinimo: 8, ativo: true, sku: 'CONV-005', fornecedor: 'Nutri Atacado', ultimaEntrada: '2026-02-05', curvaABC: 'B' },
  { id: 'pd06', nome: 'Bandagem Elástica 3m', categoria: 'acessorios', preco: 25.00, precoCusto: 8.00, estoque: 15, estoqueMinimo: 5, ativo: true, sku: 'ACES-001', fornecedor: 'FightGear Brasil', ultimaEntrada: '2026-01-20', curvaABC: 'B' },
  { id: 'pd07', nome: 'Protetor Bucal Simples', categoria: 'acessorios', preco: 35.00, precoCusto: 12.00, estoque: 10, estoqueMinimo: 3, ativo: true, sku: 'ACES-002', fornecedor: 'FightGear Brasil', ultimaEntrada: '2026-01-20', curvaABC: 'C' },
  { id: 'pd08', nome: 'Protetor Bucal Moldável', categoria: 'acessorios', preco: 65.00, precoCusto: 28.00, estoque: 6, estoqueMinimo: 3, ativo: true, sku: 'ACES-003', fornecedor: 'FightGear Brasil', ultimaEntrada: '2026-01-15', curvaABC: 'C' },
  { id: 'pd09', nome: 'Nível Avulso (Branca)', categoria: 'acessorios', preco: 30.00, precoCusto: 10.00, estoque: 20, estoqueMinimo: 5, ativo: true, sku: 'ACES-004', fornecedor: 'Keiko Sports', ultimaEntrada: '2026-01-10', curvaABC: 'B' },
  { id: 'pd10', nome: 'Rashguard Treino', categoria: 'roupas', preco: 89.90, precoCusto: 38.00, estoque: 18, estoqueMinimo: 5, ativo: true, sku: 'ROUPA-001', fornecedor: 'Keiko Sports', ultimaEntrada: '2026-02-08', curvaABC: 'B', tamanhos: [{ tamanho: 'P', estoque: 4 }, { tamanho: 'M', estoque: 6 }, { tamanho: 'G', estoque: 5 }, { tamanho: 'GG', estoque: 3 }] },
  { id: 'pd11', nome: 'Shorts No-Gi', categoria: 'roupas', preco: 79.90, precoCusto: 32.00, estoque: 14, estoqueMinimo: 5, ativo: true, sku: 'ROUPA-002', fornecedor: 'Keiko Sports', ultimaEntrada: '2026-02-08', curvaABC: 'C', tamanhos: [{ tamanho: 'P', estoque: 3 }, { tamanho: 'M', estoque: 5 }, { tamanho: 'G', estoque: 4 }, { tamanho: 'GG', estoque: 2 }] },
  { id: 'pd12', nome: 'Camiseta BlackBelt', categoria: 'roupas', preco: 59.90, precoCusto: 22.00, estoque: 25, estoqueMinimo: 8, ativo: true, sku: 'ROUPA-003', fornecedor: 'Estamparia Central', ultimaEntrada: '2026-01-28', curvaABC: 'A', tamanhos: [{ tamanho: 'P', estoque: 5 }, { tamanho: 'M', estoque: 8 }, { tamanho: 'G', estoque: 7 }, { tamanho: 'GG', estoque: 5 }] },
  { id: 'pd13', nome: 'Chinelo BlackBelt', categoria: 'acessorios', preco: 45.00, precoCusto: 15.00, estoque: 3, estoqueMinimo: 5, ativo: true, sku: 'ACES-005', fornecedor: 'FightGear Brasil', ultimaEntrada: '2025-12-15', curvaABC: 'C' },
  { id: 'pd14', nome: 'Tape Dedo 2,5cm', categoria: 'acessorios', preco: 18.00, precoCusto: 5.50, estoque: 40, estoqueMinimo: 10, ativo: true, sku: 'ACES-006', fornecedor: 'FightGear Brasil', ultimaEntrada: '2026-02-01', curvaABC: 'A' },
  { id: 'pd15', nome: 'Whey Protein (dose)', categoria: 'conveniencia', preco: 10.00, precoCusto: 4.50, estoque: 0, estoqueMinimo: 5, ativo: true, sku: 'CONV-006', fornecedor: 'Nutri Atacado', ultimaEntrada: '2026-01-05', curvaABC: 'B' },
  { id: 'pd16', nome: 'Uniforme A1 Branco', categoria: 'uniformes', preco: 289.90, precoCusto: 145.00, estoque: 8, estoqueMinimo: 3, ativo: true, sku: 'KIM-001', fornecedor: 'Keiko Sports', ultimaEntrada: '2026-01-20', curvaABC: 'B', tamanhos: [{ tamanho: 'A1', estoque: 2 }, { tamanho: 'A2', estoque: 3 }, { tamanho: 'A3', estoque: 2 }, { tamanho: 'A4', estoque: 1 }] },
  { id: 'pd17', nome: 'Uniforme A2 Azul', categoria: 'uniformes', preco: 319.90, precoCusto: 160.00, estoque: 5, estoqueMinimo: 2, ativo: true, sku: 'KIM-002', fornecedor: 'Keiko Sports', ultimaEntrada: '2026-01-20', curvaABC: 'C', tamanhos: [{ tamanho: 'A1', estoque: 1 }, { tamanho: 'A2', estoque: 2 }, { tamanho: 'A3', estoque: 1 }, { tamanho: 'A4', estoque: 1 }] },
  { id: 'pd18', nome: 'Uniforme Infantil M0', categoria: 'uniformes', preco: 199.90, precoCusto: 95.00, estoque: 6, estoqueMinimo: 2, ativo: true, sku: 'KIM-003', fornecedor: 'Keiko Sports', ultimaEntrada: '2026-02-05', curvaABC: 'C', tamanhos: [{ tamanho: 'M0', estoque: 2 }, { tamanho: 'M1', estoque: 2 }, { tamanho: 'M2', estoque: 2 }] },
];

export const VENDAS: VendaBalcao[] = [
  { id: 'v01', itens: [{ produtoId: 'pd01', produtoNome: 'Água Mineral 500ml', quantidade: 2, precoUnitario: 5.00, subtotal: 10.00 }, { produtoId: 'pd05', produtoNome: 'Barra de Proteína', quantidade: 1, precoUnitario: 12.00, subtotal: 12.00 }], clienteId: 'u1', clienteNome: 'Lucas Mendes', formaPagamento: 'pix', subtotal: 22.00, desconto: 0, total: 22.00, data: '2026-02-16T19:30:00', vendedor: 'Recepção' },
  { id: 'v02', itens: [{ produtoId: 'pd02', produtoNome: 'Açaí 300ml', quantidade: 1, precoUnitario: 15.00, subtotal: 15.00 }], clienteId: 'u2', clienteNome: 'Ana Carolina', formaPagamento: 'conta_aluno', subtotal: 15.00, desconto: 0, total: 15.00, data: '2026-02-16T20:15:00', vendedor: 'Recepção' },
  { id: 'v03', itens: [{ produtoId: 'pd10', produtoNome: 'Rashguard Treino', quantidade: 1, precoUnitario: 89.90, subtotal: 89.90 }, { produtoId: 'pd01', produtoNome: 'Água Mineral 500ml', quantidade: 1, precoUnitario: 5.00, subtotal: 5.00 }], clienteId: 'u3', clienteNome: 'Pedro Santos', formaPagamento: 'cartao', subtotal: 94.90, desconto: 0, total: 94.90, data: '2026-02-15T18:45:00', vendedor: 'Recepção' },
  { id: 'v04', itens: [{ produtoId: 'pd06', produtoNome: 'Bandagem Elástica 3m', quantidade: 2, precoUnitario: 25.00, subtotal: 50.00 }, { produtoId: 'pd07', produtoNome: 'Protetor Bucal Simples', quantidade: 1, precoUnitario: 35.00, subtotal: 35.00 }], formaPagamento: 'dinheiro', subtotal: 85.00, desconto: 5.00, total: 80.00, data: '2026-02-15T10:00:00', vendedor: 'Admin' },
  { id: 'v05', itens: [{ produtoId: 'pd03', produtoNome: 'Açaí 500ml', quantidade: 2, precoUnitario: 22.00, subtotal: 44.00 }, { produtoId: 'pd04', produtoNome: 'Isotônico 500ml', quantidade: 2, precoUnitario: 8.00, subtotal: 16.00 }], clienteId: 'u5', clienteNome: 'Rafael Lima', formaPagamento: 'pix', subtotal: 60.00, desconto: 0, total: 60.00, data: '2026-02-14T19:00:00', vendedor: 'Recepção' },
  { id: 'v06', itens: [{ produtoId: 'pd12', produtoNome: 'Camiseta BlackBelt', quantidade: 1, precoUnitario: 59.90, subtotal: 59.90 }], clienteId: 'u7', clienteNome: 'Camila Souza', formaPagamento: 'conta_aluno', subtotal: 59.90, desconto: 0, total: 59.90, data: '2026-02-14T17:30:00', vendedor: 'Admin' },
  { id: 'v07', itens: [{ produtoId: 'pd01', produtoNome: 'Água Mineral 500ml', quantidade: 3, precoUnitario: 5.00, subtotal: 15.00 }], formaPagamento: 'dinheiro', subtotal: 15.00, desconto: 0, total: 15.00, data: '2026-02-13T20:00:00', vendedor: 'Recepção' },
  { id: 'v08', itens: [{ produtoId: 'pd08', produtoNome: 'Protetor Bucal Moldável', quantidade: 1, precoUnitario: 65.00, subtotal: 65.00 }, { produtoId: 'pd14', produtoNome: 'Tape Dedo 2,5cm', quantidade: 2, precoUnitario: 18.00, subtotal: 36.00 }], clienteId: 'u8', clienteNome: 'Thiago Ferreira', formaPagamento: 'pix', subtotal: 101.00, desconto: 0, total: 101.00, data: '2026-02-13T18:00:00', vendedor: 'Recepção' },
];

export const MOVIMENTOS: MovimentoEstoque[] = [
  { id: 'mv01', produtoId: 'pd01', produtoNome: 'Água Mineral 500ml', tipo: 'entrada', quantidade: 60, motivo: 'Compra fornecedor', data: '2026-02-10', responsavel: 'Admin' },
  { id: 'mv02', produtoId: 'pd02', produtoNome: 'Açaí 300ml', tipo: 'entrada', quantidade: 20, motivo: 'Compra fornecedor', data: '2026-02-10', responsavel: 'Admin' },
  { id: 'mv03', produtoId: 'pd01', produtoNome: 'Água Mineral 500ml', tipo: 'saida', quantidade: 12, motivo: 'Vendas da semana', data: '2026-02-16', responsavel: 'Sistema' },
  { id: 'mv04', produtoId: 'pd15', produtoNome: 'Whey Protein (dose)', tipo: 'saida', quantidade: 5, motivo: 'Vencido', data: '2026-02-14', responsavel: 'Admin' },
  { id: 'mv05', produtoId: 'pd13', produtoNome: 'Chinelo BlackBelt', tipo: 'ajuste', quantidade: -2, motivo: 'Avaria / defeito', data: '2026-02-12', responsavel: 'Admin' },
  { id: 'mv06', produtoId: 'pd10', produtoNome: 'Rashguard Treino', tipo: 'entrada', quantidade: 10, motivo: 'Compra fornecedor', data: '2026-02-08', responsavel: 'Admin' },
];

export const CONTAS: ContaAluno[] = [
  { alunoId: 'u2', alunoNome: 'Ana Carolina', saldo: 15.00, movimentos: [{ data: '2026-02-16', descricao: 'Açaí 300ml', valor: 15.00 }] },
  { alunoId: 'u7', alunoNome: 'Camila Souza', saldo: 59.90, movimentos: [{ data: '2026-02-14', descricao: 'Camiseta BlackBelt', valor: 59.90 }] },
];

// Helpers
let vendaCounter = VENDAS.length;

export function registrarVendaMock(itens: ItemVenda[], clienteId?: string, clienteNome?: string, formaPagamento?: FormaPagamentoPDV, desconto?: number): VendaBalcao {
  vendaCounter++;
  const subtotal = itens.reduce((s, i) => s + i.subtotal, 0);
  const desc = desconto || 0;
  return {
    id: `v${String(vendaCounter).padStart(2, '0')}`,
    itens,
    clienteId,
    clienteNome,
    formaPagamento: formaPagamento || 'dinheiro',
    subtotal,
    desconto: desc,
    total: subtotal - desc,
    data: new Date().toISOString(),
    vendedor: 'Admin',
  };
}

export interface PDVStats {
  vendasHoje: number;
  receitaHoje: number;
  vendasSemana: number;
  receitaSemana: number;
  produtosBaixoEstoque: number;
  produtosSemEstoque: number;
}

export function getStats(): PDVStats {
  const hoje = new Date().toISOString().split('T')[0];
  const vendasHoje = VENDAS.filter((v) => v.data.startsWith(hoje));
  const semana = VENDAS; // Simplified: all recent sales
  return {
    vendasHoje: vendasHoje.length,
    receitaHoje: vendasHoje.reduce((s, v) => s + v.total, 0),
    vendasSemana: semana.length,
    receitaSemana: semana.reduce((s, v) => s + v.total, 0),
    produtosBaixoEstoque: PRODUTOS.filter((p) => p.estoque > 0 && p.estoque <= p.estoqueMinimo).length,
    produtosSemEstoque: PRODUTOS.filter((p) => p.estoque === 0).length,
  };
}
