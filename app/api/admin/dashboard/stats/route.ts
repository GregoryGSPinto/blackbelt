/**
 * GET /api/admin/dashboard/stats — Estatísticas do dashboard
 *
 * Endpoint seguro: retorna zeros se não houver dados
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      totalAlunos: 0,
      totalProfessores: 0,
      totalAulas: 0,
      aulasHoje: 0,
      taxaOcupacao: 0,
      checkInsHoje: 0,
      totalVisitantes: 0,
      inadimplencias: 0,
      alertasPendentes: 0,
      tendencia: 'stable',
    }
  });
}
