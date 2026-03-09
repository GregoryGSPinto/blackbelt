export interface MessageAttachment {
  id: string;
  nome?: string;
  tipo?: string;
  url: string;
}

export interface ConversationParticipant {
  id: string;
  nome: string;
  avatar?: string;
}

export interface ConversationMessage {
  id: string;
  conversaId: string;
  remetenteId: string;
  remetenteNome?: string;
  conteudo: string;
  tipo?: string;
  criadoEm: string;
  anexos?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  titulo: string;
  tipo: string;
  participantes: ConversationParticipant[];
  ultimaMensagem?: ConversationMessage | null;
  naoLidas?: number;
  atualizadoEm: string;
}

export interface MessageTemplate {
  id: string;
  nome: string;
  conteudo: string;
}

export interface MessageThread {
  conversa: Conversation;
  mensagens: ConversationMessage[];
}

export interface SendMessageInput {
  conversaId: string;
  conteudo: string;
  tipo?: string;
  anexos?: MessageAttachment[];
}
