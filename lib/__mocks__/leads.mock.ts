/**
 * Mock Data — Leads / Funil de Vendas
 *
 * TODO(BE-063): Substituir por endpoints reais
 *   GET    /leads
 *   POST   /leads
 *   PATCH  /leads/:id
 *   PATCH  /leads/:id/etapa
 *   GET    /leads/stats
 *   DELETE /leads/:id
 */

import type { Lead, LeadEtapa, LeadOrigem, LeadHistorico, FunnelStats } from '@/lib/api/contracts';

export const LEADS: Lead[] = [
  // NOVOS
  { id: 'ld01', nome: 'Ricardo Moreira', telefone: '31999001122', email: 'ricardo@email.com', etapa: 'novo', origem: 'instagram', interesse: ['BlackBelt'], dataCriacao: '2026-02-14', observacao: 'Viu reels da unidade' },
  { id: 'ld02', nome: 'Fernanda Lopes', telefone: '31988112233', etapa: 'novo', origem: 'indicacao', interesse: ['BlackBelt', 'Muay Thai'], dataCriacao: '2026-02-15', observacao: 'Indicação da Ana Torres' },
  { id: 'ld03', nome: 'Diego Martins', telefone: '31977223344', etapa: 'novo', origem: 'site', interesse: ['Kids'], dataCriacao: '2026-02-16', observacao: 'Filho de 8 anos' },

  // CONTATO FEITO
  { id: 'ld04', nome: 'Mariana Souza', telefone: '31966334455', email: 'mari@email.com', etapa: 'contato', origem: 'whatsapp', interesse: ['BlackBelt'], dataCriacao: '2026-02-10', dataUltimoContato: '2026-02-13', responsavel: 'Admin' },
  { id: 'ld05', nome: 'Bruno Alves', telefone: '31955445566', etapa: 'contato', origem: 'instagram', interesse: ['Muay Thai'], dataCriacao: '2026-02-11', dataUltimoContato: '2026-02-14', responsavel: 'Admin' },

  // TRIAL AGENDADO
  { id: 'ld06', nome: 'Larissa Dias', telefone: '31944556677', email: 'lari@email.com', etapa: 'agendado', origem: 'indicacao', interesse: ['BlackBelt'], dataCriacao: '2026-02-08', dataUltimoContato: '2026-02-12', trialAgendado: '2026-02-18T19:00:00', responsavel: 'Prof. Ricardo' },
  { id: 'ld07', nome: 'Caio Ribeiro', telefone: '31933667788', etapa: 'agendado', origem: 'presencial', interesse: ['BlackBelt', 'No-Gi'], dataCriacao: '2026-02-09', trialAgendado: '2026-02-17T07:00:00', responsavel: 'Admin' },
  { id: 'ld08', nome: 'Priscila Nunes', telefone: '31922778899', etapa: 'agendado', origem: 'instagram', interesse: ['Muay Thai'], dataCriacao: '2026-02-07', trialAgendado: '2026-02-19T18:00:00', responsavel: 'Admin' },

  // FEZ TRIAL
  { id: 'ld09', nome: 'Guilherme Costa', telefone: '31911889900', email: 'gui@email.com', etapa: 'trial', origem: 'indicacao', interesse: ['BlackBelt'], dataCriacao: '2026-02-01', trialAgendado: '2026-02-05T19:00:00', trialRealizado: true, responsavel: 'Prof. Ricardo', observacao: 'Gostou muito, quer voltar' },
  { id: 'ld10', nome: 'Amanda Ferreira', telefone: '31900990011', etapa: 'trial', origem: 'site', interesse: ['BlackBelt', 'Muay Thai'], dataCriacao: '2026-01-28', trialAgendado: '2026-02-03T07:00:00', trialRealizado: true, responsavel: 'Admin', observacao: 'Pediu valores' },

  // EM NEGOCIAÇÃO
  { id: 'ld11', nome: 'Rodrigo Gomes', telefone: '31899001122', email: 'rodrigo@email.com', etapa: 'negociacao', origem: 'indicacao', interesse: ['BlackBelt'], dataCriacao: '2026-01-20', trialRealizado: true, planoInteresse: 'Trimestral', valorProposta: 159.90, responsavel: 'Admin', observacao: 'Quer desconto familiar' },
  { id: 'ld12', nome: 'Tatiana Lima', telefone: '31888112233', etapa: 'negociacao', origem: 'instagram', interesse: ['Muay Thai'], dataCriacao: '2026-01-25', trialRealizado: true, planoInteresse: 'Mensal', valorProposta: 189.90, responsavel: 'Admin' },

  // CONVERTIDOS
  { id: 'ld13', nome: 'Felipe Araújo', telefone: '31877223344', email: 'felipe@email.com', etapa: 'convertido', origem: 'indicacao', interesse: ['BlackBelt'], dataCriacao: '2026-01-10', trialRealizado: true, planoInteresse: 'Trimestral', valorProposta: 159.90, responsavel: 'Admin' },
  { id: 'ld14', nome: 'Juliana Mendes', telefone: '31866334455', etapa: 'convertido', origem: 'instagram', interesse: ['BlackBelt', 'No-Gi'], dataCriacao: '2026-01-15', trialRealizado: true, planoInteresse: 'Semestral', valorProposta: 139.90, responsavel: 'Admin' },
  { id: 'ld15', nome: 'Renato Vieira', telefone: '31855445566', etapa: 'convertido', origem: 'whatsapp', interesse: ['Muay Thai'], dataCriacao: '2026-01-18', trialRealizado: true, planoInteresse: 'Mensal', valorProposta: 189.90, responsavel: 'Admin' },

  // PERDIDOS
  { id: 'ld16', nome: 'Carolina Barros', telefone: '31844556677', etapa: 'perdido', origem: 'site', interesse: ['BlackBelt'], dataCriacao: '2026-01-05', observacao: 'Achou caro, vai pensar' },
  { id: 'ld17', nome: 'Vinícius Rocha', telefone: '31833667788', etapa: 'perdido', origem: 'presencial', interesse: ['Muay Thai'], dataCriacao: '2026-01-08', observacao: 'Mudou de cidade' },
  { id: 'ld18', nome: 'Patrícia Moura', telefone: '31822778899', etapa: 'perdido', origem: 'instagram', interesse: ['Kids'], dataCriacao: '2025-12-20', observacao: 'Não respondeu mais' },
];

