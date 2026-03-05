'use client';

// ============================================================
// ESTOQUE AVANÇADO — Controle de Inventário
//
// Tabs: Produtos / Movimentos / Análise ABC / Fornecedores
// Modal: Entrada / Ajuste de estoque
// Features: SKU, custo/margem, tamanhos, curva ABC, alertas
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package, AlertTriangle, Search, ArrowUpCircle, ArrowDownCircle,
  RefreshCw, Box, Droplets, Shirt, X, Plus, Minus,
  BarChart3, Truck, ChevronDown, ChevronUp, Percent, DollarSign,
  Tag, AlertCircle,
} from 'lucide-react';
import * as pdvService from '@/lib/api/pdv.service';
import type { ProdutoEstoque, MovimentoEstoque } from '@/lib/api/pdv.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';
import { useTranslations } from 'next-intl';

type CategoriaFilter = 'todas' | 'uniformes' | 'roupas' | 'acessorios' | 'conveniencia';
type TabView = 'produtos' | 'movimentos' | 'abc' | 'fornecedores';
type ModalMode = null | 'entrada' | 'ajuste';

const CATEGORIA_CONFIG: Record<string, { label: string; Icon: typeof Package; color: string }> = {
  uniformes: { label: 'Uniformes', Icon: Shirt, color: 'text-indigo-400' },
  roupas: { label: 'Roupas', Icon: Shirt, color: 'text-purple-400' },
  acessorios: { label: 'Acessórios', Icon: Box, color: 'text-amber-400' },
  conveniencia: { label: 'Conveniência', Icon: Droplets, color: 'text-green-400' },
};

const TIPO_MOV: Record<string, { label: string; color: string; Icon: typeof Plus }> = {
  entrada: { label: 'Entrada', color: 'text-green-400', Icon: ArrowUpCircle },
  saida: { label: 'Saída', color: 'text-red-400', Icon: ArrowDownCircle },
  ajuste: { label: 'Ajuste', color: 'text-amber-400', Icon: RefreshCw },
};

const ABC_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Alta rotação' },
  B: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Média rotação' },
  C: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Baixa rotação' },
};

