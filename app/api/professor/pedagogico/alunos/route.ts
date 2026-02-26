import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const { url, page, limit, offset } = getPagination(req);
  const academyId = membership!.academy_id;
  const type = url.searchParams.get('type');

  let query = supabase
    .from('memberships')
    .select('id, profile_id, role, belt_rank, status, joined_at, profiles!inner(full_name, avatar_url, birth_date)', { count: 'exact' })
    .eq('academy_id', academyId)
    .eq('role', 'student')
    .range(offset, offset + limit - 1)
    .order('joined_at', { ascending: false });

  if (type !== 'all') {
    query = query.eq('status', 'active');
  }

  const { data, count, error } = await query;
  if (error) throw error;

  return apiOk({ alunos: data || [], total: count || 0, page, limit });
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();
  // Create observation, achievement, or evaluation
  const { data, error } = await supabase.from('audit_log').insert({
    user_id: membership!.id,
    action: body.action || 'observation',
    resource_type: 'student',
    resource_id: body.alunoId,
    new_value: body,
    academy_id: membership!.academy_id,
  }).select().single();
  if (error) throw error;
  return apiOk(data);
});
