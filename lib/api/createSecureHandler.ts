import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z, type ZodTypeAny } from 'zod';
import { rateLimit } from '@/lib/api/rate-limit';
import { withAuth, type AuthContext } from '@/lib/api/route-helpers';

type Role = 'owner' | 'admin' | 'professor' | 'student' | 'guardian';

interface SecureHandlerOptions<TSchema extends ZodTypeAny | undefined> {
  auth?: boolean;
  requireMembership?: boolean;
  roles?: Role[];
  schema?: TSchema;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  auditAction?: string;
  handler: (
    req: NextRequest,
    ctx: SecureHandlerContext<TSchema>,
  ) => Promise<NextResponse>;
}

export interface SecureRequestContext {
  tenantId: string | null;
  actorId: string | null;
  correlationId: string;
  causationId: string;
}

export interface SecureHandlerContext<TSchema extends ZodTypeAny | undefined> {
  auth: AuthContext | null;
  body: TSchema extends ZodTypeAny ? z.infer<TSchema> : undefined;
  requestContext: SecureRequestContext;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return req.headers.get('x-real-ip') || 'unknown';
}

function logAudit(
  level: 'info' | 'warn' | 'error',
  message: string,
  data: Record<string, unknown>,
) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...data,
  };

  const serialized = JSON.stringify(entry);
  if (level === 'error') {
    console.error(serialized);
    return;
  }
  if (level === 'warn') {
    console.warn(serialized);
    return;
  }
  return;
}

export function createSecureHandler<TSchema extends ZodTypeAny | undefined = undefined>(
  options: SecureHandlerOptions<TSchema>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const correlationId = req.headers.get('x-request-id') || randomUUID();
    const causationId = req.headers.get('x-causation-id') || correlationId;
    const ip = getClientIp(req);

    let auth: AuthContext | null = null;
    try {
      if (options.auth !== false) {
        auth = await withAuth(req, {
          requireMembership: options.requireMembership,
        });
      }

      if (options.roles?.length) {
        const role = auth?.membership?.role;
        if (!role || !options.roles.includes(role as Role)) {
          logAudit('warn', 'api.authorization_denied', {
            path: req.nextUrl.pathname,
            correlationId,
            actorId: auth?.user.id ?? null,
            tenantId: auth?.membership?.academy_id ?? null,
            ip,
          });
          return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
        }
      }

      const tenantId = auth?.membership?.academy_id ?? null;
      const tenantHeader = req.headers.get('x-tenant-id') || req.headers.get('x-academy-id');
      if (tenantHeader && tenantId && tenantHeader !== tenantId) {
        logAudit('warn', 'api.tenant_mismatch', {
          path: req.nextUrl.pathname,
          correlationId,
          actorId: auth?.user.id ?? null,
          tenantId,
          providedTenantId: tenantHeader,
          ip,
        });
        return NextResponse.json({ error: 'Tenant mismatch', code: 'TENANT_MISMATCH' }, { status: 403 });
      }

      if (options.rateLimit) {
        const rateKey = [
          req.nextUrl.pathname,
          auth?.user.id ?? 'anonymous',
          tenantId ?? 'no-tenant',
          ip,
        ].join(':');

        const rl = rateLimit(rateKey, options.rateLimit.maxRequests, options.rateLimit.windowMs);
        if (!rl.allowed) {
          logAudit('warn', 'api.rate_limited', {
            path: req.nextUrl.pathname,
            correlationId,
            actorId: auth?.user.id ?? null,
            tenantId,
            ip,
            resetAt: new Date(rl.resetAt).toISOString(),
          });
          return NextResponse.json(
            { error: 'Too many requests', code: 'RATE_LIMITED' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))),
              },
            },
          );
        }
      }

      let body: z.infer<NonNullable<TSchema>> | undefined;
      if (options.schema) {
        const raw = await req.json().catch(() => undefined);
        const parsed = options.schema.safeParse(raw);
        if (!parsed.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              code: 'VALIDATION_ERROR',
              issues: parsed.error.flatten(),
            },
            { status: 400 },
          );
        }
        body = parsed.data as z.infer<NonNullable<TSchema>>;
      }

      const response = await options.handler(req, {
        auth,
        body: body as SecureHandlerContext<TSchema>['body'],
        requestContext: {
          tenantId,
          actorId: auth?.user.id ?? null,
          correlationId,
          causationId,
        },
      });

      logAudit('info', options.auditAction || 'api.request_ok', {
        path: req.nextUrl.pathname,
        method: req.method,
        correlationId,
        causationId,
        actorId: auth?.user.id ?? null,
        tenantId,
        ip,
        status: response.status,
      });

      return response;
    } catch (error) {
      const knownResponse = error instanceof Response ? error : null;
      if (knownResponse) {
        return knownResponse as NextResponse;
      }

      logAudit('error', 'api.request_failed', {
        path: req.nextUrl.pathname,
        method: req.method,
        correlationId,
        causationId,
        actorId: auth?.user.id ?? null,
        tenantId: auth?.membership?.academy_id ?? null,
        ip,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }
  };
}
