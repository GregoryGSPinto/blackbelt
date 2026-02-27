export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_MONTHLY_DATA,
  MOCK_REVENUE_BY_PLAN,
  MOCK_TOP_ACADEMIES,
} from '@/lib/__mocks__/super-admin.mock';

export async function GET() {
  return NextResponse.json({
    metrics: MOCK_DASHBOARD_METRICS,
    monthlyData: MOCK_MONTHLY_DATA,
    revenueByPlan: MOCK_REVENUE_BY_PLAN,
    topAcademies: MOCK_TOP_ACADEMIES,
  });
}
