import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const { url, page, limit, offset } = getPagination(req);
  const type = url.searchParams.get('type'); // videos, series, top10

  if (type === 'series' || url.pathname.endsWith('/series')) {
    const { data } = await supabase.from('class_schedules').select('martial_art')
      .eq('academy_id', membership!.academy_id).eq('active', true);
    return apiOk(data || []);
  }

  // Default: return empty content list (content stored externally/YouTube)
  return apiOk({ videos: [], series: [], total: 0, page, limit });
});
