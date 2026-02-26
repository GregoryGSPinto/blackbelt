import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ estoque: [], vendas: [], movimentos: [], contas: [], stats: {} });
});

export const POST = createHandler(async (req: NextRequest) => {
  const body = await req.json();
  return apiOk({ id: `venda_${Date.now()}`, ...body, success: true });
});
