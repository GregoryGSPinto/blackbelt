// ============================================================
// GET /api/super-admin/academies - List academies with subscriptions
// Super Admin only
// ============================================================

import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/pricing/service';
import { withSuperAdminAccess } from '@/lib/api/access-context';
import { apiServerError } from '@/lib/api/route-helpers';

export async function GET(request: Request) {
  try {
    await withSuperAdminAccess(request);

    // Parse query params
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    // Fetch academies
    const academies = await pricingService.getAcademies({ plan, status, search });

    return NextResponse.json({ data: academies });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    return apiServerError(error);
  }
}
