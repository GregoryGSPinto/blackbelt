// ============================================================
// POST /api/subscription/upgrade - Upgrade subscription plan
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { planService } from '@/lib/subscription/services-v3';
import type { BillingCycle } from '@/lib/subscription/types-v3';

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
    const { target_plan_id, billing_cycle } = body;

    if (!target_plan_id) {
      return NextResponse.json(
        { error: 'target_plan_id required' },
        { status: 400 }
      );
    }

    const academyId = userAcademy.academia_id;

    // Perform upgrade
    await planService.upgradePlan(academyId, target_plan_id);

    // If billing cycle changed, update it
    if (billing_cycle && ['monthly', 'annual'].includes(billing_cycle)) {
      await supabase
        .from('academy_subscriptions')
        .update({ billing_cycle })
        .eq('academy_id', academyId);
    }

    return NextResponse.json({
      success: true,
      message: 'Upgrade realizado com sucesso',
    });
  } catch (error) {
    console.error('[Subscription Upgrade API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
