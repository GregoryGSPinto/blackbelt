/**
 * CONTRACTS — Contratos de dados para integração com backend
 *
 * SINGLE SOURCE OF TRUTH para todas as interfaces que representam
 * entidades do banco de dados ou respostas da API.
 *
 * REGRAS:
 * - Zero `any` — use `unknown` quando tipo for realmente indeterminado
 * - Campos opcionais (?) significam: backend pode não enviar
 * - `unidadeId` presente em toda entidade tenant-scoped
 * - Enums como union types (não TypeScript enum) para tree-shaking
 *
 * TODO(BE-002): Alinhar com OpenAPI/Swagger quando backend estiver pronto
 */

// ============================================================
// ENUMS / UNIONS COMPARTILHADOS
// ============================================================

/** Perfil de acesso do usuário autenticado (front-end) */
export type TipoPerfil =
  | 'ALUNO_ADULTO'
  | 'ALUNO_KIDS'
  | 'ALUNO_TEEN'
  | 'RESPONSAVEL'
  | 'INSTRUTOR'
  // ── Corporativo ──
  | 'SUPPORT'          // Operador da plataforma
  | 'UNIT_OWNER'       // Controlador da unidade
  // ── Legacy (backward compat) ──
  | 'GESTOR'
  | 'ADMINISTRADOR'
  | 'SUPER_ADMIN'
  | 'SYS_AUDITOR';

/** Status operacional do aluno/responsável */
export type StatusOperacional = 'ATIVO' | 'EM_ATRASO' | 'BLOQUEADO' | 'CONGELADO' | 'INATIVO';

/** Informações de congelamento de matrícula */
export interface CongelamentoInfo {
  dataCongelamento: string;
  previsaoRetorno?: string;
  motivo: string;
}

/** Informações de inativação */
export interface InativacaoInfo {
  dataInativacao: string;
  motivo: string;
  ultimaPresenca?: string;
}

/** Tipo simplificado de usuário (backend) */
export type TipoUsuario = 'ALUNO' | 'INSTRUTOR' | 'RESPONSAVEL' | 'ADMINISTRADOR';

/** Perfil no sistema de permissões (backend RBAC) */
export type PerfilAcesso =
  | 'ALUNO'
  | 'KIDS'
  | 'RESPONSAVEL'
  | 'INSTRUTOR'
  | 'COORDENADOR'
  | 'GESTOR'
  | 'ADMINISTRADOR'
  | 'SUPER_ADMIN';

/** Categoria de nivel etária */
export type Categoria = 'ADULTO' | 'KIDS';

/** Categoria no fluxo de cadastro */
export type CategoriaRegistro = 'Kids' | 'Adolescente' | 'Adulto';

/** Status de pagamento */
export type StatusPagamento = 'pago' | 'pendente' | 'atrasado' | 'cancelado';

/** Método de pagamento */
export type MetodoPagamento = 'pix' | 'cartao' | 'boleto' | 'dinheiro';

/** Status de turma */
export type StatusTurma = 'ATIVA' | 'PAUSADA' | 'ENCERRADA';

/** Status de check-in */
export type StatusCheckIn = 'pendente' | 'confirmado' | 'recusado';

/** Plano de assinatura da unidade */
export type PlanoUnidade = 'BASICO' | 'PROFISSIONAL' | 'ENTERPRISE';

/** Status da unidade */
export type StatusUnidade = 'ATIVA' | 'INATIVA' | 'SUSPENSA';

// ============================================================
// USER — Usuário autenticado
// ============================================================

export interface User {
  id: string;
  unidadeId?: string;
  nome: string;
  email: string;
  tipo: TipoPerfil;
  idade?: number;
  avatar?: string;
  graduacao?: string;
  instrutor?: string;
  turno?: string;
  unidade?: string;
  permissoes: string[];
  categoria?: CategoriaRegistro;
}

// ============================================================
// ACADEMY — Multi-tenant (NOVO)
// ============================================================

export interface AcademyEndereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface AcademyHorario {
  abertura: string;
  fechamento: string;
}

export interface AcademyConfiguracao {
  limiteAtrasoPermitido: number;
  diasParaBloqueio: number;
  mensagemBloqueio: string;
  horarioFuncionamento: AcademyHorario;
  permitirCheckInAntecipado: boolean;
  minutosAntecedencia: number;
}

export interface Academy {
  id: string;
  nome: string;
  slug: string;
  endereco?: AcademyEndereco;
  telefone?: string;
  email?: string;
  logo?: string;
  status: StatusUnidade;
  plano: PlanoUnidade;
  configuracao: AcademyConfiguracao;
  criadoEm: string;
  atualizadoEm: string;
}

// ============================================================
// CLASS (Turma)
// ============================================================

export interface Class {
  id: string;
  unidadeId?: string;
  nome: string;
  categoria: string;
  professorId: string;
  professorNome?: string;
  horario: string;
  diasSemana: string[];
  capacidadeMaxima: number;
  alunosInscritos: number;
  status: StatusTurma;
  sala?: string;
}

// ============================================================
// CHECK-IN
// ============================================================

export interface CheckIn {
  id: string;
  unidadeId?: string;
  alunoId: string;
  alunoNome?: string;
  turmaId: string;
  turmaNome?: string;
  dataHora: string;
  status: StatusCheckIn;
  validadoPor?: string;
  method?: CheckInMethod;
}

export type CheckInMethod = 'QR' | 'MANUAL' | 'BIOMETRIA' | 'APP' | 'RESPONSAVEL';

export interface CheckInQR {
  alunoId: string;
  nome: string;
  unidadeId: string;
  turmaId?: string;
  timestamp: number;
  hash: string;
}

export interface CheckInResult {
  success: boolean;
  checkIn?: CheckIn;
  aluno?: { id: string; nome: string; avatar?: string; graduacao?: string; status: StatusOperacional };
  error?: string;
}

// ============================================================
// PAYMENT (Pagamento)
// ============================================================

export interface Payment {
  id: string;
  unidadeId?: string;
  alunoId: string;
  alunoNome?: string;
  valor: number;
  status: StatusPagamento;
  dataVencimento: string;
  dataPagamento?: string;
  metodo?: MetodoPagamento;
  referencia?: string;
  descricao?: string;
}

// ============================================================
// FINANCE REPORT (Relatório Financeiro — NOVO)
// ============================================================

export interface FinanceReportPeriodo {
  inicio: string;
  fim: string;
}

