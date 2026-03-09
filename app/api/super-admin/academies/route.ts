// ============================================================
// GET /api/super-admin/academies - List academies with subscriptions
// Super Admin only
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pricingService } from '@/lib/pricing/service';
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

    // Verify super admin role
    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('perfil')
      .eq('usuario_id', user.id)
      .single();

    if (userAcademy?.perfil !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin required' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    // Fetch academies
    const academies = await pricingService.getAcademies({ plan, status, search });

    return NextResponse.json({ data: academies });
  } catch (error) {
    console.error('[Super Admin Academies API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
