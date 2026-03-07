// ============================================================
// Unit Owner — Mock Data
// Academia "BlackBelt Demo" — Visao empresarial completa
// ============================================================

// ── Interfaces ──────────────────────────────────────────────

export interface OwnerKPIs {
  mrr: number;
  mrrVariacao: number; // % vs mes anterior
  arr: number;
  ticketMedio: number;
  ltvMedio: number;
  cacEstimado: number;
  roiMensal: number;
  alunosAtivos: number;
  novosNoMes: number;
  cancelamentosNoMes: number;
  netGrowth: number;
  taxaRetencao: number;
  taxaInadimplencia: number;
  ocupacaoMedia: number;
  horarioMaisCheio: string;
  horarioMaisVazio: string;
  turmaMaisLotada: string;
  turmaComVagas: string;
}

export interface ReceitaMensal { mes: string; receita: number; despesa: number; lucro: number; alunos: number; }
export interface DistribuicaoItem { nome: string; valor: number; cor: string; }
export interface FunilItem { etapa: string; quantidade: number; taxa: number; }
export interface AlertaNegocio { id: string; tipo: 'warning' | 'critical' | 'info'; titulo: string; descricao: string; }
export interface ComparativoMes { metrica: string; mesAtual: number; mesAnterior: number; mesmoMesAnoAnterior: number; }

// Financeiro
export interface Despesa { id: string; nome: string; categoria: string; valor: number; tipo: 'fixa' | 'variavel'; recorrencia: 'mensal' | 'anual' | 'avulsa'; }
export interface ReceitaPorCategoria { categoria: string; valor: number; percentual: number; }
export interface Inadimplente { id: string; nome: string; diasAtraso: number; valor: number; telefone: string; email: string; }
export interface ReguaCobranca { dia: number; acao: string; tipo: 'lembrete' | 'aviso' | 'bloqueio'; ativo: boolean; }

// Equipe
export interface Professor {
  id: string; nome: string; foto: string; modalidades: string[]; turmas: string[];
  cargaHoraria: number; avaliacaoMedia: number; tipoRemuneracao: string;
  salario: number; retencaoAlunos: number; frequenciaMedia: number;
  satisfacao: number; contratoStatus: 'ativo' | 'vencido'; cref: string;
}
export interface StaffMember { id: string; nome: string; funcao: string; horario: string; salario: number; contato: string; }

// CRM
export interface FunilVendas { coluna: string; cor: string; leads: CrmLead[]; }
export interface CrmLead {
  id: string; nome: string; telefone: string; email: string; whatsapp: string;
  modalidade: string; comoConheceu: string; dataPrimeiroContato: string;
  responsavel: string; notas: string; followUp: string; motivoPerda?: string;
}
export interface MetricaFunil { etapa: string; taxa: number; tempoMedio: number; }
export interface Indicacao { id: string; indicador: string; indicado: string; status: 'pendente' | 'convertido' | 'perdido'; desconto: string; }

// Marketing
export interface Campanha {
  id: string; nome: string; tipo: string; dataInicio: string; dataFim: string;
  desconto: string; codigo: string; limiteUso: number; usados: number;
  receitaGerada: number; status: 'ativa' | 'encerrada' | 'agendada';
}
export interface RedeSocial { nome: string; url: string; seguidores: number; engajamento: number; }
export interface AlunoEmRisco { id: string; nome: string; motivo: string; diasSemVir: number; planoVence?: string; acaoSugerida: string; }

// Infraestrutura
export interface Espaco {
  id: string; nome: string; tipo: string; dimensoes: string; capacidade: number;
  equipamentos: string[]; status: 'ativo' | 'manutencao' | 'desativado';
}
export interface Manutencao {
  id: string; espaco: string; descricao: string; custo: number; fornecedor: string;
  data: string; status: 'pendente' | 'realizada' | 'agendada'; preventiva: boolean;
}
export interface Equipamento {
  id: string; nome: string; quantidade: number; estado: 'novo' | 'bom' | 'desgastado' | 'substituir';
  dataCompra: string; custo: number; fornecedor: string;
}

