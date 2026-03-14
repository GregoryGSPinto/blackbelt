// ============================================================
// POST /api/usage/buy-credits - Buy prepaid credits
// ============================================================

import { NextResponse } from 'next/server';
import { prepaidCredits } from '@/lib/subscription/services';
import type { CreditType } from '@/lib/subscription/types';
import { withBillingManagerAccess } from '@/lib/api/access-context';

export async function POST(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);

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

    const academyId = membership.academy_id;

    // Create credit purchase
    const credit = await prepaidCredits.buyCredits(academyId, creditType, amount);

    // TODO: Create Stripe PaymentIntent if needed
    // For now, return the credit info
    return NextResponse.json({
      credit,
      clientSecret: null // Would be populated with Stripe secret
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    console.error('[Buy Credits API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
