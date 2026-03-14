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
import { logRouteEvent } from '@/lib/monitoring/route-observability';

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
      logRouteEvent('info', 'security', 'No authenticated user found for /api/me', request, {
        event_type: 'me_unauthenticated',
      });
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
      logRouteEvent('warn', 'security', 'Multiple active memberships require explicit tenant selection in /api/me', request, {
        event_type: 'me_ambiguous_tenant',
        profile_id: user.id,
        membership_count: activeMemberships.length,
      });
      return NextResponse.json(
        { error: 'Múltiplas memberships ativas encontradas. Informe x-membership-id ou x-academy-id.' },
        { status: 409 },
      );
    }

    if (activeMemberships.length > 0 && !resolvedMembership.membership && resolvedMembership.usedSelector) {
      logRouteEvent('warn', 'security', 'Explicit tenant selector did not match an active membership in /api/me', request, {
        event_type: 'me_selector_miss',
        profile_id: user.id,
      });
      return NextResponse.json(
        { error: 'Nenhuma membership ativa encontrada para o tenant informado.' },
        { status: 403 },
      );
    }

    const membership = resolvedMembership.membership;
    logRouteEvent('info', 'security', 'Resolved /api/me tenant context', request, {
      event_type: 'me_resolved',
      profile_id: user.id,
      academy_id: membership?.academy_id ?? null,
      membership_id: membership?.id ?? null,
    });

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
    logRouteEvent('error', 'error', 'Failed to resolve /api/me payload', request, {
      event_type: 'me_failed',
      reason: err,
    });
    logServerError('API /me', err);
    // NUNCA retornar erro 500 — sempre dados vazios
    return NextResponse.json({ data: emptyUser });
  }
}
