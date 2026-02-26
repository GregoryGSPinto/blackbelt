/**
 * Assinatura Digital + Consentimento Service
 * TODO(BE-026): Implementar endpoints assinatura
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { DocumentoAssinatura, ConsentimentoLGPD } from './contracts';

export type { DocumentoAssinatura, ConsentimentoLGPD };

async function getMock() {
  return import('@/lib/__mocks__/assinatura.mock');
}

export async function getDocumentos(): Promise<DocumentoAssinatura[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.mockDocumentos]; }
  return apiClient.get<DocumentoAssinatura[]>('/assinatura/documentos');
}

export async function assinarDocumento(id: string): Promise<DocumentoAssinatura> {
  if (useMock()) {
    await mockDelay(500);
    const m = await getMock();
    const doc = m.mockDocumentos.find(d => d.id === id);
    if (!doc) throw new Error('Documento não encontrado');
    return { ...doc, status: 'ASSINADO', dataAssinatura: new Date().toISOString(), hashAssinatura: `sha256:${Date.now().toString(36)}` };
  }
  return apiClient.post<DocumentoAssinatura>(`/assinatura/documentos/${id}/assinar`, {});
}

export async function getConsentimentos(): Promise<ConsentimentoLGPD[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.mockConsentimentos]; }
  return apiClient.get<ConsentimentoLGPD[]>('/assinatura/consentimentos');
}

export async function toggleConsentimento(id: string, aceito: boolean): Promise<ConsentimentoLGPD> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    const c = m.mockConsentimentos.find(x => x.id === id);
    if (!c) throw new Error('Consentimento não encontrado');
    return { ...c, aceito, dataAceite: aceito ? new Date().toISOString().split('T')[0] : undefined };
  }
  return apiClient.put<ConsentimentoLGPD>(`/assinatura/consentimentos/${id}`, { aceito });
}
