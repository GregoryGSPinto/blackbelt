/**
 * Mock Data — Pagamentos / Payment Gateway
 *
 * TODO(BE-062): Substituir por endpoints reais
 *   GET  /pagamentos/planos
 *   GET  /pagamentos/assinaturas
 *   GET  /pagamentos/faturas/:alunoId
 *   POST /pagamentos/pix/gerar
 *   GET  /pagamentos/resumo/:alunoId
 *   GET  /pagamentos/admin/dashboard
 */

import type {
  Plano, Assinatura, Fatura, PixPaymentResponse,
  ResumoFinanceiroAluno, MetodoPagamento, StatusPagamento,
} from '@/lib/api/contracts';

// ── Planos ──
export const PLANOS: Plano[] = [
  {
    id: 'plano_mensal',
    nome: 'Mensal',
    descricao: 'Acesso completo, renovação mensal',
    valor: 189.90,
    frequencia: 'mensal',
    modalidades: ['BlackBelt', 'No-Gi'],
    sessõesSemanais: 5,
    beneficios: ['Acesso a todas as sessões', 'Conteúdo streaming', 'Uniforme incluso (1º mês)'],
    ativo: true,
  },
  {
    id: 'plano_trimestral',
    nome: 'Trimestral',
    descricao: '3 meses com desconto',
    valor: 159.90,
    frequencia: 'trimestral',
    modalidades: ['BlackBelt', 'No-Gi', 'Muay Thai'],
    sessõesSemanais: 7,
    beneficios: ['Todas as modalidades', 'Conteúdo streaming', '15% desconto', 'Uniforme incluso'],
    ativo: true,
    destaque: true,
  },
  {
    id: 'plano_semestral',
    nome: 'Semestral',
    descricao: '6 meses, melhor custo-benefício',
    valor: 139.90,
    frequencia: 'semestral',
    modalidades: ['BlackBelt', 'No-Gi', 'Muay Thai', 'Wrestling'],
    sessõesSemanais: 7,
    beneficios: ['Acesso ilimitado', 'Conteúdo streaming', '26% desconto', 'Uniforme + Rashguard', '1 sessão particular/mês'],
    ativo: true,
  },
  {
    id: 'plano_kids',
    nome: 'Kids',
    descricao: 'Plano infantil (4-12 anos)',
    valor: 149.90,
    frequencia: 'mensal',
    modalidades: ['Kids'],
    sessõesSemanais: 3,
    beneficios: ['Sessões kids', 'Acompanhamento pedagógico', 'Uniforme incluso'],
    ativo: true,
  },
  {
    id: 'plano_familia',
    nome: 'Família',
    descricao: '2+ membros da mesma família',
    valor: 299.90,
    frequencia: 'mensal',
    modalidades: ['BlackBelt', 'No-Gi', 'Kids'],
    sessõesSemanais: 7,
    beneficios: ['2 membros inclusos', 'Acesso total', '+R$89,90 por membro adicional'],
    ativo: true,
  },
];

// ── Assinaturas ──
export const ASSINATURAS: Assinatura[] = [
  { id: 'sub_01', alunoId: 'u1', alunoNome: 'Lucas Mendes', planoId: 'plano_trimestral', planoNome: 'Trimestral', valor: 159.90, status: 'ativa', dataInicio: '2025-11-01', dataRenovacao: '2026-02-01', formaPagamento: 'pix', diaVencimento: 5 },
  { id: 'sub_02', alunoId: 'u2', alunoNome: 'Ana Carolina', planoId: 'plano_semestral', planoNome: 'Semestral', valor: 139.90, status: 'ativa', dataInicio: '2025-09-01', dataRenovacao: '2026-03-01', formaPagamento: 'cartao', diaVencimento: 10 },
  { id: 'sub_03', alunoId: 'u3', alunoNome: 'Pedro Santos', planoId: 'plano_mensal', planoNome: 'Mensal', valor: 189.90, status: 'ativa', dataInicio: '2026-01-15', dataRenovacao: '2026-02-15', formaPagamento: 'pix', diaVencimento: 15 },
  { id: 'sub_04', alunoId: 'u4', alunoNome: 'Julia Costa', planoId: 'plano_mensal', planoNome: 'Mensal', valor: 189.90, status: 'vencida', dataInicio: '2025-12-01', dataRenovacao: '2026-01-01', formaPagamento: 'boleto', diaVencimento: 1 },
  { id: 'sub_05', alunoId: 'u5', alunoNome: 'Rafael Lima', planoId: 'plano_trimestral', planoNome: 'Trimestral', valor: 159.90, status: 'ativa', dataInicio: '2026-01-01', dataRenovacao: '2026-04-01', formaPagamento: 'pix', diaVencimento: 5 },
  { id: 'sub_06', alunoId: 'u6', alunoNome: 'Marcos Oliveira', planoId: 'plano_mensal', planoNome: 'Mensal', valor: 189.90, status: 'suspensa', dataInicio: '2025-10-01', dataRenovacao: '2025-11-01', formaPagamento: 'dinheiro', diaVencimento: 1 },
  { id: 'sub_07', alunoId: 'u7', alunoNome: 'Camila Souza', planoId: 'plano_semestral', planoNome: 'Semestral', valor: 139.90, status: 'ativa', dataInicio: '2025-12-01', dataRenovacao: '2026-06-01', formaPagamento: 'cartao', diaVencimento: 1 },
  { id: 'sub_08', alunoId: 'u8', alunoNome: 'Thiago Ferreira', planoId: 'plano_mensal', planoNome: 'Mensal', valor: 189.90, status: 'ativa', dataInicio: '2026-02-01', dataRenovacao: '2026-03-01', formaPagamento: 'pix', diaVencimento: 5 },
];

