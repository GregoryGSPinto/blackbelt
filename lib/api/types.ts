/**
 * DTOs e interfaces para contratos de API.
 *
 * Importa tipos canônicos de contracts.ts (single source of truth).
 * Re-exporta para consumidores existentes (backward compat).
 *
 * TODO(BE-002): Alinhar DTOs com OpenAPI/Swagger do back-end.
 */

import type {
  TipoPerfil,
  CategoriaRegistro,
  StatusCheckIn,
  StatusPagamento,
} from './contracts';

// Re-export de contracts para backward compatibility
export type {
  TipoPerfil,
  StatusOperacional,
  TipoUsuario,
  PerfilAcesso,
  Categoria,
  CategoriaRegistro,
  StatusPagamento,
  MetodoPagamento,
  StatusTurma,
  StatusCheckIn,
  PlanoUnidade,
  StatusUnidade,
  User,
  Academy,
  AcademyEndereco,
  AcademyHorario,
  AcademyConfiguracao,
  Class,
  CheckIn,
  Payment,
  FinanceReport,
  FinanceReportPeriodo,
  FinanceReportResumo,
  FinanceReportPorStatus,
  AuthLoginResponse,
  AuthRegisterResponse,
  AuthLoginRequest,
  AuthRegisterRequest,
  PerfilInfo,
  Permissao,
  PerfilPermissoes,
  PaginatedResponse,
  ApiErrorResponse,
  KidRegistroData,
} from './contracts';

// ============================================================
// AUTH DTOs
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserDTO;
  token: string;
  refreshToken: string;
  /** Perfis disponíveis para o email autenticado (multi-perfil) */
  availableProfiles?: UserDTO[];
}

export interface RegisterRequest {
  nome: string;
  email: string;
  password: string;
  idade?: number;
  categoria?: CategoriaRegistro;
}

export interface RegisterResponse {
  user: UserDTO;
  token: string;
}

// ============================================================
// USER DTOs
// ============================================================

export interface UserDTO {
  id: string;
  nome: string;
  email: string;
  tipo: TipoPerfil;
  idade?: number;
  avatar?: string;
  graduacao?: string;
  instrutor?: string;
  turno?: string;
  unidadeId?: string;
  unidade?: string;
  permissoes: string[];
}

// ============================================================
// CHECK-IN DTOs
// ============================================================

export interface CheckInDTO {
  id: string;
  unidadeId?: string; // Multi-tenant
  alunoId: string;
  alunoNome: string;
  turmaId: string;
  turmaNome: string;
  dataHora: string;
  status: StatusCheckIn;
  validadoPor?: string;
}

export interface CheckInCreateRequest {
  alunoId: string;
  turmaId: string;
}

// ============================================================
// TURMA DTOs
// ============================================================

export interface TurmaDTO {
  id: string;
  unidadeId?: string; // Multi-tenant
  nome: string;
  horario: string;
  instrutor: string;
  categoria: string;
  diasSemana: string[];
  vagas: number;
  alunosInscritos: number;
}

// ============================================================
// FINANCEIRO DTOs
// ============================================================

export interface PagamentoDTO {
  id: string;
  unidadeId?: string; // Multi-tenant
  alunoId: string;
  alunoNome: string;
  valor: number;
  status: StatusPagamento;
  dataVencimento: string;
  dataPagamento?: string;
  metodo?: string;
}

// ============================================================
// VIDEO / CONTEÚDO DTOs
// ============================================================

export interface VideoDTO {
  id: string;
  unidadeId?: string; // Multi-tenant: conteúdo pode ser por unidade
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  category: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  instructor: string;
  views?: number;
  rating?: number;
}

export interface SerieDTO {
  id: string;
  unidadeId?: string; // Multi-tenant
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  instructor: string;
  level: string;
}

// ============================================================
// KIDS DTOs
// ============================================================

export interface KidProfileDTO {
  id: string;
  unidadeId?: string; // Multi-tenant
  nome: string;
  avatar: string;
  idade: number;
  nivel: string;
  dataNascimento: string;
  parentId: string;
  progresso: {
    nivel: number;
    xp: number;
    xpTotal: number;
    conquistas: number;
    sequencia: number;
  };
}

// ============================================================
// SHOP DTOs
// ============================================================

export interface ProdutoDTO {
  id: string;
  unidadeId?: string; // Multi-tenant: loja por unidade
  nome: string;
  descricao: string;
  preco: number;
  precoOriginal?: number;
  imagens: string[];
  categoria: string;
  tamanhos: string[];
  cores: { nome: string; hex: string }[];
  disponivel: boolean;
}