export interface FinanceReportResumo {
  receitaTotal: number;
  receitaPendente: number;
  inadimplencia: number;
  taxaAdimplencia: number;
}

export interface FinanceReportPorStatus {
  emDia: number;
  emAtraso: number;
  bloqueados: number;
}

export interface FinanceReport {
  unidadeId?: string;
  periodo: FinanceReportPeriodo;
  resumo: FinanceReportResumo;
  porStatus: FinanceReportPorStatus;
  porMetodo: Record<MetodoPagamento, number>;
  ultimaAtualizacao: string;
}

// ============================================================
// PAYMENT GATEWAY (Planos, Assinaturas, Pix, Faturas)
// ============================================================

export type PlanoFrequencia = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface Plano {
  id: string;
  unidadeId?: string;
  nome: string;
  descricao?: string;
  valor: number;
  frequencia: PlanoFrequencia;
  modalidades: string[];
  sessõesSemanais?: number;
  beneficios: string[];
  ativo: boolean;
  destaque?: boolean;
}

export interface Assinatura {
  id: string;
  alunoId: string;
  alunoNome?: string;
  planoId: string;
  planoNome?: string;
  valor: number;
  status: 'ativa' | 'cancelada' | 'suspensa' | 'vencida';
  dataInicio: string;
  dataRenovacao: string;
  formaPagamento: MetodoPagamento;
  diaVencimento: number;
}

export interface Fatura {
  id: string;
  assinaturaId: string;
  alunoId: string;
  alunoNome?: string;
  planoNome?: string;
  valor: number;
  status: StatusPagamento;
  dataVencimento: string;
  dataPagamento?: string;
  metodo?: MetodoPagamento;
  pixCopiaECola?: string;
  boletoUrl?: string;
  descricao: string;
}

export interface PixPaymentRequest {
  faturaId: string;
  valor: number;
  descricao: string;
}

export interface PixPaymentResponse {
  qrCodeBase64: string;
  copiaECola: string;
  expiresAt: string;
  transactionId: string;
}

export interface ResumoFinanceiroAluno {
  assinatura?: Assinatura;
  plano?: Plano;
  faturas: Fatura[];
  totalPago: number;
  totalPendente: number;
  proximoVencimento?: string;
}

// ============================================================
// LEADS / FUNIL DE VENDAS
// ============================================================

export type LeadEtapa = 'novo' | 'contato' | 'agendado' | 'trial' | 'negociacao' | 'convertido' | 'perdido';
export type LeadOrigem = 'instagram' | 'whatsapp' | 'indicacao' | 'site' | 'presencial' | 'outro';

export interface Lead {
  id: string;
  unidadeId?: string;
  nome: string;
  telefone: string;
  email?: string;
  etapa: LeadEtapa;
  origem: LeadOrigem;
  interesse: string[];
  observacao?: string;
  dataCriacao: string;
  dataUltimoContato?: string;
  responsavel?: string;
  trialAgendado?: string;
  trialRealizado?: boolean;
  planoInteresse?: string;
  valorProposta?: number;
}

export interface LeadHistorico {
  id: string;
  leadId: string;
  etapaAnterior: LeadEtapa;
  etapaNova: LeadEtapa;
  data: string;
  observacao?: string;
  responsavel: string;
}

export interface FunnelStats {
  totalLeads: number;
  porEtapa: Record<LeadEtapa, number>;
  conversaoMes: number;
  taxaConversao: number;
  tempoMedioConversao: number;
  porOrigem: Record<LeadOrigem, number>;
}

// ============================================================
// COMUNICAÇÕES (Comunicados, Mensagens)
// ============================================================

export type ComunicadoTipo = 'geral' | 'turma' | 'financeiro' | 'evento' | 'urgente';
export type ComunicadoCanal = 'app' | 'email' | 'whatsapp' | 'todos';
export type ComunicadoDestinatario = 'todos' | 'alunos' | 'instrutores' | 'turma' | 'inadimplentes';

export interface Comunicado {
  id: string;
  unidadeId?: string;
  titulo: string;
  mensagem: string;
  tipo: ComunicadoTipo;
  canal: ComunicadoCanal[];
  destinatario: ComunicadoDestinatario;
  turmaId?: string;
  turmaNome?: string;
  remetente: string;
  dataCriacao: string;
  dataEnvio?: string;
  status: 'rascunho' | 'enviado' | 'agendado';
  agendadoPara?: string;
  lidos: number;
  totalDestinatarios: number;
}

export interface MensagemDireta {
  id: string;
  remetenteId: string;
  remetenteNome: string;
  destinatarioId: string;
  destinatarioNome: string;
  assunto: string;
  mensagem: string;
  data: string;
  lida: boolean;
}

export interface ComunicacoesStats {
  comunicadosEnviados: number;
  taxaLeitura: number;
  mensagensPendentes: number;
  ultimoEnvio?: string;
}

// ============================================================
// PDV (Ponto de Venda) + ESTOQUE
// ============================================================

export type FormaPagamentoPDV = 'pix' | 'dinheiro' | 'cartao' | 'conta_aluno';

