/**
 * GET /api/me — Retorna dados do usuário logado
 *
 * Este endpoint NUNCA retorna erro 500.
 * Se não houver sessão ou der erro, retorna dados vazios com status 200.
 */

import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { mapMembershipRoleToTipo } from '@/lib/academy/operations';
import { logServerError } from '@/lib/server/error-handler';
import { resolveMembershipSelection } from '@/lib/api/route-helpers';

// Dados vazios de fallback
const emptyUser = {
  id: null,
  email: null,
  memberId: null,
  nome: null,
  perfil: null,
  academiaId: null,
};

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ data: emptyUser });
    }

    const [{ data: memberships }, { data: userProfile }] = await Promise.all([
      supabase
        .from('memberships')
        .select('id, academy_id, role, status')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: true })
        .limit(1),
      supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle(),
    ]);

    const activeMemberships = memberships || [];
    const resolvedMembership = resolveMembershipSelection(activeMemberships, request);

    if (resolvedMembership.ambiguousCrossTenant) {
      return NextResponse.json(
        { error: 'Múltiplas memberships ativas encontradas. Informe x-membership-id ou x-academy-id.' },
        { status: 409 },
      );
    }

    if (activeMemberships.length > 0 && !resolvedMembership.membership && resolvedMembership.usedSelector) {
      return NextResponse.json(
        { error: 'Nenhuma membership ativa encontrada para o tenant informado.' },
        { status: 403 },
      );
    }

    const membership = resolvedMembership.membership;

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        memberId: membership?.id || null,
        nome: userProfile?.full_name || user.email?.split('@')[0] || 'Usuário',
        perfil: membership?.role ? mapMembershipRoleToTipo(membership.role) : null,
        academiaId: membership?.academy_id || null,
      }
    });

  } catch (err) {
    logServerError('API /me', err);
    // NUNCA retornar erro 500 — sempre dados vazios
    return NextResponse.json({ data: emptyUser });
  }
}
