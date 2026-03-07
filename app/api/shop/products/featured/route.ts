import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ products: [] });

  const { data } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, category, stock')
    .eq('academy_id', membership.academy_id)
    .eq('featured', true)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(12);

  return apiOk({ products: data || [] });
});
