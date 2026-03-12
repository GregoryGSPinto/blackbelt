export async function register() {
  try {
    const { initializeOpenTelemetry } = await import('@/src/infrastructure/observability/otel');
    await initializeOpenTelemetry();
  } catch (error) {
    // OpenTelemetry is optional — must never crash the server
    // eslint-disable-next-line no-console
    console.warn('[instrumentation] OpenTelemetry initialization failed, continuing without it:', error);
  }
}
