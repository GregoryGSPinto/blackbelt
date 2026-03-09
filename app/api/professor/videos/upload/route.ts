import { NextRequest } from 'next/server';
import { createHandler, apiError } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const POST = createHandler(async (req: NextRequest) => {
  void req;
  return apiError('Video upload not implemented', 'NOT_IMPLEMENTED', 501);
});
