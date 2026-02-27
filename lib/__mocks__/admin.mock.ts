/**
 * Mock Data — Admin — APENAS DESENVOLVIMENTO
 * 
 * ⚠️ ATENÇÃO: Este arquivo contém dados mock para desenvolvimento.
 * Em produção com NEXT_PUBLIC_API_URL definida, substitua por API real.
 * 
 * TODO(BE-010): Substituir por endpoints admin (ver admin.service.ts)
 * - GET /admin/usuarios
 * - GET /admin/turmas
 * - GET /admin/checkins
 * - GET /admin/dashboard/stats
 */

// ============================================
// DADOS MOCKADOS - PAINEL ADMINISTRATIVO
// BLACKBELT - SISTEMA DE GESTÃO
// ============================================

import type {
  StatusOperacional,
  TipoUsuario,
  Categoria,
  PerfilAcesso,
  PerfilInfo,
  Permissao,
  PerfilPermissoes,
  CongelamentoInfo,
  InativacaoInfo,
} from '@/lib/api/contracts';

// Re-export para backward compatibility (admin.service re-exporta daqui)
export type { StatusOperacional, TipoUsuario, Categoria, PerfilAcesso, CongelamentoInfo, InativacaoInfo } from '@/lib/api/contracts';

// Re-export PerfilInfo, Permissao, PerfilPermissoes de contracts
export type { PerfilInfo, Permissao, PerfilPermissoes } from '@/lib/api/contracts';

// Informações de perfil para login (PerfilInfo definido em contracts.ts)

export const perfisDisponiveis: PerfilInfo[] = [
  {
    id: 'ALUNO',
    nome: 'Aluno',
    descricao: 'Acesso ao app de treino e conteúdo',
    icon: '👤',
    cor: 'from-blue-600 to-blue-800',
    redirectTo: '/inicio',
  },
  {
    id: 'KIDS',
    nome: 'Kids',
    descricao: 'Conteúdo infantil',
    icon: '👶',
    cor: 'from-pink-600 to-pink-800',
    redirectTo: '/infantil',
  },
  {
    id: 'RESPONSAVEL',
    nome: 'Pai / Responsável',
    descricao: 'Acompanhar dependentes',
    icon: '👨‍👩‍👧',
    cor: 'from-green-600 to-green-800',
    redirectTo: '/responsavel',
  },
  {
    id: 'INSTRUTOR',
    nome: 'Instrutor',
    descricao: 'Gerenciar turmas e alunos',
    icon: '👨‍🏫',
    cor: 'from-indigo-600 to-indigo-800',
    redirectTo: '/dashboard',
  },
  {
    id: 'COORDENADOR',
    nome: 'Coordenador',
    descricao: 'Coordenar operações',
    icon: '📋',
    cor: 'from-cyan-600 to-cyan-800',
    redirectTo: '/dashboard',
  },
  {
    id: 'GESTOR',
    nome: 'Gestor',
    descricao: 'Gestão completa da unidade',
    icon: '🏢',
    cor: 'from-purple-600 to-purple-800',
    redirectTo: '/dashboard',
  },
  {
    id: 'ADMINISTRADOR',
    nome: 'Administrador',
    descricao: 'Acesso administrativo total',
    icon: '🛠️',
    cor: 'from-orange-600 to-orange-800',
    redirectTo: '/dashboard',
  },
  {
    id: 'SUPER_ADMIN',
    nome: 'Super Admin',
    descricao: 'Acesso global ao sistema',
    icon: '⚡',
    cor: 'from-red-600 to-red-800',
    redirectTo: '/dashboard',
  },
];

// ============================================
// USUÁRIOS DO SISTEMA
// ============================================

export interface Usuario {
  id: string;
  unidadeId?: string; // Multi-tenant: unidade a que pertence
  nome: string;
  email: string;
  telefone: string;
  tipo: TipoUsuario;
  perfis: PerfilAcesso[]; // Lista de perfis que o usuário possui
  perfilAtivo?: PerfilAcesso; // Perfil atualmente ativo
  status: StatusOperacional;
  categoria?: Categoria;
  graduacao?: string;
  turmaId?: string;
  responsavelId?: string; // Para alunos Kids
  ultimoPagamento?: string;
  proximoVencimento?: string;
  avatar?: string;
  dataCadastro: string;
  observacoes?: string;
  congelamento?: CongelamentoInfo;
  inativacao?: InativacaoInfo;
}

