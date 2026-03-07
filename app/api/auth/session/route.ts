import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/api/rate-limit';

const COOKIE_NAME = 'blackbelt_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/** GET — Read session from httpOnly cookie */
export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    if (!cookie) {
      return NextResponse.json({ session: null });
    }

    const session = JSON.parse(cookie);
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ session: null });
  }
}

/** POST — Set session in httpOnly cookie */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rl = rateLimit(`session:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { token, user, profiles, refreshToken } = body;

    if (!token || !user) {
      return NextResponse.json({ error: 'Missing token or user' }, { status: 400 });
    }

    const sessionData = JSON.stringify({ token, user, profiles: profiles || [user] });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, sessionData, COOKIE_OPTIONS);

    if (refreshToken) {
      response.cookies.set('blackbelt_refresh', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE — Clear session cookie */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('blackbelt_refresh', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
