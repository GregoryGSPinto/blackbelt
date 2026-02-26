import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status') || 'active';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('memberships' as any)
      .select('*, profiles!inner(full_name, avatar_url, phone, birth_date, email:id)', { count: 'exact' })
      .eq('academy_id', membership.academy_id)
      .eq('status', status)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);

    const { data, error, count } = await query;
    if (error) throw error;

    return apiOk({ members: data, total: count, page, limit });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const body = await req.json();
    const { memberId, ...updates } = body;
    if (!memberId) return apiError('memberId é obrigatório', 'VALIDATION');

    const allowed = ['role', 'status', 'belt_rank', 'notes'];
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );

    const { data, error } = await supabase
      .from('memberships' as any)
      .update(filtered)
      .eq('id', memberId)
      .eq('academy_id', membership.academy_id)
      .select()
      .single();

    if (error) throw error;
    return apiOk(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
