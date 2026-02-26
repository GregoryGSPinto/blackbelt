/**
 * Mock Data — Visitantes / Drop-in / Day Use
 * TODO(BE-067): Substituir por endpoints reais
 */
import type { Visitante } from '@/lib/api/contracts';

export const VISITANTES: Visitante[] = [
  { id: 'vis01', nome: 'Gabriel Rocha', telefone: '(31)99111-2233', email: 'gabriel@email.com', tipoVisita: 'aula_experimental', data: '2026-02-16', horario: '19:00', turmaId: 't1', turmaNome: 'Adulto Noite', valor: 0, status: 'check_in', origemLead: true },
  { id: 'vis02', nome: 'Fernando Alves', telefone: '(31)99222-3344', tipoVisita: 'drop_in', data: '2026-02-16', horario: '07:00', turmaNome: 'Adulto Manhã', valor: 50, formaPagamento: 'pix', status: 'finalizada', unidade: 'Team Alpha SP' },
  { id: 'vis03', nome: 'Diego Costa', telefone: '(31)99333-4455', tipoVisita: 'drop_in', data: '2026-02-17', horario: '19:00', turmaNome: 'Adulto Noite', valor: 50, status: 'pendente', unidade: 'Gracie BH' },
  { id: 'vis04', nome: 'Larissa Mendes', telefone: '(31)99444-5566', email: 'larissa@email.com', tipoVisita: 'aula_experimental', data: '2026-02-17', horario: '10:00', turmaNome: 'Feminino', valor: 0, status: 'pendente', origemLead: true },
  { id: 'vis05', nome: 'Roberto Silva', telefone: '(31)99555-6677', tipoVisita: 'day_use', data: '2026-02-16', horario: '06:00', valor: 30, formaPagamento: 'dinheiro', status: 'finalizada', observacao: 'Usou ambiente open mat' },
  { id: 'vis06', nome: 'Patrícia Lima', telefone: '(31)99666-7788', tipoVisita: 'aula_experimental', data: '2026-02-15', horario: '19:00', turmaNome: 'Adulto Noite', valor: 0, status: 'finalizada', origemLead: true, observacao: 'Demonstrou interesse em matricular' },
  { id: 'vis07', nome: 'André Nascimento', telefone: '(31)99777-8899', tipoVisita: 'drop_in', data: '2026-02-15', horario: '07:00', turmaNome: 'Adulto Manhã', valor: 50, formaPagamento: 'cartao', status: 'finalizada', unidade: 'Alliance RJ' },
  { id: 'vis08', nome: 'Marcos Oliveira', telefone: '(31)99888-9900', tipoVisita: 'evento', data: '2026-02-20', horario: '14:00', valor: 80, status: 'pendente', observacao: 'Seminário Prof. visitante' },
  { id: 'vis09', nome: 'Juliana Ferreira', telefone: '(31)99999-0011', email: 'ju@email.com', tipoVisita: 'aula_experimental', data: '2026-02-14', horario: '10:00', turmaNome: 'Feminino', valor: 0, status: 'no_show', origemLead: true },
  { id: 'vis10', nome: 'Carlos Eduardo', telefone: '(31)99000-1122', tipoVisita: 'day_use', data: '2026-02-18', horario: '12:00', valor: 30, status: 'pendente' },
];

export function getVisitantesStats() {
  const hoje = '2026-02-16';
  const hojeLista = VISITANTES.filter((v: Visitante) => v.data === hoje);
  return {
    visitantesHoje: hojeLista.length,
    experimentaisHoje: hojeLista.filter((v: Visitante) => v.tipoVisita === 'aula_experimental').length,
    dropInsHoje: hojeLista.filter((v: Visitante) => v.tipoVisita === 'drop_in').length,
    receitaVisitas: VISITANTES.filter((v: Visitante) => v.status === 'finalizada').reduce((s: number, v: Visitante) => s + v.valor, 0),
    noShows: VISITANTES.filter((v: Visitante) => v.status === 'no_show').length,
    pendentes: VISITANTES.filter((v: Visitante) => v.status === 'pendente').length,
  };
}
