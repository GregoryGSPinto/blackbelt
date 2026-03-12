// ============================================================
// Sentry Server Configuration — BLACKBELT
// ============================================================

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  // Initialize OpenTelemetry lazily — must never block Sentry init
  import('@/src/infrastructure/observability/otel')
    .then(({ initializeOpenTelemetry }) => initializeOpenTelemetry())
    .catch(() => {/* otel is optional */});

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    beforeSend(event) {
      // Remove PII from server-side events
      if (event.user) {
        event.user = { id: event.user.id };
      }
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },
  });
}
