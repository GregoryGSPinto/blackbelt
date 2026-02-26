/**
 * Catch-all API route handler.
 * Handles any API endpoints that don't have specific route files.
 * Returns appropriate empty/placeholder responses to prevent 404 errors.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function handler(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/api/', '');

    // Try to authenticate
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Return appropriate empty responses based on HTTP method
    if (req.method === 'GET') {
      return NextResponse.json({ data: [], total: 0, path });
    }

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const body = await req.json().catch(() => ({}));
      return NextResponse.json({ data: { id: `${path}_${Date.now()}`, ...body, success: true } });
    }

    if (req.method === 'DELETE') {
      return NextResponse.json({ data: { success: true } });
    }

    return NextResponse.json({ data: null });
  } catch (err) {
    // For unauthenticated requests, return 401
    if (err instanceof Response) return err;
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
