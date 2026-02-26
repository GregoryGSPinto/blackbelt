/**
 * Mock Data — Automações — APENAS DESENVOLVIMENTO
 *
 * TODO(BE-023): Substituir por endpoints automações
 *   GET /automacoes
 *   PUT /automacoes/:id
 *   PUT /automacoes/:id/toggle
 */

import type { Automacao } from '@/lib/api/contracts';

export const mockAutomacoes: Automacao[] = [
  // a) Aluno sumido
  {
    id: 'auto-1',
    nome: 'Aluno sumido',
    descricao: 'Notifica quando aluno fica sem treinar por X dias consecutivos',
    trigger: 'DIAS_SEM_TREINAR',
    canais: ['PUSH', 'WHATSAPP'],
    config: {
      valor: 3,
      unidade: 'dias',
      mensagemTemplate: 'Olá {nome}! Sentimos sua falta no ambiente. Já faz {dias_sem_treinar} dias desde seu último treino. Que tal voltar? 🥋',
      variaveisDisponiveis: ['{nome}', '{dias_sem_treinar}', '{turma}', '{professor}'],
    },
    ativa: true,
    stats: {
      totalEnviados: 187,
      ultimoEnvio: '2026-02-14',
      taxaResposta: 0.42,
      enviadosSemana: 12,
    },
    icone: 'UserX',
    cor: '#F97316',
  },

  // b) Inadimplência
  {
    id: 'auto-2',
    nome: 'Inadimplência',
    descricao: 'Lembrete automático quando mensalidade está em atraso',
    trigger: 'INADIMPLENCIA',
    canais: ['PUSH', 'WHATSAPP', 'EMAIL'],
    config: {
      valor: 3,
      unidade: 'dias após vencimento',
      mensagemTemplate: 'Olá {nome}, sua mensalidade de {mes_referencia} está pendente desde {data_vencimento}. Regularize pelo app para evitar bloqueio. 💳',
      variaveisDisponiveis: ['{nome}', '{mes_referencia}', '{data_vencimento}', '{valor}'],
    },
    ativa: true,
    stats: {
      totalEnviados: 94,
      ultimoEnvio: '2026-02-13',
      taxaResposta: 0.68,
      enviadosSemana: 8,
    },
    icone: 'CreditCard',
    cor: '#EF4444',
  },

  // c) Frequência alta
  {
    id: 'auto-3',
    nome: 'Frequência alta',
    descricao: 'Parabeniza alunos com alta frequência semanal',
    trigger: 'FREQUENCIA_ALTA',
    canais: ['PUSH'],
    config: {
      valor: 5,
      unidade: 'treinos na semana',
      mensagemTemplate: 'Parabéns {nome}! 🏆 Você treinou {total_treinos}x esta semana. Sua dedicação é inspiradora! Continue assim, guerreiro(a)!',
      variaveisDisponiveis: ['{nome}', '{total_treinos}', '{turma}'],
    },
    ativa: true,
    stats: {
      totalEnviados: 312,
      ultimoEnvio: '2026-02-15',
      taxaResposta: 0.85,
      enviadosSemana: 23,
    },
    icone: 'Flame',
    cor: '#22C55E',
  },

  // d) Lembrete de aula
  {
    id: 'auto-4',
    nome: 'Lembrete de aula',
    descricao: 'Avisa 1 hora antes da sessão favorita do aluno',
    trigger: 'LEMBRETE_AULA',
    canais: ['PUSH'],
    config: {
      mensagemTemplate: 'Ei {nome}! Sua sessão de {turma} começa em 1 hora ({horario}). Prepara o uniforme! 🥋',
      variaveisDisponiveis: ['{nome}', '{turma}', '{horario}', '{professor}'],
    },
    ativa: true,
    stats: {
      totalEnviados: 1540,
      ultimoEnvio: '2026-02-16',
      taxaResposta: 0.91,
      enviadosSemana: 89,
    },
    icone: 'Bell',
    cor: '#3B82F6',
  },

  // e) Apto para exame
  {
    id: 'auto-5',
    nome: 'Apto para exame de nível',
    descricao: 'Notifica quando aluno atinge requisitos mínimos para graduação',
    trigger: 'APTO_EXAME',
    canais: ['PUSH', 'EMAIL'],
    config: {
      mensagemTemplate: '{nome}, parabéns! 🎓 Você atingiu os requisitos para o exame de {proxima_nivel}. Converse com {professor} sobre os próximos passos!',
      variaveisDisponiveis: ['{nome}', '{nivel_atual}', '{proxima_nivel}', '{professor}', '{tempo_nivel}'],
    },
    ativa: true,
    stats: {
      totalEnviados: 28,
      ultimoEnvio: '2026-01-20',
      taxaResposta: 0.96,
      enviadosSemana: 0,
    },
    icone: 'Award',
    cor: '#A855F7',
  },

  // f) Reativação
  {
    id: 'auto-6',
    nome: 'Reativação de inativo',
    descricao: 'Contata alunos inativos há mais de 30 dias para reengajamento',
    trigger: 'INATIVO_REATIVACAO',
    canais: ['WHATSAPP', 'EMAIL'],
    config: {
      valor: 30,
      unidade: 'dias inativo',
      mensagemTemplate: 'Olá {nome}! Faz tempo que não te vemos no BlackBelt. Sentimos sua falta! 💪 Volte quando quiser, estamos te esperando. Que tal um treino essa semana?',
      variaveisDisponiveis: ['{nome}', '{dias_inativo}', '{ultima_presenca}', '{turma}'],
    },
    ativa: false,
    stats: {
      totalEnviados: 45,
      ultimoEnvio: '2025-12-10',
      taxaResposta: 0.22,
      enviadosSemana: 0,
    },
    icone: 'UserCheck',
    cor: '#6366F1',
  },

  // g) Aniversário
  {
    id: 'auto-7',
    nome: 'Aniversário',
    descricao: 'Parabéns automático no dia do aniversário do aluno',
    trigger: 'ANIVERSARIO',
    canais: ['PUSH', 'WHATSAPP'],
    config: {
      mensagemTemplate: 'Feliz aniversário {nome}! 🎂🎉 O BlackBelt deseja tudo de melhor pra você. Seu treino de aniversário é por nossa conta! Oss! 🥋',
      variaveisDisponiveis: ['{nome}', '{idade}'],
    },
    ativa: true,
    stats: {
      totalEnviados: 67,
      ultimoEnvio: '2026-02-12',
      taxaResposta: 0.78,
      enviadosSemana: 3,
    },
    icone: 'Cake',
    cor: '#EC4899',
  },

  // h) Pós-experimental
  {
    id: 'auto-8',
    nome: 'Pós-experimental',
    descricao: 'Follow-up automático após sessão experimental / trial',
    trigger: 'POS_EXPERIMENTAL',
    canais: ['WHATSAPP'],
    config: {
      valor: 1,
      unidade: 'dia após sessão trial',
      mensagemTemplate: 'Oi {nome}! Como foi sua sessão experimental no BlackBelt? 😊 Esperamos que tenha curtido! Quer conhecer nossos planos? Responda aqui que te ajudamos.',
      variaveisDisponiveis: ['{nome}', '{data_trial}', '{turma}', '{professor}'],
    },
    ativa: true,
    stats: {
      totalEnviados: 156,
      ultimoEnvio: '2026-02-15',
      taxaResposta: 0.54,
      enviadosSemana: 7,
    },
    icone: 'MessageCircle',
    cor: '#14B8A6',
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getAutomacaoById(id: string): Automacao | undefined {
  return mockAutomacoes.find(a => a.id === id);
}
