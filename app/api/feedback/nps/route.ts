import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { score, comment, userId } = body;

    if (typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json({ error: 'Score must be 0-10' }, { status: 400 });
    }

    // TODO(BE-090): Save to database
    console.log('[NPS] Response received:', { score, comment, userId, timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[NPS] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
