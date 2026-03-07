export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiCreated, apiError, apiServerError, apiForbidden } from '@/lib/api/route-helpers';
import { MOCK_ACADEMIES } from '@/lib/__mocks__/super-admin.mock';

export async function GET(req: NextRequest) {
  try {
    const { membership } = await withAuth(req);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a super-admins');
    }

    return apiOk({ academies: MOCK_ACADEMIES });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { membership } = await withAuth(req);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a super-admins');
    }

    const body = await req.json();

    // Validate required fields
    if (!body.nome || typeof body.nome !== 'string' || body.nome.trim().length < 2) {
      return apiError('nome is required (min 2 chars)', 'VALIDATION');
    }
    if (body.email && (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) {
      return apiError('email must be valid', 'VALIDATION');
    }
    if (body.plano && !['BASICO', 'PRO', 'ENTERPRISE'].includes(body.plano)) {
      return apiError('plano must be BASICO, PRO, or ENTERPRISE', 'VALIDATION');
    }

    const newAcademy = {
      id: `acad-${Date.now()}`,
      nome: body.nome.trim(),
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
    return apiCreated({ academy: newAcademy });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
