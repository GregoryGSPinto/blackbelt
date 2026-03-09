// ============================================================
// GET /api/billing/forecast - Get billing forecast
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { billingForecast } from '@/lib/subscription/services';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// SECURITY: service role key bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const authSupabase = await getSupabaseServerClient();
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

    const academyId = userAcademy.academia_id;

    const forecast = await billingForecast.generateForecast(academyId);

    return NextResponse.json(forecast);
  } catch (error) {
    console.error('[Billing Forecast API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
