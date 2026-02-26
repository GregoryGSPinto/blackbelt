import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const { page, limit, offset } = getPagination(req);

  const { data, count } = await supabase.from('audit_log')
    .select('*', { count: 'exact' })
    .eq('academy_id', membership!.academy_id)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  return apiOk({ data: data || [], total: count || 0, page, pageSize: limit, totalPages: Math.ceil((count || 0) / limit) });
});

export const POST = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const body = await req.json();
  const { error } = await supabase.from('audit_log').insert({
    user_id: user.id,
    action: body.action,
    resource_type: body.resourceType,
    resource_id: body.resourceId,
    old_value: body.oldValue,
    new_value: body.newValue,
    academy_id: membership?.academy_id,
  });
  if (error) throw error;
  return apiOk({ success: true });
});
