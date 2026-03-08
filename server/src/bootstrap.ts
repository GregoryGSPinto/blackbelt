/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  BOOTSTRAP — Inicialização do backend BlackBelt                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Ponto único de inicialização. Conecta:                        ║
 * ║  • Database pool (se DATABASE_URL configurado)                 ║
 * ║  • Event Store (Postgres ou InMemory fallback)                 ║
 * ║  • Event Bus wiring (bus → store → cache)                      ║
 * ║  • Health endpoints                                             ║
 * ║                                                                 ║
 * ║  Se DATABASE_URL não existe → roda com InMemory.               ║
 * ║  Zero mudança na lógica de aplicação.                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { env } from './infrastructure/env';
import { createPgPool, closePgPool } from './infrastructure/database/postgres';
import { PostgresEventStoreAdapter } from './infrastructure/event-store/postgres-event-store';
import {
  EventStore,
  InMemoryEventStoreAdapter,
  type EventStoreContext,
} from '@/lib/application/events/event-store';
import { initializeEventSystem } from '@/lib/application/events/event-wiring';
import { eventBus } from '@/lib/application/events/event-bus';

// ════════════════════════════════════════════════════════════════════
// BOOTSTRAP
// ════════════════════════════════════════════════════════════════════

export interface BootstrapResult {
  mode: 'POSTGRES' | 'MEMORY';
  eventStore: EventStore;
}

/**
 * Inicializa todo o backend.
 *
 * Chamado uma vez no entry point:
 * ```
 * const { mode } = await bootstrap();
 * console.log(`Server running in ${mode} mode`);
 * ```
 */
export async function bootstrap(options?: {
  unitId?: string;
}): Promise<BootstrapResult> {
  const startTime = Date.now();

  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  BLACKBELT — Domain Engine Bootstrap           ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Database:    ${env.hasDatabase ? 'PostgreSQL' : 'In-Memory'}`);
  console.log('');

  let mode: 'POSTGRES' | 'MEMORY';
  let store: EventStore;

  if (env.hasDatabase) {
    // ── POSTGRES MODE ────────────────────────────────────────
    mode = 'POSTGRES';

    try {
      const pool = createPgPool();

      // Test connection
      await pool.query('SELECT 1');
      console.log('  ✅ PostgreSQL connected');

      // Create adapter and new store
      const adapter = new PostgresEventStoreAdapter(pool);
      store = new EventStore(adapter);

      console.log('  ✅ Event Store: PostgreSQL adapter');
    } catch (err: any) {
      console.error('  ❌ PostgreSQL connection failed:', err.message);
      console.error('  ⚠️  Falling back to In-Memory mode');

      mode = 'MEMORY';
      store = new EventStore(new InMemoryEventStoreAdapter());
    }
  } else {
    // ── IN-MEMORY MODE ───────────────────────────────────────
    mode = 'MEMORY';
    store = new EventStore(new InMemoryEventStoreAdapter());
    console.log('  ℹ️  Event Store: In-Memory (no DATABASE_URL)');
  }

  // ── INITIALIZE EVENT SYSTEM ───────────────────────────────
  const eventContext: EventStoreContext | undefined = options?.unitId
    ? {
        tenantId: options.unitId,
        actorId: 'system',
        correlationId: 'bootstrap',
        causationId: 'bootstrap',
      }
    : undefined;

  initializeEventSystem({
    context: eventContext,
    debug: env.isDevelopment,
  });

  // ── STRUCTURED EVENT LOGGING ──────────────────────────────
  if (env.hasDatabase) {
    eventBus.onAny(async (event) => {
      try {
        const stored = await store.persist(event, eventContext ?? {
          tenantId: 'system',
          actorId: 'system',
          correlationId: event.correlationId,
          causationId: event.causationId,
        });
        if (stored) {
          logEvent('persisted', {
            type: event.type,
            version: event.version,
            participantId: (event as any).payload?.participantId,
            sequence: stored.sequence,
          });
        } else {
          logEvent('duplicate_rejected', {
            type: event.type,
            idempotencyKey: event.idempotencyKey,
          });
        }
      } catch (err: any) {
        logEvent('persist_error', {
          type: event.type,
          error: err.message,
        });
      }
    });
  }

  const elapsed = Date.now() - startTime;
  console.log(`  ✅ Bootstrap complete (${elapsed}ms)`);
  console.log(`  Mode: ${mode}`);
  console.log('');

  return { mode, eventStore: store };
}

// ════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ════════════════════════════════════════════════════════════════════

export async function shutdown(): Promise<void> {
  console.log('[Shutdown] Draining connections...');
  await closePgPool();
  console.log('[Shutdown] Complete');
}

// Register shutdown handlers
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });
  process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
}

// ════════════════════════════════════════════════════════════════════
// STRUCTURED LOGGING
// ════════════════════════════════════════════════════════════════════

function logEvent(action: string, data: Record<string, any>): void {
  if (env.LOG_LEVEL === 'debug' || env.LOG_LEVEL === 'info') {
    const entry = {
      ts: new Date().toISOString(),
      service: 'event-store',
      action,
      ...data,
    };

    if (env.isProduction) {
      // JSON structured log (machine-parseable)
      console.log(JSON.stringify(entry));
    } else {
      // Human-readable
      const { ts, service, action: a, ...rest } = entry;
      console.log(
        `  %c[${a}]%c ${data.type ?? ''}`,
        'color: #8B5CF6; font-weight: bold',
        'color: inherit',
        rest,
      );
    }
  }
}
