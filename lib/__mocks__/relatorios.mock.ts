/**
 * Mock Data — Relatórios e Exportações — APENAS DESENVOLVIMENTO
 *
 * TODO(BE-024): Substituir por endpoints relatórios
 *   GET /relatorios/config
 *   POST /relatorios/gerar
 *   GET /relatorios/:id/exportar?formato=CSV
 */

import type {
  RelatorioConfig,
  RelatorioGerado,
  TipoRelatorio,
  PeriodoRelatorio,
  RelatorioLinha,
} from '@/lib/api/contracts';

// ── Configurações dos relatórios ─────────────────────────

export const relatorioConfigs: RelatorioConfig[] = [
  {
    tipo: 'FREQUENCIA',
    nome: 'Frequência de Alunos',
    descricao: 'Presença por aluno, turma e período. Inclui percentual de frequência e tendências.',
    icone: 'ClipboardCheck',
    cor: '#3B82F6',
    formatosDisponiveis: ['CSV', 'PDF', 'XLSX'],
    camposDisponiveis: ['nome', 'turma', 'total_presencas', 'total_faltas', 'pct_frequencia', 'streak_atual'],
  },
  {
    tipo: 'FINANCEIRO',
    nome: 'Relatório Financeiro',
    descricao: 'Receitas, inadimplência, pagamentos recebidos e previsão de caixa por período.',
    icone: 'DollarSign',
    cor: '#22C55E',
    formatosDisponiveis: ['CSV', 'PDF', 'XLSX'],
    camposDisponiveis: ['aluno', 'plano', 'valor', 'status_pagamento', 'data_vencimento', 'data_pagamento'],
  },
  {
    tipo: 'ALUNOS',
    nome: 'Cadastro de Alunos',
    descricao: 'Lista completa de alunos ativos, inativos e bloqueados com dados cadastrais.',
    icone: 'Users',
    cor: '#8B5CF6',
    formatosDisponiveis: ['CSV', 'XLSX'],
    camposDisponiveis: ['nome', 'email', 'telefone', 'nivel', 'turma', 'status', 'data_matricula'],
  },
  {
    tipo: 'GRADUACOES',
    nome: 'Graduações e Níveis',
    descricao: 'Distribuição de niveis, tempo médio por graduação e alunos aptos para exame.',
    icone: 'Award',
    cor: '#F59E0B',
    formatosDisponiveis: ['CSV', 'PDF'],
    camposDisponiveis: ['nome', 'nivel_atual', 'data_graduacao', 'tempo_no_nivel', 'presenca_pct', 'apto_exame'],
  },
  {
    tipo: 'EVENTOS',
    nome: 'Eventos e Campeonatos',
    descricao: 'Participações em eventos, resultados e conquistas conquistadas pela unidade.',
    icone: 'Trophy',
    cor: '#EF4444',
    formatosDisponiveis: ['CSV', 'PDF'],
    camposDisponiveis: ['evento', 'data', 'tipo', 'aluno', 'categoria', 'resultado', 'conquista'],
  },
  {
    tipo: 'EVASAO',
    nome: 'Análise de Evasão',
    descricao: 'Alunos em risco de evasão, inativos e cancelamentos com motivos.',
    icone: 'AlertTriangle',
    cor: '#F97316',
    formatosDisponiveis: ['CSV', 'PDF'],
    camposDisponiveis: ['nome', 'status', 'ultima_presenca', 'dias_ausente', 'frequencia_recente', 'risco'],
  },
  {
    tipo: 'CHECK_INS',
    nome: 'Log de Check-ins',
    descricao: 'Registro detalhado de todas as entradas com data, hora, turma e método.',
    icone: 'ScanLine',
    cor: '#06B6D4',
    formatosDisponiveis: ['CSV', 'XLSX'],
    camposDisponiveis: ['data', 'hora', 'aluno', 'turma', 'metodo', 'validado_por'],
  },
];

// ── Geradores de dados mock ──────────────────────────────

const NOMES = [
  'Carlos Silva', 'Rafael Mendes', 'Lucas Oliveira', 'Bruno Santos',
  'Gabriel Ferreira', 'André Barbosa', 'Felipe Costa', 'Thiago Lima',
  'Marcelo Souza', 'Ricardo Almeida', 'Pedro Nascimento', 'Diego Rocha',
  'Leonardo Ribeiro', 'Gustavo Pereira', 'Vinícius Carvalho', 'João Martins',
  'Eduardo Araújo', 'Henrique Duarte', 'Fernando Moreira', 'Mateus Gomes',
  'Amanda Rocha', 'Julia Ferreira', 'Ana Paula', 'Larissa Mota',
];

