import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  // Shop products are typically stored in a dedicated table or external service.
  // Return empty array - can be populated when shop table is created.
  return apiOk({ products: [], total: 0 });
});
