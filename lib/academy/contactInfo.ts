// ============================================================
// Academy Contact Info — Single Source of Truth
// ============================================================
// TODO(PROD-001): Substituir valores placeholder antes do deploy
// Todos os placeholders marcados com FIXME para busca fácil
// ============================================================

export const ACADEMY_CONTACT = {
  // ── Razão Social ──
  razaoSocial: 'BLACKBELT LTDA', // FIXME: razão social real
  cnpj: '00.000.000/0001-00',       // FIXME: CNPJ real
  endereco: 'Rua a definir, 000',    // FIXME: endereço real
  cep: '00000-000',                  // FIXME: CEP real
  cidade: 'Vespasiano',
  estado: 'MG',

  // ── Canais de Atendimento ──
  email: 'suporte@blackbelt.com',
  whatsapp: '(31) 00000-0000',       // FIXME: WhatsApp real
  telefone: '0800-000-0000',         // FIXME: telefone real

  // ── URLs ──
  site: 'https://blackbelt.com',
  instagram: 'https://instagram.com/blackbelt',

  // ── Suporte ──
  tempoResposta: '24 horas úteis',
} as const;

// Helper para endereço completo
export function enderecoCompleto(): string {
  return `${ACADEMY_CONTACT.endereco}, ${ACADEMY_CONTACT.cidade} - ${ACADEMY_CONTACT.estado}, CEP: ${ACADEMY_CONTACT.cep}`;
}

// Contagem de FIXMEs para pré-deploy check
// grep -c 'FIXME' lib/academy/contactInfo.ts → deve ser 0 antes de produção
