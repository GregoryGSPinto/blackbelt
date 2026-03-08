import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSecureHandler } from '@/lib/api/createSecureHandler';
import { sendEmail, type EmailTemplate } from '@/lib/emails/sender';

const VALID_TEMPLATES: EmailTemplate[] = ['welcome', 'new-student', 'payment-reminder'];

export const dynamic = 'force-dynamic';

const sendEmailSchema = z.object({
  to: z.string().email(),
  template: z.enum(VALID_TEMPLATES),
  data: z.record(z.string(), z.unknown()),
});

export const POST = createSecureHandler({
  roles: ['owner', 'admin', 'instructor'],
  schema: sendEmailSchema,
  rateLimit: {
    windowMs: 60_000,
    maxRequests: 10,
  },
  auditAction: 'email.send',
  handler: async (_req, { auth, body, requestContext }) => {
    if (!auth?.membership?.academy_id || !requestContext.tenantId) {
      return NextResponse.json({ error: 'Tenant context is required', code: 'NO_TENANT' }, { status: 403 });
    }

    const emailPayload = body.data as Record<string, unknown>;
    const payloadTenantId = typeof emailPayload.academyId === 'string'
      ? emailPayload.academyId
      : typeof emailPayload.tenantId === 'string'
        ? emailPayload.tenantId
        : requestContext.tenantId;

    if (payloadTenantId !== requestContext.tenantId) {
      return NextResponse.json({ error: 'Tenant mismatch', code: 'TENANT_MISMATCH' }, { status: 403 });
    }

    const result = await sendEmail(body.to, body.template, {
      ...emailPayload,
      academyId: requestContext.tenantId,
      requestedBy: auth.user.id,
    } as never);

    if (!result.success) {
      return NextResponse.json({ error: result.error, code: 'EMAIL_SEND_FAILED' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      tenantId: requestContext.tenantId,
      requestedBy: auth.user.id,
    });
  },
});