export const usuarios: Usuario[] = [
  // ALUNOS ADULTOS
  {
    id: 'ALU001',
    nome: 'Rafael Santos',
    email: 'rafael.santos@email.com',
    telefone: '(11) 98765-4321',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'ATIVO',
    categoria: 'ADULTO',
    graduacao: 'Nível Intermediário',
    turmaId: 'TUR001',
    ultimoPagamento: '2026-01-15',
    proximoVencimento: '2026-02-15',
    dataCadastro: '2023-03-10',
  },
  {
    id: 'ALU002',
    nome: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    telefone: '(11) 98765-4322',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'EM_ATRASO',
    categoria: 'ADULTO',
    graduacao: 'Nível Básico',
    turmaId: 'TUR001',
    ultimoPagamento: '2025-12-10',
    proximoVencimento: '2026-01-10',
    dataCadastro: '2024-01-20',
    observacoes: 'Pagamento vencido há 23 dias',
  },
  {
    id: 'ALU003',
    nome: 'Carlos Henrique',
    email: 'carlos.h@email.com',
    telefone: '(11) 98765-4323',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'BLOQUEADO',
    categoria: 'ADULTO',
    graduacao: 'Nível Iniciante',
    turmaId: 'TUR002',
    ultimoPagamento: '2025-10-05',
    proximoVencimento: '2025-11-05',
    dataCadastro: '2025-09-01',
    observacoes: 'Bloqueado por inadimplência superior a 60 dias',
  },
  {
    id: 'ALU004',
    nome: 'Juliana Ferreira',
    email: 'juliana.f@email.com',
    telefone: '(11) 98765-4324',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'ATIVO',
    categoria: 'ADULTO',
    graduacao: 'Nível Intermediário',
    turmaId: 'TUR003',
    ultimoPagamento: '2026-01-20',
    proximoVencimento: '2026-02-20',
    dataCadastro: '2022-05-15',
  },
  {
    id: 'ALU005',
    nome: 'Pedro Almeida',
    email: 'pedro.almeida@email.com',
    telefone: '(11) 98765-4325',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'ATIVO',
    categoria: 'ADULTO',
    graduacao: 'Nível Avançado',
    turmaId: 'TUR004',
    ultimoPagamento: '2026-01-18',
    proximoVencimento: '2026-02-18',
    dataCadastro: '2020-02-10',
  },

  // ALUNOS KIDS
  {
    id: 'ALU006',
    nome: 'Miguel Santos',
    email: 'contato.miguel@email.com',
    telefone: '(11) 98765-4326',
    tipo: 'ALUNO',
    perfis: ['KIDS'],
    perfilAtivo: 'KIDS',
    status: 'ATIVO',
    categoria: 'KIDS',
    graduacao: 'Nível Cinza',
    turmaId: 'TUR005',
    responsavelId: 'RESP001',
    ultimoPagamento: '2026-01-10',
    proximoVencimento: '2026-02-10',
    dataCadastro: '2024-08-01',
  },
  {
    id: 'ALU007',
    nome: 'Sofia',
    email: 'contato.sofia@email.com',
    telefone: '(11) 98765-4327',
    tipo: 'ALUNO',
    perfis: ['KIDS'],
    perfilAtivo: 'KIDS',
    status: 'ATIVO',
    categoria: 'KIDS',
    graduacao: 'Nível Amarelo',
    turmaId: 'TUR005',
    responsavelId: 'RESP002',
    ultimoPagamento: '2026-01-12',
    proximoVencimento: '2026-02-12',
    dataCadastro: '2023-09-05',
  },
  {
    id: 'ALU008',
    nome: 'Lucas Martins',
    email: 'contato.lucas@email.com',
    telefone: '(11) 98765-4328',
    tipo: 'ALUNO',
    perfis: ['KIDS'],
    perfilAtivo: 'KIDS',
    status: 'EM_ATRASO',
    categoria: 'KIDS',
    graduacao: 'Nível Cinza',
    turmaId: 'TUR006',
    responsavelId: 'RESP003',
    ultimoPagamento: '2025-12-15',
    proximoVencimento: '2026-01-15',
    dataCadastro: '2024-11-20',
    observacoes: 'Responsável notificado sobre atraso',
  },
  {
    id: 'ALU009',
    nome: 'Fernanda Rocha',
    email: 'fernanda.r@email.com',
    telefone: '(31) 99887-1122',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'CONGELADO',
    categoria: 'ADULTO',
    graduacao: 'Nível Básico',
    turmaId: 'TUR001',
    ultimoPagamento: '2026-01-05',
    proximoVencimento: '2026-04-05',
    dataCadastro: '2023-08-10',
    observacoes: 'Congelamento por viagem — retorno previsto em abril',
    congelamento: { dataCongelamento: '2026-01-05', previsaoRetorno: '2026-04-01', motivo: 'Viagem ao exterior' },
  },
  {
    id: 'ALU010',
    nome: 'Roberto Dias',
    email: 'roberto.d@email.com',
    telefone: '(31) 99887-3344',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'CONGELADO',
    categoria: 'ADULTO',
    graduacao: 'Nível Iniciante',
    turmaId: 'TUR002',
    ultimoPagamento: '2025-12-20',
    proximoVencimento: '2026-03-20',
    dataCadastro: '2025-03-15',
    observacoes: 'Congelamento por cirurgia no joelho',
    congelamento: { dataCongelamento: '2025-12-20', previsaoRetorno: '2026-03-15', motivo: 'Recuperação cirúrgica' },
  },
  {
    id: 'ALU011',
    nome: 'Marcos Paulo',
    email: 'marcos.p@email.com',
    telefone: '(31) 99887-5566',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'INATIVO',
    categoria: 'ADULTO',
    graduacao: 'Nível Básico',
    turmaId: 'TUR001',
    ultimoPagamento: '2025-09-10',
    dataCadastro: '2023-02-01',
    observacoes: 'Inativo há 5 meses — sem retorno aos contatos',
    inativacao: { dataInativacao: '2025-10-01', motivo: 'Sem retorno após tentativas de contato', ultimaPresenca: '2025-09-08' },
  },
  {
    id: 'ALU012',
    nome: 'Patrícia Alves',
    email: 'patricia.a@email.com',
    telefone: '(31) 99887-7788',
    tipo: 'ALUNO',
    perfis: ['ALUNO'],
    perfilAtivo: 'ALUNO',
    status: 'INATIVO',
    categoria: 'ADULTO',
    graduacao: 'Nível Iniciante',
    turmaId: 'TUR003',
    ultimoPagamento: '2025-08-15',
    dataCadastro: '2025-05-20',
    observacoes: 'Desistiu — motivo financeiro',
    inativacao: { dataInativacao: '2025-09-15', motivo: 'Cancelamento por motivo financeiro', ultimaPresenca: '2025-08-22' },
  },

  // PROFESSORES
  {
    id: 'PROF001',
    nome: 'Mestre João Silva',
    email: 'joao.silva@blackbelt.com',
    telefone: '(11) 98765-1001',
    tipo: 'INSTRUTOR',
    perfis: ['INSTRUTOR'],
    perfilAtivo: 'INSTRUTOR',
    status: 'ATIVO',
    graduacao: 'Nível Máximo 3º Subnível',
    dataCadastro: '2015-01-10',
  },
  {
    id: 'PROF002',
    nome: 'Professor Carlos Lima',
    email: 'carlos.lima@blackbelt.com',
    telefone: '(11) 98765-1002',
    tipo: 'INSTRUTOR',
    perfis: ['INSTRUTOR'],
    perfilAtivo: 'INSTRUTOR',
    status: 'ATIVO',
    graduacao: 'Nível Máximo 1º Subnível',
    dataCadastro: '2018-06-15',
  },
  {
    id: 'PROF003',
    nome: 'Professora Ana Paula',
    email: 'ana.paula@blackbelt.com',
    telefone: '(11) 98765-1003',
    tipo: 'INSTRUTOR',
    perfis: ['INSTRUTOR'],
    perfilAtivo: 'INSTRUTOR',
    status: 'ATIVO',
    graduacao: 'Nível Máximo 2º Subnível',
    dataCadastro: '2017-03-20',
  },

  // RESPONSÁVEIS
  {
    id: 'RESP001',
    nome: 'Roberto Santos (Pai do Miguel)',
    email: 'roberto.santos@email.com',
    telefone: '(11) 98765-2001',
    tipo: 'RESPONSAVEL',
    perfis: ['RESPONSAVEL'],
    perfilAtivo: 'RESPONSAVEL',
    status: 'ATIVO',
    dataCadastro: '2024-08-01',
  },
  {
    id: 'RESP002',
    nome: 'Psessão Oliveira (Mãe da Sofia)',
    email: 'paula.oliveira@email.com',
    telefone: '(11) 98765-2002',
    tipo: 'RESPONSAVEL',
    perfis: ['RESPONSAVEL'],
    perfilAtivo: 'RESPONSAVEL',
    status: 'ATIVO',
    dataCadastro: '2023-09-05',
  },
  {
    id: 'RESP003',
    nome: 'Fernando Martins (Pai do Lucas)',
    email: 'fernando.martins@email.com',
    telefone: '(11) 98765-2003',
    tipo: 'RESPONSAVEL',
    perfis: ['RESPONSAVEL'],
    perfilAtivo: 'RESPONSAVEL',
    status: 'ATIVO',
    dataCadastro: '2024-11-20',
  },

  // ADMINISTRADORES
  {
    id: 'ADM001',
    nome: 'Anderson Rodrigues',
    email: 'anderson@blackbelt.com',
    telefone: '(11) 98765-9001',
    tipo: 'ADMINISTRADOR',
    perfis: ['ADMINISTRADOR'],
    perfilAtivo: 'ADMINISTRADOR',
    status: 'ATIVO',
    dataCadastro: '2020-01-01',
  },
];