// ── Faturas ──
function gerarFaturas(): Fatura[] {
  const faturas: Fatura[] = [];
  const meses = ['2025-11', '2025-12', '2026-01', '2026-02'];
  let idx = 0;

  for (const sub of ASSINATURAS) {
    for (const mes of meses) {
      idx++;
      const venc = `${mes}-${String(sub.diaVencimento).padStart(2, '0')}`;
      const vencDate = new Date(venc);
      const hoje = new Date();
      const isPast = vencDate < hoje;
      const isCurrentMonth = mes === hoje.toISOString().slice(0, 7);

      let status: StatusPagamento;
      let dataPag: string | undefined;
      let metodo: MetodoPagamento | undefined;

      if (sub.status === 'suspensa') {
        status = isCurrentMonth ? 'atrasado' : 'cancelado';
      } else if (isPast && !isCurrentMonth) {
        status = 'pago';
        dataPag = `${mes}-${String(Math.min(sub.diaVencimento + Math.floor(Math.random() * 3), 28)).padStart(2, '0')}`;
        metodo = sub.formaPagamento;
      } else if (isCurrentMonth) {
        status = sub.status === 'vencida' ? 'atrasado' : 'pendente';
      } else {
        status = 'pendente';
      }

      faturas.push({
        id: `fat_${String(idx).padStart(3, '0')}`,
        assinaturaId: sub.id,
        alunoId: sub.alunoId,
        alunoNome: sub.alunoNome,
        planoNome: sub.planoNome,
        valor: sub.valor,
        status,
        dataVencimento: venc,
        dataPagamento: dataPag,
        metodo,
        descricao: `Mensalidade ${sub.planoNome} — ${mes.replace('-', '/')}`,
      });
    }
  }

  return faturas;
}

export const FATURAS = gerarFaturas();

// ── Helpers ──

export function gerarPixMock(faturaId: string, valor: number): PixPaymentResponse {
  return {
    qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    copiaECola: `00020126580014br.gov.bcb.pix0136${faturaId}-blackbelt-${Date.now()}5204000053039865802BR5920BLACKBELT LTDA6009SAO PAULO62070503***6304`,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    transactionId: `txn_${Date.now()}`,
  };
}

export function getResumoAluno(alunoId: string): ResumoFinanceiroAluno {
  const assinatura = ASSINATURAS.find((s) => s.alunoId === alunoId);
  const plano = assinatura ? PLANOS.find((p) => p.id === assinatura.planoId) : undefined;
  const faturas = FATURAS
    .filter((f) => f.alunoId === alunoId)
    .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento));

  const totalPago = faturas.filter((f) => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const totalPendente = faturas.filter((f) => f.status === 'pendente' || f.status === 'atrasado').reduce((s, f) => s + f.valor, 0);
  const proxima = faturas.find((f) => f.status === 'pendente' || f.status === 'atrasado');

  return {
    assinatura,
    plano,
    faturas,
    totalPago,
    totalPendente,
    proximoVencimento: proxima?.dataVencimento,
  };
}

export interface AdminFinanceDashboard {
  receitaMes: number;
  receitaPendente: number;
  inadimplentes: number;
  totalAssinaturas: number;
  assinaturasAtivas: number;
  porMetodo: Record<MetodoPagamento, number>;
  faturasRecentes: Fatura[];
}

export function getAdminDashboard(): AdminFinanceDashboard {
  const hoje = new Date();
  const mesAtual = hoje.toISOString().slice(0, 7);
  const faturasMes = FATURAS.filter((f) => f.dataVencimento.startsWith(mesAtual));
  const pagas = faturasMes.filter((f) => f.status === 'pago');
  const pendentes = faturasMes.filter((f) => f.status === 'pendente' || f.status === 'atrasado');

  const porMetodo: Record<MetodoPagamento, number> = { pix: 0, cartao: 0, boleto: 0, dinheiro: 0 };
  for (const f of pagas) {
    if (f.metodo) porMetodo[f.metodo] += f.valor;
  }

  return {
    receitaMes: pagas.reduce((s, f) => s + f.valor, 0),
    receitaPendente: pendentes.reduce((s, f) => s + f.valor, 0),
    inadimplentes: ASSINATURAS.filter((s) => s.status === 'vencida' || s.status === 'suspensa').length,
    totalAssinaturas: ASSINATURAS.length,
    assinaturasAtivas: ASSINATURAS.filter((s) => s.status === 'ativa').length,
    porMetodo,
    faturasRecentes: FATURAS
      .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento))
      .slice(0, 15),
  };
}