export interface ItemVenda {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface VendaBalcao {
  id: string;
  itens: ItemVenda[];
  clienteId?: string;
  clienteNome?: string;
  formaPagamento: FormaPagamentoPDV;
  subtotal: number;
  desconto: number;
  total: number;
  data: string;
  vendedor: string;
}

export interface MovimentoEstoque {
  id: string;
  produtoId: string;
  produtoNome: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  motivo?: string;
  data: string;
  responsavel: string;
}

export interface ProdutoEstoque {
  id: string;
  nome: string;
  categoria: 'uniformes' | 'roupas' | 'acessorios' | 'conveniencia';
  preco: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  /** SKU único do produto */
  sku?: string;
  /** Preço de custo */
  precoCusto?: number;
  /** Fornecedor principal */
  fornecedor?: string;
  /** Tamanhos disponíveis (para vestuário) */
  tamanhos?: { tamanho: string; estoque: number }[];
  /** Última entrada */
  ultimaEntrada?: string;
  /** Curva ABC: 'A' = alta rotação, 'B' = média, 'C' = baixa */
  curvaABC?: 'A' | 'B' | 'C';
}

export interface ContaAluno {
  alunoId: string;
  alunoNome: string;
  saldo: number;
  movimentos: { data: string; descricao: string; valor: number }[];
}

// ============================================================
// SESSÕES PARTICULARES + COMISSÕES
// ============================================================

export type StatusParticular = 'agendada' | 'confirmada' | 'realizada' | 'cancelada';
export type RecorrenciaParticular = 'unica' | 'semanal' | 'quinzenal';
export type DuracaoParticular = 30 | 45 | 60 | 90;

export interface AulaParticular {
  id: string;
  professorId: string;
  professorNome: string;
  alunoId: string;
  alunoNome: string;
  data: string;
  horario: string;
  duracao: DuracaoParticular;
  valor: number;
  splitUnidade: number;
  splitInstrutor: number;
  status: StatusParticular;
  recorrencia: RecorrenciaParticular;
  observacao?: string;
}

export interface Comissao {
  professorId: string;
  professorNome: string;
  mes: string;
  sessõesRegulares: number;
  sessõesParticulares: number;
  valorBruto: number;
  percentual: number;
  valorLiquido: number;
  pago: boolean;
  dataPagamento?: string;
}

// ============================================================
// VISITANTES / DROP-IN / DAY USE
// ============================================================

export type TipoVisita = 'drop_in' | 'day_use' | 'aula_experimental' | 'evento';
export type StatusVisita = 'pendente' | 'check_in' | 'finalizada' | 'no_show';

export interface Visitante {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  tipoVisita: TipoVisita;
  data: string;
  horario: string;
  turmaId?: string;
  turmaNome?: string;
  valor: number;
  formaPagamento?: string;
  status: StatusVisita;
  observacao?: string;
  unidade?: string;
  origemLead?: boolean;
}

// ============================================================
// CAMPOS DO PERFIL — Modalidade, Peso, Atestado, Termo
// ============================================================

export type Modalidade = 'pratica_gi' | 'pratica_nogi' | 'mma' | 'muay_thai' | 'wrestling' | 'judo';
export type CategoriaCompetidor = 'galo' | 'pluma' | 'pena' | 'leve' | 'medio' | 'meio_pesado' | 'pesado' | 'super_pesado' | 'pesadissimo';
export type StatusDocumento = 'pendente' | 'enviado' | 'aprovado' | 'vencido' | 'rejeitado';

export interface PerfilEstendido {
  modalidades: Modalidade[];
  peso?: number;
  categoriaCompetidor?: CategoriaCompetidor;
  atestadoMedico: { status: StatusDocumento; dataEnvio?: string; dataValidade?: string; arquivo?: string };
  termoResponsabilidade: { aceito: boolean; dataAceite?: string; versao?: string };
  termoImagem: { aceito: boolean; dataAceite?: string };
  objetivos?: string;
  lesoes?: string;
  experienciaPrevia?: string;
}

// ============================================================
// AUTH RESPONSES
// ============================================================

export interface AuthLoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  availableProfiles?: User[];
}

export interface AuthRegisterResponse {
  user: User;
  token: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  nome: string;
  email: string;
  password: string;
  idade?: number;
  categoria?: CategoriaRegistro;
}

// ============================================================
// PERFIL INFO (seleção de perfil — backend)
// ============================================================

export interface PerfilInfo {
  id: PerfilAcesso;
  nome: string;
  descricao: string;
  icon: string;
  cor: string;
  redirectTo: string;
}

// ============================================================
// PERMISSÃO (RBAC)
// ============================================================

export interface Permissao {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
}

export interface PerfilPermissoes {
  perfil: PerfilAcesso;
  permissoes: string[];
}

// ============================================================
// GENÉRICOS
// ============================================================

/** Resposta paginada padrão */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Resposta de erro padrão da API */
export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

// ============================================================
// KIDS — Dados filhos cadastro
// ============================================================

export interface KidRegistroData {
  nome: string;
  dataNascimento?: string;
  sexo?: string;
}

// ============================================================
// PEDAGÓGICO — Tipos fortes para módulo Professor
// ============================================================

/** Categoria do aluno (filtro pedagógico) */
export type CategoriaAluno = 'Adulto' | 'Teen' | 'Kids';

/** Status operacional do aluno na visão pedagógica */
export type StatusAluno = 'ativo' | 'alerta' | 'ausente';

/** Status do desafio pedagógico */
export type StatusDesafio = 'pendente' | 'em_andamento' | 'concluido' | 'reprovado';

/** Tipo de ação logada no sistema pedagógico */
export type TipoLog = 'observacao' | 'avaliacao' | 'conquista' | 'progresso' | 'aula' | 'desafio' | 'graduacao';

/** Status automático de graduação (calculado no servidor) */
export type StatusGraduacao = 'APTO' | 'EM_AVALIACAO' | 'NAO_APTO';

/**
 * Módulo de progresso técnico — TIPAGEM FORTE
 *
 * Score SEMPRE entre 0..100.
 * Backend valida e rejeita valores fora da faixa.
 *
 * Módulos por categoria:
 * - Adulto: Quedas, Passagens, Finalizações, Defesa, Estratégia
 * - Teen:   Quedas, Passagens, Finalizações, Defesa, Competição
 * - Kids:   Coordenação, Disciplina, Base, Movimentos Fundamentais
 */
export interface ModuloProgresso {
  id: string;
  nome: string;
  /** Score 0..100 — validado server-side, nunca negativo, nunca >100 */
  progresso: number;
  ultimaAtualizacao: string;
}

/**
 * Progresso técnico — recalculado automaticamente
 *
 * overallScore = média ponderada dos módulos (calculada no backend)
 * Nunca calcular no frontend — apenas exibir.
 */
export interface ProgressoTecnico {
  /** Média geral 0..100 (calculada pelo backend) */
  geral: number;
  modulos: ModuloProgresso[];
}

/** Conquista concedida a um aluno */
export interface ConquistaAluno {
  id: string;
  nome: string;
  emoji: string;
  descricao: string;
  dataConquista: string;
  concedidaPor: string;
}

/** Desafio pedagógico atribuído a um aluno */
export interface DesafioAluno {
  id: string;
  titulo: string;
  status: StatusDesafio;
  prazo: string;
  feedback?: string;
  dataInicio: string;
  dataConclusao?: string;
}

/** Observação pedagógica interna do instrutor */
export interface ObservacaoPedagogica {
  id: string;
  texto: string;
  data: string;
  instrutor: string;
  tipo: 'positiva' | 'neutra' | 'atencao';
}

/** Registro de avaliação técnica/graduação/comportamento */
export interface AvaliacaoRegistro {
  id: string;
  tipo: 'tecnica' | 'graduacao' | 'comportamento';
  resultado: 'aprovado' | 'reprovado' | 'pendente';
  nota?: number;
  observacao: string;
  data: string;
  instrutor: string;
}