const TURMAS = ['Iniciantes Manhã', 'Avançado Noite', 'Fundamentals', 'All Levels', 'Teen Manhã', 'Kids Iniciante'];
const NIVEIS = ['Nível Iniciante', 'Nível Básico', 'Nível Intermediário', 'Nível Avançado', 'Nível Máximo'];
const PLANOS = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function gerarFrequencia(): RelatorioLinha[] {
  return NOMES.map(nome => ({
    nome,
    turma: pick(TURMAS),
    total_presencas: rand(10, 45),
    total_faltas: rand(0, 12),
    pct_frequencia: rand(55, 98),
    streak_atual: rand(0, 15),
  }));
}

function gerarFinanceiro(): RelatorioLinha[] {
  const statuses = ['Pago', 'Pendente', 'Em atraso', 'Pago'];
  return NOMES.map(nome => ({
    aluno: nome,
    plano: pick(PLANOS),
    valor: pick([150, 180, 195, 220, 350, 450, 800, 1200]),
    status_pagamento: pick(statuses),
    data_vencimento: `2026-02-${String(rand(1, 28)).padStart(2, '0')}`,
    data_pagamento: Math.random() > 0.3 ? `2026-02-${String(rand(1, 16)).padStart(2, '0')}` : '',
  }));
}

function gerarAlunos(): RelatorioLinha[] {
  const statuses = ['Ativo', 'Ativo', 'Ativo', 'Inativo', 'Bloqueado'];
  return NOMES.map((nome, i) => ({
    nome,
    email: `${nome.toLowerCase().replace(/\s/g, '.')}@email.com`,
    telefone: `(31) 9${rand(1000, 9999)}-${rand(1000, 9999)}`,
    nivel: pick(NIVEIS),
    turma: pick(TURMAS),
    status: pick(statuses),
    data_matricula: `${rand(2022, 2025)}-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`,
  }));
}

function gerarGraduacoes(): RelatorioLinha[] {
  return NOMES.slice(0, 15).map(nome => ({
    nome,
    nivel_atual: pick(NIVEIS),
    data_graduacao: `${rand(2022, 2025)}-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`,
    tempo_na_nivel: `${rand(6, 48)} meses`,
    presenca_pct: rand(60, 98),
    apto_exame: Math.random() > 0.65 ? 'Sim' : 'Não',
  }));
}

function gerarEventos(): RelatorioLinha[] {
  const eventos = ['Copa BlackBelt 2025', 'Campeonato Mineiro 2025', 'Open BlackBelt 2026', 'Desafio Interno Mar/2026'];
  const conquistas = ['Ouro', 'Prata', 'Bronze', '', '', ''];
  return Array.from({ length: 20 }, (_, i) => ({
    evento: pick(eventos),
    data: `${rand(2025, 2026)}-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`,
    tipo: Math.random() > 0.4 ? 'Externo' : 'Interno',
    aluno: pick(NOMES),
    categoria: `${pick(NIVEIS)} - ${pick(['Galo', 'Pena', 'Leve', 'Médio', 'Pesado'])}`,
    resultado: `${rand(1, 4)}º lugar`,
    conquista: pick(conquistas),
  }));
}

function gerarEvasao(): RelatorioLinha[] {
  const riscos = ['Alto', 'Médio', 'Baixo'];
  return NOMES.slice(0, 12).map(nome => ({
    nome,
    status: pick(['Em risco', 'Inativo', 'Cancelado', 'Em risco']),
    ultima_presenca: `2026-${String(rand(1, 2)).padStart(2, '0')}-${String(rand(1, 16)).padStart(2, '0')}`,
    dias_ausente: rand(5, 60),
    frequencia_recente: `${rand(0, 3)} treinos/sem`,
    risco: pick(riscos),
  }));
}

function gerarCheckins(): RelatorioLinha[] {
  const metodos = ['QR Code', 'Manual', 'Biométrico'];
  return Array.from({ length: 30 }, (_, i) => ({
    data: `2026-02-${String(rand(1, 16)).padStart(2, '0')}`,
    hora: `${String(rand(6, 21)).padStart(2, '0')}:${String(rand(0, 59)).padStart(2, '0')}`,
    aluno: pick(NOMES),
    turma: pick(TURMAS),
    metodo: pick(metodos),
    validado_por: Math.random() > 0.5 ? 'Sistema' : 'Prof. Ricardo',
  }));
}

// ── Gerador principal ────────────────────────────────────

const GERADORES: Record<TipoRelatorio, () => RelatorioLinha[]> = {
  FREQUENCIA: gerarFrequencia,
  FINANCEIRO: gerarFinanceiro,
  ALUNOS: gerarAlunos,
  GRADUACOES: gerarGraduacoes,
  EVENTOS: gerarEventos,
  EVASAO: gerarEvasao,
  CHECK_INS: gerarCheckins,
};

