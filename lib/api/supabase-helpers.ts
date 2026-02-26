/**
 * Supabase query helpers for API routes.
 * Provides reusable patterns for common operations.
 */

import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError, type AuthContext } from './route-helpers';

export { withAuth, apiOk, apiError, apiServerError, type AuthContext };

/** Extract pagination params from URL */
export function getPagination(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '50')), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset, url };
}

/** Standard list endpoint: paginated query on a table scoped to academy */
export async function listFromTable(
  ctx: AuthContext,
  table: string,
  options?: {
    select?: string;
    filters?: Record<string, string | null>;
    orderBy?: string;
    ascending?: boolean;
    page?: number;
    limit?: number;
  }
) {
  const { supabase, membership } = ctx;
  if (!membership) throw apiError('Sem membership ativa', 'NO_MEMBERSHIP');

  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const offset = (page - 1) * limit;

  let query = supabase
    .from(table)
    .select(options?.select || '*', { count: 'exact' })
    .eq('academy_id', membership.academy_id)
    .range(offset, offset + limit - 1)
    .order(options?.orderBy || 'created_at', { ascending: options?.ascending ?? false });

  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    }
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0, page, limit };
}

/** Create a safe API handler with auth and error handling */
export function createHandler(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const ctx = await withAuth(req);
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof Response) return err;
      return apiServerError(err);
    }
  };
}
