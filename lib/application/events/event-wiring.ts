/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EVENT WIRING — Conecta bus → store → cache                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Chamado UMA vez no bootstrap da aplicação.                    ║
 * ║  Conecta os 3 sistemas de eventos:                             ║
 * ║                                                                 ║
 * ║  eventBus.publish(event)                                       ║
 * ║       │                                                         ║
 * ║       ├→ eventStore.persist(event)     ← log eterno            ║
 * ║       ├→ snapshotCache.invalidate(pid) ← reatividade           ║
 * ║       └→ console.log (dev mode)        ← debugging             ║
 * ║                                                                 ║
 * ║  A aplicação não precisa saber que isso existe.                ║
 * ║  Commands publicam. Wiring distribui. Tudo automático.         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { eventBus } from './event-bus';
import { eventStore, type EventStoreContext } from './event-store';

let initialized = false;

/**
 * Bootstrap do sistema de eventos.
 *
 * Chame uma vez no entry point da aplicação:
 *
 * ```ts
 * // app/layout.tsx ou similar
 * import { initializeEventSystem } from '@/lib/application/events';
 * initializeEventSystem({ unitId: 'unit_xxx', debug: isDev });
 * ```
 */
export function initializeEventSystem(options?: {
  context?: EventStoreContext;
  debug?: boolean;
}): void {
  if (initialized) return;
  initialized = true;

  // 1. Connect bus → store (persist all domain events)
  eventBus.onAny(async (event) => {
    try {
      if (!options?.context) {
        return;
      }
      await eventStore.persist(event, options.context);
    } catch (err) {
      console.error('[EventWiring] Failed to persist event:', event.type, err);
    }
  });

  // 2. Wire ALL intelligence subscribers (churn, attendance, promotion, evaluation)
  import('../intelligence/subscribers/intelligence-wiring').then(mod => {
    mod.wireIntelligenceSubscribers(eventBus);
  }).catch(() => {
    // Intelligence module is optional — silently skip if not available
  });

  // 3. Debug logging (dev mode only)
  if (options?.debug) {
    eventBus.onAny((event) => {
      const pid = (event as any).payload?.participantId ?? '—';
      console.log(
        `%c[Event] ${event.type} v${event.version}`,
        'color: #8B5CF6; font-weight: bold',
        `| pid: ${pid} | ${event.occurredAt}`,
      );
    });
    eventBus.enableLogging();
  }
}

/**
 * Reset (para testes).
 */
export function resetEventSystem(): void {
  eventBus.reset();
  initialized = false;
}
