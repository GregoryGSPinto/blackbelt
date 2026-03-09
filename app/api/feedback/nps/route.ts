import { NextRequest, NextResponse } from 'next/server';
import { FeedbackSchema } from '@/lib/api/schemas';
import { rateLimit } from '@/lib/api/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 requests per minute per IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rl = rateLimit(`nps:${ip}`, 3, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { score, comment, userId } = parsed.data;

    // TODO(BE-090): Save to database
    void score;
    void comment;
    void userId;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[NPS] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
