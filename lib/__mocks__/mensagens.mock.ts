// ============================================================
// Mensagens Mock — Internal messaging system mock data
// ============================================================

export interface Mensagem {
  id: string;
  conversaId: string;
  remetenteId: string;
  remetenteNome: string;
  remetenteTipo: 'instrutor' | 'aluno' | 'responsavel' | 'sistema';
  conteudo: string;
  timestamp: string; // ISO
  lida: boolean;
  tipo: 'texto' | 'template' | 'sistema';
}

export interface Conversa {
  id: string;
  participantes: { id: string; nome: string; tipo: string; avatar?: string }[];
  ultimaMensagem: Mensagem;
  naoLidas: number;
  ativa: boolean;
}

export interface MensagemTemplate {
  id: string;
  label: string;
  emoji: string;
  texto: string;
  categoria: 'ausencia' | 'parabens' | 'lembrete' | 'geral';
}

// ── Templates ──

export const MENSAGEM_TEMPLATES: MensagemTemplate[] = [
  { id: 'tmpl-1', label: 'Sentimos sua falta', emoji: '👋', texto: 'Olá {nome}! Sentimos sua falta nas sessões. Está tudo bem? Esperamos te ver em breve!', categoria: 'ausencia' },
  { id: 'tmpl-2', label: 'Parabéns pela evolução', emoji: '🏆', texto: 'Parabéns {nome}! Sua evolução tem sido incrível. Continue assim, você está no caminho certo!', categoria: 'parabens' },
  { id: 'tmpl-3', label: 'Lembrete de aula', emoji: '🔔', texto: 'Olá {nome}! Lembrete: sua sessão é amanhã às {horario}. Te esperamos! 🥋', categoria: 'lembrete' },
  { id: 'tmpl-4', label: 'Graduação próxima', emoji: '🎯', texto: '{nome}, você está quase lá! Continue frequentando as sessões e em breve estará pronto(a) para a próxima graduação!', categoria: 'parabens' },
  { id: 'tmpl-5', label: 'Boas-vindas', emoji: '🦁', texto: 'Bem-vindo(a) ao BlackBelt, {nome}! Estamos muito felizes em ter você conosco. Qualquer dúvida, é só mandar uma mensagem!', categoria: 'geral' },
  { id: 'tmpl-6', label: 'Aviso de ausência', emoji: '📋', texto: 'Olá professor, gostaria de informar que {nome} não poderá comparecer à sessão de hoje. Obrigado pela compreensão.', categoria: 'ausencia' },
];

// ── Mock conversations ──

const NOW = new Date();
function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3600000).toISOString();
}

