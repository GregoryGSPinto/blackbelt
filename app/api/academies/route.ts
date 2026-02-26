import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiCreated, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { supabase, membership } = await withAuth();

    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const { data, error } = await supabase
      .from('academies')
      .select('*')
      .eq('id', membership.academy_id)
      .single();

    if (error) throw error;
    return apiOk(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await withAuth(req, { requireMembership: false });
    const body = await req.json();

    const { name, slug, phone, address } = body;
    if (!name) return apiError('Nome é obrigatório', 'VALIDATION');

    const { data, error } = await (supabase
      .from('academies') as any)
      .insert({
        name: String(name),
        slug: String(slug || name.toLowerCase().replace(/\s+/g, '-')),
        owner_id: user.id,
        phone: phone ? String(phone) : null,
        address: address || null,
      })
      .select()
      .single();

    if (error) throw error;
    return apiCreated(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
