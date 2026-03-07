export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiNotFound, apiServerError, apiForbidden } from '@/lib/api/route-helpers';
import { MOCK_ACADEMIES } from '@/lib/__mocks__/super-admin.mock';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { membership } = await withAuth(req);

    if (!membership || !['owner', 'admin', 'super_admin'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a super-admins');
    }

    const { id } = await params;
    const body = await req.json();
    const academy = MOCK_ACADEMIES.find(a => a.id === id);
    if (!academy) {
      return apiNotFound('Academia não encontrada');
    }
    const updated = { ...academy, ...body };
    return apiOk({ academy: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { membership } = await withAuth(req);

    if (!membership || !['owner', 'admin', 'super_admin'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a super-admins');
    }

    const { id } = await params;
    const academy = MOCK_ACADEMIES.find(a => a.id === id);
    if (!academy) {
      return apiNotFound('Academia não encontrada');
    }
    return apiOk({ deleted: true, id });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