// Metas
export interface Meta {
  id: string; nome: string; tipo: string; target: number; atual: number;
  unidade: string; status: 'no_caminho' | 'atencao' | 'critico' | 'atingida';
  sugestao?: string;
}
export interface HistoricoMeta { mes: string; meta: string; target: number; resultado: number; atingiu: boolean; }

// ── KPIs ────────────────────────────────────────────────────

export const OWNER_KPIS: OwnerKPIs = {
  mrr: 45000,
  mrrVariacao: 5.2,
  arr: 540000,
  ticketMedio: 250,
  ltvMedio: 3000,
  cacEstimado: 120,
  roiMensal: 37,
  alunosAtivos: 180,
  novosNoMes: 12,
  cancelamentosNoMes: 4,
  netGrowth: 8,
  taxaRetencao: 87,
  taxaInadimplencia: 8,
  ocupacaoMedia: 72,
  horarioMaisCheio: '19:00 - 20:00',
  horarioMaisVazio: '14:00 - 15:00',
  turmaMaisLotada: 'BJJ Avancado Noite',
  turmaComVagas: 'Muay Thai Manha',
};

// ── Receita Mensal (12 meses) ───────────────────────────────

export const RECEITA_MENSAL: ReceitaMensal[] = [
  { mes: 'Abr/25', receita: 38000, despesa: 25000, lucro: 13000, alunos: 155 },
  { mes: 'Mai/25', receita: 39500, despesa: 25500, lucro: 14000, alunos: 158 },
  { mes: 'Jun/25', receita: 38800, despesa: 26000, lucro: 12800, alunos: 156 },
  { mes: 'Jul/25', receita: 40200, despesa: 26200, lucro: 14000, alunos: 160 },
  { mes: 'Ago/25', receita: 41000, despesa: 26500, lucro: 14500, alunos: 163 },
  { mes: 'Set/25', receita: 41500, despesa: 26800, lucro: 14700, alunos: 165 },
  { mes: 'Out/25', receita: 42300, despesa: 27000, lucro: 15300, alunos: 168 },
  { mes: 'Nov/25', receita: 42800, despesa: 27200, lucro: 15600, alunos: 170 },
  { mes: 'Dez/25', receita: 40000, despesa: 27500, lucro: 12500, alunos: 167 },
  { mes: 'Jan/26', receita: 43500, despesa: 27800, lucro: 15700, alunos: 173 },
  { mes: 'Fev/26', receita: 44200, despesa: 28000, lucro: 16200, alunos: 176 },
  { mes: 'Mar/26', receita: 45000, despesa: 28000, lucro: 17000, alunos: 180 },
];

// ── Distribuicao ────────────────────────────────────────────

export const DIST_MODALIDADE: DistribuicaoItem[] = [
  { nome: 'BJJ', valor: 85, cor: '#3B82F6' },
  { nome: 'Muay Thai', valor: 42, cor: '#EF4444' },
  { nome: 'Wrestling', valor: 25, cor: '#F59E0B' },
  { nome: 'No-Gi', valor: 18, cor: '#8B5CF6' },
  { nome: 'Kids', valor: 10, cor: '#10B981' },
];

export const DIST_PLANO: DistribuicaoItem[] = [
  { nome: 'Premium', valor: 72, cor: '#F59E0B' },
  { nome: 'Plus', valor: 58, cor: '#3B82F6' },
  { nome: 'Basico', valor: 35, cor: '#6B7280' },
  { nome: 'Familia', valor: 15, cor: '#10B981' },
];

// ── Funil de Conversao ──────────────────────────────────────

export const FUNIL_CONVERSAO: FunilItem[] = [
  { etapa: 'Visitante', quantidade: 120, taxa: 100 },
  { etapa: 'Trial', quantidade: 48, taxa: 40 },
  { etapa: 'Matricula', quantidade: 30, taxa: 25 },
  { etapa: 'Renovacao', quantidade: 26, taxa: 21.7 },
  { etapa: 'Indicacao', quantidade: 8, taxa: 6.7 },
];

// ── Alertas de Negocio ──────────────────────────────────────

