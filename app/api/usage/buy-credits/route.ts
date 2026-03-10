// ============================================================
// POST /api/usage/buy-credits - Buy prepaid credits
// ============================================================

import { NextResponse } from 'next/server';
import { prepaidCredits } from '@/lib/subscription/services';
import type { CreditType } from '@/lib/subscription/types';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const authSupabase = await getSupabaseServerClient();
    const supabase = getSupabaseAdminClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('academia_id')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    const body = await request.json();
    const { creditType, amount } = body;

    if (!creditType || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request: creditType and amount required' },
        { status: 400 }
      );
    }

    const validTypes: CreditType[] = ['api_requests', 'storage_gb', 'custom_reports', 'staff_users'];
    if (!validTypes.includes(creditType)) {
      return NextResponse.json(
        { error: 'Invalid credit type' },
        { status: 400 }
      );
    }

    const academyId = userAcademy.academia_id;

    // Create credit purchase
    const credit = await prepaidCredits.buyCredits(academyId, creditType, amount);

    // TODO: Create Stripe PaymentIntent if needed
    // For now, return the credit info
    return NextResponse.json({
      credit,
      clientSecret: null // Would be populated with Stripe secret
    });
  } catch (error) {
    console.error('[Buy Credits API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
