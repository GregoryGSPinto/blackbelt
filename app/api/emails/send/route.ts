import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, type EmailTemplate } from '@/lib/emails/sender';

const VALID_TEMPLATES: EmailTemplate[] = ['welcome', 'new-student', 'payment-reminder'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, template, data } = body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!template || !VALID_TEMPLATES.includes(template)) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Missing template data' }, { status: 400 });
    }

    const result = await sendEmail(to, template, data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error('[API] Email send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
