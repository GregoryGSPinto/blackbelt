// ============================================================
// GET /api/subscription - Get current subscription
// ============================================================

import { NextResponse } from 'next/server';
import { planService } from '@/lib/subscription/services-v3';
import { withBillingManagerAccess } from '@/lib/api/access-context';
import { apiServerError } from '@/lib/api/route-helpers';
import { logRouteEvent } from '@/lib/monitoring/route-observability';

export async function GET(request: Request) {
  try {
    const { supabase, membership } = await withBillingManagerAccess(request);
    const academyId = membership.academy_id;

    // Get subscription data with plan
    const subscription = await planService.getSubscription(academyId);
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Get student limit status
    const studentLimit = await planService.checkStudentLimit(academyId);

    // Get quotas
    const { data: quotas } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('academy_id', academyId);

    return NextResponse.json({
      subscription: {
        ...subscription,
        plan: subscription.plan,
      },
      usage: {
        students: studentLimit,
        quotas: quotas || [],
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    logRouteEvent('error', 'error', 'Subscription query failed unexpectedly', request, {
      event_type: 'subscription_query_failed',
      reason: error,
    });
    return apiServerError(error);
  }
}