const COLUNAS: Record<TipoRelatorio, { key: string; label: string }[]> = {
  FREQUENCIA: [
    { key: 'nome', label: 'Aluno' }, { key: 'turma', label: 'Turma' },
    { key: 'total_presencas', label: 'Presenças' }, { key: 'total_faltas', label: 'Faltas' },
    { key: 'pct_frequencia', label: '% Freq.' }, { key: 'streak_atual', label: 'Streak' },
  ],
  FINANCEIRO: [
    { key: 'aluno', label: 'Aluno' }, { key: 'plano', label: 'Plano' },
    { key: 'valor', label: 'Valor (R$)' }, { key: 'status_pagamento', label: 'Status' },
    { key: 'data_vencimento', label: 'Vencimento' }, { key: 'data_pagamento', label: 'Pagamento' },
  ],
  ALUNOS: [
    { key: 'nome', label: 'Nome' }, { key: 'email', label: 'Email' },
    { key: 'nivel', label: 'Nível' }, { key: 'turma', label: 'Turma' },
    { key: 'status', label: 'Status' }, { key: 'data_matricula', label: 'Matrícula' },
  ],
  GRADUACOES: [
    { key: 'nome', label: 'Aluno' }, { key: 'nivel_atual', label: 'Nível' },
    { key: 'tempo_no_nivel', label: 'Tempo' }, { key: 'presenca_pct', label: '% Presença' },
    { key: 'apto_exame', label: 'Apto?' },
  ],
  EVENTOS: [
    { key: 'evento', label: 'Evento' }, { key: 'data', label: 'Data' },
    { key: 'aluno', label: 'Aluno' }, { key: 'categoria', label: 'Categoria' },
    { key: 'resultado', label: 'Resultado' }, { key: 'conquista', label: 'Conquista' },
  ],
  EVASAO: [
    { key: 'nome', label: 'Aluno' }, { key: 'status', label: 'Status' },
    { key: 'ultima_presenca', label: 'Última Presença' }, { key: 'dias_ausente', label: 'Dias Ausente' },
    { key: 'frequencia_recente', label: 'Freq. Recente' }, { key: 'risco', label: 'Risco' },
  ],
  CHECK_INS: [
    { key: 'data', label: 'Data' }, { key: 'hora', label: 'Hora' },
    { key: 'aluno', label: 'Aluno' }, { key: 'turma', label: 'Turma' },
    { key: 'metodo', label: 'Método' }, { key: 'validado_por', label: 'Validado por' },
  ],
};

const RESUMOS: Record<TipoRelatorio, (dados: RelatorioLinha[]) => { label: string; valor: string }[]> = {
  FREQUENCIA: (d) => [
    { label: 'Total de alunos', valor: String(d.length) },
    { label: 'Média frequência', valor: `${Math.round(d.reduce((s, r) => s + (Number(r.pct_frequencia) || 0), 0) / d.length)}%` },
    { label: 'Maior streak', valor: `${Math.max(...d.map(r => Number(r.streak_atual) || 0))} dias` },
  ],
  FINANCEIRO: (d) => [
    { label: 'Total registros', valor: String(d.length) },
    { label: 'Receita total', valor: `R$ ${d.reduce((s, r) => s + (Number(r.valor) || 0), 0).toLocaleString('pt-BR')}` },
    { label: 'Pagos', valor: String(d.filter(r => r.status_pagamento === 'Pago').length) },
    { label: 'Pendentes', valor: String(d.filter(r => r.status_pagamento !== 'Pago').length) },
  ],
  ALUNOS: (d) => [
    { label: 'Total', valor: String(d.length) },
    { label: 'Ativos', valor: String(d.filter(r => r.status === 'Ativo').length) },
    { label: 'Inativos', valor: String(d.filter(r => r.status === 'Inativo').length) },
  ],
  GRADUACOES: (d) => [
    { label: 'Total avaliados', valor: String(d.length) },
    { label: 'Aptos para exame', valor: String(d.filter(r => r.apto_exame === 'Sim').length) },
  ],
  EVENTOS: (d) => [
    { label: 'Total participações', valor: String(d.length) },
    { label: 'Conquistas', valor: String(d.filter(r => r.conquista && r.conquista !== '').length) },
  ],
  EVASAO: (d) => [
    { label: 'Total analisados', valor: String(d.length) },
    { label: 'Risco alto', valor: String(d.filter(r => r.risco === 'Alto').length) },
  ],
  CHECK_INS: (d) => [
    { label: 'Total check-ins', valor: String(d.length) },
    { label: 'Via QR Code', valor: String(d.filter(r => r.metodo === 'QR Code').length) },
  ],
};

export function gerarRelatorio(tipo: TipoRelatorio, periodo: PeriodoRelatorio): RelatorioGerado {
  const config = relatorioConfigs.find(c => c.tipo === tipo)!;
  const dados = GERADORES[tipo]();
  return {
    tipo,
    titulo: config.nome,
    periodo,
    geradoEm: new Date().toISOString(),
    totalLinhas: dados.length,
    colunas: COLUNAS[tipo],
    dados,
    resumo: RESUMOS[tipo](dados),
  };
}
