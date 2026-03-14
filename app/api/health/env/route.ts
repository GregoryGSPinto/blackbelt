import { NextResponse } from 'next/server';
import { env } from '@/src/config/env';
import { withAuth, apiError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { membership } = await withAuth();
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const checks = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(env.SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(env.SUPABASE_ANON_KEY),
    };
    const ok = Object.values(checks).every(Boolean);

    return NextResponse.json(
      { ok, checks },
      { status: ok ? 200 : 503 },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
