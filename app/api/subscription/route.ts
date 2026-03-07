// ============================================================
// GET /api/subscription - Get current subscription
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { planManagement, overageBilling, addonManagement } from '@/lib/subscription/services';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's academy
    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('academia_id')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    const academyId = userAcademy.academia_id;

    // Get subscription data
    const subscription = await planManagement.getSubscription(academyId);
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Get quotas
    const { data: quotas } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('academy_id', academyId);

    // Get addons
    const addons = await addonManagement.getActiveAddons(academyId);

    // Get student limit status
    const studentLimit = await planManagement.checkStudentLimit(academyId);

    // Calculate upcoming invoice
    const { breakdown, total: overagesAmount } = await overageBilling.calculateOverages(academyId);
    const addonsAmount = addons.reduce((sum, a) => sum + a.price, 0);
    const subscriptionAmount = subscription.billing_cycle === 'annual'
      ? (subscription.plan?.base_price_annual || 0) / 12
      : (subscription.plan?.base_price_monthly || 0);

    return NextResponse.json({
      subscription: {
        ...subscription,
        student_limit_status: studentLimit
      },
      quotas: quotas || [],
      addons,
      upcomingInvoice: {
        subscriptionAmount: Math.round(subscriptionAmount * 100) / 100,
        addonsAmount: Math.round(addonsAmount * 100) / 100,
        overagesAmount: Math.round(overagesAmount * 100) / 100,
        totalAmount: Math.round((subscriptionAmount + addonsAmount + overagesAmount) * 100) / 100,
        periodStart: subscription.current_period_starts_at,
        periodEnd: subscription.current_period_ends_at
      }
    });
  } catch (error) {
    console.error('[Subscription API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
