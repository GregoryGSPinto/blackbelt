/**
 * Mock Data — Academy Management (Admin)
 * Dados da academia, modalidades, grade, planos, contratos
 */

// ─── Academy Registration ────────────────────────────────

export interface AcademyData {
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  telefone: string;
  whatsapp: string;
  emailInstitucional: string;
  website: string;
  redesSociais: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
  bannerUrl: string;
  horarioFuncionamento: DaySchedule[];
  capacidadeM2: number;
  capacidadeAlunos: number;
  dataFundacao: string;
  descricao: string;
  regulamento: string;
  politicaCancelamento: string;
}

export interface DaySchedule {
  dia: string;
  aberto: boolean;
  inicio: string;
  fim: string;
}

export const mockAcademyData: AcademyData = {
  razaoSocial: 'BlackBelt Artes Marciais Ltda',
  cnpj: '12.345.678/0001-90',
  inscricaoEstadual: '123.456.789.000',
  inscricaoMunicipal: '987654',
  endereco: {
    cep: '30130-000',
    logradouro: 'Rua dos Guajajaras',
    numero: '1200',
    complemento: 'Sala 301',
    bairro: 'Centro',
    cidade: 'Belo Horizonte',
    estado: 'MG',
  },
  telefone: '(31) 3333-4444',
  whatsapp: '(31) 99999-8888',
  emailInstitucional: 'contato@blackbelt.com.br',
  website: 'https://blackbelt.com.br',
  redesSociais: {
    instagram: 'https://instagram.com/blackbelt_bh',
    facebook: 'https://facebook.com/blackbeltbh',
    youtube: 'https://youtube.com/@blackbeltbh',
  },
  bannerUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1200',
  horarioFuncionamento: [
    { dia: 'Segunda', aberto: true, inicio: '06:00', fim: '22:00' },
    { dia: 'Terca', aberto: true, inicio: '06:00', fim: '22:00' },
    { dia: 'Quarta', aberto: true, inicio: '06:00', fim: '22:00' },
    { dia: 'Quinta', aberto: true, inicio: '06:00', fim: '22:00' },
    { dia: 'Sexta', aberto: true, inicio: '06:00', fim: '22:00' },
    { dia: 'Sabado', aberto: true, inicio: '08:00', fim: '14:00' },
    { dia: 'Domingo', aberto: false, inicio: '', fim: '' },
  ],
  capacidadeM2: 350,
  capacidadeAlunos: 40,
  dataFundacao: '2015-03-15',
  descricao: 'Academia referencia em artes marciais em Belo Horizonte. Oferecemos aulas de Jiu-Jitsu, Muay Thai e MMA para todas as idades e niveis.',
  regulamento: 'E obrigatorio o uso de kimono limpo nas aulas de Jiu-Jitsu. Luvas e caneleiras sao obrigatorias nas aulas de Muay Thai. Respeite os horarios e seus colegas de treino.',
  politicaCancelamento: 'O cancelamento deve ser solicitado com 30 dias de antecedencia. Multa de 10% sobre o valor restante do contrato em caso de cancelamento antes do periodo minimo de 3 meses.',
};

// ─── Modalities ──────────────────────────────────────────

export interface Modalidade {
  id: string;
  nome: string;
  ativa: boolean;
  graduacoes: Graduacao[];
  tempoMinimoMeses: number;
  faixaEtaria: string[];
  niveis: string[];
  professorResponsavel: string;
  equipamentos: string[];
}

export interface Graduacao {
  nome: string;
  cor: string;
  ordem: number;
}

export const TODAS_MODALIDADES = [
  'Jiu-Jitsu (Gi)', 'Jiu-Jitsu (No-Gi)', 'Muay Thai', 'Boxe', 'Judo',
  'Karate', 'Taekwondo', 'Wrestling', 'MMA', 'Capoeira',
  'Kickboxing', 'Kung Fu', 'Aikido', 'Krav Maga', 'Sambo', 'Hapkido',
];

export const FAIXAS_ETARIAS = ['Kids 4-7', 'Kids 8-12', 'Teen 13-17', 'Adulto 18+'];
export const NIVEIS = ['Iniciante', 'Intermediario', 'Avancado', 'Competicao'];
export const EQUIPAMENTOS = ['Kimono', 'Luvas', 'Caneleira', 'Protetor Bucal', 'Rashguard', 'Shorts', 'Faixa'];

