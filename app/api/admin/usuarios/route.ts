import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status') || 'active';
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('memberships' as any)
      .select('id, role, status, belt_rank, joined_at, profile_id, profiles!inner(full_name, avatar_url, phone, birth_date)', { count: 'exact' })
      .eq('academy_id', membership.academy_id)
      .range(offset, offset + limit - 1)
      .order('joined_at', { ascending: false });

    if (status !== 'all') query = query.eq('status', status);
    if (role) query = query.eq('role', role);
    if (search) query = query.ilike('profiles.full_name', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return apiOk({ usuarios: data || [], total: count || 0, page, limit });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
