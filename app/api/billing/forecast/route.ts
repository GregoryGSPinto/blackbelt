// ============================================================
// GET /api/billing/forecast - Get billing forecast
// ============================================================

import { NextResponse } from 'next/server';
import { billingForecast } from '@/lib/subscription/services';
import { withBillingManagerAccess } from '@/lib/api/access-context';

export async function GET(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);
    const academyId = membership.academy_id;

    const forecast = await billingForecast.generateForecast(academyId);

    return NextResponse.json(forecast);
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    console.error('[Billing Forecast API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