// ============================================
// TURMAS
// ============================================

export interface Turma {
  id: string;
  unidadeId?: string; // Multi-tenant: unidade da turma
  nome: string;
  categoria: Categoria;
  professorId: string;
  diasSemana: string[];
  horario: string;
  capacidadeMaxima: number;
  alunosMatriculados: number;
  status: 'ATIVA' | 'PAUSADA' | 'ENCERRADA';
  sala?: string;
}

export const turmas: Turma[] = [
  {
    id: 'TUR001',
    nome: 'Gi Avançado',
    categoria: 'ADULTO',
    professorId: 'PROF001',
    diasSemana: ['Segunda', 'Quarta', 'Sexta'],
    horario: '19:00 - 20:30',
    capacidadeMaxima: 30,
    alunosMatriculados: 24,
    status: 'ATIVA',
    sala: 'Ambiente 1',
  },
  {
    id: 'TUR002',
    nome: 'Iniciantes',
    categoria: 'ADULTO',
    professorId: 'PROF002',
    diasSemana: ['Terça', 'Quinta'],
    horario: '20:00 - 21:00',
    capacidadeMaxima: 25,
    alunosMatriculados: 18,
    status: 'ATIVA',
    sala: 'Ambiente 2',
  },
  {
    id: 'TUR003',
    nome: 'No-Gi Competition',
    categoria: 'ADULTO',
    professorId: 'PROF001',
    diasSemana: ['Segunda', 'Quarta'],
    horario: '18:00 - 19:00',
    capacidadeMaxima: 20,
    alunosMatriculados: 15,
    status: 'ATIVA',
    sala: 'Ambiente 1',
  },
  {
    id: 'TUR004',
    nome: 'Feminino',
    categoria: 'ADULTO',
    professorId: 'PROF003',
    diasSemana: ['Terça', 'Quinta', 'Sábado'],
    horario: '10:00 - 11:30',
    capacidadeMaxima: 20,
    alunosMatriculados: 16,
    status: 'ATIVA',
    sala: 'Ambiente 2',
  },
  {
    id: 'TUR005',
    nome: 'Kids 7-10 anos',
    categoria: 'KIDS',
    professorId: 'PROF003',
    diasSemana: ['Segunda', 'Quarta', 'Sexta'],
    horario: '17:00 - 18:00',
    capacidadeMaxima: 25,
    alunosMatriculados: 22,
    status: 'ATIVA',
    sala: 'Ambiente 2',
  },
  {
    id: 'TUR006',
    nome: 'Kids 11-14 anos',
    categoria: 'KIDS',
    professorId: 'PROF002',
    diasSemana: ['Terça', 'Quinta', 'Sábado'],
    horario: '17:00 - 18:00',
    capacidadeMaxima: 25,
    alunosMatriculados: 19,
    status: 'ATIVA',
    sala: 'Ambiente 1',
  },
];