export const ALERTAS_NEGOCIO: AlertaNegocio[] = [
  { id: '1', tipo: 'warning', titulo: 'Inadimplencia acima de 10%', descricao: 'Taxa atual: 8% — proximo do limite' },
  { id: '2', tipo: 'critical', titulo: 'Turma com ocupacao < 40%', descricao: 'Wrestling Manha: apenas 35% ocupacao' },
  { id: '3', tipo: 'info', titulo: 'Professor com avaliacao baixa', descricao: 'Carlos Souza: 3.2/5.0 — abaixo do ideal' },
  { id: '4', tipo: 'warning', titulo: 'Churn de 4.4% no mes', descricao: '4 cancelamentos em 90 alunos ativos' },
  { id: '5', tipo: 'info', titulo: 'Meta mensal quase atingida', descricao: '90% do target de alunos ativos (180/200)' },
];

// ── Comparativo ─────────────────────────────────────────────

export const COMPARATIVO_MES: ComparativoMes[] = [
  { metrica: 'Receita (R$)', mesAtual: 45000, mesAnterior: 44200, mesmoMesAnoAnterior: 38000 },
  { metrica: 'Alunos Ativos', mesAtual: 180, mesAnterior: 176, mesmoMesAnoAnterior: 155 },
  { metrica: 'Novos', mesAtual: 12, mesAnterior: 10, mesmoMesAnoAnterior: 8 },
  { metrica: 'Cancelamentos', mesAtual: 4, mesAnterior: 3, mesmoMesAnoAnterior: 6 },
  { metrica: 'Ticket Medio (R$)', mesAtual: 250, mesAnterior: 251, mesmoMesAnoAnterior: 245 },
  { metrica: 'Retencao (%)', mesAtual: 87, mesAnterior: 88, mesmoMesAnoAnterior: 84 },
  { metrica: 'Inadimplencia (%)', mesAtual: 8, mesAnterior: 7.5, mesmoMesAnoAnterior: 11 },
  { metrica: 'Ocupacao Media (%)', mesAtual: 72, mesAnterior: 70, mesmoMesAnoAnterior: 65 },
];

// ── Financeiro — Despesas ───────────────────────────────────

export const DESPESAS: Despesa[] = [
  { id: '1', nome: 'Aluguel', categoria: 'Infraestrutura', valor: 8000, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '2', nome: 'Energia Eletrica', categoria: 'Infraestrutura', valor: 1200, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '3', nome: 'Agua', categoria: 'Infraestrutura', valor: 400, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '4', nome: 'Internet', categoria: 'Infraestrutura', valor: 300, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '5', nome: 'Seguro', categoria: 'Administrativo', valor: 500, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '6', nome: 'Contador', categoria: 'Administrativo', valor: 800, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '7', nome: 'Sistema BlackBelt', categoria: 'Tecnologia', valor: 299, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '8', nome: 'Folha de Pagamento', categoria: 'Pessoal', valor: 12000, tipo: 'fixa', recorrencia: 'mensal' },
  { id: '9', nome: 'Material de Limpeza', categoria: 'Operacional', valor: 350, tipo: 'variavel', recorrencia: 'mensal' },
  { id: '10', nome: 'Marketing Digital', categoria: 'Marketing', valor: 2000, tipo: 'variavel', recorrencia: 'mensal' },
  { id: '11', nome: 'Manutencao Equipamentos', categoria: 'Operacional', valor: 800, tipo: 'variavel', recorrencia: 'mensal' },
  { id: '12', nome: 'Material Esportivo', categoria: 'Operacional', valor: 1351, tipo: 'variavel', recorrencia: 'mensal' },
];

export const RECEITA_POR_MODALIDADE: ReceitaPorCategoria[] = [
  { categoria: 'BJJ', valor: 21250, percentual: 47.2 },
  { categoria: 'Muay Thai', valor: 10500, percentual: 23.3 },
  { categoria: 'Wrestling', valor: 6250, percentual: 13.9 },
  { categoria: 'No-Gi', valor: 4500, percentual: 10.0 },
  { categoria: 'Kids', valor: 2500, percentual: 5.6 },
];

