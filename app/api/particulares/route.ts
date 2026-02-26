import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ particulares: [], instrutores: [], comissoes: [] });
});