/** Registro de presença em sessão */
export interface HistoricoSessão {
  id: string;
  titulo: string;
  data: string;
  presente: boolean;
  turma: string;
}

/**
 * Aluno na visão pedagógica do instrutor — ENTIDADE PRINCIPAL
 *
 * ⚠ SEM dados financeiros, CPF, ou informações sensíveis.
 * updatedAt usado para controle de concorrência otimista.
 */
export interface AlunoPedagogico {
  id: string;
  nome: string;
  idade: number;
  avatar: string;
  categoria: CategoriaAluno;
  nivel: string;
  subniveis: number;
  turma: string;
  turmaId: string;
  tempoTreino: string;
  dataInicio: string;
  status: StatusAluno;
  /** Status de graduação calculado automaticamente (freq>75% && progresso>80%) */
  statusGraduacao: StatusGraduacao;
  /** Payment status (Wave 15) */
  statusPagamento?: 'em_dia' | 'pendente' | 'atrasado';
  /** Whether student is ready for graduation (Wave 15) */
  aptoGraduacao?: boolean;
  /** Timestamp para controle de concorrência otimista */
  updatedAt: string;
  frequencia: {
    presenca30d: number;
    presenca90d: number;
    totalSessões: number;
    ultimaSessao: string;
    diasAusente: number;
  };
  progresso: ProgressoTecnico;
  conquistas: ConquistaAluno[];
  desafios: DesafioAluno[];
  observacoes: ObservacaoPedagogica[];
  avaliacoes: AvaliacaoRegistro[];
  historicoSessões: HistoricoAula[];
}

/** Log de ação pedagógica — auditoria obrigatória */
export interface LogPedagogico {
  id: string;
  tipo: TipoLog;
  descricao: string;
  alunoId: string;
  alunoNome: string;
  professorId: string;
  professorNome: string;
  timestamp: string;
  detalhes?: string;
}

/** Estatísticas pedagógicas agregadas (cache-friendly) */
export interface EstatisticasPedagogicas {
  totalAlunos: number;
  alunosPorCategoria: { categoria: CategoriaAluno; total: number }[];
  frequenciaMedia: number;
  alunosBaixaFrequencia: number;
  alunosDestaque: number;
  alunosAptoGraduacao: number;
  conquistasConcedidasMes: number;
  desafiosPendentes: number;
  distribuicaoNiveis: { nivel: string; total: number }[];
  evolucaoMensal: { mes: string; novos: number; ativos: number; frequencia: number }[];
  frequenciaSemanal: { dia: string; presentes: number; total: number }[];
}

/**
 * Parâmetros de query para listagem paginada de alunos.
 * Toda filtragem/busca/ordenação é server-side.
 */
