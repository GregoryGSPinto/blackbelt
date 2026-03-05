'use client';

// ============================================================
// MEUS PAGAMENTOS — Área do Aluno
//
// Plano atual, histórico de faturas, geração de Pix QR
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, AlertCircle, Clock, QrCode,
  Copy, Check, ChevronDown, ChevronUp,
} from 'lucide-react';
import * as pagService from '@/lib/api/pagamentos.service';
import type { ResumoFinanceiroAluno, Fatura, PixPaymentResponse } from '@/lib/api/pagamentos.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_BADGE: Record<string, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
  pago: { bg: 'bg-green-600/20', text: 'text-green-400', icon: CheckCircle, label: 'Pago' },
  pendente: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', icon: Clock, label: 'Pendente' },
  atrasado: { bg: 'bg-red-600/20', text: 'text-red-400', icon: AlertCircle, label: 'Atrasado' },
  cancelado: { bg: 'bg-white/5', text: 'text-white/30', icon: CreditCard, label: 'Cancelado' },
};

const SUB_STATUS: Record<string, { color: string; label: string }> = {
  ativa: { color: 'text-green-400', label: 'Ativa' },
  cancelada: { color: 'text-red-400', label: 'Cancelada' },
  suspensa: { color: 'text-yellow-400', label: 'Suspensa' },
  vencida: { color: 'text-red-400', label: 'Vencida' },
};

