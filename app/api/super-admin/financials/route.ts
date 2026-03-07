export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden } from '@/lib/api/route-helpers';
import { MOCK_FINANCIAL_DATA } from '@/lib/__mocks__/super-admin.mock';

export async function GET(req: NextRequest) {
  try {
    const { membership } = await withAuth(req);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a super-admins');
    }

    return apiOk({ financial: MOCK_FINANCIAL_DATA });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