// ============================================
// CHECK-INS
// ============================================

export interface CheckIn {
  id: string;
  unidadeId?: string; // Multi-tenant: unidade do check-in
  alunoId: string;
  turmaId: string;
  data: string;
  hora: string;
  validadoPor?: string; // ID do responsável (para Kids)
  statusAluno: StatusOperacional;
}

export const checkIns: CheckIn[] = [
  // CHECK-INS DE HOJE (2026-02-02)
  {
    id: 'CHK001',
    alunoId: 'ALU001',
    turmaId: 'TUR001',
    data: '2026-02-02',
    hora: '19:05',
    statusAluno: 'ATIVO',
  },
  {
    id: 'CHK002',
    alunoId: 'ALU004',
    turmaId: 'TUR003',
    data: '2026-02-02',
    hora: '18:10',
    statusAluno: 'ATIVO',
  },
  {
    id: 'CHK003',
    alunoId: 'ALU006',
    turmaId: 'TUR005',
    data: '2026-02-02',
    hora: '17:02',
    validadoPor: 'RESP001',
    statusAluno: 'ATIVO',
  },
  {
    id: 'CHK004',
    alunoId: 'ALU007',
    turmaId: 'TUR005',
    data: '2026-02-02',
    hora: '17:05',
    validadoPor: 'RESP002',
    statusAluno: 'ATIVO',
  },

  // CHECK-INS DE ONTEM (2026-02-01)
  {
    id: 'CHK005',
    alunoId: 'ALU001',
    turmaId: 'TUR001',
    data: '2026-02-01',
    hora: '19:08',
    statusAluno: 'ATIVO',
  },
  {
    id: 'CHK006',
    alunoId: 'ALU005',
    turmaId: 'TUR004',
    data: '2026-02-01',
    hora: '10:05',
    statusAluno: 'ATIVO',
  },
];

