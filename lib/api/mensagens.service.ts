// ============================================================
// Mensagens Service — Internal messaging system
// ============================================================
import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Mensagem, Conversa, MensagemTemplate } from '@/lib/__mocks__/mensagens.mock';
export type { Mensagem, Conversa, MensagemTemplate };

async function getMock() {
  return import('@/lib/__mocks__/mensagens.mock');
}

/** Get all conversations for current user */
export async function getConversas(): Promise<Conversa[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getConversas();
  }
  const { data } = await apiClient.get<Conversa[]>('/mensagens');
  return data;
}

/** Get messages for a conversation */
export async function getConversaMensagens(conversaId: string): Promise<Mensagem[]> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    return m.getConversaMensagens(conversaId);
  }
  const { data } = await apiClient.get<Mensagem[]>(`/mensagens/${conversaId}`);
  return data;
}

/** Get conversation with a specific user */
export async function getConversaByUser(userId: string): Promise<Conversa | null> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    return m.getConversaByParticipante(userId) ?? null;
  }
  const { data } = await apiClient.get<Conversa | null>(`/mensagens/user/${userId}`);
  return data;
}

/** Get total unread count */
export async function getUnreadCount(): Promise<number> {
  if (useMock()) {
    const m = await getMock();
    return m.getUnreadCount();
  }
  const { data } = await apiClient.get<{ count: number }>('/mensagens/unread');
  return data.count;
}

/** Send a message */
export async function sendMessage(
  conversaId: string,
  conteudo: string,
  remetenteId: string,
  remetenteNome: string,
  remetenteTipo: 'instrutor' | 'aluno' | 'responsavel',
): Promise<Mensagem> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getMock();
    return m.addMensagem(conversaId, {
      remetenteId,
      remetenteNome,
      remetenteTipo,
      conteudo,
      tipo: 'texto',
    });
  }
  const { data } = await apiClient.post<Mensagem>(`/mensagens/${conversaId}`, {
    conteudo, remetenteNome, remetenteTipo,
  });
  return data;
}

/** Send a template message */
export async function sendTemplateMessage(
  conversaId: string,
  templateTexto: string,
  remetenteId: string,
  remetenteNome: string,
  remetenteTipo: 'instrutor' | 'aluno' | 'responsavel',
): Promise<Mensagem> {
  if (useMock()) {
    await mockDelay(400);
    const m = await getMock();
    return m.addMensagem(conversaId, {
      remetenteId,
      remetenteNome,
      remetenteTipo,
      conteudo: templateTexto,
      tipo: 'template',
    });
  }
  const { data } = await apiClient.post<Mensagem>(`/mensagens/${conversaId}`, {
    conteudo: templateTexto, remetenteNome, remetenteTipo, tipo: 'template',
  });
  return data;
}

/** Mark conversation as read */
export async function markAsRead(conversaId: string): Promise<void> {
  if (useMock()) {
    await mockDelay(100);
    return;
  }
  await apiClient.patch(`/mensagens/${conversaId}/read`);
}

/** Get message templates */
export async function getTemplates(): Promise<MensagemTemplate[]> {
  if (useMock()) {
    const m = await getMock();
    return m.MENSAGEM_TEMPLATES;
  }
  const { data } = await apiClient.get<MensagemTemplate[]>('/mensagens/templates');
  return data;
}

/** Alias: getMensagens → getConversaMensagens */
export const getMensagens = getConversaMensagens;

/** Alias: enviarMensagem (simplified) */
export async function enviarMensagem(conversaId: string, conteudo: string): Promise<Mensagem> {
  return sendMessage(conversaId, conteudo, 'professor_01', 'Professor', 'instrutor');
}
