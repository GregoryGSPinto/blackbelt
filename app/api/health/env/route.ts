import { NextResponse } from 'next/server';
import { env } from '@/src/config/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const checks = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(env.SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(env.SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    };
    const ok = Object.values(checks).every(Boolean);

    return NextResponse.json(
      { ok, checks },
      { status: ok ? 200 : 503 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