export default function MeusPagamentosPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [resumo, setResumo] = useState<ResumoFinanceiroAluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Pix state
  const [pixFaturaId, setPixFaturaId] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Show all faturas
  const [showAll, setShowAll] = useState(false);

  // Mock: user ID (em produção vem do auth context)
  const MOCK_USER_ID = 'u1';

  useEffect(() => {
    setError(null);
    setLoading(true);
    pagService.getResumoAluno(MOCK_USER_ID)
      .then(setResumo)
      .catch((err: unknown) => setError(handleServiceError(err, 'MeusPagamentos')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  const handleGerarPix = useCallback(async (fatura: Fatura) => {
    setPixFaturaId(fatura.id);
    setPixLoading(true);
    setPixData(null);
    setCopied(false);
    try {
      const result = await pagService.gerarPix({
        faturaId: fatura.id,
        valor: fatura.valor,
        descricao: fatura.descricao,
      });
      setPixData(result);
    } catch {
      // Error handled silently
    } finally {
      setPixLoading(false);
    }
  }, []);

  const handleCopyPix = useCallback(async () => {
    if (!pixData?.copiaECola) return;
    try {
      await navigator.clipboard.writeText(pixData.copiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = pixData.copiaECola;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pixData]);

  if (loading) {
    return <PremiumLoader />;
  }

  if (error || !resumo) {
    return <PageError error={error || 'Erro ao carregar'} onRetry={() => setRetryCount((c: number) => c + 1)} />;
  }

  const { assinatura, plano, faturas, totalPendente, proximoVencimento } = resumo;
  const subStatus = assinatura ? SUB_STATUS[assinatura.status] || SUB_STATUS.ativa : null;
  const displayFaturas = showAll ? faturas : faturas.slice(0, 6);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>Meus Pagamentos</h1>
          <p className="text-white/60">Seu plano, faturas e pagamentos</p>
        </div>

        {/* Current Plan */}
        {assinatura && plano && (
          <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-6">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Seu Plano</p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{plano.nome}</h2>
                <p className="text-white/40 text-sm mt-1">{plano.descricao}</p>
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{formatCurrency(assinatura.valor)}</p>
                <p className="text-white/30 text-xs">/{plano.frequencia}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                assinatura.status === 'ativa' ? 'bg-green-600/20 border-green-600/30 text-green-400' :
                'bg-yellow-600/20 border-yellow-600/30 text-yellow-400'
              }`}>
                {subStatus?.label}
              </span>
              {plano.modalidades.map((m: string) => (
                <span key={m} className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 border border-white/10">
                  {m}
                </span>
              ))}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {plano.beneficios.map((b: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                  <span className="text-white/60 text-sm">{b}</span>
                </div>
              ))}
            </div>

            {/* Renewal info */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
              <span className="text-white/30">Próxima renovação</span>
              <span className="text-white/60 font-medium">
                {new Date(assinatura.dataRenovacao + 'T12:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        )}

        {/* Pending alert */}
        {totalPendente > 0 && (
          <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-300 font-bold text-sm">Pagamento pendente</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {formatCurrency(totalPendente)} em aberto
                  {proximoVencimento && ` · Vence em ${new Date(proximoVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Faturas */}
        <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-bold text-white">Faturas</h2>
            <p className="text-sm text-white/40 mt-1">{faturas.length} faturas</p>
          </div>

          <div className="divide-y">
            {displayFaturas.map((fatura: Fatura) => {
              const st = STATUS_BADGE[fatura.status] || STATUS_BADGE.pendente;
              const Icon = st.icon;
              const showPixBtn = fatura.status === 'pendente' || fatura.status === 'atrasado';
              const isPixOpen = pixFaturaId === fatura.id;

              return (
                <div key={fatura.id}>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${st.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className={st.text} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{fatura.descricao}</p>
                          <p className="text-white/30 text-xs">
                            Venc. {new Date(fatura.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                            {fatura.dataPagamento && ` · Pago ${new Date(fatura.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-3">
                        <div>
                          <p className={`font-bold text-sm ${st.text}`}>{formatCurrency(fatura.valor)}</p>
                          <p className={`text-[10px] font-bold ${st.text}`}>{st.label}</p>
                        </div>
                        {showPixBtn && (
                          <button
                            onClick={() => isPixOpen ? setPixFaturaId(null) : handleGerarPix(fatura)}
                            className="px-3 py-2 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-bold hover:bg-blue-600/20 transition-all flex items-center gap-1"
                          >
                            <QrCode size={14} />
                            Pix
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pix QR Panel */}
                  {isPixOpen && (
                    <div className="px-6 pb-4">
                      <div className="bg-blue-600/5 border border-blue-600/15 rounded-xl p-5">
                        {pixLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
                          </div>
                        ) : pixData ? (
                          <div className="text-center">
                            <p className="text-blue-300 font-bold text-sm mb-3">Pague via Pix</p>

                            {/* QR placeholder (em produção: imagem real do QR) */}
                            <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-4">
                              <div className="text-center">
                                <QrCode size={48} className="text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 text-xs font-medium">QR Code Pix</p>
                                <p className="text-gray-400 text-[10px]">{formatCurrency(fatura.valor)}</p>
                              </div>
                            </div>

                            {/* Copy-paste code */}
                            <div className="bg-black/30 rounded-lg p-3 mb-3">
                              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Pix Copia e Cola</p>
                              <p className="text-white/60 text-xs font-mono break-all leading-relaxed">
                                {pixData.copiaECola.substring(0, 60)}...
                              </p>
                            </div>

                            <button
                              onClick={handleCopyPix}
                              className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                copied
                                  ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {copied ? (
                                <><Check size={16} /> Copiado!</>
                              ) : (
                                <><Copy size={16} /> Copiar código Pix</>
                              )}
                            </button>

                            <p className="text-white/20 text-[10px] mt-3">
                              Expira em 30 minutos · Pagamento processado em instantes
                            </p>
                          </div>
                        ) : (
                          <p className="text-center text-white/30 text-sm py-4">Erro ao gerar Pix</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Show more */}
          {faturas.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 text-white/30 text-sm hover:text-white/50 transition-colors flex items-center justify-center gap-1 border-t border-white/5"
            >
              {showAll ? <><ChevronUp size={14} /> Mostrar menos</> : <><ChevronDown size={14} /> Ver todas ({faturas.length})</>}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}