export default function EstoquePage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatNumber, formatDate, currencyCode } = useFormatting();
  const fmt = (v: number) => formatNumber(v, { style: 'currency', currency: currencyCode });

  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [tab, setTab] = useState<TabView>('produtos');
  const [catFilter, setCatFilter] = useState<CategoriaFilter>('todas');
  const [busca, setBusca] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [modalProduct, setModalProduct] = useState<ProdutoEstoque | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([pdvService.getProdutos(), pdvService.getMovimentos()])
      .then(([prods, movs]) => { setProdutos(prods); setMovimentos(movs); })
      .catch((err: unknown) => setError(handleServiceError(err, 'Estoque')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const filtered = useMemo(() => {
    let list = produtos;
    if (catFilter !== 'todas') list = list.filter(p => p.categoria === catFilter);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
    }
    return list;
  }, [produtos, catFilter, busca]);

  // ── Stats ───────────────────────────────────────────────
  const totalProdutos = produtos.length;
  const semEstoque = produtos.filter(p => p.estoque === 0).length;
  const baixoEstoque = produtos.filter(p => p.estoque > 0 && p.estoque <= p.estoqueMinimo).length;
  const valorEstoque = produtos.reduce((s, p) => s + p.preco * p.estoque, 0);
  const custoEstoque = produtos.reduce((s, p) => s + (p.precoCusto || 0) * p.estoque, 0);
  const margemMedia = custoEstoque > 0 ? Math.round(((valorEstoque - custoEstoque) / valorEstoque) * 100) : 0;

  // ── Suppliers ───────────────────────────────────────────
  const fornecedores = useMemo(() => {
    const map = new Map<string, { nome: string; produtos: number; valorEstoque: number; categorias: Set<string> }>();
    produtos.forEach(p => {
      const f = p.fornecedor || 'Sem fornecedor';
      if (!map.has(f)) map.set(f, { nome: f, produtos: 0, valorEstoque: 0, categorias: new Set() });
      const entry = map.get(f)!;
      entry.produtos++;
      entry.valorEstoque += p.preco * p.estoque;
      entry.categorias.add(p.categoria);
    });
    return Array.from(map.values()).sort((a, b) => b.valorEstoque - a.valorEstoque);
  }, [produtos]);

  const openModal = useCallback((mode: 'entrada' | 'ajuste', product: ProdutoEstoque) => {
    setModalProduct(product);
    setModalMode(mode);
  }, []);

  if (loading) {
    return <PremiumLoader text="Carregando estoque..." />;
  }

  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
          <Package size={24} className="text-blue-400" />
          Controle de Estoque
        </h1>
        <p className="text-sm text-white/40 mt-1">Inventário, movimentações, análise ABC e fornecedores</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MiniStat label="Total produtos" value={String(totalProdutos)} icon={Package} color="text-blue-400" />
        <MiniStat label="Sem estoque" value={String(semEstoque)} icon={AlertCircle} color="text-red-400" alert={semEstoque > 0} />
        <MiniStat label="Estoque baixo" value={String(baixoEstoque)} icon={AlertTriangle} color="text-amber-400" alert={baixoEstoque > 0} />
        <MiniStat label="Valor estoque" value={fmt(valorEstoque)} icon={DollarSign} color="text-emerald-400" />
        <MiniStat label="Custo estoque" value={fmt(custoEstoque)} icon={Tag} color="text-purple-400" />
        <MiniStat label="Margem média" value={`${margemMedia}%`} icon={Percent} color="text-cyan-400" />
      </div>

      {/* Alerts banner */}
      {(semEstoque > 0 || baixoEstoque > 0) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <AlertTriangle size={16} className="text-amber-400/60 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-300/50">
            {semEstoque > 0 && <span className="font-bold text-red-400">{semEstoque} produto(s) sem estoque. </span>}
            {baixoEstoque > 0 && <span className="font-bold text-amber-400">{baixoEstoque} produto(s) abaixo do mínimo. </span>}
            Verifique a aba de produtos para detalhes.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-black/30 backdrop-blur-xl rounded-xl p-1 w-fit">
        {([
          { key: 'produtos', label: 'Produtos', Icon: Package },
          { key: 'movimentos', label: 'Movimentos', Icon: RefreshCw },
          { key: 'abc', label: 'Curva ABC', Icon: BarChart3 },
          { key: 'fornecedores', label: 'Fornecedores', Icon: Truck },
        ] as { key: TabView; label: string; Icon: typeof Package }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === t.key ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            <t.Icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: PRODUTOS */}
      {tab === 'produtos' && (
        <div className="space-y-4">
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome ou SKU..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['todas', 'uniformes', 'roupas', 'acessorios', 'conveniencia'] as CategoriaFilter[]).map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-colors ${
                    catFilter === c ? 'bg-white/10 text-white' : 'text-white/25 hover:text-white/40'
                  }`}>
                  {c === 'todas' ? 'Todas' : CATEGORIA_CONFIG[c]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product list */}
          <div className="space-y-2">
            {filtered.map(prod => {
              const isExpanded = expandedId === prod.id;
              const isCritical = prod.estoque === 0;
              const isLow = prod.estoque > 0 && prod.estoque <= prod.estoqueMinimo;
              const margem = prod.precoCusto ? Math.round(((prod.preco - prod.precoCusto) / prod.preco) * 100) : null;
              const catCfg = CATEGORIA_CONFIG[prod.categoria];

              return (
                <div key={prod.id} className={`rounded-xl border overflow-hidden transition-all ${
                  isCritical ? 'bg-red-500/[0.03] border-red-500/15' :
                  isLow ? 'bg-amber-500/[0.03] border-amber-500/15' :
                  'bg-black/30 border-white/10'
                }`}>
                  {/* Main row */}
                  <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : prod.id)}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white/10`}>
                      {catCfg ? <catCfg.Icon size={16} className={catCfg.color} /> : <Package size={16} className="text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white/80 truncate">{prod.nome}</p>
                        {prod.sku && <span className="text-[9px] text-white/15 font-mono">{prod.sku}</span>}
                        {prod.curvaABC && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ABC_COLORS[prod.curvaABC].bg} ${ABC_COLORS[prod.curvaABC].text}`}>
                            {prod.curvaABC}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/25">{fmt(prod.preco)}{margem !== null ? ` · Margem ${margem}%` : ''}</p>
                    </div>

                    {/* Stock indicator */}
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-black ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white/70'}`}>
                        {prod.estoque}
                      </p>
                      <p className="text-[9px] text-white/20">mín: {prod.estoqueMinimo}</p>
                    </div>

                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      isCritical ? 'bg-red-400 animate-pulse' : isLow ? 'bg-amber-400' : 'bg-emerald-400/50'
                    }`} />

                    {isExpanded ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 space-y-4 bg-black/20 backdrop-blur-sm">
                      {/* Details grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DetailCell label="Preço venda" value={fmt(prod.preco)} />
                        <DetailCell label="Custo" value={prod.precoCusto ? fmt(prod.precoCusto) : '—'} />
                        <DetailCell label="Margem" value={margem !== null ? `${margem}%` : '—'} />
                        <DetailCell label="Valor em estoque" value={fmt(prod.preco * prod.estoque)} />
                        <DetailCell label="Fornecedor" value={prod.fornecedor || '—'} />
                        <DetailCell label="Última entrada" value={prod.ultimaEntrada ? formatDate(prod.ultimaEntrada, 'short') : '—'} />
                        <DetailCell label="Categoria" value={catCfg?.label || prod.categoria} />
                        <DetailCell label="Curva ABC" value={prod.curvaABC ? `${prod.curvaABC} — ${ABC_COLORS[prod.curvaABC].label}` : '—'} />
                      </div>

                      {/* Sizes */}
                      {prod.tamanhos && prod.tamanhos.length > 0 && (
                        <div>
                          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Estoque por tamanho</p>
                          <div className="flex flex-wrap gap-2">
                            {prod.tamanhos.map(t => (
                              <div key={t.tamanho} className={`px-3 py-2 rounded-lg border text-center min-w-[56px] ${
                                t.estoque === 0 ? 'bg-red-500/5 border-red-500/20' :
                                t.estoque <= 2 ? 'bg-amber-500/5 border-amber-500/20' :
                                'bg-black/30 border-white/10'
                              }`}>
                                <p className="text-[10px] text-white/30 font-bold">{t.tamanho}</p>
                                <p className={`text-sm font-black ${
                                  t.estoque === 0 ? 'text-red-400' : t.estoque <= 2 ? 'text-amber-400' : 'text-white/60'
                                }`}>{t.estoque}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); openModal('entrada', prod); }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                        >
                          <Plus size={14} /> Entrada
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); openModal('ajuste', prod); }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                        >
                          <RefreshCw size={14} /> Ajuste
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-white/20 text-center py-8">Nenhum produto encontrado</p>
            )}
          </div>
        </div>
      )}

      {/* TAB: MOVIMENTOS */}
      {tab === 'movimentos' && (
        <div className="space-y-2">
          {movimentos.map(mov => {
            const cfg = TIPO_MOV[mov.tipo];
            return (
              <div key={mov.id} className="flex items-center gap-3 p-4 rounded-xl bg-black/30 backdrop-blur-xl border border-white/10">
                <cfg.Icon size={16} className={cfg.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 font-medium">{mov.produtoNome}</p>
                  <p className="text-[10px] text-white/25">{mov.motivo || 'Sem motivo'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${cfg.color}`}>
                    {mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : ''}{Math.abs(mov.quantidade)}
                  </p>
                  <p className="text-[9px] text-white/20">{formatDate(mov.data, 'short')}</p>
                </div>
                <span className="text-[10px] text-white/15 shrink-0">{mov.responsavel}</span>
              </div>
            );
          })}
          {movimentos.length === 0 && (
            <p className="text-sm text-white/20 text-center py-8">Nenhuma movimentação registrada</p>
          )}
        </div>
      )}

      {/* TAB: CURVA ABC */}
      {tab === 'abc' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <BarChart3 size={16} className="text-blue-400/60 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-300/50 leading-relaxed">
              A Curva ABC classifica produtos por rotação de vendas.
              <strong className="text-emerald-400"> A</strong> = alta rotação (foco em reposição),
              <strong className="text-amber-400"> B</strong> = média rotação,
              <strong className="text-red-400"> C</strong> = baixa rotação (avaliar descontinuação).
            </p>
          </div>

          {(['A', 'B', 'C'] as const).map(curva => {
            const prods = produtos.filter(p => p.curvaABC === curva);
            const cfg = ABC_COLORS[curva];
            const valorTotal = prods.reduce((s, p) => s + p.preco * p.estoque, 0);
            return (
              <div key={curva} className="rounded-xl bg-black/30 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${cfg.bg} ${cfg.text}`}>{curva}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</p>
                    <p className="text-[10px] text-white/20">{prods.length} produtos · Estoque: {fmt(valorTotal)}</p>
                  </div>
                </div>
                <div className="divide-y divide-white/[0.03]">
                  {prods.map(p => {
                    const margem = p.precoCusto ? Math.round(((p.preco - p.precoCusto) / p.preco) * 100) : null;
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-xs text-white/60 flex-1">{p.nome}</span>
                        <span className="text-[10px] text-white/20 font-mono">{p.sku}</span>
                        {margem !== null && <span className="text-[10px] text-white/30">{margem}%</span>}
                        <span className={`text-xs font-bold ${p.estoque === 0 ? 'text-red-400' : p.estoque <= p.estoqueMinimo ? 'text-amber-400' : 'text-white/50'}`}>
                          {p.estoque} un
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: FORNECEDORES */}
      {tab === 'fornecedores' && (
        <div className="space-y-3">
          {fornecedores.map((f, i) => (
            <div key={i} className="rounded-xl bg-black/30 backdrop-blur-xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Truck size={16} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/70">{f.nome}</p>
                  <p className="text-[10px] text-white/25">
                    {f.produtos} produtos · {Array.from(f.categorias).map(c => CATEGORIA_CONFIG[c]?.label || c).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white/60">{fmt(f.valorEstoque)}</p>
                  <p className="text-[9px] text-white/20">em estoque</p>
                </div>
              </div>
              {/* Products from this supplier */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {produtos.filter(p => p.fornecedor === f.nome).map(p => (
                  <span key={p.id} className="text-[10px] text-white/25 bg-black/25 px-2 py-0.5 rounded">
                    {p.nome} ({p.estoque})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: Entrada / Ajuste ──────────────────────── */}
      {modalMode && modalProduct && (
        <MovimentoModal
          mode={modalMode}
          product={modalProduct}
          onClose={() => { setModalMode(null); setModalProduct(null); }}
          onConfirm={(qty, motivo) => {
            // In production, this would call the API
            const newMov: MovimentoEstoque = {
              id: `mv-new-${Date.now()}`,
              produtoId: modalProduct.id,
              produtoNome: modalProduct.nome,
              tipo: modalMode === 'entrada' ? 'entrada' : 'ajuste',
              quantidade: qty,
              motivo,
              data: new Date().toISOString().split('T')[0],
              responsavel: 'Admin',
            };
            setMovimentos(prev => [newMov, ...prev]);
            // Update product stock
            setProdutos(prev => prev.map(p =>
              p.id === modalProduct.id
                ? { ...p, estoque: Math.max(0, p.estoque + qty) }
                : p
            ));
            setModalMode(null);
            setModalProduct(null);
          }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function MiniStat({ label, value, icon: Icon, color, alert }: {
  label: string; value: string; icon: typeof Package; color: string; alert?: boolean;
}) {
  return (
    <div className={`hover-card rounded-xl border p-3 ${alert ? 'bg-red-500/[0.03] border-red-500/10' : 'bg-black/30 border-white/10'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className={color} />
        <span className="text-[9px] text-white/25 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/30 border border-white/10 px-3 py-2">
      <p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-white/50 font-medium mt-0.5 truncate">{value}</p>
    </div>
  );
}

function MovimentoModal({ mode, product, onClose, onConfirm }: {
  mode: 'entrada' | 'ajuste';
  product: ProdutoEstoque;
  onClose: () => void;
  onConfirm: (qty: number, motivo: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [motivo, setMotivo] = useState('');
  const isEntrada = mode === 'entrada';
  const title = isEntrada ? 'Registrar Entrada' : 'Ajuste de Estoque';
  const color = isEntrada ? 'emerald' : 'amber';

  const handleSubmit = () => {
    if (qty === 0) return;
    const finalQty = isEntrada ? Math.abs(qty) : qty;
    onConfirm(finalQty, motivo || (isEntrada ? 'Compra fornecedor' : 'Ajuste manual'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0D1117] border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/30">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Product info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
            <Package size={18} className="text-white/30" />
            <div>
              <p className="text-sm font-bold text-white/70">{product.nome}</p>
              <p className="text-[10px] text-white/25">Estoque atual: {product.estoque} · Mínimo: {product.estoqueMinimo}</p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">
              {isEntrada ? 'Quantidade a adicionar' : 'Ajuste (+ ou -)'}
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(q => q - 1)} disabled={isEntrada && qty <= 1}
                className="w-10 h-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/60 disabled:opacity-20">
                <Minus size={16} />
              </button>
              <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))}
                className="w-24 px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/70 text-center text-lg font-bold focus:outline-none focus:border-white/20" />
              <button onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/60">
                <Plus size={16} />
              </button>
            </div>
            {!isEntrada && (
              <p className="text-[10px] text-white/20 mt-1">
                Resultado: {product.estoque} → {Math.max(0, product.estoque + qty)}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Motivo</label>
            <input value={motivo} onChange={e => setMotivo(e.target.value)}
              placeholder={isEntrada ? 'Ex: Compra fornecedor' : 'Ex: Avaria, inventário...'}
              className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20" />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white/40 text-sm font-bold hover:bg-white/10 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={qty === 0}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 bg-${color}-500/15 border border-${color}-500/25 text-${color}-300 hover:bg-${color}-500/25`}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

