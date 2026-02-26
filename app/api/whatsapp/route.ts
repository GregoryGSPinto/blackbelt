import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const POST = createHandler(async (req: NextRequest) => {
  const body = await req.json();
  return apiOk({ id: `wpp_${Date.now()}`, status: 'queued', ...body });
});

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ stats: { sent: 0, delivered: 0, read: 0 } });
});
