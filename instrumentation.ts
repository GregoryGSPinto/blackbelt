export async function register() {
  try {
    // Dynamic import path constructed to bypass TypeScript module resolution
    // The otel module only exists on feature branches with full observability stack
    const modulePath = '@/src/infrastructure/observability/otel';
    const otel: any = await import(/* @vite-ignore */ modulePath);
    if (otel?.initializeOpenTelemetry) {
      await otel.initializeOpenTelemetry();
    }
  } catch {
    // OpenTelemetry is optional — must never crash the server
  }
}
