/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  REPLAY POLICY — Modos de reconstrução do estado               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Replay é a capacidade de reconstruir o snapshot de um         ║
 * ║  participante a partir dos eventos históricos.                 ║
 * ║                                                                 ║
 * ║  3 MODOS:                                                       ║
 * ║                                                                 ║
 * ║  WRITE — snapshot reconstruído toda vez que evento é gravado   ║
 * ║  • Sempre atualizado                                            ║
 * ║  • Mais custoso em processamento                                ║
 * ║  • Ideal para participantes ativos                              ║
 * ║                                                                 ║
 * ║  DEMAND — snapshot reconstruído quando alguém consulta          ║
 * ║  • Lazy (só calcula se necessário)                              ║
 * ║  • Com cache TTL + invalidação por evento                      ║
 * ║  • É o modo PADRÃO do BlackBelt hoje                             ║
 * ║                                                                 ║
 * ║  FULL — reconstruir todos os snapshots do zero                  ║
 * ║  • Usado após correção de bug em regra de negócio              ║
 * ║  • Usado após migração de versão de evento                     ║
 * ║  • Usado para auditoria / verificação                          ║
 * ║  • Executado como job offline                                   ║
 * ║                                                                 ║
 * ║  O modo é configurável por participante e por cenário.         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { DomainEvent } from '@/lib/domain/events/domain-events';
import type { EventStore } from '@/lib/application/events/event-store';

// ════════════════════════════════════════════════════════════════════
// REPLAY MODES
// ════════════════════════════════════════════════════════════════════

export type ReplayMode = 'write' | 'demand' | 'full';

export interface ReplayOptions {
  /** Modo de replay */
  mode: ReplayMode;

  /** Para mode=full: IDs dos participantes a reprocessar (null = todos) */
  participantIds?: string[] | null;

  /** Para mode=full: reprocessar desde esta data (null = desde o início) */
  since?: string | null;

  /** Callback de progresso */
  onProgress?: (processed: number, total: number) => void;

  /** Callback por erro individual (não interrompe) */
  onError?: (participantId: string, error: Error) => void;
}

export interface ReplayResult {
  mode: ReplayMode;
  processed: number;
  errors: number;
  durationMs: number;
  timestamp: string;
}

// ════════════════════════════════════════════════════════════════════
// FULL REPLAY ENGINE
// ════════════════════════════════════════════════════════════════════

/**
 * Executa replay completo — reconstrói snapshots a partir de eventos.
 *
 * Usado por support_admin para:
 * • Corrigir bugs retroativamente
 * • Aplicar nova versão de regra de negócio
 * • Verificar consistência (comparar snapshot atual vs replay)
 * • Gerar relatórios históricos
 *
 * SEGURANÇA: requer role support_admin.
 */
export async function executeFullReplay(
  store: EventStore,
  snapshotBuilder: (participantId: string, events: DomainEvent[]) => Promise<any>,
  snapshotWriter: (participantId: string, snapshot: any) => Promise<void>,
  options: ReplayOptions,
): Promise<ReplayResult> {
  const startTime = Date.now();
  let processed = 0;
  let errors = 0;

  // Discover participant IDs
  const participantIds = options.participantIds
    ?? await discoverParticipantIds(store);

  const total = participantIds.length;

  for (const pid of participantIds) {
    try {
      // Replay all events for this participant
      const events = await store.replay(pid, {
        after: options.since ?? undefined,
      });

      if (events.length === 0) continue;

      // Rebuild snapshot from events
      const snapshot = await snapshotBuilder(pid, events);

      // Write rebuilt snapshot
      await snapshotWriter(pid, snapshot);

      processed++;
      options.onProgress?.(processed, total);
    } catch (err: any) {
      errors++;
      options.onError?.(pid, err);
    }
  }

  return {
    mode: options.mode,
    processed,
    errors,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Descobre todos os participantIds únicos no event store.
 */
async function discoverParticipantIds(store: EventStore): Promise<string[]> {
  // TODO: quando houver adapter real, usar SELECT DISTINCT participant_id
  // Por enquanto, replay all events e extrair PIDs
  const recent = await store.getRecent(10_000);
  const pids = new Set<string>();
  for (const event of recent) {
    if (event.participantId) pids.add(event.participantId);
  }
  return Array.from(pids);
}

// ════════════════════════════════════════════════════════════════════
// SUPPORT ADMIN ROLE
// ════════════════════════════════════════════════════════════════════

/**
 * Operações disponíveis para o papel support_admin.
 *
 * support_admin NÃO é o admin da academia.
 * É o operador da plataforma BlackBelt (CTO, devops, suporte N3).
 *
 * Pode:
 * • Executar replay completo
 * • Consultar event log de qualquer tenant
 * • Verificar consistência de snapshots
 * • Anonimizar dados LGPD
 * • Rodar migrations
 * • Acessar healthcheck detalhado
 *
 * NÃO pode:
 * • Alterar dados pedagógicos diretamente
 * • Promover/rebaixar participantes
 * • Criar/editar contas de academia
 */
export const SUPPORT_ADMIN_PERMISSIONS = [
  'replay:execute',
  'event_log:read_any',
  'snapshot:verify',
  'lgpd:anonymize',
  'migration:run',
  'health:detailed',
  'audit:read',
] as const;

export type SupportAdminPermission = typeof SUPPORT_ADMIN_PERMISSIONS[number];

/**
 * Verifica se uma operação é permitida para support_admin.
 */
export function assertSupportAdmin(
  userRole: string,
  requiredPermission: SupportAdminPermission,
): void {
  if (userRole !== 'support_admin') {
    throw new Error(
      `Permission denied: '${requiredPermission}' requires support_admin role (current: '${userRole}')`
    );
  }
}