export interface AlunoQueryParams {
  page?: number;
  limit?: number;
  categoria?: CategoriaAluno;
  search?: string;
  status?: StatusAluno;
  sortBy?: 'nome' | 'frequencia' | 'progresso' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/** Erro de conflito para controle de concorrência otimista */
export interface ConflictError {
  code: 'CONFLICT';
  message: string;
  currentUpdatedAt: string;
}

/** Payload para atualizar progresso com controle de concorrência */
export interface UpdateProgressoPayload {
  moduloId: string;
  valor: number; // 0..100
  updatedAt: string; // timestamp para optimistic lock
}

// ============================================================
// SEGURANÇA — Arquitetura Enterprise (Zero Trust)
// ============================================================

/**
 * Roles do sistema — RBAC
 * Cada role tem permissões específicas associadas no backend.
 * Frontend usa para UI gating; backend SEMPRE valida.
 */
export type SecurityRole =
  // ── Corporativo (Admin) ──
  | 'SUPPORT'          // Operador da plataforma (acesso técnico apenas)
  | 'UNIT_OWNER'       // Controlador da unidade (acesso total à própria unidade)
  // ── Operacional ──
  | 'INSTRUTOR'
  | 'ALUNO_ADULTO'
  | 'ALUNO_ADOLESCENTE'
  | 'ALUNO_KIDS'
  | 'RESPONSAVEL'
  // ── Legacy aliases (backward compat — mapeiam para SUPPORT/UNIT_OWNER) ──
  | 'ADMIN'            // → UNIT_OWNER (legacy)
  | 'SYS_AUDITOR';     // → SUPPORT (legacy)

/**
 * Permissões granulares — Policy Engine
 * Formato: "resource:action" ou "resource:action:scope"
 * Backend valida permissão específica, NUNCA apenas a role.
 */
export type SecurityPermission =
  // ── Admin (unidade) ──
  | 'admin:manage:users'
  | 'admin:manage:units'
  | 'admin:view:audit'
  | 'admin:manage:roles'
  | 'admin:export:data'
  | 'admin:manage:settings'
  // ── Professor ──
  | 'instrutor:view:students'
  | 'instrutor:update:progress'
  | 'instrutor:create:class'
  | 'instrutor:delete:class'
  | 'instrutor:grant:medal'
  | 'instrutor:create:evaluation'
  | 'instrutor:create:observation'
  | 'instrutor:view:reports'
  // ── Aluno ──
  | 'student:view:own_progress'
  | 'student:view:content'
  | 'student:checkin'
  // ── Responsável ──
  | 'parent:view:children'
  | 'parent:manage:children_access'
  // ── Financeiro (UNIT_OWNER only) ──
  | 'finance:view:payments'
  | 'finance:manage:payments'
  | 'finance:view:reports'
  // ── Module: Executive (UNIT_OWNER only) ──
  | 'module:executive:view'
  | 'module:executive:manage'
  // ── Module: Finance (UNIT_OWNER only) ──
  | 'module:finance:view'
  | 'module:finance:manage'
  // ── Module: Operations (UNIT_OWNER only) ──
  | 'module:operations:view'
  | 'module:operations:manage'
  // ── Module: Pedagogy (UNIT_OWNER only) ──
  | 'module:pedagogy:view'
  | 'module:pedagogy:manage'
  // ── Module: Technical (SUPPORT only) ──
  | 'module:technical:view'
  | 'module:technical:manage'
  // ── Module: Security (SUPPORT only) ──
  | 'module:security:view'
  | 'module:security:manage'
  // ── Module: AI Governance (SUPPORT only) ──
  | 'module:ai_governance:view'
  | 'module:ai_governance:manage'
  // ── Developer / SUPPORT (legacy compat) ──
  | 'dev:view:audit_logs'
  | 'dev:view:system_health'
  | 'dev:view:ai_models'
  | 'dev:execute:danger_zone'
  | 'dev:view:login_monitoring'
  | 'dev:view:observability';

/** Mapeamento Role → Permissões (definição server-side, espelhada no front para UI) */
export const ROLE_PERMISSIONS: Record<SecurityRole, SecurityPermission[]> = {
  // ════════════════════════════════════════════════════════
  // SUPPORT — Operador da Plataforma
  // Acesso: TECHNICAL, SECURITY, AI_GOVERNANCE
  // Proibido: FINANCE, PEDAGOGY, EXECUTIVE
  // ════════════════════════════════════════════════════════
  SUPPORT: [
    // Módulos técnicos
    'module:technical:view', 'module:technical:manage',
    'module:security:view', 'module:security:manage',
    'module:ai_governance:view', 'module:ai_governance:manage',
    // Developer tools
    'dev:view:audit_logs', 'dev:view:system_health', 'dev:view:ai_models',
    'dev:execute:danger_zone', 'dev:view:login_monitoring', 'dev:view:observability',
    // Audit (somente leitura)
    'admin:view:audit',
    // NUNCA: finance:*, module:finance:*, module:pedagogy:*, module:executive:*
  ],

  // ════════════════════════════════════════════════════════
  // UNIT_OWNER — Controlador da Unidade (Dono da Unidade)
  // Acesso: EXECUTIVE, FINANCE, OPERATIONS, PEDAGOGY
  // Proibido: TECHNICAL, SECURITY, AI_GOVERNANCE
  // ════════════════════════════════════════════════════════
  UNIT_OWNER: [
    // Módulos de negócio
    'module:executive:view', 'module:executive:manage',
    'module:finance:view', 'module:finance:manage',
    'module:operations:view', 'module:operations:manage',
    'module:pedagogy:view', 'module:pedagogy:manage',
    // Admin da unidade
    'admin:manage:users', 'admin:manage:units', 'admin:view:audit',
    'admin:manage:roles', 'admin:export:data', 'admin:manage:settings',
    // Financeiro
    'finance:view:payments', 'finance:manage:payments', 'finance:view:reports',
    // Supervisão pedagógica (leitura — professor executa)
    'instrutor:view:students', 'instrutor:view:reports',
    // NUNCA: dev:*, module:technical:*, module:security:*, module:ai_governance:*
  ],

  // ════════════════════════════════════════════════════════
  // ROLES OPERACIONAIS (não-admin)
  // ════════════════════════════════════════════════════════
  INSTRUTOR: [
    'instrutor:view:students', 'instrutor:update:progress', 'instrutor:create:class',
    'instrutor:delete:class', 'instrutor:grant:medal', 'instrutor:create:evaluation',
    'instrutor:create:observation', 'instrutor:view:reports',
  ],
  ALUNO_ADULTO: ['student:view:own_progress', 'student:view:content', 'student:checkin'],
  ALUNO_ADOLESCENTE: ['student:view:own_progress', 'student:view:content', 'student:checkin'],
  ALUNO_KIDS: ['student:view:own_progress', 'student:view:content'],
  RESPONSAVEL: ['parent:view:children', 'parent:manage:children_access', 'student:view:content'],

  // ════════════════════════════════════════════════════════
  // LEGACY ALIASES (backward compat — serão removidos em v2)
  // ════════════════════════════════════════════════════════
  ADMIN: [
    // Legacy: mesmas permissões de UNIT_OWNER
    'module:executive:view', 'module:executive:manage',
    'module:finance:view', 'module:finance:manage',
    'module:operations:view', 'module:operations:manage',
    'module:pedagogy:view', 'module:pedagogy:manage',
    'admin:manage:users', 'admin:manage:units', 'admin:view:audit',
    'admin:manage:roles', 'admin:export:data', 'admin:manage:settings',
    'finance:view:payments', 'finance:manage:payments', 'finance:view:reports',
    'instrutor:view:students', 'instrutor:view:reports',
  ],
  SYS_AUDITOR: [
    // Legacy: mesmas permissões de SUPPORT
    'module:technical:view', 'module:technical:manage',
    'module:security:view', 'module:security:manage',
    'module:ai_governance:view', 'module:ai_governance:manage',
    'dev:view:audit_logs', 'dev:view:system_health', 'dev:view:ai_models',
    'dev:execute:danger_zone', 'dev:view:login_monitoring', 'dev:view:observability',
    'admin:view:audit',
  ],
};

// ============================================================
// ADMIN MODULE SYSTEM
// ============================================================

/**
 * Módulos do painel administrativo.
 * Cada módulo é isolado e acessível apenas pela role correspondente.
 */
export type AdminModule =
  | 'EXECUTIVE'       // Dashboard executivo, KPIs (UNIT_OWNER)
  | 'FINANCE'         // Financeiro, pagamentos, relatórios (UNIT_OWNER)
  | 'OPERATIONS'      // Check-in, turmas, agenda (UNIT_OWNER)
  | 'PEDAGOGY'        // Pedagogia, avaliações, progresso (UNIT_OWNER)
  | 'TECHNICAL'       // Logs, health, infrastructure (SUPPORT)
  | 'SECURITY'        // Login monitor, audit trail (SUPPORT)
  | 'AI_GOVERNANCE';  // Model registry, inference health (SUPPORT)

/**
 * Matriz de acesso por módulo.
 * SUPPORT nunca acessa FINANCE, PEDAGOGY, EXECUTIVE.
 * UNIT_OWNER nunca acessa TECHNICAL, SECURITY, AI_GOVERNANCE.
 */
export const MODULE_ACCESS: Record<'SUPPORT' | 'UNIT_OWNER', AdminModule[]> = {
  SUPPORT: ['TECHNICAL', 'SECURITY', 'AI_GOVERNANCE'],
  UNIT_OWNER: ['EXECUTIVE', 'FINANCE', 'OPERATIONS', 'PEDAGOGY'],
};

/**
 * Resolve role legacy para role canônica.
 * ADMIN/GESTOR/ADMINISTRADOR/SUPER_ADMIN → UNIT_OWNER
 * SYS_AUDITOR → SUPPORT
 */
export function resolveCanonicalRole(role: SecurityRole): 'SUPPORT' | 'UNIT_OWNER' | null {
  switch (role) {
    case 'SUPPORT':
    case 'SYS_AUDITOR':
      return 'SUPPORT';
    case 'UNIT_OWNER':
    case 'ADMIN':
      return 'UNIT_OWNER';
    default:
      return null; // Roles operacionais (professor, aluno, etc.)
  }
}

/**
 * Verifica se uma role tem acesso a um módulo administrativo.
 */
export function hasModuleAccess(role: SecurityRole, module: AdminModule): boolean {
  const canonical = resolveCanonicalRole(role);
  if (!canonical) return false;
  return MODULE_ACCESS[canonical].includes(module);
}

/** Sessão ativa do usuário — tabela user_sessions */
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  /** Hash do refresh token (nunca armazenar plain text) */
  refreshTokenHash: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  revoked: boolean;
  revokedAt?: string;
  revokedReason?: string;
}

