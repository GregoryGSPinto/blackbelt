/**
 * Catch-all API route handler.
 * Returns a 501 so placeholder endpoints fail safely in production.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  try {
    const hasSupabaseEnv = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (!hasSupabaseEnv) {
      return NextResponse.json(
        { error: 'Endpoint not implemented', code: 'NOT_IMPLEMENTED' },
        { status: 501 },
      );
    }

    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Endpoint not implemented', code: 'NOT_IMPLEMENTED' },
      { status: 501 },
    );
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
