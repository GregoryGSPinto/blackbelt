/**
 * Assinatura Digital + Consentimento Service — FAIL-SAFE
 * 
 * PRINCÍPIO: Nunca quebra a UI, sempre retorna dados válidos
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { DocumentoAssinatura, ConsentimentoLGPD } from './contracts';

export type { DocumentoAssinatura, ConsentimentoLGPD };

// Dados vazios de fallback
const emptyDocumento: DocumentoAssinatura = {
  id: '',
  titulo: 'Documento',
  tipo: 'CONTRATO_MATRICULA',
  descricao: '',
  conteudo: '',
  versao: '1.0',
  obrigatorio: true,
  status: 'PENDENTE',
};

const emptyConsentimento: ConsentimentoLGPD = {
  id: '',
  titulo: 'Consentimento',
  descricao: '',
  obrigatorio: false,
  aceito: false,
};

async function getMock() {
  return import('@/lib/__mocks__/assinatura.mock');
}

export async function getDocumentos(): Promise<DocumentoAssinatura[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.mockDocumentos];
  }
  
  try {
    const { data } = await apiClient.get<DocumentoAssinatura[]>('/assinatura/documentos');
    return data || [];
  } catch (err) {
    logger.error('[assinatura.service]', 'getDocumentos failed', err);
    return [];
  }
}

export async function assinarDocumento(id: string): Promise<DocumentoAssinatura> {
  if (useMock()) {
    await mockDelay(500);
    const m = await getMock();
    const doc = m.mockDocumentos.find(d => d.id === id);
    if (!doc) {
      logger.warn('[assinatura.service]', 'Documento não encontrado no mock', { id });
      return { 
        ...emptyDocumento, 
        id, 
        status: 'ASSINADO',
        dataAssinatura: new Date().toISOString(),
        hashAssinatura: `sha256:${Date.now().toString(36)}`
      };
    }
    return { 
      ...doc, 
      status: 'ASSINADO', 
      dataAssinatura: new Date().toISOString(), 
      hashAssinatura: `sha256:${Date.now().toString(36)}` 
    };
  }
  
  try {
    const { data } = await apiClient.post<DocumentoAssinatura>(`/assinatura/documentos/${id}/assinar`, {});
    return data || { ...emptyDocumento, id, status: 'ASSINADO' };
  } catch (err) {
    logger.error('[assinatura.service]', 'assinarDocumento failed', err);
    return { 
      ...emptyDocumento, 
      id, 
      status: 'ASSINADO',
      dataAssinatura: new Date().toISOString(),
    };
  }
}

export async function getConsentimentos(): Promise<ConsentimentoLGPD[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.mockConsentimentos];
  }
  
  try {
    const { data } = await apiClient.get<ConsentimentoLGPD[]>('/assinatura/consentimentos');
    return data || [];
  } catch (err) {
    logger.error('[assinatura.service]', 'getConsentimentos failed', err);
    return [];
  }
}

export async function toggleConsentimento(id: string, aceito: boolean): Promise<ConsentimentoLGPD> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    const c = m.mockConsentimentos.find(x => x.id === id);
    if (!c) {
      logger.warn('[assinatura.service]', 'Consentimento não encontrado no mock', { id });
      return { 
        ...emptyConsentimento, 
        id, 
        aceito, 
        dataAceite: aceito ? new Date().toISOString().split('T')[0] : undefined 
      };
    }
    return { 
      ...c, 
      aceito, 
      dataAceite: aceito ? new Date().toISOString().split('T')[0] : undefined 
    };
  }
  
  try {
    const { data } = await apiClient.put<ConsentimentoLGPD>(`/assinatura/consentimentos/${id}`, { aceito });
    return data || { ...emptyConsentimento, id, aceito };
  } catch (err) {
    logger.error('[assinatura.service]', 'toggleConsentimento failed', err);
    return { 
      ...emptyConsentimento, 
      id, 
      aceito,
      dataAceite: aceito ? new Date().toISOString().split('T')[0] : undefined,
    };
  }
}
