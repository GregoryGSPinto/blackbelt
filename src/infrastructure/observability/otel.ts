import type { NodeSDK } from '@opentelemetry/sdk-node';
import * as Sentry from '@sentry/nextjs';

let sdkPromise: Promise<NodeSDK | null> | null = null;

async function createSdk() {
  if (typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
    return null;
  }

  const [{ NodeSDK }, { getNodeAutoInstrumentations }, { trace, context, SpanStatusCode }] = await Promise.all([
    import('@opentelemetry/sdk-node'),
    import('@opentelemetry/auto-instrumentations-node'),
    import('@opentelemetry/api'),
  ]);

  const sdk = new NodeSDK({
    autoDetectResources: true,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
      }),
    ],
  });

  await sdk.start();

  const tracer = trace.getTracer('blackbelt-platform');

  Sentry.addEventProcessor((event) => {
    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      event.contexts = {
        ...event.contexts,
        trace: {
          trace_id: activeSpan.spanContext().traceId,
          span_id: activeSpan.spanContext().spanId,
          status: SpanStatusCode[SpanStatusCode.UNSET],
        },
      };
    }
    return event;
  });

  return sdk;
}

export function initializeOpenTelemetry() {
  if (!sdkPromise) {
    sdkPromise = createSdk().catch((error) => {
      console.error('[otel] failed to initialize', error);
      return null;
    });
  }

  return sdkPromise;
}
