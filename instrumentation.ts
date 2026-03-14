export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    return;
  }

  try {
    const loadOpenTelemetry = new Function(
      "return import('./src/infrastructure/observability/otel')"
    ) as () => Promise<{ initializeOpenTelemetry: () => Promise<unknown> }>;
    const { initializeOpenTelemetry } = await loadOpenTelemetry();
    await initializeOpenTelemetry();
  } catch (error) {
    // OpenTelemetry is optional — must never crash the server
    // eslint-disable-next-line no-console
    console.warn('[instrumentation] OpenTelemetry initialization failed, continuing without it:', error);
  }
}