/** Informações do dispositivo (fingerprint básico) */
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  timezone: string;
  /** Hash derivado dos campos acima */
  fingerprint: string;
}

/** Resultado de autenticação enterprise */
export interface AuthResult {
  /** JWT de curta duração (10-15 min) */
  accessToken: string;
  /** Metadata do token */
  accessTokenExpiresAt: string;
  /** Refresh token via httpOnly cookie (não exposto ao JS) */
  refreshTokenSetViaCookie: boolean;
  /** Dados do usuário */
  user: AuthenticatedUser;
  /** Sessão criada */
  sessionId: string;
  /** Se login foi de um dispositivo/IP desconhecido */
  suspiciousLogin: boolean;
}

/** Usuário autenticado com contexto de segurança */
export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  role: SecurityRole;
  permissions: SecurityPermission[];
  /** ID da unidade para isolamento multi-tenant */
  unitId: string;
  avatar?: string;
  graduacao?: string;
}

/** Log de auditoria imutável — tabela security_audit_logs */
export interface AuditLogEntry {
  id: string;
  userId: string;
  role: SecurityRole;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  /** ID da unidade para isolamento */
  unitId: string;
  createdAt: string;
  /** Nunca null — append only */
  immutable: true;
}

/** Ações auditáveis */
export type AuditAction =
  | 'auth:login'
  | 'auth:logout'
  | 'auth:logout_all'
  | 'auth:login_failed'
  | 'auth:password_change'
  | 'auth:token_refresh'
  | 'auth:suspicious_login'
  | 'progress:update'
  | 'medal:grant'
  | 'evaluation:create'
  | 'observation:create'
  | 'class:create'
  | 'class:delete_blocked'
  | 'student:create'
  | 'student:update'
  | 'student:deactivate'
  | 'user:role_change'
  | 'data:export'
  | 'data:anonymize';

/** Status do rate limiter */
export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  /** Se bloqueio temporário está ativo */
  blocked: boolean;
  blockedUntil?: string;
}

/** Configuração de segurança (carregada do backend/env) */
export interface SecurityConfig {
  /** Duração do access token em segundos */
  accessTokenTTL: number;
  /** Duração do refresh token em segundos */
  refreshTokenTTL: number;
  /** Máximo de tentativas de login antes de bloqueio */
  maxLoginAttempts: number;
  /** Duração do bloqueio temporário em segundos */
  lockoutDuration: number;
  /** Se requer reautenticação para ações críticas */
  requireReauthForCritical: boolean;
  /** Máximo de sessões simultâneas por usuário */
  maxConcurrentSessions: number;
}

/** Resultado de verificação de permissão */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  /** Se requer reautenticação */
  requiresReauth?: boolean;
}

/** Request para reautenticação (ações críticas) */
export interface ReauthRequest {
  password: string;
  action: AuditAction;
  resourceId?: string;
}

/** LGPD — Solicitação de exportação/anonimização */
export interface LGPDRequest {
  type: 'export' | 'anonymize' | 'delete';
  userId: string;
  reason: string;
  requestedAt: string;
  approvedBy?: string;
  completedAt?: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
}

// ============================================================
// PERSISTÊNCIA — Camada de Integridade (Livro-Razão)
// ============================================================

/**
 * Entidade base com soft delete, concorrência e tenant isolation.
 * Toda entidade crítica do sistema DEVE estender esta interface.
 *
 * Campos obrigatórios no banco:
 * - id:         UUID (nunca sequencial)
 * - unit_id:    Isolamento multi-tenant
 * - created_at: Timestamp de criação
 * - updated_at: Controle de concorrência otimista
 * - deleted_at: Soft delete (null = ativo)
 * - version:    Número de versão para optimistic lock
 */