export const RECEITA_POR_PLANO: ReceitaPorCategoria[] = [
  { categoria: 'Premium (R$349)', valor: 25128, percentual: 55.8 },
  { categoria: 'Plus (R$249)', valor: 14442, percentual: 32.1 },
  { categoria: 'Basico (R$149)', valor: 5215, percentual: 11.6 },
  { categoria: 'Familia', valor: 215, percentual: 0.5 },
];

export const INADIMPLENTES: Inadimplente[] = [
  { id: '1', nome: 'Pedro Almeida', diasAtraso: 15, valor: 349, telefone: '31999990001', email: 'pedro@email.com' },
  { id: '2', nome: 'Ana Costa', diasAtraso: 12, valor: 249, telefone: '31999990002', email: 'ana@email.com' },
  { id: '3', nome: 'Lucas Ferreira', diasAtraso: 8, valor: 349, telefone: '31999990003', email: 'lucas@email.com' },
  { id: '4', nome: 'Mariana Santos', diasAtraso: 5, valor: 149, telefone: '31999990004', email: 'mariana@email.com' },
  { id: '5', nome: 'Rafael Lima', diasAtraso: 3, valor: 249, telefone: '31999990005', email: 'rafael@email.com' },
  { id: '6', nome: 'Camila Rocha', diasAtraso: 22, valor: 349, telefone: '31999990006', email: 'camila@email.com' },
  { id: '7', nome: 'Bruno Oliveira', diasAtraso: 18, valor: 249, telefone: '31999990007', email: 'bruno@email.com' },
];

export const REGUA_COBRANCA: ReguaCobranca[] = [
  { dia: 1, acao: 'Lembrete amigavel por WhatsApp', tipo: 'lembrete', ativo: true },
  { dia: 5, acao: 'Segundo lembrete por email e WhatsApp', tipo: 'lembrete', ativo: true },
  { dia: 10, acao: 'Aviso de possivel bloqueio', tipo: 'aviso', ativo: true },
  { dia: 15, acao: 'Bloqueio automatico do acesso', tipo: 'bloqueio', ativo: true },
];

// ── Equipe ──────────────────────────────────────────────────

export const PROFESSORES: Professor[] = [
  {
    id: '1', nome: 'Mestre Ricardo Silva', foto: '', modalidades: ['BJJ', 'No-Gi'],
    turmas: ['BJJ Avancado Noite', 'BJJ Intermediario Tarde', 'No-Gi Sabado'],
    cargaHoraria: 25, avaliacaoMedia: 4.8, tipoRemuneracao: 'Fixo + Comissao',
    salario: 5500, retencaoAlunos: 92, frequenciaMedia: 88, satisfacao: 4.8,
    contratoStatus: 'ativo', cref: '012345-G/MG',
  },
  {
    id: '2', nome: 'Prof. Ana Machado', foto: '', modalidades: ['Muay Thai'],
    turmas: ['Muay Thai Manha', 'Muay Thai Noite'],
    cargaHoraria: 18, avaliacaoMedia: 4.5, tipoRemuneracao: 'Por Aula',
    salario: 3800, retencaoAlunos: 85, frequenciaMedia: 82, satisfacao: 4.5,
    contratoStatus: 'ativo', cref: '067890-G/MG',
  },
  {
    id: '3', nome: 'Prof. Carlos Souza', foto: '', modalidades: ['Wrestling', 'BJJ'],
    turmas: ['Wrestling Manha', 'BJJ Kids'],
    cargaHoraria: 15, avaliacaoMedia: 3.2, tipoRemuneracao: 'Fixo',
    salario: 2700, retencaoAlunos: 72, frequenciaMedia: 75, satisfacao: 3.2,
    contratoStatus: 'vencido', cref: '034567-G/MG',
  },
];

export const STAFF: StaffMember[] = [
  { id: '1', nome: 'Julia Mendes', funcao: 'Recepcionista', horario: 'Seg-Sex 08:00-17:00', salario: 2200, contato: '31999998001' },
  { id: '2', nome: 'Felipe Torres', funcao: 'Recepcionista', horario: 'Seg-Sex 14:00-22:00', salario: 2200, contato: '31999998002' },
  { id: '3', nome: 'Andre Costa', funcao: 'Limpeza', horario: 'Seg-Sab 06:00-12:00', salario: 1800, contato: '31999998003' },
];