const MOCK_MENSAGENS: Mensagem[] = [
  // Conversa 1: Professor → Aluno Rafael
  { id: 'm1', conversaId: 'conv-1', remetenteId: 'prof-1', remetenteNome: 'Prof. Ricardo', remetenteTipo: 'instrutor', conteudo: 'Rafael, parabéns pela sua dedicação nas últimas semanas! Sua guarda está evoluindo muito.', timestamp: hoursAgo(48), lida: true, tipo: 'texto' },
  { id: 'm2', conversaId: 'conv-1', remetenteId: 'aluno-1', remetenteNome: 'Rafael Santos', remetenteTipo: 'aluno', conteudo: 'Obrigado instrutor! Tenho treinado bastante os drills que o senhor passou.', timestamp: hoursAgo(47), lida: true, tipo: 'texto' },
  { id: 'm3', conversaId: 'conv-1', remetenteId: 'prof-1', remetenteNome: 'Prof. Ricardo', remetenteTipo: 'instrutor', conteudo: 'Excelente! Na próxima sessão vou te mostrar uma variação nova. 💪', timestamp: hoursAgo(46), lida: true, tipo: 'texto' },

  // Conversa 2: Professor → Responsável (mãe do Lucas)
  { id: 'm4', conversaId: 'conv-2', remetenteId: 'prof-1', remetenteNome: 'Prof. Ricardo', remetenteTipo: 'instrutor', conteudo: 'Olá Dona Maria! O Lucas está indo muito bem nas sessões. Ele é muito participativo e ajuda os colegas.', timestamp: hoursAgo(24), lida: true, tipo: 'texto' },
  { id: 'm5', conversaId: 'conv-2', remetenteId: 'resp-1', remetenteNome: 'Maria Silva', remetenteTipo: 'responsavel', conteudo: 'Que bom saber! Ele adora as sessões e fala muito do senhor. Obrigada pelo carinho!', timestamp: hoursAgo(22), lida: true, tipo: 'texto' },
  { id: 'm6', conversaId: 'conv-2', remetenteId: 'prof-1', remetenteNome: 'Prof. Ricardo', remetenteTipo: 'instrutor', conteudo: 'Ele é ótimo! Está quase pronto para a próxima graduação. Vamos avaliar no final do mês.', timestamp: hoursAgo(21), lida: false, tipo: 'texto' },

  // Conversa 3: Sistema → Aluno (automática)
  { id: 'm7', conversaId: 'conv-3', remetenteId: 'sistema', remetenteNome: 'BlackBelt', remetenteTipo: 'sistema', conteudo: 'Olá Pedro! Sentimos sua falta nas sessões. Está tudo bem? Esperamos te ver em breve!', timestamp: hoursAgo(72), lida: true, tipo: 'template' },
  { id: 'm8', conversaId: 'conv-3', remetenteId: 'aluno-3', remetenteNome: 'Pedro Costa', remetenteTipo: 'aluno', conteudo: 'Oi! Estava doente mas já estou melhor. Volto na próxima sessão!', timestamp: hoursAgo(70), lida: true, tipo: 'texto' },
];

const MOCK_CONVERSAS: Conversa[] = [
  {
    id: 'conv-1',
    participantes: [
      { id: 'prof-1', nome: 'Prof. Ricardo', tipo: 'instrutor' },
      { id: 'aluno-1', nome: 'Rafael Santos', tipo: 'aluno', avatar: 'R' },
    ],
    ultimaMensagem: MOCK_MENSAGENS[2],
    naoLidas: 0,
    ativa: true,
  },
  {
    id: 'conv-2',
    participantes: [
      { id: 'prof-1', nome: 'Prof. Ricardo', tipo: 'instrutor' },
      { id: 'resp-1', nome: 'Maria Silva', tipo: 'responsavel', avatar: 'M' },
    ],
    ultimaMensagem: MOCK_MENSAGENS[5],
    naoLidas: 1,
    ativa: true,
  },
  {
    id: 'conv-3',
    participantes: [
      { id: 'sistema', nome: 'BlackBelt', tipo: 'sistema' },
      { id: 'aluno-3', nome: 'Pedro Costa', tipo: 'aluno', avatar: 'P' },
    ],
    ultimaMensagem: MOCK_MENSAGENS[7],
    naoLidas: 0,
    ativa: true,
  },
];

// ── Mock functions ──

export function getConversas(): Conversa[] {
  return [...MOCK_CONVERSAS];
}

export function getConversaMensagens(conversaId: string): Mensagem[] {
  return MOCK_MENSAGENS.filter(m => m.conversaId === conversaId);
}

export function getConversaByParticipante(userId: string): Conversa | undefined {
  return MOCK_CONVERSAS.find(c =>
    c.participantes.some(p => p.id === userId)
  );
}

export function getUnreadCount(): number {
  return MOCK_CONVERSAS.reduce((sum, c) => sum + c.naoLidas, 0);
}

export function addMensagem(conversaId: string, msg: Omit<Mensagem, 'id' | 'conversaId' | 'timestamp' | 'lida'>): Mensagem {
  const nova: Mensagem = {
    ...msg,
    id: `m-${Date.now()}`,
    conversaId,
    timestamp: new Date().toISOString(),
    lida: false,
  };
  MOCK_MENSAGENS.push(nova);
  const conv = MOCK_CONVERSAS.find(c => c.id === conversaId);
  if (conv) conv.ultimaMensagem = nova;
  return nova;
}
