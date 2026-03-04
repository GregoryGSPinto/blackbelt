import { NextRequest, NextResponse } from 'next/server';
import { useMock as checkMockMode } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const normalised = email.toLowerCase().trim();
    const isMock = checkMockMode();

    // ─── Mock mode: check against dev registry ──────────────
    if (isMock) {
      const { mockCheckEmailAvailable } = await import('@/lib/__mocks__/auth.mock');
      // mockCheckEmailAvailable returns true when email is NOT taken → invert
      return NextResponse.json({ exists: !mockCheckEmailAvailable(normalised) });
    }

    // ─── Real mode: Supabase Auth doesn't expose email lookup without admin key.
    //     Return exists: true so login flow is never blocked — the actual
    //     password step will reject invalid credentials. ───────────────
    return NextResponse.json({ exists: true });
  } catch {
    return NextResponse.json({ exists: true });
  }
}