export interface BaseEntity {
  id: string;
  unitId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

/** Operações que geram audit log */
export type AuditableOperation = 'CREATE' | 'UPDATE' | 'DELETE' | 'ANONYMIZE';

/** Contexto de execução para audit trail */
export interface AuditContext {
  userId: string;
  role: SecurityRole;
  unitId: string;
  ipAddress: string;
  userAgent: string;
  /** Ação que disparou o audit */
  action: AuditAction;
}

/** Resultado de operação com audit trail */
export interface AuditedResult<T> {
  data: T;
  auditLogId: string;
  version: number;
  updatedAt: string;
}

/** Erro de integridade referencial */
export interface IntegrityError {
  code: 'INTEGRITY_VIOLATION';
  message: string;
  resourceType: string;
  resourceId: string;
  dependencyType: string;
  dependencyCount: number;
}

/** Erro global padronizado (nunca expõe detalhes internos) */
export interface SafeError {
  /** Código HTTP */
  status: number;
  /** Código de erro da aplicação */
  code: string;
  /** Mensagem segura para o usuário */
  message: string;
  /** ID de rastreamento para debug (UUID) */
  traceId: string;
}

/** Mapeamento de códigos de erro → mensagens seguras */
export const SAFE_ERROR_MESSAGES: Record<string, string> = {
  CONFLICT: 'Este registro foi atualizado por outro usuário. Atualize a página.',
  INTEGRITY_VIOLATION: 'Não é possível realizar esta operação. Existem registros vinculados.',
  FORBIDDEN: 'Acesso não permitido.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  RATE_LIMITED: 'Muitas requisições. Aguarde antes de tentar novamente.',
  UNIT_MISMATCH: 'Acesso negado. Recurso pertence a outra unidade.',
  DELETION_BLOCKED: 'Não é possível excluir este registro. Existem dependências ativas.',
  ANONYMIZE_FAILED: 'Falha na anonimização. Tente novamente.',
  VERSION_MISMATCH: 'Conflito de versão detectado. Recarregue os dados.',
};

/**
 * Dados pessoais sensíveis que devem ser anonimizados (LGPD).
 * Estes campos são criptografados em repouso (AES-256)
 * e substituídos por placeholders na anonimização.
 */
export interface SensitivePersonalData {
  cpf?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
  nomeCompleto?: string;
}

/** Resultado da anonimização */
export interface AnonymizeResult {
  success: boolean;
  studentId: string;
  fieldsAnonymized: string[];
  auditLogId: string;
  /** Dados pedagógicos preservados */
  pedagogicalDataPreserved: boolean;
}

// ============================================================
// RANKING / GAMIFICAÇÃO
// ============================================================

/** Categoria de ranking (filtro por nivel etária) */
export type CategoriaRanking = 'ADULTO' | 'TEEN' | 'KIDS';

/** Período para filtro de ranking */
export type PeriodoRanking = 'SEMANAL' | 'MENSAL' | 'TRIMESTRAL' | 'ANUAL' | 'GERAL';

/** Uma entrada no leaderboard */
export interface RankingEntry {
  posicao: number;
  alunoId: string;
  nome: string;
  avatar?: string;
  nivel: string;
  pontos: number;
  /** Variação de posição na última semana (+3 = subiu 3, -2 = desceu 2) */
  variacaoSemana: number;
  /** Total de check-ins no período */
  checkinsRecentes: number;
  /** Streak atual em dias */
  streakAtual: number;
  /** Categoria do aluno */
  categoria: CategoriaRanking;
  /** ID da turma principal */
  turmaId?: string;
  /** Nome da turma principal */
  turmaNome?: string;
}

/** Regra de pontuação configurável */
export interface PontoRegra {
  id: string;
  nome: string;
  descricao: string;
  pontos: number;
  /** Ícone lucide-react ou emoji */
  icone: string;
  /** Se está ativa */
  ativa: boolean;
  /** Categoria: se vazio, aplica a todas */
  categorias?: CategoriaRanking[];
}

/** Resumo de pontos do aluno */
export interface PontosResumo {
  total: number;
  esteMes: number;
  ultimaSemana: number;
  posicaoGeral: number;
  posicaoCategoria: number;
  streakAtual: number;
  melhorStreak: number;
  /** Breakdown das fontes de pontos */
  fontes: { fonte: string; pontos: number; quantidade: number }[];
}

// ============================================================
// CARTEIRINHA DIGITAL + PERFIL PÚBLICO
// ============================================================

/** Status da carteirinha digital */
export type StatusCarteirinha = 'ATIVA' | 'VENCIDA' | 'BLOQUEADA';

/** Dados da carteirinha digital do aluno */
export interface CarteirinhaDigital {
  alunoId: string;
  matricula: string;
  nome: string;
  avatar?: string;
  nivel: string;
  unidade: string;
  unidadeNome?: string;
  dataInicio: string;
  dataValidade: string;
  status: StatusCarteirinha;
  /** Código para QR code */
  codigoQR: string;
  /** Código de barras (simulado) */
  codigoBarras: string;
  /** Professor principal */
  instrutor?: string;
  /** Turma principal */
  turma?: string;
}

/** Graduação histórica do atleta */
export interface GraduacaoHistorico {
  nivel: string;
  data: string;
  professorNome?: string;
}

/** Exame de graduação — admin */
export interface ExameGraduacao {
  id: string;
  alunoId: string;
  alunoNome: string;
  nivelAtual: string;
  nivelAlvo: string;
  status: 'AGENDADO' | 'APROVADO' | 'REPROVADO' | 'CANCELADO';
  dataExame: string;
  professorAvaliador: string;
  presencaPct: number;
  tempoNivelMeses: number;
  observacao?: string;
}

/** Requisitos para promoção de nivel */
export interface RequisitoGraduacao {
  nivelDe: string;
  nivelPara: string;
  tempoMinimoMeses: number;
  presencaMinimaPct: number;
  sessõesMinimas: number;
}

/** Controle de subniveis (stripes) por aluno */
export interface SubnivelAluno {
  alunoId: string;
  alunoNome: string;
  nivelAtual: string;
  subniveisAtuais: number; // 0-4
  dataUltimoSubnivel?: string;
  presencaPct: number;
  tempoNivelMeses: number;
  historicoSubniveis: { subnivel: number; data: string; instrutor: string }[];
}

/** Perfil público do atleta (sem dados pessoais sensíveis) */
export interface AtletaPublico {
  id: string;
  nome: string;
  avatar?: string;
  nivelAtual: string;
  unidade: string;
  /** Meses treinando */
  tempoTreino: number;
  totalCheckins: number;
  mesesTreinando: number;
  conquistasRecebidas: number;
  /** Timeline de graduações */
  graduacoes: GraduacaoHistorico[];
  /** Link público compartilhável */
  linkPublico: string;
}

// ============================================================
// EVENTOS E CAMPEONATOS
// ============================================================

/** Tipo de evento */
export type TipoEvento = 'INTERNO' | 'EXTERNO';

/** Status do evento */
export type StatusEvento = 'AGENDADO' | 'INSCRICOES_ABERTAS' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

/** Categoria de peso + nivel para inscrição */
export interface CategoriaEvento {
  id: string;
  nivel: string;
  peso: string;
  /** Limite de inscritos (0 = sem limite) */
  limiteInscritos?: number;
}

/** Inscrição de aluno em evento */
export interface InscricaoEvento {
  id: string;
  alunoId: string;
  alunoNome: string;
  eventoId: string;
  categoriaId: string;
  /** Ex: "Nível Básico - Leve" */
  categoriaDescricao: string;
  peso: string;
  dataInscricao: string;
  resultado?: ResultadoInscricao;
}

/** Resultado de um inscrito pós-evento */
export interface ResultadoInscricao {
  posicao: number; // 1=ouro, 2=prata, 3=bronze
  conquista: 'OURO' | 'PRATA' | 'BRONZE' | 'SEM_CONQUISTA';
  observacao?: string;
}

/** Evento ou Campeonato */
export interface Evento {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  dataFim?: string;
  local: string;
  endereco?: string;
  tipo: TipoEvento;
  status: StatusEvento;
  categorias: CategoriaEvento[];
  inscricoesAbertas: boolean;
  prazoInscricao?: string;
  valorInscricao?: number;
  regulamento?: string;
  inscritos: InscricaoEvento[];
  resultados?: InscricaoEvento[];
  /** URL da imagem de capa */
  imagemCapa?: string;
  /** Total de vagas (0 = sem limite) */
  totalVagas?: number;
  unidadeId?: string;
}

// ============================================================
// AUTOMAÇÕES
// ============================================================

/** Canal de envio da automação */
export type CanalAutomacao = 'PUSH' | 'WHATSAPP' | 'EMAIL' | 'SMS';

/** Trigger que dispara a automação */
export type TriggerAutomacao =
  | 'DIAS_SEM_TREINAR'
  | 'INADIMPLENCIA'
  | 'FREQUENCIA_ALTA'
  | 'LEMBRETE_AULA'
  | 'APTO_EXAME'
  | 'INATIVO_REATIVACAO'
  | 'ANIVERSARIO'
  | 'POS_EXPERIMENTAL';

/** Estatísticas de uma automação */
export interface AutomacaoStats {
  totalEnviados: number;
  ultimoEnvio?: string;
  taxaResposta: number;
  /** Últimos 7 dias */
  enviadosSemana: number;
}

/** Configuração de uma automação */
export interface AutomacaoConfig {
  /** Dias/valor do trigger (ex: 3 dias sem treinar) */
  valor?: number;
  /** Unidade do valor (dias, treinos, etc.) */
  unidade?: string;
  /** Mensagem template com variáveis: {nome}, {dias_sem_treinar}, {turma}, {professor} */
  mensagemTemplate: string;
  /** Variáveis disponíveis */
  variaveisDisponiveis: string[];
}

/** Automação completa */
export interface Automacao {
  id: string;
  nome: string;
  descricao: string;
  trigger: TriggerAutomacao;
  canais: CanalAutomacao[];
  config: AutomacaoConfig;
  ativa: boolean;
  stats: AutomacaoStats;
  /** Ícone lucide-react */
  icone: string;
  /** Cor do ícone */
  cor: string;
}

// ============================================================
// RELATÓRIOS E EXPORTAÇÕES
// ============================================================

/** Tipo de relatório disponível */
export type TipoRelatorio =
  | 'FREQUENCIA'
  | 'FINANCEIRO'
  | 'ALUNOS'
  | 'GRADUACOES'
  | 'EVENTOS'
  | 'EVASAO'
  | 'CHECK_INS';

/** Formato de exportação */
export type FormatoExportacao = 'CSV' | 'PDF' | 'XLSX';

/** Período do relatório */
export interface PeriodoRelatorio {
  inicio: string;
  fim: string;
}

/** Configuração de um tipo de relatório */
export interface RelatorioConfig {
  tipo: TipoRelatorio;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  formatosDisponiveis: FormatoExportacao[];
  camposDisponiveis: string[];
}

/** Linha genérica de dados do relatório */
export interface RelatorioLinha {
  [key: string]: string | number | boolean | undefined;
}

/** Relatório gerado com preview */
export interface RelatorioGerado {
  tipo: TipoRelatorio;
  titulo: string;
  periodo: PeriodoRelatorio;
  geradoEm: string;
  totalLinhas: number;
  colunas: { key: string; label: string }[];
  dados: RelatorioLinha[];
  resumo?: { label: string; valor: string }[];
}

// ============================================================
// ASSINATURA DIGITAL + CONSENTIMENTO LGPD
// ============================================================

/** Status de um documento pendente de assinatura */
export type StatusDocumento = 'PENDENTE' | 'ASSINADO' | 'EXPIRADO' | 'CANCELADO';

/** Tipo de documento para assinatura */
export type TipoDocumento =
  | 'CONTRATO_MATRICULA'
  | 'TERMO_RESPONSABILIDADE'
  | 'CONSENTIMENTO_IMAGEM'
  | 'REGULAMENTO_INTERNO'
  | 'CONSENTIMENTO_LGPD'
  | 'TERMO_SAUDE';

/** Documento para assinatura digital */
export interface DocumentoAssinatura {
  id: string;
  tipo: TipoDocumento;
  titulo: string;
  descricao: string;
  conteudo: string;
  versao: string;
  obrigatorio: boolean;
  status: StatusDocumento;
  dataAssinatura?: string;
  ipAssinatura?: string;
  hashAssinatura?: string;
}

/** Consentimento LGPD */
export interface ConsentimentoLGPD {
  id: string;
  titulo: string;
  descricao: string;
  obrigatorio: boolean;
  aceito: boolean;
  dataAceite?: string;
}

// ============================================================
// KIDS SAFETY — Autorização de Saída
// ============================================================

/** Pessoa autorizada a buscar menor */
export interface PessoaAutorizada {
  id: string;
  responsavelId: string;
  alunoId: string;
  nome: string;
  cpf: string;
  telefone: string;
  parentesco: string;
  foto?: string;
  ativa: boolean;
  dataCadastro: string;
}

/** Registro de saída de menor */
export interface AutorizacaoSaida {
  id: string;
  alunoId: string;
  alunoNome: string;
  pessoaAutorizadaId: string;
  pessoaAutorizadaNome: string;
  parentesco: string;
  dataHoraSaida: string;
  validadoPor: string;
  metodoValidacao: 'documento' | 'reconhecimento' | 'senha';
}

// ============================================================
// PLANO DE AULA — Professor
// ============================================================

export type FaseSessão = 'aquecimento' | 'tecnica' | 'drill' | 'sparring' | 'alongamento';

export interface TecnicaPratica {
  id: string;
  nome: string;
  posicao: string;
  tipo: 'ataque' | 'defesa' | 'transicao' | 'raspagem' | 'finalizacao';
  nivelMinimo: string;
  descricao?: string;
}

export interface ItemPlanoSessão {
  id: string;
  fase: FaseAula;
  titulo: string;
  descricao: string;
  duracaoMinutos: number;
  tecnicaId?: string;
}

export interface PlanoSessão {
  id: string;
  titulo: string;
  turmaId?: string;
  turmaNome?: string;
  data: string;
  professorId: string;
  itens: ItemPlanoAula[];
  duracaoTotal: number;
  template: boolean;
  tags: string[];
}

/** Filtros de query com tenant isolation automático */
export interface TenantQuery<T = Record<string, unknown>> {
  /** Filtros de negócio (sem unit_id — adicionado automaticamente) */
  filters: Partial<T>;
  /** Se deve incluir soft-deleted */
  includeDeleted?: boolean;
  /** Paginação */
  page?: number;
  limit?: number;
  /** Ordenação */
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}
