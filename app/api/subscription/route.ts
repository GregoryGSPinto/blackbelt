// ============================================================
// GET /api/subscription - Get current subscription
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { planService } from '@/lib/subscription/services-v3';

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
      .select('academia_id, perfil')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    const academyId = userAcademy.academia_id;

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
