import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ visitantes: [], stats: { total: 0, today: 0 } });
});
