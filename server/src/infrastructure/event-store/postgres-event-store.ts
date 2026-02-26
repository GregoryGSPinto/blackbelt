/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  POSTGRES EVENT STORE ADAPTER                                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Implementa EventStoreAdapter contra PostgreSQL real.          ║
 * ║                                                                 ║
 * ║  Tabela: event_log (append-only)                               ║
 * ║  Idempotência: UNIQUE INDEX em idempotency_key                ║
 * ║  Concorrência: sequence via SERIAL (database-managed)         ║
 * ║  Transacional: append() em transaction                         ║
 * ║                                                                 ║
 * ║  Não importa nada do domínio diretamente.                     ║
 * ║  Recebe StoredEvent genérico e persiste.                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { Pool, PoolClient } from 'pg';
import type {
  EventStoreAdapter,
  StoredEvent,
  EventQuery,
} from '@/lib/application/events/event-store';

// ════════════════════════════════════════════════════════════════════
// ADAPTER
// ════════════════════════════════════════════════════════════════════

export class PostgresEventStoreAdapter implements EventStoreAdapter {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // ── APPEND ─────────────────────────────────────────────────

  async append(event: StoredEvent): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO event_log (
          id, unit_id, participant_id,
          event_type, event_version,
          causation_id, correlation_id, idempotency_key,
          occurred_at, stored_at,
          payload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL
        DO NOTHING`,
        [
          event.id,
          event.unitId,
          event.participantId,
          event.eventType,
          event.eventVersion,
          event.causationId,
          event.correlationId,
          event.idempotencyKey,
          event.occurredAt,
          event.storedAt,
          JSON.stringify(event.event),
        ],
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async appendBatch(events: StoredEvent[]): Promise<void> {
    if (events.length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const event of events) {
        await client.query(
          `INSERT INTO event_log (
            id, unit_id, participant_id,
            event_type, event_version,
            causation_id, correlation_id, idempotency_key,
            occurred_at, stored_at,
            payload
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL
          DO NOTHING`,
          [
            event.id,
            event.unitId,
            event.participantId,
            event.eventType,
            event.eventVersion,
            event.causationId,
            event.correlationId,
            event.idempotencyKey,
            event.occurredAt,
            event.storedAt,
            JSON.stringify(event.event),
          ],
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ── IDEMPOTENCY ────────────────────────────────────────────

  async hasIdempotencyKey(key: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 FROM event_log WHERE idempotency_key = $1 LIMIT 1`,
      [key],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ── QUERY ──────────────────────────────────────────────────

  async query(q: EventQuery): Promise<StoredEvent[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (q.participantId) {
      conditions.push(`participant_id = $${paramIdx++}`);
      params.push(q.participantId);
    }
    if (q.unitId) {
      conditions.push(`unit_id = $${paramIdx++}`);
      params.push(q.unitId);
    }
    if (q.eventTypes?.length) {
      conditions.push(`event_type = ANY($${paramIdx++})`);
      params.push(q.eventTypes);
    }
    if (q.correlationId) {
      conditions.push(`correlation_id = $${paramIdx++}`);
      params.push(q.correlationId);
    }
    if (q.causationId) {
      conditions.push(`causation_id = $${paramIdx++}`);
      params.push(q.causationId);
    }
    if (q.after) {
      conditions.push(`occurred_at >= $${paramIdx++}`);
      params.push(q.after);
    }
    if (q.before) {
      conditions.push(`occurred_at <= $${paramIdx++}`);
      params.push(q.before);
    }
    if (q.minVersion) {
      conditions.push(`event_version >= $${paramIdx++}`);
      params.push(q.minVersion);
    }

    const where = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    let sql = `SELECT * FROM event_log ${where} ORDER BY sequence ASC`;

    if (q.limit) {
      sql += ` LIMIT $${paramIdx++}`;
      params.push(q.limit);
    }
    if (q.offset) {
      sql += ` OFFSET $${paramIdx++}`;
      params.push(q.offset);
    }

    const result = await this.pool.query(sql, params);
    return result.rows.map(rowToStoredEvent);
  }

  // ── COUNT ──────────────────────────────────────────────────

  async count(q?: EventQuery): Promise<number> {
    if (!q) {
      const result = await this.pool.query(`SELECT COUNT(*) FROM event_log`);
      return parseInt(result.rows[0].count, 10);
    }

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (q.participantId) { conditions.push(`participant_id = $${paramIdx++}`); params.push(q.participantId); }
    if (q.unitId) { conditions.push(`unit_id = $${paramIdx++}`); params.push(q.unitId); }
    if (q.eventTypes?.length) { conditions.push(`event_type = ANY($${paramIdx++})`); params.push(q.eventTypes); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await this.pool.query(`SELECT COUNT(*) FROM event_log ${where}`, params);
    return parseInt(result.rows[0].count, 10);
  }

  // ── SEQUENCE ───────────────────────────────────────────────

  async getLastSequence(): Promise<number> {
    const result = await this.pool.query(
      `SELECT COALESCE(MAX(sequence), 0) as last_seq FROM event_log`,
    );
    return parseInt(result.rows[0].last_seq, 10);
  }
}

// ════════════════════════════════════════════════════════════════════
// ROW MAPPER
// ════════════════════════════════════════════════════════════════════

function rowToStoredEvent(row: any): StoredEvent {
  return {
    id: row.id,
    sequence: row.sequence,
    unitId: row.unit_id,
    participantId: row.participant_id,
    eventType: row.event_type,
    eventVersion: row.event_version,
    causationId: row.causation_id,
    correlationId: row.correlation_id,
    idempotencyKey: row.idempotency_key,
    occurredAt: row.occurred_at instanceof Date ? row.occurred_at.toISOString() : row.occurred_at,
    storedAt: row.stored_at instanceof Date ? row.stored_at.toISOString() : row.stored_at,
    event: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
  };
}
