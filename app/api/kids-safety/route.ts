import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ autorizados: [], saidas: [] });
});

export const POST = createHandler(async (req: NextRequest) => {
  const body = await req.json();
  return apiOk({ id: `ks_${Date.now()}`, ...body, success: true });
});
