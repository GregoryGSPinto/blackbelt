/**
 * Shared helpers for Next.js API route handlers.
 *
 * Usage:
 *   import { withAuth, apiError, apiOk } from '@/lib/api/route-helpers';
 *
 *   export async function GET(req: Request) {
 *     const { supabase, user, membership } = await withAuth(req);
 *     ...
 *     return apiOk(data);
 *   }
 */
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createErrorResponse, handleServerError } from '@/lib/server/error-handler';
import { logRouteEvent } from '@/lib/monitoring/route-observability';

// ── Response helpers ──────────────────────────────────────
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiCreated<T>(data: T) {
  return apiOk(data, 201);
}

export function apiError(message: string, code: string, status = 400) {
  return createErrorResponse(message, status, code);
}

export function apiUnauthorized(message = 'Não autenticado') {
  return apiError(message, 'UNAUTHORIZED', 401);
}

export function apiForbidden(message = 'Sem permissão') {
  return apiError(message, 'FORBIDDEN', 403);
}

export function apiNotFound(message = 'Recurso não encontrado') {
  return apiError(message, 'NOT_FOUND', 404);
}

export function apiServerError(err: unknown) {
  return handleServerError('API Error', err);
}

// ── Auth extraction ───────────────────────────────────────
export type AuthContext = {
  // Intentionally loose at the boundary because the generated Database type
  // is not yet aligned with all live tables/relations used by legacy routes.
  supabase: any;
  user: { id: string; email: string };
  membership: { id: string; academy_id: string; profile_id: string; role: string } | null;
};

type MembershipRecord = NonNullable<AuthContext['membership']>;
type MembershipSelectionRecord = Pick<MembershipRecord, 'id' | 'academy_id' | 'role'>;

type WithAuthOptions = {
  requireMembership?: boolean;
};

function getRequestedMembershipSelector(req?: Request): { membershipId: string | null; academyId: string | null } {
  if (!req) {
    return { membershipId: null, academyId: null };
  }

  const membershipId = req.headers.get('x-membership-id');
  const academyId = req.headers.get('x-academy-id') ?? req.headers.get('x-tenant-id');

  return {
    membershipId: membershipId?.trim() || null,
    academyId: academyId?.trim() || null,
  };
}

function pickMembershipFromSameAcademy<T extends MembershipSelectionRecord>(memberships: T[]) {
  if (memberships.length === 0) {
    return null;
  }

  const academyIds = new Set(memberships.map((membership) => membership.academy_id));
  if (academyIds.size > 1) {
    return null;
  }

  const rolePriority = ['owner', 'admin', 'professor', 'parent', 'student', 'super_admin'];
  return [...memberships].sort((left, right) => {
    const leftIndex = rolePriority.indexOf(left.role);
    const rightIndex = rolePriority.indexOf(right.role);
    return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex)
      - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
  })[0];
}

async function getActiveMemberships(
  supabase: any,
  profileId: string,
): Promise<MembershipRecord[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select('id, academy_id, profile_id, role')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function resolveMembershipSelection<T extends MembershipSelectionRecord>(
  memberships: T[],
  req?: Request,
): {
  membership: T | null;
  ambiguousCrossTenant: boolean;
  usedSelector: boolean;
} {
  const selector = getRequestedMembershipSelector(req);
  let membership: T | null = null;

  if (selector.membershipId) {
    membership = memberships.find((item) => item.id === selector.membershipId) ?? null;
  } else if (selector.academyId) {
    membership = memberships.find((item) => item.academy_id === selector.academyId) ?? null;
  } else if (memberships.length === 1) {
    membership = memberships[0];
  } else {
    membership = pickMembershipFromSameAcademy(memberships);
  }

  return {
    membership,
    ambiguousCrossTenant: !membership && memberships.length > 1 && !selector.membershipId && !selector.academyId,
    usedSelector: Boolean(selector.membershipId || selector.academyId),
  };
}

/**
 * Extract auth from the Supabase session (cookie-based).
 * Throws JSON response if not authenticated.
 */
export async function withAuth(
  req?: Request,
  opts?: WithAuthOptions
): Promise<AuthContext> {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw apiUnauthorized();
  }

  let membership: AuthContext['membership'] = null;

  if (opts?.requireMembership !== false) {
    const memberships = await getActiveMemberships(supabase, user.id);
    const resolvedMembership = resolveMembershipSelection(memberships, req);
    membership = resolvedMembership.membership;

    if (!membership) {
      if (resolvedMembership.ambiguousCrossTenant) {
        logRouteEvent('warn', 'security', 'Tenant resolution requires explicit membership selection', req, {
          event_type: 'tenant_resolution_ambiguous',
          profile_id: user.id,
          active_membership_count: memberships.length,
        });
        throw NextResponse.json(
          { error: 'Múltiplas memberships ativas encontradas. Informe x-membership-id ou x-academy-id.' },
          { status: 409 }
        );
      }

      logRouteEvent('warn', 'security', 'Authenticated user has no active membership for route access', req, {
        event_type: 'tenant_resolution_missing_membership',
        profile_id: user.id,
      });
      throw NextResponse.json(
        { error: 'Nenhuma membership ativa encontrada' },
        { status: 403 }
      );
    }
  }

  return {
    supabase: supabase as any,
    user: { id: user.id, email: user.email ?? '' },
    membership,
  };
}

// ── Safe handler wrapper ──────────────────────────────────
type Handler = (req: Request, ctx?: any) => Promise<NextResponse>;

export function safeHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      // If it's already a NextResponse (from withAuth throw), return it
      if (err instanceof NextResponse) return err;
      return apiServerError(err);
    }
  };
}
