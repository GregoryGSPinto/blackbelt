// ============================================================
// Mensagens Service — Internal messaging system
// ============================================================
import type { Mensagem, Conversa, MensagemTemplate } from '@/lib/__mocks__/mensagens.mock';
export type { Mensagem, Conversa, MensagemTemplate };

function useMock() {
  return process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
}

async function mockDelay(ms = 300) {
  return new Promise(r => setTimeout(r, ms));
}

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
  // Production: const { data } = await apiClient.get('/mensagens/conversas');
  return [];
}

/** Get messages for a conversation */
export async function getConversaMensagens(conversaId: string): Promise<Mensagem[]> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    return m.getConversaMensagens(conversaId);
  }
  return [];
}

/** Get conversation with a specific user */
export async function getConversaByUser(userId: string): Promise<Conversa | null> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    return m.getConversaByParticipante(userId) ?? null;
  }
  return null;
}

/** Get total unread count */
export async function getUnreadCount(): Promise<number> {
  if (useMock()) {
    const m = await getMock();
    return m.getUnreadCount();
  }
  return 0;
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
  throw new Error('Not implemented');
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
  throw new Error('Not implemented');
}

/** Mark conversation as read */
export async function markAsRead(conversaId: string): Promise<void> {
  if (useMock()) {
    await mockDelay(100);
    // In production: PATCH /mensagens/conversas/:id/read
    return;
  }
}

/** Get message templates */
export async function getTemplates(): Promise<MensagemTemplate[]> {
  if (useMock()) {
    const m = await getMock();
    return m.MENSAGEM_TEMPLATES;
  }
  return [];
}

/** Alias: getMensagens → getConversaMensagens */
export const getMensagens = getConversaMensagens;

/** Alias: enviarMensagem (simplified) */
export async function enviarMensagem(conversaId: string, conteudo: string): Promise<Mensagem> {
  return sendMessage(conversaId, conteudo, 'professor_01', 'Professor', 'instrutor');
}
