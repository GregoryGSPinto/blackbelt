'use client';

// ============================================================
// PDV — Ponto de Venda (Balcão)
//
// Caixa registradora: busca produto, carrinho, cliente, pagamento
// Stats: vendas hoje, receita, estoque baixo
// Histórico de vendas recentes
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, DollarSign,
  CreditCard, Banknote, Smartphone, User, CheckCircle, Receipt,
  Package, AlertTriangle, TrendingUp, Clock,
} from 'lucide-react';
import * as pdvService from '@/lib/api/pdv.service';
import type { ProdutoEstoque, VendaBalcao, ItemVenda, FormaPagamentoPDV } from '@/lib/api/pdv.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';
import { useTranslations } from 'next-intl';

interface CartItem extends ItemVenda {
  estoqueDisponivel: number;
}

const FORMA_PAGAMENTO: { key: FormaPagamentoPDV; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'pix', label: 'Pix', icon: <Smartphone size={16} />, color: 'text-green-400' },
  { key: 'dinheiro', label: 'Dinheiro', icon: <Banknote size={16} />, color: 'text-emerald-400' },
  { key: 'cartao', label: 'Cartão', icon: <CreditCard size={16} />, color: 'text-blue-400' },
  { key: 'conta_aluno', label: 'Conta Aluno', icon: <User size={16} />, color: 'text-amber-400' },
];

