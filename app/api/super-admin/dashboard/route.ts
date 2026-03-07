export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiServerError, apiForbidden } from '@/lib/api/route-helpers';
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_MONTHLY_DATA,
  MOCK_REVENUE_BY_PLAN,
  MOCK_TOP_ACADEMIES,
} from '@/lib/__mocks__/super-admin.mock';

export async function GET(req: NextRequest) {
  try {
    const { membership } = await withAuth(req);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return apiForbidden('Acesso restrito a super-admins');
    }

    return apiOk({
      metrics: MOCK_DASHBOARD_METRICS,
      monthlyData: MOCK_MONTHLY_DATA,
      revenueByPlan: MOCK_REVENUE_BY_PLAN,
      topAcademies: MOCK_TOP_ACADEMIES,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
