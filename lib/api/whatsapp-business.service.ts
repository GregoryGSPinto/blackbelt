/**
 * WhatsApp Business API — Service
 *
 * Envio programático de mensagens via WhatsApp Business API.
 * Em mock, simula envio com delay. Em produção, chama a API Meta/360dialog.
 *
 * Para envio manual via deeplink, use lib/utils/whatsapp.ts
 *
 * TODO(BE-032): Implementar integração com WhatsApp Business API (Meta ou 360dialog)
 * TODO(BE-033): Implementar webhook para status de entrega
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';

// ── Types ─────────────────────────────────────────────────

export type StatusEnvio = 'enviado' | 'entregue' | 'lido' | 'falha';

export interface EnvioWhatsApp {
  telefone: string;
  templateId?: string;
  mensagem?: string;
  variaveis?: Record<string, string>;
}

export interface RespostaEnvio {
  id: string;
  telefone: string;
  status: StatusEnvio;
  timestamp: string;
  erro?: string;
}

export interface EnvioLoteResult {
  total: number;
  enviados: number;
  falhas: number;
  detalhes: RespostaEnvio[];
}

export interface WhatsAppStats {
  enviadosHoje: number;
  entreguesHoje: number;
  lidosHoje: number;
  falhasHoje: number;
  limiteDisponivel: number;
}

// ── Service Functions ─────────────────────────────────────

export async function enviarMensagem(envio: EnvioWhatsApp): Promise<RespostaEnvio> {
  if (useMock()) {
    await mockDelay(800);
    logger.debug('[WhatsApp Mock] Enviando para:', envio.telefone, envio.mensagem?.slice(0, 50));
    return {
      id: `wpp_${Date.now().toString(36)}`,
      telefone: envio.telefone,
      status: 'enviado',
      timestamp: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<RespostaEnvio>('/whatsapp/enviar', envio); return data;
}

export async function enviarEmLote(envios: EnvioWhatsApp[]): Promise<EnvioLoteResult> {
  if (useMock()) {
    await mockDelay(1200);
    const detalhes = envios.map((e, i) => ({
      id: `wpp_${Date.now().toString(36)}_${i}`,
      telefone: e.telefone,
      status: 'enviado' as StatusEnvio,
      timestamp: new Date().toISOString(),
    }));
    return { total: envios.length, enviados: envios.length, falhas: 0, detalhes };
  }
  const { data } = await apiClient.post<EnvioLoteResult>('/whatsapp/enviar-lote', { envios }); return data;
}

export async function getStatusMensagem(id: string): Promise<RespostaEnvio> {
  if (useMock()) {
    await mockDelay();
    return { id, telefone: '', status: 'entregue', timestamp: new Date().toISOString() };
  }
  const { data } = await apiClient.get<RespostaEnvio>(`/whatsapp/status/${id}`); return data;
}

export async function getStats(): Promise<WhatsAppStats> {
  if (useMock()) {
    await mockDelay();
    return { enviadosHoje: 45, entreguesHoje: 42, lidosHoje: 38, falhasHoje: 3, limiteDisponivel: 955 };
  }
  const { data } = await apiClient.get<WhatsAppStats>('/whatsapp/stats'); return data;
}
