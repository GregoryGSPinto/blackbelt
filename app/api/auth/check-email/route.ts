import { NextRequest, NextResponse } from 'next/server';
import { useMock as checkMockMode } from '@/lib/env';
import { rateLimit } from '@/lib/api/rate-limit';
import { z } from 'zod';

const CheckEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rl = rateLimit(`check-email:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = CheckEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ exists: false });
    }

    const normalised = parsed.data.email.toLowerCase().trim();
    const isMock = checkMockMode();

    // Mock mode: check against dev registry
    if (isMock) {
      const { mockCheckEmailAvailable } = await import('@/lib/__mocks__/auth.mock');
      return NextResponse.json({ exists: !mockCheckEmailAvailable(normalised) });
    }

    // Real mode: Supabase Auth doesn't expose email lookup without admin key.
    // Return exists: true so login flow is never blocked.
    return NextResponse.json({ exists: true });
  } catch {
    return NextResponse.json({ exists: true });
  }
}
