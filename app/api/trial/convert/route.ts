// ============================================================
// POST /api/trial/convert - Convert trial to paid subscription
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trialService } from '@/lib/subscription/services-v3';

const supabase = createClient(
  // SECURITY: service role key bypasses RLS
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { academy_id, billing_cycle, payment_method_id } = await request.json();

    if (!academy_id || !billing_cycle) {
      return NextResponse.json(
        { error: 'Missing required fields: academy_id, billing_cycle' },
        { status: 400 }
      );
    }

    if (!['monthly', 'annual'].includes(billing_cycle)) {
      return NextResponse.json(
        { error: 'Invalid billing_cycle. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    const result = await trialService.convertTrial(academy_id, {
      billing_cycle,
      payment_method_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Trial Convert API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