export const CUSTO_FOLHA = 18200; // Total mensal

// ── CRM / Funil de Vendas ───────────────────────────────────

export const FUNIL_VENDAS: FunilVendas[] = [
  { coluna: 'Lead', cor: '#60A5FA', leads: [
    { id: 'c1', nome: 'Marcos Vieira', telefone: '31999001001', email: 'marcos@email.com', whatsapp: '31999001001', modalidade: 'BJJ', comoConheceu: 'Instagram', dataPrimeiroContato: '2026-02-28', responsavel: 'Julia', notas: 'Interessado em competir', followUp: '2026-03-08' },
    { id: 'c2', nome: 'Leticia Ramos', telefone: '31999001002', email: 'leticia@email.com', whatsapp: '31999001002', modalidade: 'Muay Thai', comoConheceu: 'Google', dataPrimeiroContato: '2026-03-01', responsavel: 'Julia', notas: 'Quer emagrecer', followUp: '2026-03-07' },
    { id: 'c3', nome: 'Diego Mendes', telefone: '31999001003', email: '', whatsapp: '31999001003', modalidade: 'Wrestling', comoConheceu: 'Indicacao', dataPrimeiroContato: '2026-03-03', responsavel: 'Felipe', notas: '', followUp: '2026-03-10' },
  ]},
  { coluna: 'Contato', cor: '#A78BFA', leads: [
    { id: 'c4', nome: 'Fernanda Lima', telefone: '31999001004', email: 'fernanda@email.com', whatsapp: '31999001004', modalidade: 'BJJ', comoConheceu: 'Passou na frente', dataPrimeiroContato: '2026-02-20', responsavel: 'Julia', notas: 'Ligou perguntando precos', followUp: '2026-03-06' },
  ]},
  { coluna: 'Visita Agendada', cor: '#FBBF24', leads: [
    { id: 'c5', nome: 'Thiago Nunes', telefone: '31999001005', email: 'thiago@email.com', whatsapp: '31999001005', modalidade: 'Muay Thai', comoConheceu: 'Instagram', dataPrimeiroContato: '2026-02-25', responsavel: 'Felipe', notas: 'Agendou para sabado', followUp: '2026-03-08' },
    { id: 'c6', nome: 'Patricia Souza', telefone: '31999001006', email: 'patricia@email.com', whatsapp: '31999001006', modalidade: 'BJJ', comoConheceu: 'Indicacao', dataPrimeiroContato: '2026-02-22', responsavel: 'Julia', notas: 'Amiga da Maria', followUp: '2026-03-07' },
  ]},
  { coluna: 'Visitou', cor: '#F97316', leads: [
    { id: 'c7', nome: 'Gabriel Santos', telefone: '31999001007', email: 'gabriel@email.com', whatsapp: '31999001007', modalidade: 'BJJ', comoConheceu: 'Google', dataPrimeiroContato: '2026-02-15', responsavel: 'Julia', notas: 'Gostou da estrutura, pediu tempo', followUp: '2026-03-06' },
  ]},
  { coluna: 'Aula Experimental', cor: '#EC4899', leads: [
    { id: 'c8', nome: 'Renata Oliveira', telefone: '31999001008', email: 'renata@email.com', whatsapp: '31999001008', modalidade: 'Muay Thai', comoConheceu: 'Instagram', dataPrimeiroContato: '2026-02-10', responsavel: 'Felipe', notas: 'Fez aula trial, adorou', followUp: '2026-03-05' },
    { id: 'c9', nome: 'Lucas Barbosa', telefone: '31999001009', email: 'lucas.b@email.com', whatsapp: '31999001009', modalidade: 'No-Gi', comoConheceu: 'Indicacao', dataPrimeiroContato: '2026-02-12', responsavel: 'Julia', notas: 'Fez 2 aulas trial', followUp: '2026-03-06' },
  ]},
  { coluna: 'Matriculou', cor: '#22C55E', leads: [
    { id: 'c10', nome: 'Sofia Almeida', telefone: '31999001010', email: 'sofia@email.com', whatsapp: '31999001010', modalidade: 'BJJ', comoConheceu: 'Indicacao', dataPrimeiroContato: '2026-01-20', responsavel: 'Julia', notas: 'Plano Premium anual', followUp: '' },
    { id: 'c11', nome: 'Ricardo Pereira', telefone: '31999001011', email: 'ricardo@email.com', whatsapp: '31999001011', modalidade: 'Muay Thai', comoConheceu: 'Instagram', dataPrimeiroContato: '2026-02-01', responsavel: 'Felipe', notas: 'Plano Plus mensal', followUp: '' },
    { id: 'c12', nome: 'Amanda Dias', telefone: '31999001012', email: 'amanda@email.com', whatsapp: '31999001012', modalidade: 'BJJ', comoConheceu: 'Google', dataPrimeiroContato: '2026-01-15', responsavel: 'Julia', notas: 'Plano Basico', followUp: '' },
  ]},
  { coluna: 'Indicou', cor: '#06B6D4', leads: [
    { id: 'c13', nome: 'Sofia Almeida', telefone: '31999001010', email: 'sofia@email.com', whatsapp: '31999001010', modalidade: 'BJJ', comoConheceu: 'Indicacao', dataPrimeiroContato: '2026-01-20', responsavel: 'Julia', notas: 'Indicou Patricia Souza', followUp: '' },
  ]},
];