export const HISTORICO: LeadHistorico[] = [
  { id: 'lh01', leadId: 'ld13', etapaAnterior: 'negociacao', etapaNova: 'convertido', data: '2026-02-01', responsavel: 'Admin', observacao: 'Fechou trimestral' },
  { id: 'lh02', leadId: 'ld14', etapaAnterior: 'negociacao', etapaNova: 'convertido', data: '2026-02-05', responsavel: 'Admin' },
  { id: 'lh03', leadId: 'ld11', etapaAnterior: 'trial', etapaNova: 'negociacao', data: '2026-02-08', responsavel: 'Admin', observacao: 'Enviou proposta' },
  { id: 'lh04', leadId: 'ld09', etapaAnterior: 'agendado', etapaNova: 'trial', data: '2026-02-05', responsavel: 'Prof. Ricardo' },
  { id: 'lh05', leadId: 'ld16', etapaAnterior: 'negociacao', etapaNova: 'perdido', data: '2026-01-20', responsavel: 'Admin', observacao: 'Sem retorno após 15 dias' },
];

export function getStats(): FunnelStats {
  const porEtapa: Record<LeadEtapa, number> = { novo: 0, contato: 0, agendado: 0, trial: 0, negociacao: 0, convertido: 0, perdido: 0 };
  const porOrigem: Record<LeadOrigem, number> = { instagram: 0, whatsapp: 0, indicacao: 0, site: 0, presencial: 0, outro: 0 };

  for (const l of LEADS) {
    porEtapa[l.etapa]++;
    porOrigem[l.origem]++;
  }

  const convertidos = LEADS.filter((l) => l.etapa === 'convertido').length;
  const total = LEADS.filter((l) => l.etapa !== 'perdido').length;

  return {
    totalLeads: LEADS.length,
    porEtapa,
    conversaoMes: convertidos,
    taxaConversao: total > 0 ? Math.round((convertidos / total) * 100) : 0,
    tempoMedioConversao: 18,
    porOrigem,
  };
}

export function moverEtapa(leadId: string, novaEtapa: LeadEtapa): Lead | null {
  const lead = LEADS.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.etapa = novaEtapa;
  lead.dataUltimoContato = new Date().toISOString().split('T')[0];
  return { ...lead };
}