// ============================================
// HISTÓRICO DE STATUS
// ============================================

export interface HistoricoStatus {
  id: string;
  unidadeId?: string; // Multi-tenant: unidade do evento
  alunoId: string;
  statusAnterior: StatusOperacional;
  statusNovo: StatusOperacional;
  data: string;
  motivo: string;
  alteradoPor: string;
}

export const historicoStatus: HistoricoStatus[] = [
  {
    id: 'HIST001',
    alunoId: 'ALU002',
    statusAnterior: 'ATIVO',
    statusNovo: 'EM_ATRASO',
    data: '2026-01-11',
    motivo: 'Vencimento de mensalidade não identificado',
    alteradoPor: 'ADM001',
  },
  {
    id: 'HIST002',
    alunoId: 'ALU003',
    statusAnterior: 'EM_ATRASO',
    statusNovo: 'BLOQUEADO',
    data: '2026-01-05',
    motivo: 'Inadimplência superior a 60 dias',
    alteradoPor: 'ADM001',
  },
  {
    id: 'HIST003',
    alunoId: 'ALU008',
    statusAnterior: 'ATIVO',
    statusNovo: 'EM_ATRASO',
    data: '2026-01-16',
    motivo: 'Vencimento não identificado',
    alteradoPor: 'ADM001',
  },
];

// ============================================
// ALERTAS OPERACIONAIS
// ============================================

export interface Alerta {
  id: string;
  unidadeId?: string; // Multi-tenant: unidade do alerta
  tipo: 'BLOQUEIO' | 'ATRASO' | 'FREQUENCIA' | 'VENCIMENTO';
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  titulo: string;
  mensagem: string;
  alunoId?: string;
  turmaId?: string;
  data: string;
  lido: boolean;
}

