export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withSuperAdminAccess } from '@/lib/api/access-context';
import { apiOk, apiServerError } from '@/lib/api/route-helpers';
import { MOCK_FINANCIAL_DATA } from '@/lib/__mocks__/super-admin.mock';

export async function GET(req: NextRequest) {
  try {
    await withSuperAdminAccess(req);

    return apiOk({ financial: MOCK_FINANCIAL_DATA });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
