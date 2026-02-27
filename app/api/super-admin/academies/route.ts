export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { MOCK_ACADEMIES } from '@/lib/__mocks__/super-admin.mock';

export async function GET() {
  return NextResponse.json({ academies: MOCK_ACADEMIES });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newAcademy = {
    id: `acad-${Date.now()}`,
    nome: body.nome || 'Nova Academia',
    plano: body.plano || 'BASICO',
    status: 'ATIVA' as const,
    totalAlunos: 0,
    totalProfessores: 0,
    mrr: body.plano === 'ENTERPRISE' ? 10000 : body.plano === 'PRO' ? 5000 : 500,
    cidade: body.cidade || '',
    estado: body.estado || '',
    criadoEm: new Date().toISOString().split('T')[0],
    ultimoPagamento: new Date().toISOString().split('T')[0],
    email: body.email || '',
    telefone: body.telefone || '',
  };
  return NextResponse.json({ academy: newAcademy }, { status: 201 });
}
