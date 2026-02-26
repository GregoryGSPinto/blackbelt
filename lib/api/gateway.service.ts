/**
 * Gateway de Pagamento — Service Abstraction
 *
 * Abstração unificada para provedores de pagamento (Asaas, Pagarme, Stripe).
 * Em modo mock, retorna dados fake. Em produção, chama a API do provedor.
 *
 * TODO(BE-030): Implementar SDK do provedor escolhido
 * TODO(BE-031): Implementar webhook receiver para confirmação de pagamento
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

// ── Types ─────────────────────────────────────────────────

export type GatewayProvider = 'asaas' | 'pagarme' | 'stripe';
export type StatusCobranca = 'pendente' | 'pago' | 'vencido' | 'cancelado' | 'estornado';
export type MetodoCobranca = 'pix' | 'cartao' | 'boleto';

export interface CriarCobrancaRequest {
  alunoId: string;
  valor: number;
  vencimento: string;
  descricao: string;
  metodo: MetodoCobranca;
}

export interface Cobranca {
  id: string;
  alunoId: string;
  valor: number;
  status: StatusCobranca;
  metodo: MetodoCobranca;
  vencimento: string;
  dataPagamento?: string;
  pixQrCodeBase64?: string;
  pixCopiaCola?: string;
  boletoUrl?: string;
  cartaoUltimos4?: string;
  createdAt: string;
}

export interface RecorrenciaConfig {
  alunoId: string;
  planoId: string;
  metodo: MetodoCobranca;
  diaVencimento: number;
}

export interface Recorrencia {
  id: string;
  alunoId: string;
  planoId: string;
  status: 'ativa' | 'pausada' | 'cancelada';
  proximoVencimento: string;
}

export interface WebhookEvent {
  id: string;
  tipo: 'pagamento_confirmado' | 'pagamento_vencido' | 'estorno' | 'assinatura_cancelada';
  cobrancaId: string;
  data: string;
  payload: Record<string, unknown>;
}

// ── Mock Helpers ──────────────────────────────────────────

const MOCK_PIX_COPIA_COLA = '00020126580014br.gov.bcb.pix0136blackbelt-app-4c4d-b3a7-mock-pix-key5204000053039865802BR5925BLACKBELT ACADEMIA6009VESPASIANO62070503***6304ABCD';

function mockCobranca(req: CriarCobrancaRequest): Cobranca {
  const id = `cob_${Date.now().toString(36)}`;
  return {
    id,
    alunoId: req.alunoId,
    valor: req.valor,
    status: 'pendente',
    metodo: req.metodo,
    vencimento: req.vencimento,
    pixQrCodeBase64: req.metodo === 'pix' ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' : undefined,
    pixCopiaCola: req.metodo === 'pix' ? MOCK_PIX_COPIA_COLA : undefined,
    boletoUrl: req.metodo === 'boleto' ? `https://mock-boleto.com/${id}` : undefined,
    cartaoUltimos4: req.metodo === 'cartao' ? '4242' : undefined,
    createdAt: new Date().toISOString(),
  };
}

// ── Service Functions ─────────────────────────────────────

export async function criarCobranca(req: CriarCobrancaRequest): Promise<Cobranca> {
  if (useMock()) { await mockDelay(600); return mockCobranca(req); }
  const { data } = await apiClient.post<Cobranca>('/gateway/cobrancas', req); return data;
}

export async function consultarCobranca(id: string): Promise<Cobranca> {
  if (useMock()) {
    await mockDelay();
    return { id, alunoId: 'ALU001', valor: 189.90, status: 'pendente', metodo: 'pix', vencimento: '2026-03-10', pixCopiaCola: MOCK_PIX_COPIA_COLA, createdAt: new Date().toISOString() };
  }
  const { data } = await apiClient.get<Cobranca>(`/gateway/cobrancas/${id}`); return data;
}

export async function cancelarCobranca(id: string): Promise<void> {
  if (useMock()) { await mockDelay(300); return; }
  await apiClient.delete(`/gateway/cobrancas/${id}`);
}

export async function configurarRecorrencia(config: RecorrenciaConfig): Promise<Recorrencia> {
  if (useMock()) {
    await mockDelay(500);
    return { id: `rec_${Date.now().toString(36)}`, alunoId: config.alunoId, planoId: config.planoId, status: 'ativa', proximoVencimento: config.diaVencimento + '/03/2026' };
  }
  const { data } = await apiClient.post<Recorrencia>('/gateway/recorrencias', config); return data;
}

export async function cancelarRecorrencia(id: string): Promise<void> {
  if (useMock()) { await mockDelay(300); return; }
  await apiClient.delete(`/gateway/recorrencias/${id}`);
}

export async function listarWebhooks(limit?: number): Promise<WebhookEvent[]> {
  if (useMock()) {
    await mockDelay();
    return [
      { id: 'wh1', tipo: 'pagamento_confirmado', cobrancaId: 'cob_1', data: '2026-02-16T14:30:00', payload: {} },
      { id: 'wh2', tipo: 'pagamento_vencido', cobrancaId: 'cob_2', data: '2026-02-15T09:00:00', payload: {} },
    ];
  }
  const { data } = await apiClient.get<WebhookEvent[]>(`/gateway/webhooks?limit=${limit || 20}`); return data;
}