export default function PDVPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatNumber, formatDateTime, currencyCode } = useFormatting();
  const formatCurrency = (v: number) => formatNumber(v, { style: 'currency', currency: currencyCode });
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [vendas, setVendas] = useState<VendaBalcao[]>([]);
  const [stats, setStats] = useState<{ vendasHoje: number; receitaHoje: number; vendasSemana: number; receitaSemana: number; produtosBaixoEstoque: number; produtosSemEstoque: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [busca, setBusca] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoPDV>('pix');
  const [desconto, setDesconto] = useState(0);
  const [showReceipt, setShowReceipt] = useState<VendaBalcao | null>(null);
  const [saving, setSaving] = useState(false);

  // Tab
  const [tab, setTab] = useState<'venda' | 'historico'>('venda');

  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([pdvService.getProdutos(), pdvService.getVendas(), pdvService.getStats()])
      .then(([prods, vends, st]) => {
        setProdutos(prods as ProdutoEstoque[]);
        setVendas(vends as VendaBalcao[]);
        setStats(st as typeof stats);
      })
      .catch((err: unknown) => setError(handleServiceError(err, 'PDV')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const filteredProdutos = useMemo(() => {
    if (!busca.trim()) return produtos.filter((p: ProdutoEstoque) => p.ativo && p.estoque > 0);
    const q = busca.toLowerCase();
    return produtos.filter((p: ProdutoEstoque) => p.ativo && p.estoque > 0 && p.nome.toLowerCase().includes(q));
  }, [produtos, busca]);

  const subtotal = cart.reduce((s: number, i: CartItem) => s + i.subtotal, 0);
  const total = Math.max(subtotal - desconto, 0);

  const addToCart = useCallback((p: ProdutoEstoque) => {
    setCart((prev: CartItem[]) => {
      const existing = prev.find((i: CartItem) => i.produtoId === p.id);
      if (existing) {
        if (existing.quantidade >= p.estoque) return prev;
        return prev.map((i: CartItem) =>
          i.produtoId === p.id
            ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * i.precoUnitario }
            : i
        );
      }
      return [...prev, {
        produtoId: p.id,
        produtoNome: p.nome,
        quantidade: 1,
        precoUnitario: p.preco,
        subtotal: p.preco,
        estoqueDisponivel: p.estoque,
      }];
    });
  }, []);

  const updateQty = useCallback((produtoId: string, delta: number) => {
    setCart((prev: CartItem[]) =>
      prev.map((i: CartItem) => {
        if (i.produtoId !== produtoId) return i;
        const newQty = Math.max(1, Math.min(i.quantidade + delta, i.estoqueDisponivel));
        return { ...i, quantidade: newQty, subtotal: newQty * i.precoUnitario };
      })
    );
  }, []);

  const removeFromCart = useCallback((produtoId: string) => {
    setCart((prev: CartItem[]) => prev.filter((i: CartItem) => i.produtoId !== produtoId));
  }, []);

  const handleFinalizarVenda = useCallback(async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const itens: ItemVenda[] = cart.map((c: CartItem) => ({
        produtoId: c.produtoId,
        produtoNome: c.produtoNome,
        quantidade: c.quantidade,
        precoUnitario: c.precoUnitario,
        subtotal: c.subtotal,
      }));
      const venda = await pdvService.registrarVenda(itens, undefined, clienteNome || undefined, formaPagamento, desconto);
      setShowReceipt(venda);
      setVendas((prev: VendaBalcao[]) => [venda, ...prev]);
      setCart([]);
      setClienteNome('');
      setDesconto(0);
      setBusca('');
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  }, [cart, clienteNome, formaPagamento, desconto]);

  if (loading) {
    return <PremiumLoader text="Carregando PDV..." />;
  }
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('pos.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>Venda rápida de produtos no balcão</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2"><Receipt size={16} className="text-blue-400" /><span className="text-white/40 text-xs">Vendas Hoje</span></div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.vendasHoje}</p>
          </div>
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2"><TrendingUp size={16} className="text-green-400" /><span className="text-white/40 text-xs">Receita Hoje</span></div>
            <p className="text-green-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{formatCurrency(stats.receitaHoje)}</p>
          </div>
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2"><DollarSign size={16} className="text-purple-400" /><span className="text-white/40 text-xs">Receita Semana</span></div>
            <p className="text-purple-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{formatCurrency(stats.receitaSemana)}</p>
          </div>
          <div className="hover-card" style={{ ...glass, padding: '1.25rem' }}>
            <div className="flex items-center gap-3 mb-2"><AlertTriangle size={16} className="text-red-400" /><span className="text-white/40 text-xs">Estoque Crítico</span></div>
            <p className="text-red-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{stats.produtosBaixoEstoque + stats.produtosSemEstoque}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('venda')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'venda' ? 'bg-white/10 text-white border border-white/15' : 'text-white/40 hover:text-white/60'}`}>
          <ShoppingCart size={14} /> Nova Venda
        </button>
        <button onClick={() => setTab('historico')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'historico' ? 'bg-white/10 text-white border border-white/15' : 'text-white/40 hover:text-white/60'}`}>
          <Clock size={14} /> Histórico
          <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{vendas.length}</span>
        </button>
      </div>

      {/* ══════════ NOVA VENDA ══════════ */}
      {tab === 'venda' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Product list — 3 cols */}
          <div className="lg:col-span-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto">
              {filteredProdutos.map((p: ProdutoEstoque) => {
                const inCart = cart.find((c: CartItem) => c.produtoId === p.id);
                const isLow = p.estoque <= p.estoqueMinimo;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      inCart ? 'bg-blue-600/10 border-blue-500/20' : 'bg-black/30 border-white/10 hover:bg-black/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <Package size={14} className={inCart ? 'text-blue-400' : 'text-white/20'} />
                      {inCart && <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 rounded-full">{inCart.quantidade}</span>}
                    </div>
                    <p className="text-white text-xs font-medium line-clamp-2 mb-1">{p.nome}</p>
                    <p className="text-green-400 text-sm font-bold">{formatCurrency(p.preco)}</p>
                    <p className={`text-[10px] mt-0.5 ${isLow ? 'text-red-400' : 'text-white/25'}`}>
                      {p.estoque} un.{isLow ? ' ⚠️' : ''}
                    </p>
                  </button>
                );
              })}
              {filteredProdutos.length === 0 && (
                <div className="col-span-full py-8 text-center text-white/30 text-sm">Nenhum produto encontrado</div>
              )}
            </div>
          </div>

          {/* Cart — 2 cols */}
          <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-bold flex items-center gap-2">
                <ShoppingCart size={16} /> Carrinho
                {cart.length > 0 && <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{cart.length}</span>}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/20 text-sm">Adicione produtos ao carrinho</div>
              ) : (
                cart.map((item: CartItem) => (
                  <div key={item.produtoId} className="bg-black/30 backdrop-blur-xl rounded-xl p-3 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white text-xs font-medium flex-1 mr-2">{item.produtoNome}</p>
                      <button onClick={() => removeFromCart(item.produtoId)} className="text-red-400/50 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.produtoId, -1)} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 hover:text-white"><Minus size={10} /></button>
                        <span className="text-white text-xs font-bold w-6 text-center">{item.quantidade}</span>
                        <button onClick={() => updateQty(item.produtoId, 1)} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-white/40 hover:text-white"><Plus size={10} /></button>
                      </div>
                      <p className="text-green-400 text-sm font-bold">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer */}
            <div className="border-t border-white/5 p-4 space-y-3">
              {/* Cliente */}
              <input
                type="text"
                value={clienteNome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClienteNome(e.target.value)}
                placeholder="Nome do cliente (opcional)"
                className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-white/25 bg-white/5 border border-white/10 outline-none"
              />

              {/* Forma pagamento */}
              <div className="grid grid-cols-2 gap-2">
                {FORMA_PAGAMENTO.map((fp) => (
                  <button
                    key={fp.key}
                    onClick={() => setFormaPagamento(fp.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${
                      formaPagamento === fp.key ? `bg-white/10 ${fp.color} border border-white/15` : 'text-white/30 bg-black/30 border border-white/10'
                    }`}
                  >
                    {fp.icon} {fp.label}
                  </button>
                ))}
              </div>

              {/* Desconto */}
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">Desconto:</span>
                <input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={desconto || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDesconto(Number(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded text-xs text-white bg-white/5 border border-white/10 outline-none text-right"
                  placeholder="0"
                />
              </div>

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-white/40"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {desconto > 0 && <div className="flex justify-between text-red-400/60"><span>Desconto</span><span>-{formatCurrency(desconto)}</span></div>}
                <div className="flex justify-between text-white font-bold text-lg pt-1 border-t border-white/5"><span>Total</span><span className="text-green-400">{formatCurrency(total)}</span></div>
              </div>

              {/* Finalizar */}
              <button
                onClick={handleFinalizarVenda}
                disabled={saving || cart.length === 0}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Processando...' : <><CheckCircle size={16} /> Finalizar Venda</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ HISTÓRICO ══════════ */}
      {tab === 'historico' && (
        <div style={{ ...glass, overflow: 'hidden' }}>
          <div className="divide-y">
            {vendas.map((v: VendaBalcao) => {
              const fp = FORMA_PAGAMENTO.find((f) => f.key === v.formaPagamento);
              return (
                <div key={v.id} className="px-6 py-4 hover:bg-black/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium">#{v.id}</span>
                        {v.clienteNome && <span className="text-white/40 text-xs">· {v.clienteNome}</span>}
                      </div>
                      <p className="text-white/30 text-xs">
                        {v.itens.map((i: ItemVenda) => `${i.quantidade}× ${i.produtoNome}`).join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-white/20">
                        {fp && <span className={fp.color}>{fp.label}</span>}
                        <span>· {v.vendedor}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-green-400 font-bold text-sm">{formatCurrency(v.total)}</p>
                      <p className="text-white/20 text-xs">{formatDateTime(v.data)}</p>
                      {v.desconto > 0 && <p className="text-red-400/50 text-[10px]">desc: -{formatCurrency(v.desconto)}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
            {vendas.length === 0 && (
              <div className="px-6 py-12 text-center text-white/30 text-sm">Nenhuma venda registrada</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ RECEIPT MODAL ══════════ */}
      {showReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowReceipt(null)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-1">Venda Registrada!</h3>
              <p className="text-white/40 text-sm mb-4">#{showReceipt.id}</p>

              <div className="bg-white/5 rounded-xl p-4 text-left space-y-2 mb-4">
                {showReceipt.itens.map((i: ItemVenda, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-white/60">{i.quantidade}× {i.produtoNome}</span>
                    <span className="text-white/60">{formatCurrency(i.subtotal)}</span>
                  </div>
                ))}
                {showReceipt.desconto > 0 && (
                  <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                    <span className="text-red-400/60">Desconto</span>
                    <span className="text-red-400/60">-{formatCurrency(showReceipt.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">{formatCurrency(showReceipt.total)}</span>
                </div>
              </div>

              {showReceipt.clienteNome && <p className="text-white/30 text-xs mb-2">Cliente: {showReceipt.clienteNome}</p>}
              <p className="text-white/20 text-xs mb-4">
                {FORMA_PAGAMENTO.find((f) => f.key === showReceipt.formaPagamento)?.label} · {formatDateTime(showReceipt.data)}
              </p>

              <button
                onClick={() => setShowReceipt(null)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
