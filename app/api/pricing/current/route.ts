// ============================================================
// GET /api/pricing/current - Get current pricing
// Public endpoint (requires authentication)
// ============================================================

import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/pricing/service';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { apiServerError } from '@/lib/api/route-helpers';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pricing = await pricingService.getFormattedPricing();
    
    return NextResponse.json(pricing);
  } catch (error) {
    return apiServerError(error);
  }
}