export const alertas: Alerta[] = [
  {
    id: 'ALERT001',
    tipo: 'BLOQUEIO',
    prioridade: 'ALTA',
    titulo: 'Tentativa de Check-in Bloqueado',
    mensagem: 'Carlos Henrique tentou fazer check-in mas está bloqueado',
    alunoId: 'ALU003',
    data: '2026-02-02T18:45:00',
    lido: false,
  },
  {
    id: 'ALERT002',
    tipo: 'VENCIMENTO',
    prioridade: 'MEDIA',
    titulo: 'Vencimentos Hoje',
    mensagem: '3 alunos com vencimento hoje',
    data: '2026-02-02T08:00:00',
    lido: false,
  },
  {
    id: 'ALERT003',
    tipo: 'FREQUENCIA',
    prioridade: 'BAIXA',
    titulo: 'Baixa Frequência',
    mensagem: 'Turma Iniciantes com apenas 45% de presença esta semana',
    turmaId: 'TUR002',
    data: '2026-02-01T20:00:00',
    lido: true,
  },
  {
    id: 'ALERT004',
    tipo: 'ATRASO',
    prioridade: 'ALTA',
    titulo: 'Aluno com Faltas Consecutivas',
    mensagem: 'Mariana Costa não treina há 14 dias',
    alunoId: 'ALU002',
    data: '2026-02-01T09:00:00',
    lido: false,
  },
];

// ============================================
// PERMISSÕES RBAC
// ============================================

// Permissao e PerfilPermissoes definidos em contracts.ts

export const permissoes: Permissao[] = [
  { id: 'PERM001', nome: 'Validar Pagamento', descricao: 'Alterar status de pagamento do aluno', categoria: 'Financeiro' },
  { id: 'PERM002', nome: 'Bloquear Aluno', descricao: 'Bloquear/Desbloquear alunos', categoria: 'Gestão' },
  { id: 'PERM003', nome: 'Editar Turma', descricao: 'Criar e editar turmas', categoria: 'Operacional' },
  { id: 'PERM004', nome: 'Ver Relatórios', descricao: 'Acessar relatórios gerenciais', categoria: 'Administrativo' },
  { id: 'PERM005', nome: 'Gerenciar Usuários', descricao: 'Criar e editar usuários', categoria: 'Administrativo' },
  { id: 'PERM006', nome: 'Validar Check-in', descricao: 'Confirmar presença de alunos', categoria: 'Operacional' },
  { id: 'PERM007', nome: 'Ver Dados Financeiros', descricao: 'Visualizar informações de pagamento', categoria: 'Financeiro' },
  { id: 'PERM008', nome: 'Configurar Sistema', descricao: 'Alterar configurações da unidade', categoria: 'Administrativo' },
];

export const perfilPermissoes: PerfilPermissoes[] = [
  {
    perfil: 'INSTRUTOR',
    permissoes: ['PERM006'], // Apenas validar check-in
  },
  {
    perfil: 'COORDENADOR',
    permissoes: ['PERM003', 'PERM006'], // Editar turmas e validar check-in
  },
  {
    perfil: 'GESTOR',
    permissoes: ['PERM001', 'PERM002', 'PERM003', 'PERM004', 'PERM006', 'PERM007'],
  },
  {
    perfil: 'ADMINISTRADOR',
    permissoes: ['PERM001', 'PERM002', 'PERM003', 'PERM004', 'PERM005', 'PERM006', 'PERM007'],
  },
  {
    perfil: 'SUPER_ADMIN',
    permissoes: ['PERM001', 'PERM002', 'PERM003', 'PERM004', 'PERM005', 'PERM006', 'PERM007', 'PERM008'],
  },
];

// ============================================
// CONFIGURAÇÕES DA ACADEMIA
// ============================================

export interface ConfiguracaoUnidade {
  unidadeId?: string; // Multi-tenant: configuração da unidade
  limiteAtrasoPermitido: number; // em dias
  diasParaBloqueio: number;
  mensagemBloqueio: string;
  horarioFuncionamento: {
    abertura: string;
    fechamento: string;
  };
  permitirCheckInAntecipado: boolean;
  minutosAntecedencia: number;
}

export const configuracaoUnidade: ConfiguracaoUnidade = {
  limiteAtrasoPermitido: 7,
  diasParaBloqueio: 60,
  mensagemBloqueio: 'Seu acesso está temporariamente bloqueado. Por favor, regularize sua situação na recepção.',
  horarioFuncionamento: {
    abertura: '06:00',
    fechamento: '22:00',
  },
  permitirCheckInAntecipado: true,
  minutosAntecedencia: 15,
};

