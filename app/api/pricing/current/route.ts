// ============================================================
// GET /api/pricing/current - Get current pricing
// Public endpoint (requires authentication)
// ============================================================

import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/pricing/service';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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
    console.error('[Pricing API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
