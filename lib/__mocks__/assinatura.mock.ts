/**
 * Mock Data — Assinatura Digital + Consentimento
 * TODO(BE-026): Substituir por endpoints assinatura
 */

import type { DocumentoAssinatura, ConsentimentoLGPD } from '@/lib/api/contracts';

export const mockDocumentos: DocumentoAssinatura[] = [
  {
    id: 'doc-1',
    tipo: 'CONTRATO_MATRICULA',
    titulo: 'Contrato de Matrícula',
    descricao: 'Termos e condições de matrícula na unidade BlackBelt.',
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS — BLACKBELT\n\n1. OBJETO\nO presente contrato tem por objeto a prestação de serviços de ensino de Práticas de Desenvolvimento Pessoal pela ACADEMIA BLACKBELT ao ALUNO.\n\n2. OBRIGAÇÕES DA ACADEMIA\n2.1. Disponibilizar espaço adequado e seguro para a prática;\n2.2. Fornecer instrutores qualificados;\n2.3. Emitir certificados de graduação quando cabível.\n\n3. OBRIGAÇÕES DO ALUNO\n3.1. Manter mensalidades em dia;\n3.2. Respeitar o regulamento interno;\n3.3. Comparecer com vestimenta adequada (uniforme).\n\n4. PAGAMENTO\nMensalidade conforme plano escolhido, com vencimento todo dia 10.\n\n5. RESCISÃO\nQualquer das partes pode rescindir com aviso prévio de 30 dias.\n\n6. FORO\nFica eleito o foro da comarca de Vespasiano/MG.`,
    versao: '2.1',
    obrigatorio: true,
    status: 'ASSINADO',
    dataAssinatura: '2024-03-15T10:30:00',
    ipAssinatura: '189.44.xxx.xxx',
    hashAssinatura: 'sha256:a1b2c3d4e5f6...',
  },
  {
    id: 'doc-2',
    tipo: 'REGULAMENTO_INTERNO',
    titulo: 'Regulamento Interno',
    descricao: 'Regras de conduta, horários e normas da unidade.',
    conteudo: `REGULAMENTO INTERNO — BLACKBELT\n\n1. É obrigatório o uso de uniforme nas sessões de Gi.\n2. Mantenha a higiene pessoal e do uniforme.\n3. Unhas cortadas (mãos e pés).\n4. Respeite instrutores e colegas.\n5. Celular no silencioso durante as sessões.\n6. Não é permitido filmar sessões sem autorização.\n7. Pontualidade: tolerância de 10 minutos.\n8. Em caso de lesão, informe imediatamente o instrutor.`,
    versao: '1.3',
    obrigatorio: true,
    status: 'ASSINADO',
    dataAssinatura: '2024-03-15T10:32:00',
    ipAssinatura: '189.44.xxx.xxx',
    hashAssinatura: 'sha256:f6e5d4c3b2a1...',
  },
  {
    id: 'doc-3',
    tipo: 'CONSENTIMENTO_IMAGEM',
    titulo: 'Uso de Imagem',
    descricao: 'Autorização para uso de fotos e vídeos em redes sociais e marketing.',
    conteudo: `TERMO DE AUTORIZAÇÃO DE USO DE IMAGEM\n\nAutorizo a Unidade BlackBelt a captar, utilizar e divulgar minha imagem (fotos e vídeos) durante treinos e eventos, para fins de divulgação em redes sociais, site e material publicitário, sem fins comerciais diretos.\n\nEsta autorização é válida por tempo indeterminado e pode ser revogada a qualquer momento mediante comunicação por escrito.`,
    versao: '1.0',
    obrigatorio: false,
    status: 'PENDENTE',
  },
  {
    id: 'doc-4',
    tipo: 'TERMO_SAUDE',
    titulo: 'Declaração de Saúde',
    descricao: 'Declaração de aptidão física para prática de artes marciais.',
    conteudo: `DECLARAÇÃO DE APTIDÃO FÍSICA\n\nDeclaro que:\n1. Estou em boas condições de saúde para a prática de treinamento especializado;\n2. Não possuo restrições médicas que impeçam atividade física intensa;\n3. Estou ciente dos riscos inerentes à prática de artes marciais;\n4. Me comprometo a informar qualquer alteração de saúde ao instrutor.`,
    versao: '1.1',
    obrigatorio: true,
    status: 'ASSINADO',
    dataAssinatura: '2024-03-15T10:35:00',
    ipAssinatura: '189.44.xxx.xxx',
    hashAssinatura: 'sha256:1a2b3c4d5e6f...',
  },
  {
    id: 'doc-5',
    tipo: 'CONSENTIMENTO_LGPD',
    titulo: 'Consentimento LGPD',
    descricao: 'Autorização para tratamento de dados pessoais conforme LGPD.',
    conteudo: `TERMO DE CONSENTIMENTO — LEI GERAL DE PROTEÇÃO DE DADOS (LGPD)\n\nNos termos da Lei nº 13.709/2018, autorizo a Unidade BlackBelt a coletar e tratar meus dados pessoais para as seguintes finalidades:\n\n• Gestão de matrícula e frequência;\n• Comunicações sobre sessões, eventos e pagamentos;\n• Envio de comunicados por app, e-mail e WhatsApp;\n• Geração de relatórios internos.\n\nSeus dados não serão compartilhados com terceiros sem seu consentimento expresso. Você pode solicitar a exclusão de seus dados a qualquer momento.`,
    versao: '2.0',
    obrigatorio: true,
    status: 'ASSINADO',
    dataAssinatura: '2024-03-15T10:33:00',
    ipAssinatura: '189.44.xxx.xxx',
    hashAssinatura: 'sha256:9f8e7d6c5b4a...',
  },
  {
    id: 'doc-6',
    tipo: 'TERMO_RESPONSABILIDADE',
    titulo: 'Termo de Responsabilidade (Menores)',
    descricao: 'Autorização do responsável legal para participação de menores.',
    conteudo: `TERMO DE RESPONSABILIDADE — MENORES DE 18 ANOS\n\nEu, responsável legal, autorizo a participação do(a) menor nas sessões de Práticas de Desenvolvimento Pessoal na Unidade BlackBelt, assumindo responsabilidade por quaisquer lesões decorrentes da prática esportiva, desde que respeitadas as normas de segurança da unidade.`,
    versao: '1.0',
    obrigatorio: false,
    status: 'PENDENTE',
  },
];

export const mockConsentimentos: ConsentimentoLGPD[] = [
  { id: 'cons-1', titulo: 'Dados de matrícula e frequência', descricao: 'Coleta e tratamento de nome, CPF, endereço e registro de presenças.', obrigatorio: true, aceito: true, dataAceite: '2024-03-15' },
  { id: 'cons-2', titulo: 'Comunicações por app e e-mail', descricao: 'Envio de avisos, comunicados e notificações sobre sessões e eventos.', obrigatorio: true, aceito: true, dataAceite: '2024-03-15' },
  { id: 'cons-3', titulo: 'Comunicações por WhatsApp', descricao: 'Envio de mensagens sobre sessões, pagamentos e promoções via WhatsApp.', obrigatorio: false, aceito: true, dataAceite: '2024-03-15' },
  { id: 'cons-4', titulo: 'Marketing e promoções', descricao: 'Envio de ofertas, descontos e campanhas promocionais.', obrigatorio: false, aceito: false },
  { id: 'cons-5', titulo: 'Compartilhamento com parceiros', descricao: 'Compartilhamento de dados com fornecedores e parceiros para benefícios exclusivos.', obrigatorio: false, aceito: false },
];