export const mockModalidades: Modalidade[] = [
  {
    id: 'bjj-gi',
    nome: 'Jiu-Jitsu (Gi)',
    ativa: true,
    graduacoes: [
      { nome: 'Branca', cor: '#FFFFFF', ordem: 1 },
      { nome: 'Azul', cor: '#2563EB', ordem: 2 },
      { nome: 'Roxa', cor: '#7C3AED', ordem: 3 },
      { nome: 'Marrom', cor: '#92400E', ordem: 4 },
      { nome: 'Preta', cor: '#000000', ordem: 5 },
    ],
    tempoMinimoMeses: 24,
    faixaEtaria: ['Teen 13-17', 'Adulto 18+'],
    niveis: ['Iniciante', 'Intermediario', 'Avancado', 'Competicao'],
    professorResponsavel: 'Prof. Ricardo Silva',
    equipamentos: ['Kimono', 'Faixa', 'Rashguard'],
  },
  {
    id: 'muay-thai',
    nome: 'Muay Thai',
    ativa: true,
    graduacoes: [
      { nome: 'Branca', cor: '#FFFFFF', ordem: 1 },
      { nome: 'Amarela', cor: '#EAB308', ordem: 2 },
      { nome: 'Verde', cor: '#22C55E', ordem: 3 },
      { nome: 'Azul', cor: '#2563EB', ordem: 4 },
      { nome: 'Vermelha', cor: '#EF4444', ordem: 5 },
      { nome: 'Preta', cor: '#000000', ordem: 6 },
    ],
    tempoMinimoMeses: 12,
    faixaEtaria: ['Kids 8-12', 'Teen 13-17', 'Adulto 18+'],
    niveis: ['Iniciante', 'Intermediario', 'Avancado'],
    professorResponsavel: 'Prof. Ana Costa',
    equipamentos: ['Luvas', 'Caneleira', 'Protetor Bucal', 'Shorts'],
  },
  {
    id: 'mma',
    nome: 'MMA',
    ativa: true,
    graduacoes: [],
    tempoMinimoMeses: 0,
    faixaEtaria: ['Adulto 18+'],
    niveis: ['Iniciante', 'Intermediario', 'Avancado', 'Competicao'],
    professorResponsavel: 'Prof. Joao Mendes',
    equipamentos: ['Luvas', 'Caneleira', 'Protetor Bucal', 'Rashguard', 'Shorts'],
  },
];

// ─── Schedule Grid ───────────────────────────────────────

export interface TurmaGrade {
  id: string;
  nome: string;
  modalidade: string;
  professor: string;
  sala: string;
  diaSemana: number; // 0=seg, 5=sab
  horaInicio: number; // 6-22
  duracao: number; // em horas (1 ou 1.5 ou 2)
  alunosAtivos: number;
  capacidade: number;
  cor: string;
}

export const mockTurmasGrade: TurmaGrade[] = [
  { id: 't1', nome: 'BJJ Iniciantes Manha', modalidade: 'Jiu-Jitsu (Gi)', professor: 'Prof. Ricardo', sala: 'Tatame 1', diaSemana: 0, horaInicio: 7, duracao: 1.5, alunosAtivos: 18, capacidade: 25, cor: '#2563EB' },
  { id: 't2', nome: 'Muay Thai Manha', modalidade: 'Muay Thai', professor: 'Prof. Ana', sala: 'Tatame 2', diaSemana: 0, horaInicio: 8, duracao: 1, alunosAtivos: 12, capacidade: 20, cor: '#EF4444' },
  { id: 't3', nome: 'BJJ Avancado Noite', modalidade: 'Jiu-Jitsu (Gi)', professor: 'Prof. Ricardo', sala: 'Tatame 1', diaSemana: 0, horaInicio: 19, duracao: 1.5, alunosAtivos: 22, capacidade: 25, cor: '#2563EB' },
  { id: 't4', nome: 'MMA Noite', modalidade: 'MMA', professor: 'Prof. Joao', sala: 'Tatame 2', diaSemana: 0, horaInicio: 20, duracao: 1.5, alunosAtivos: 15, capacidade: 15, cor: '#F59E0B' },
  { id: 't5', nome: 'BJJ Iniciantes Manha', modalidade: 'Jiu-Jitsu (Gi)', professor: 'Prof. Ricardo', sala: 'Tatame 1', diaSemana: 2, horaInicio: 7, duracao: 1.5, alunosAtivos: 18, capacidade: 25, cor: '#2563EB' },
  { id: 't6', nome: 'Muay Thai Tarde', modalidade: 'Muay Thai', professor: 'Prof. Ana', sala: 'Tatame 2', diaSemana: 1, horaInicio: 15, duracao: 1, alunosAtivos: 8, capacidade: 20, cor: '#EF4444' },
  { id: 't7', nome: 'BJJ Kids', modalidade: 'Jiu-Jitsu (Gi)', professor: 'Prof. Ricardo', sala: 'Tatame 1', diaSemana: 3, horaInicio: 16, duracao: 1, alunosAtivos: 20, capacidade: 20, cor: '#2563EB' },
  { id: 't8', nome: 'MMA Sabado', modalidade: 'MMA', professor: 'Prof. Joao', sala: 'Tatame 1', diaSemana: 5, horaInicio: 9, duracao: 2, alunosAtivos: 10, capacidade: 15, cor: '#F59E0B' },
];

// ─── Plans ───────────────────────────────────────────────

export interface PlanoAcademia {
  id: string;
  nome: string;
  preco: number;
  modalidades: string[];
  descricao: string;
  descontoFamilia2: number;
  descontoFamilia3: number;
  descontoEstudante: number;
  descontoFuncionarioPublico: number;
  trialDias: number;
  features: string[];
}