export const METRICA_FUNIL: MetricaFunil[] = [
  { etapa: 'Lead → Contato', taxa: 75, tempoMedio: 2 },
  { etapa: 'Contato → Visita', taxa: 60, tempoMedio: 3 },
  { etapa: 'Visita → Trial', taxa: 70, tempoMedio: 2 },
  { etapa: 'Trial → Matricula', taxa: 55, tempoMedio: 5 },
  { etapa: 'Matricula → Indicacao', taxa: 20, tempoMedio: 30 },
];

export const INDICACOES: Indicacao[] = [
  { id: '1', indicador: 'Maria Silva', indicado: 'Patricia Souza', status: 'pendente', desconto: '10% proximo mes' },
  { id: '2', indicador: 'Sofia Almeida', indicado: 'Lucas Barbosa', status: 'convertido', desconto: 'Camiseta gratis' },
  { id: '3', indicador: 'Joao Ferreira', indicado: 'Thiago Nunes', status: 'pendente', desconto: '10% proximo mes' },
];

// ── Marketing ───────────────────────────────────────────────

export const CAMPANHAS: Campanha[] = [
  { id: '1', nome: 'Marco no Tatame', tipo: 'Desconto Matricula', dataInicio: '2026-03-01', dataFim: '2026-03-31', desconto: '20%', codigo: 'MARCO20', limiteUso: 30, usados: 12, receitaGerada: 4188, status: 'ativa' },
  { id: '2', nome: 'Volta as Aulas', tipo: 'Primeira Aula Gratis', dataInicio: '2026-02-01', dataFim: '2026-02-28', desconto: '1 aula gratis', codigo: 'VOLTAAULAS', limiteUso: 50, usados: 35, receitaGerada: 8750, status: 'encerrada' },
  { id: '3', nome: 'Aniversario BlackBelt', tipo: 'Desconto Aniversario', dataInicio: '2026-04-01', dataFim: '2026-04-15', desconto: '30%', codigo: 'NIVER30', limiteUso: 20, usados: 0, receitaGerada: 0, status: 'agendada' },
];

export const REDES_SOCIAIS: RedeSocial[] = [
  { nome: 'Instagram', url: 'https://instagram.com/blackbelt', seguidores: 4500, engajamento: 3.2 },
  { nome: 'Facebook', url: 'https://facebook.com/blackbelt', seguidores: 2100, engajamento: 1.5 },
  { nome: 'TikTok', url: 'https://tiktok.com/@blackbelt', seguidores: 1200, engajamento: 5.8 },
  { nome: 'YouTube', url: 'https://youtube.com/blackbelt', seguidores: 800, engajamento: 2.1 },
];