// ============================================
// ESTATÍSTICAS DO DASHBOARD
// ============================================

export interface EstatisticasDashboard {
  unidadeId?: string; // Multi-tenant: estatísticas da unidade
  totalAlunos: number;
  alunosAtivos: number;
  alunosEmAtraso: number;
  alunosBloqueados: number;
  alunosCongelados: number;
  alunosInativos: number;
  checkInsHoje: number;
  checkInsOntem: number;
  turmasAtivas: number;
  alertasNaoLidos: number;

  // ── Alertas de Gestão (Prompt 4.2) ─────────────────────
  novatos: { quantidade: number; lista: { id: string; nome: string; dataInicio: string; turma: string }[] };
  riscoEvasao: { quantidade: number; lista: { id: string; nome: string; frequenciaSemanas: number[]; turma: string }[] };
  congelados: { quantidade: number; lista: { id: string; nome: string; dataCongelamento: string }[] };
  aniversariantes: { quantidade: number; lista: { id: string; nome: string; dataNascimento: string }[] };

  // ── Mapa de Calor (Prompt 4.2) ─────────────────────────
  mapaCalor: { dia: string; horario: string; checkins: number }[];

  // ── Graduações (Prompt 4.2) ────────────────────────────
  aptosExame: { quantidade: number; lista: { id: string; nome: string; nivelAtual: string; proximaNível: string; tempoNivelMeses: number; presencaPct: number }[] };
  tempoMedioPorNível: { nivel: string; meses: number }[];

  // ── Financeiro Resumo (Prompt 4.2) ─────────────────────
  financeiroResumo: {
    receitaMes: number;
    receitaMesAnterior: number;
    inadimplenciaPct: number;
    ticketMedio: number;
    planoMaisVendido: { nome: string; quantidade: number };
    distribuicaoPlanos: { plano: string; quantidade: number }[];
    previsaoCaixa: number;
  };
}