export const mockPlanos: PlanoAcademia[] = [
  {
    id: 'basico',
    nome: 'Basico',
    preco: 149.90,
    modalidades: ['Jiu-Jitsu (Gi)'],
    descricao: 'Acesso a uma modalidade, 3x por semana.',
    descontoFamilia2: 10,
    descontoFamilia3: 15,
    descontoEstudante: 10,
    descontoFuncionarioPublico: 5,
    trialDias: 7,
    features: ['1 modalidade', '3x por semana', 'Kimono incluso (1o mes)'],
  },
  {
    id: 'plus',
    nome: 'Plus',
    preco: 229.90,
    modalidades: ['Jiu-Jitsu (Gi)', 'Muay Thai'],
    descricao: 'Acesso a duas modalidades, 5x por semana.',
    descontoFamilia2: 10,
    descontoFamilia3: 20,
    descontoEstudante: 15,
    descontoFuncionarioPublico: 10,
    trialDias: 7,
    features: ['2 modalidades', '5x por semana', 'Armario individual'],
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 349.90,
    modalidades: ['Jiu-Jitsu (Gi)', 'Muay Thai', 'MMA'],
    descricao: 'Acesso ilimitado a todas as modalidades.',
    descontoFamilia2: 15,
    descontoFamilia3: 25,
    descontoEstudante: 20,
    descontoFuncionarioPublico: 15,
    trialDias: 14,
    features: ['Todas as modalidades', 'Ilimitado', 'Armario + toalha', 'Videos exclusivos'],
  },
  {
    id: 'familia',
    nome: 'Familia',
    preco: 499.90,
    modalidades: ['Jiu-Jitsu (Gi)', 'Muay Thai', 'MMA'],
    descricao: 'Ate 3 membros da familia, todas as modalidades.',
    descontoFamilia2: 0,
    descontoFamilia3: 0,
    descontoEstudante: 0,
    descontoFuncionarioPublico: 0,
    trialDias: 14,
    features: ['Ate 3 membros', 'Todas as modalidades', 'Ilimitado', 'Armario + toalha', 'Videos exclusivos', 'Prioridade eventos'],
  },
];

// ─── Contracts ───────────────────────────────────────────

export interface Contrato {
  id: string;
  alunoNome: string;
  alunoCpf: string;
  plano: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativo' | 'vencido' | 'cancelado';
  modalidade: string;
}

export const mockContratos: Contrato[] = [
  { id: 'c1', alunoNome: 'Carlos Oliveira', alunoCpf: '123.456.789-00', plano: 'Premium', valor: 349.90, dataInicio: '2025-01-15', dataFim: '2026-01-15', status: 'ativo', modalidade: 'Jiu-Jitsu (Gi), Muay Thai, MMA' },
  { id: 'c2', alunoNome: 'Maria Santos', alunoCpf: '987.654.321-00', plano: 'Plus', valor: 229.90, dataInicio: '2025-03-01', dataFim: '2026-03-01', status: 'ativo', modalidade: 'Jiu-Jitsu (Gi), Muay Thai' },
  { id: 'c3', alunoNome: 'Pedro Lima', alunoCpf: '456.789.123-00', plano: 'Basico', valor: 149.90, dataInicio: '2024-06-01', dataFim: '2025-06-01', status: 'vencido', modalidade: 'Jiu-Jitsu (Gi)' },
  { id: 'c4', alunoNome: 'Ana Ferreira', alunoCpf: '321.654.987-00', plano: 'Premium', valor: 349.90, dataInicio: '2025-02-01', dataFim: '2026-02-01', status: 'ativo', modalidade: 'Jiu-Jitsu (Gi), Muay Thai, MMA' },
  { id: 'c5', alunoNome: 'Lucas Souza', alunoCpf: '789.123.456-00', plano: 'Plus', valor: 229.90, dataInicio: '2024-09-01', dataFim: '2025-09-01', status: 'cancelado', modalidade: 'Jiu-Jitsu (Gi), Muay Thai' },
];

export const contratoTemplate = `CONTRATO DE PRESTACAO DE SERVICOS

CONTRATANTE: {nome_aluno}, CPF {cpf}
CONTRATADA: BlackBelt Artes Marciais Ltda

PLANO: {plano}
MODALIDADE(S): {modalidade}
VALOR MENSAL: R$ {valor}
DATA DE INICIO: {data_inicio}

CLAUSULA 1 - DO OBJETO
O presente contrato tem por objeto a prestacao de servicos de ensino de artes marciais na modalidade especificada acima.

CLAUSULA 2 - DO PERIODO
O contrato tem vigencia de 12 (doze) meses a partir da data de inicio.

CLAUSULA 3 - DO PAGAMENTO
O pagamento devera ser realizado ate o dia 10 de cada mes.

CLAUSULA 4 - DO CANCELAMENTO
O cancelamento deve ser solicitado com 30 dias de antecedencia.`;
