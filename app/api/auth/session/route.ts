import { NextResponse } from 'next/server';
import { getSupabaseServerClientSafe } from '@/lib/supabase/server';
import { hasRequiredSupabaseEnv } from '@/src/config/env';

const COOKIE_NAME = 'blackbelt_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const dynamic = 'force-dynamic';

/** GET — Read authenticated session from Supabase server session */
export async function GET() {
  if (!hasRequiredSupabaseEnv()) {
    return NextResponse.json(
      {
        session: null,
        error: 'Server configuration incomplete',
        code: 'ENV_MISSING',
      },
      { status: 503 },
    );
  }

  try {
    const supabase = await getSupabaseServerClientSafe();
    if (!supabase) {
      return NextResponse.json(
        {
          session: null,
          error: 'Authentication unavailable',
          code: 'AUTH_UNAVAILABLE',
        },
        { status: 503 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    const { data: membership } = await supabase
      .from('memberships')
      .select('id, academy_id, role, status')
      .eq('profile_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      session: {
        user: {
          id: user.id,
          email: user.email ?? '',
        },
        membership,
      },
    });
  } catch {
    return NextResponse.json({ session: null });
  }
}

/** POST — Disabled to prevent client-forged server session cookies */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Session cookies are managed by Supabase server auth. Client-provided session payloads are not accepted.',
      code: 'METHOD_NOT_ALLOWED',
    },
    { status: 405 },
  );
}

/** DELETE — Clear session cookie */
export async function DELETE() {
  try {
    const supabase = await getSupabaseServerClientSafe();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    // Best effort; legacy cookies are still cleared below.
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('blackbelt_refresh', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
