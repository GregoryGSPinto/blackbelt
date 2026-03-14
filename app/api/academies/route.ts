import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiCreated, apiError, apiServerError } from '@/lib/api/route-helpers';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

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
    const { user } = await withAuth(req, { requireMembership: false });
    const body = await req.json();
    const admin = getSupabaseAdminClient();

    const { name, slug, phone, address } = body;
    if (!name) return apiError('Nome é obrigatório', 'VALIDATION');

    const academySlug = String(slug || name.toLowerCase().replace(/\s+/g, '-'));
    const ownerName =
      typeof body.ownerName === 'string' && body.ownerName.trim().length > 0
        ? body.ownerName.trim()
        : typeof body.fullName === 'string' && body.fullName.trim().length > 0
          ? body.fullName.trim()
          : user.email.split('@')[0] || 'Usuário';

    const { data, error } = await (admin
      .from('academies') as any)
      .insert({
        name: String(name),
        slug: academySlug,
        owner_id: user.id,
        phone: phone ? String(phone) : null,
        address: address || null,
      })
      .select()
      .single();

    if (error) throw error;

    try {
      const { error: profileError } = await admin
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: ownerName,
          phone: phone ? String(phone) : null,
        });

      if (profileError) throw profileError;

      const { error: membershipError } = await admin
        .from('memberships')
        .upsert({
          profile_id: user.id,
          academy_id: data.id,
          role: 'owner',
          status: 'active',
        });

      if (membershipError) throw membershipError;
    } catch (linkError) {
      await admin.from('academies').delete().eq('id', data.id);
      throw linkError;
    }

    return apiCreated(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
