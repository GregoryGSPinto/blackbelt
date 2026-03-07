// ============================================================
// POST /api/subscription/upgrade - Upgrade subscription plan
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { planManagement } from '@/lib/subscription/services';
import type { BillingCycle } from '@/lib/subscription/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('academia_id, perfil')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    const allowedProfiles = ['ADMINISTRADOR', 'OWNER', 'SUPER_ADMIN'];
    if (!allowedProfiles.includes(userAcademy.perfil)) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetPlanId, billingCycle = 'monthly' } = body;

    if (!targetPlanId) {
      return NextResponse.json(
        { error: 'targetPlanId required' },
        { status: 400 }
      );
    }

    const academyId = userAcademy.academia_id;

    // Calculate prorated amount
    const calculation = await planManagement.calculateProratedUpgrade(
      academyId,
      targetPlanId,
      billingCycle as BillingCycle
    );

    // Perform upgrade
    await planManagement.upgradePlan(academyId, targetPlanId, 'manual');

    return NextResponse.json({
      success: true,
      proratedAmount: calculation.proratedAmount,
      newAmount: calculation.newPlanPrice,
      effectiveDate: new Date().toISOString(),
      clientSecret: null // Would be populated with Stripe secret for payment
    });
  } catch (error) {
    console.error('[Subscription Upgrade API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