export const ALUNOS_EM_RISCO: AlunoEmRisco[] = [
  { id: '1', nome: 'Maria Silva', motivo: 'Faltou 3 aulas seguidas', diasSemVir: 12, acaoSugerida: 'Ligar para Maria — faltou 3 aulas seguidas' },
  { id: '2', nome: 'Joao Ferreira', motivo: 'Plano vencendo', diasSemVir: 2, planoVence: '2026-03-10', acaoSugerida: 'Enviar mensagem para Joao — plano vence em 4 dias' },
  { id: '3', nome: 'Ana Paula Costa', motivo: 'Diminuiu frequencia (de 4x para 1x/sem)', diasSemVir: 5, acaoSugerida: 'Conversar com Ana Paula sobre satisfacao' },
  { id: '4', nome: 'Carlos Eduardo', motivo: 'Nao vem ha 10 dias', diasSemVir: 10, acaoSugerida: 'Ligar para Carlos — ausencia prolongada' },
  { id: '5', nome: 'Beatriz Mendes', motivo: 'Plano vencendo + baixa frequencia', diasSemVir: 7, planoVence: '2026-03-12', acaoSugerida: 'Oferecer desconto renovacao para Beatriz' },
];

// ── Infraestrutura ──────────────────────────────────────────

export const ESPACOS: Espaco[] = [
  { id: '1', nome: 'Tatame A (Principal)', tipo: 'Tatame', dimensoes: '12x10m (120m2)', capacidade: 30, equipamentos: ['Tatame EVA', 'Espelho', 'Ventiladores'], status: 'ativo' },
  { id: '2', nome: 'Tatame B (Auxiliar)', tipo: 'Tatame', dimensoes: '8x6m (48m2)', capacidade: 15, equipamentos: ['Tatame EVA', 'Saco de pancada x3'], status: 'ativo' },
  { id: '3', nome: 'Sala Musculacao', tipo: 'Sala', dimensoes: '6x8m (48m2)', capacidade: 12, equipamentos: ['Pesos', 'Barras', 'Kettlebells', 'Corda', 'Espelho'], status: 'ativo' },
  { id: '4', nome: 'Recepcao', tipo: 'Administrativo', dimensoes: '4x6m (24m2)', capacidade: 8, equipamentos: ['Balcao', 'Computador', 'Catraca'], status: 'ativo' },
];

export const MANUTENCOES: Manutencao[] = [
  { id: '1', espaco: 'Tatame A', descricao: 'Limpeza profunda mensal', custo: 300, fornecedor: 'LimpaTudo', data: '2026-03-15', status: 'agendada', preventiva: true },
  { id: '2', espaco: 'Tatame B', descricao: 'Troca de piso danificado', custo: 1200, fornecedor: 'SportFloor', data: '2026-02-20', status: 'realizada', preventiva: false },
  { id: '3', espaco: 'Sala Musculacao', descricao: 'Revisao equipamentos trimestral', custo: 500, fornecedor: 'FitMaintain', data: '2026-04-01', status: 'agendada', preventiva: true },
  { id: '4', espaco: 'Recepcao', descricao: 'Manutencao ar condicionado', custo: 250, fornecedor: 'ClimaFrio', data: '2026-03-05', status: 'pendente', preventiva: false },
];

