// ============================================================
// GET /api/pricing/current - Get current pricing
// Public endpoint (requires authentication)
// ============================================================

import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/pricing/service';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
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