export const getEstatisticas = (): EstatisticasDashboard => {
  const alunos = usuarios.filter(u => u.tipo === 'ALUNO');
  
  return {
    totalAlunos: alunos.length,
    alunosAtivos: alunos.filter(a => a.status === 'ATIVO').length,
    alunosEmAtraso: alunos.filter(a => a.status === 'EM_ATRASO').length,
    alunosBloqueados: alunos.filter(a => a.status === 'BLOQUEADO').length,
    alunosCongelados: alunos.filter(a => a.status === 'CONGELADO').length,
    alunosInativos: alunos.filter(a => a.status === 'INATIVO').length,
    checkInsHoje: checkIns.filter(c => c.data === '2026-02-02').length,
    checkInsOntem: checkIns.filter(c => c.data === '2026-02-01').length,
    turmasAtivas: turmas.filter(t => t.status === 'ATIVA').length,
    alertasNaoLidos: alertas.filter(a => !a.lido).length,

    // ── Alertas de Gestão ────────────────────────────────
    novatos: {
      quantidade: 4,
      lista: [
        { id: 'n1', nome: 'Amanda Rocha', dataInicio: '2026-01-28', turma: 'Iniciantes Manhã' },
        { id: 'n2', nome: 'Pedro Henrique', dataInicio: '2026-02-03', turma: 'Fundamentals' },
        { id: 'n3', nome: 'Larissa Mota', dataInicio: '2026-02-08', turma: 'Iniciantes Noite' },
        { id: 'n4', nome: 'Bruno Tavares', dataInicio: '2026-02-12', turma: 'Iniciantes Manhã' },
      ],
    },
    riscoEvasao: {
      quantidade: 3,
      lista: [
        { id: 'r1', nome: 'Marcos Vinicius', frequenciaSemanas: [4, 3, 2, 1], turma: 'Avançado Noite' },
        { id: 'r2', nome: 'Julia Ferreira', frequenciaSemanas: [5, 4, 2, 0], turma: 'All Levels' },
        { id: 'r3', nome: 'Diego Souza', frequenciaSemanas: [3, 2, 1, 1], turma: 'Fundamentals' },
      ],
    },
    congelados: {
      quantidade: 2,
      lista: [
        { id: 'c1', nome: 'Fernanda Lima', dataCongelamento: '2026-01-05' },
        { id: 'c2', nome: 'Roberto Santos', dataCongelamento: '2025-12-20' },
      ],
    },
    aniversariantes: {
      quantidade: 3,
      lista: [
        { id: 'a1', nome: 'Carlos Silva', dataNascimento: '1997-02-18' },
        { id: 'a2', nome: 'Thiago Lima', dataNascimento: '1992-02-22' },
        { id: 'a3', nome: 'Ana Paula', dataNascimento: '2000-02-25' },
      ],
    },

    // ── Mapa de Calor de Horários ────────────────────────
    mapaCalor: generateHeatmapData(),

    // ── Graduações ───────────────────────────────────────
    aptosExame: {
      quantidade: 5,
      lista: [
        { id: 'g1', nome: 'Carlos Silva', nivelAtual: 'Nível Básico', proximaNível: 'Nível Intermediário', tempoNivelMeses: 26, presencaPct: 82 },
        { id: 'g2', nome: 'André Barbosa', nivelAtual: 'Nível Iniciante', proximaNível: 'Nível Básico', tempoNivelMeses: 25, presencaPct: 88 },
        { id: 'g3', nome: 'Rafael Mendes', nivelAtual: 'Nível Intermediário', proximaNível: 'Nível Avançado', tempoNivelMeses: 38, presencaPct: 91 },
        { id: 'g4', nome: 'Lucas Oliveira', nivelAtual: 'Nível Iniciante', proximaNível: 'Nível Básico', tempoNivelMeses: 24, presencaPct: 75 },
        { id: 'g5', nome: 'Miguel Oliveira', nivelAtual: 'Nível Iniciante', proximaNível: 'Nível Cinza', tempoNivelMeses: 9, presencaPct: 85 },
      ],
    },
    tempoMedioPorNível: [
      { nivel: 'Branca → Azul', meses: 22 },
      { nivel: 'Azul → Roxa', meses: 28 },
      { nivel: 'Roxa → Marrom', meses: 36 },
      { nivel: 'Marrom → Preta', meses: 30 },
    ],

    // ── Financeiro Resumo ────────────────────────────────
    financeiroResumo: {
      receitaMes: 47850,
      receitaMesAnterior: 44200,
      inadimplenciaPct: 8.5,
      ticketMedio: 195,
      planoMaisVendido: { nome: 'Plano Mensal', quantidade: 128 },
      distribuicaoPlanos: [
        { plano: 'Mensal', quantidade: 128 },
        { plano: 'Trimestral', quantidade: 52 },
        { plano: 'Semestral', quantidade: 38 },
        { plano: 'Anual', quantidade: 27 },
      ],
      previsaoCaixa: 51200,
    },
  };
};

// ── Heatmap data helper ──────────────────────────────────
function generateHeatmapData(): { dia: string; horario: string; checkins: number }[] {
  const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const horarios = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const data: { dia: string; horario: string; checkins: number }[] = [];

  // Peak hours pattern: morning (7-9), afternoon (18-20)
  dias.forEach(dia => {
    horarios.forEach(h => {
      const hour = parseInt(h);
      let base = 2;
      if (hour >= 7 && hour <= 9) base = 12;
      else if (hour >= 18 && hour <= 20) base = 18;
      else if (hour >= 14 && hour <= 16) base = 6;
      // Saturday lighter
      if (dia === 'Sáb') base = Math.floor(base * 0.6);
      const noise = Math.floor(Math.random() * 5) - 2;
      data.push({ dia, horario: h, checkins: Math.max(0, base + noise) });
    });
  });

  return data;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getUsuarioById = (id: string): Usuario | undefined => {
  return usuarios.find(u => u.id === id);
};

export const getTurmaById = (id: string): Turma | undefined => {
  return turmas.find(t => t.id === id);
};

export const getCheckInsByAluno = (alunoId: string): CheckIn[] => {
  return checkIns.filter(c => c.alunoId === alunoId);
};

export const getAlunosByTurma = (turmaId: string): Usuario[] => {
  return usuarios.filter(u => u.tipo === 'ALUNO' && u.turmaId === turmaId);
};

export const getAlertasAtivos = (): Alerta[] => {
  return alertas.filter(a => !a.lido);
};