export const EQUIPAMENTOS: Equipamento[] = [
  { id: '1', nome: 'Tatame EVA (placas)', quantidade: 120, estado: 'bom', dataCompra: '2024-06-01', custo: 6000, fornecedor: 'SportFloor' },
  { id: '2', nome: 'Luvas de Boxe', quantidade: 20, estado: 'desgastado', dataCompra: '2024-01-15', custo: 2000, fornecedor: 'FightGear' },
  { id: '3', nome: 'Protetores Bucal', quantidade: 50, estado: 'novo', dataCompra: '2026-01-10', custo: 500, fornecedor: 'FightGear' },
  { id: '4', nome: 'Sacos de Pancada', quantidade: 5, estado: 'bom', dataCompra: '2024-08-01', custo: 2500, fornecedor: 'FightGear' },
  { id: '5', nome: 'Dummies de Treino', quantidade: 3, estado: 'bom', dataCompra: '2025-03-01', custo: 1800, fornecedor: 'GrapplePro' },
  { id: '6', nome: 'Kettlebells (set)', quantidade: 8, estado: 'novo', dataCompra: '2025-11-01', custo: 1200, fornecedor: 'FitEquip' },
  { id: '7', nome: 'Cordas Naval', quantidade: 2, estado: 'bom', dataCompra: '2025-06-01', custo: 600, fornecedor: 'FitEquip' },
  { id: '8', nome: 'Espelhos Parede', quantidade: 4, estado: 'bom', dataCompra: '2024-06-01', custo: 2400, fornecedor: 'VidroMax' },
  { id: '9', nome: 'Ventiladores Industriais', quantidade: 6, estado: 'bom', dataCompra: '2024-06-01', custo: 3000, fornecedor: 'ClimaFrio' },
  { id: '10', nome: 'Caneleiras (pares)', quantidade: 15, estado: 'desgastado', dataCompra: '2024-03-01', custo: 750, fornecedor: 'FightGear' },
];

// ── Metas / OKRs ────────────────────────────────────────────

export const METAS: Meta[] = [
  { id: '1', nome: 'Alunos Ativos', tipo: 'alunos', target: 200, atual: 180, unidade: 'alunos', status: 'atencao', sugestao: 'Para atingir 200 alunos, voce precisa de +20 matriculas. Sugestao: campanha "Primeira Aula Gratis" nas redes sociais' },
  { id: '2', nome: 'Receita Mensal (MRR)', tipo: 'receita', target: 50000, atual: 45000, unidade: 'R$', status: 'atencao', sugestao: 'Faltam R$5.000. Sugestao: upsell de planos Basico para Plus (15 alunos x R$100 diferenca)' },
  { id: '3', nome: 'Taxa de Retencao', tipo: 'retencao', target: 90, atual: 87, unidade: '%', status: 'atencao', sugestao: 'Ligar para os 5 alunos em risco de churn esta semana' },
  { id: '4', nome: 'Novos Alunos/Mes', tipo: 'novos', target: 15, atual: 12, unidade: 'alunos', status: 'no_caminho' },
  { id: '5', nome: 'Inadimplencia Maxima', tipo: 'inadimplencia', target: 5, atual: 8, unidade: '%', status: 'critico', sugestao: 'Inadimplencia esta 8%. Sugestao: ligar para os 7 inadimplentes acima de 5 dias e ativar regua de cobranca' },
];

export const HISTORICO_METAS: HistoricoMeta[] = [
  { mes: 'Jan/26', meta: 'Alunos Ativos', target: 185, resultado: 173, atingiu: false },
  { mes: 'Jan/26', meta: 'Receita (MRR)', target: 47000, resultado: 43500, atingiu: false },
  { mes: 'Fev/26', meta: 'Alunos Ativos', target: 190, resultado: 176, atingiu: false },
  { mes: 'Fev/26', meta: 'Receita (MRR)', target: 48000, resultado: 44200, atingiu: false },
  { mes: 'Fev/26', meta: 'Retencao', target: 90, resultado: 88, atingiu: false },
  { mes: 'Fev/26', meta: 'Inadimplencia Max', target: 5, resultado: 7.5, atingiu: false },
];

// ── Configuracoes Extras ────────────────────────────────────

export const CONFIG_CHECKIN = {
  geofenceRaio: 200, // metros
  toleranciaAtraso: 15, // minutos
  checkinAntecipado: true,
  minimoFrequenciaGraduacao: 75, // %
  alertaAposFaltas: 3,
};

export const CONFIG_NOTIFICACOES = {
  novoAluno: true,
  alunoCancelou: true,
  inadimplencia: true,
  turmaLotada: true,
  avaliacaoProfessorBaixa: true,
  metaAtingida: true,
  metaNaoAtingida: true,
};

export const CONFIG_INTEGRACOES = {
  whatsapp: { configurado: false, numero: '' },
  instagram: { vinculado: false, conta: '' },
  googleMeuNegocio: { vinculado: false },
  gateway: { provider: 'Stripe', status: 'ativo', ultimaTransacao: '2026-03-05' },
};
