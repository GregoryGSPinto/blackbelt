export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withSuperAdminAccess } from '@/lib/api/access-context';
import { apiOk, apiServerError } from '@/lib/api/route-helpers';
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_MONTHLY_DATA,
  MOCK_REVENUE_BY_PLAN,
  MOCK_TOP_ACADEMIES,
} from '@/lib/__mocks__/super-admin.mock';

export async function GET(req: NextRequest) {
  try {
    await withSuperAdminAccess(req);

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
