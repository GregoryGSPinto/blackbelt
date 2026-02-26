// ============================================================
// Sentry Client Configuration — BLACKBELT
//
// LGPD Compliance:
// - NUNCA envia nome, email, CPF, dados pedagógicos
// - Kids (role === 'KID'): nenhum dado do usuário
// - Session Replay DESATIVADO por compliance
// - PII filtrado via beforeSend
// ============================================================

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    environment: process.env.NODE_ENV,

    // ── Sampling ──
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // ── Session Replay DESATIVADO (LGPD) ──
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // ── PII Filter ──
    beforeSend(event) {
      return sanitizeEvent(event);
    },

    // ── Breadcrumbs ──
    beforeBreadcrumb(breadcrumb) {
      // Remove URLs que possam conter tokens
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (breadcrumb.data?.url) {
          breadcrumb.data.url = redactUrl(breadcrumb.data.url);
        }
      }
      return breadcrumb;
    },

    // ── Integrations ──
    integrations: [
      Sentry.browserTracingIntegration({
        tracePropagationTargets: [
          /^https:\/\/api\.blackbelt\.com\.br/,
          /^https:\/\/blackbelt\.com\.br/,
        ],
      }),
    ],

    // Ignore common non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
      'Network Error',
      'AbortError',
    ],
  });
}

// ============================================================
// PII Sanitization (LGPD Art. 46)
// ============================================================

const PII_FIELDS = [
  'email', 'cpf', 'nome', 'name', 'telefone', 'phone',
  'password', 'senha', 'token', 'accessToken', 'refreshToken',
  'authorization', 'cookie', 'address', 'endereco',
];

const PII_REGEX = /(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)|(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi;

function sanitizeEvent(event: Sentry.Event): Sentry.Event | null {
  // Kids: block all user data
  if (event.tags?.userRole === 'KID') {
    delete event.user;
    delete event.extra;
    return event;
  }

  // Sanitize user
  if (event.user) {
    event.user = {
      id: event.user.id, // Keep anonymous ID only
    };
  }

  // Sanitize extra
  if (event.extra) {
    event.extra = redactObject(event.extra as Record<string, unknown>);
  }

  // Sanitize breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((bc) => {
      if (bc.data) {
        bc.data = redactObject(bc.data as Record<string, unknown>);
      }
      if (bc.message) {
        bc.message = redactString(bc.message);
      }
      return bc;
    });
  }

  // Sanitize request
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['X-CSRF-Token'];
    }
    if (event.request.data) {
      event.request.data = typeof event.request.data === 'string'
        ? redactString(event.request.data)
        : JSON.stringify(redactObject(
            typeof event.request.data === 'object' ? event.request.data : {}
          ));
    }
  }

  return event;
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (PII_FIELDS.some((f) => key.toLowerCase().includes(f))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      result[key] = redactString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function redactString(s: string): string {
  return s.replace(PII_REGEX, '[REDACTED]');
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove query params that might contain PII
    ['token', 'email', 'cpf', 'key', 'secret'].forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return url;
  }
}
