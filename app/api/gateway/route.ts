import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ webhooks: [] });
});

export const POST = createHandler(async (req: NextRequest) => {
  const body = await req.json();
  // Payment gateway integration placeholder
  return apiOk({ id: `charge_${Date.now()}`, status: 'pending', ...body });
});
