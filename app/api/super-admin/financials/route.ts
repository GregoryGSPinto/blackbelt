export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { MOCK_FINANCIAL_DATA } from '@/lib/__mocks__/super-admin.mock';

export async function GET() {
  return NextResponse.json({ financial: MOCK_FINANCIAL_DATA });
}
