import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ config: { types: ['attendance', 'financial', 'progression', 'members'] } });
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();
  // Generate report based on type
  return apiOk({ id: `report_${Date.now()}`, type: body.type, status: 'generated', data: {} });
});
