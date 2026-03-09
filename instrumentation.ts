import { initializeOpenTelemetry } from '@/src/infrastructure/observability/otel';

export async function register() {
  await initializeOpenTelemetry();
}
