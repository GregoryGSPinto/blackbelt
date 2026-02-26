/**
 * WhatsApp Deeplink — Utilitário de integração
 *
 * Gera links wa.me com mensagem pré-formatada.
 * Suporta: aluno → unidade, admin → aluno, admin → fornecedor,
 * leads follow-up, cobranças, convites de evento.
 *
 * TODO(BE-025): Integrar com API WhatsApp Business (envio programático)
 */

// ── Core ──────────────────────────────────────────────────

/** Formata telefone para padrão internacional (BR) */
export function formatPhone(phone: string): string {
  // Remove tudo que não é dígito
  const digits = phone.replace(/\D/g, '');

  // Se já tem código de país (55)
  if (digits.startsWith('55') && digits.length >= 12) return digits;

  // Se tem DDD + número (11 dígitos)
  if (digits.length === 11) return `55${digits}`;

  // Se tem DDD + número sem 9 (10 dígitos)
  if (digits.length === 10) return `55${digits}`;

  return `55${digits}`;
}

/** Gera URL do WhatsApp com mensagem */
export function whatsappUrl(phone: string, message?: string): string {
  const formatted = formatPhone(phone);
  const base = `https://wa.me/${formatted}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Abre WhatsApp em nova aba */
export function openWhatsApp(phone: string, message?: string): void {
  window.open(whatsappUrl(phone, message), '_blank', 'noopener');
}

// ── Templates de Mensagem ─────────────────────────────────

export interface WhatsAppTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'cobranca' | 'convite' | 'followup' | 'geral' | 'evento' | 'reativacao';
  template: string;
  variaveis: string[];
}

export const TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'wpp-cobranca',
    nome: 'Cobrança amigável',
    descricao: 'Lembrete de mensalidade pendente',
    categoria: 'cobranca',
    template: `Olá {nome}! 👋\n\nSua mensalidade de {mes} está pendente desde {data_vencimento}.\n\n💳 Valor: {valor}\n📱 Pague pelo app ou via PIX.\n\nQualquer dúvida, estamos à disposição!\n\n🥋 BlackBelt`,
    variaveis: ['{nome}', '{mes}', '{data_vencimento}', '{valor}'],
  },
  {
    id: 'wpp-convite-trial',
    nome: 'Convite sessão experimental',
    descricao: 'Convida lead para sessão trial',
    categoria: 'convite',
    template: `Oi {nome}! 😊\n\nQue tal conhecer o BlackBelt?\n\n🥋 Agende sua sessão experimental *gratuita*!\n📍 {endereco}\n⏰ Turmas: {horarios}\n\nResponda aqui que agendamos pra você! 💪`,
    variaveis: ['{nome}', '{endereco}', '{horarios}'],
  },
  {
    id: 'wpp-followup-trial',
    nome: 'Follow-up pós-trial',
    descricao: 'Acompanhamento após sessão experimental',
    categoria: 'followup',
    template: `Oi {nome}! 👋\n\nComo foi sua sessão experimental no BlackBelt? Esperamos que tenha curtido! 🥋\n\nGostaria de conhecer nossos planos?\n\n📱 Mensal: R$ {valor_mensal}\n📱 Trimestral: R$ {valor_trimestral}\n\nResponda aqui que te ajudamos! 😊`,
    variaveis: ['{nome}', '{valor_mensal}', '{valor_trimestral}'],
  },
  {
    id: 'wpp-evento',
    nome: 'Convite para evento',
    descricao: 'Divulga evento ou campeonato',
    categoria: 'evento',
    template: `🏆 *{nome_evento}*\n\n📅 {data}\n📍 {local}\n💰 Inscrição: {valor}\n\nOlá {nome}! As inscrições estão abertas.\nInscreva-se pelo app ou responda aqui!\n\n🥋 BlackBelt`,
    variaveis: ['{nome}', '{nome_evento}', '{data}', '{local}', '{valor}'],
  },
  {
    id: 'wpp-reativacao',
    nome: 'Reativação de inativo',
    descricao: 'Contato com aluno que parou de treinar',
    categoria: 'reativacao',
    template: `Olá {nome}! 💪\n\nFaz um tempo que não te vemos no ambiente. Sentimos sua falta! 🥋\n\nVem voltar a treinar? Temos condições especiais para retorno.\n\nResponda aqui que conversamos! 😊\n\n🥋 BlackBelt`,
    variaveis: ['{nome}'],
  },
  {
    id: 'wpp-aniversario',
    nome: 'Parabéns aniversário',
    descricao: 'Mensagem de aniversário personalizada',
    categoria: 'geral',
    template: `🎂 *Feliz Aniversário, {nome}!* 🎉\n\nO BlackBelt deseja tudo de melhor pra você!\n\nSeu treino de aniversário é por nossa conta! 🥋💪\n\nOss! 🤙`,
    variaveis: ['{nome}'],
  },
];

/** Substitui variáveis no template */
export function renderTemplate(template: string, dados: Record<string, string>): string {
  let result = template;
  Object.entries(dados).forEach(([key, value]) => {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  return result;
}

/** Busca template por ID */
export function getTemplate(id: string): WhatsAppTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

/** Busca templates por categoria */
export function getTemplatesByCategoria(cat: WhatsAppTemplate['categoria']): WhatsAppTemplate[] {
  return TEMPLATES.filter(t => t.categoria === cat);
}
