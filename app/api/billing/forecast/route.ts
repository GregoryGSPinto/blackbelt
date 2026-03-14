// ============================================================
// GET /api/billing/forecast - Get billing forecast
// ============================================================

import { NextResponse } from 'next/server';
import { billingForecast } from '@/lib/subscription/services';
import { withBillingManagerAccess } from '@/lib/api/access-context';
import { apiServerError } from '@/lib/api/route-helpers';
import { logRouteEvent } from '@/lib/monitoring/route-observability';

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
    logRouteEvent('error', 'error', 'Billing forecast generation failed unexpectedly', request, {
      event_type: 'billing_forecast_failed',
      reason: error,
    });
    return apiServerError(error);
  }
}
