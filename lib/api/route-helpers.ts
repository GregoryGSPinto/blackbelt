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

type WithAuthOptions = {
  requireMembership?: boolean;
};

async function getActiveMembership(
  supabase: any,
  profileId: string,
): Promise<AuthContext['membership']> {
  const { data, error } = await supabase
    .from('memberships')
    .select('id, academy_id, profile_id, role')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Extract auth from the Supabase session (cookie-based).
 * Throws JSON response if not authenticated.
 */
export async function withAuth(
  _req?: Request,
  opts?: WithAuthOptions
): Promise<AuthContext> {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw apiUnauthorized();
  }

  let membership: AuthContext['membership'] = null;

  if (opts?.requireMembership !== false) {
    membership = await getActiveMembership(supabase, user.id);

    if (!membership) {
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
