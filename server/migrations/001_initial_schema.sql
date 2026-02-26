-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 001 — Schema inicial do BlackBelt                    ║
-- ╠══════════════════════════════════════════════════════════════════╣
-- ║  Data: 2026-02-19                                              ║
-- ║  Descrição: event_log + snapshot_cache + account               ║
-- ║  Executar: psql $DATABASE_URL -f 001_initial_schema.sql       ║
-- ╚══════════════════════════════════════════════════════════════════╝

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. ACCOUNT (unidade/academia — tenant root)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS account (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  segment_type  TEXT NOT NULL DEFAULT 'martial_arts',
  timezone      TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  plan          TEXT NOT NULL DEFAULT 'free'
                CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_slug ON account (slug);
CREATE INDEX idx_account_status ON account (status);

-- ════════════════════════════════════════════════════════════════════
-- 2. EVENT_LOG (append-only — coração do sistema)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS event_log (
  -- Identity
  id              TEXT NOT NULL,
  sequence        BIGSERIAL PRIMARY KEY,

  -- Tenant isolation (partition key)
  unit_id         TEXT NOT NULL REFERENCES account(id),

  -- Participant (secondary partition)
  participant_id  TEXT,

  -- Event envelope
  event_type      TEXT NOT NULL,
  event_version   INTEGER NOT NULL DEFAULT 1,

  -- Causality chain
  causation_id    TEXT NOT NULL,
  correlation_id  TEXT NOT NULL,

  -- Idempotency (rejects duplicates)
  idempotency_key TEXT,

  -- Temporal
  occurred_at     TIMESTAMPTZ NOT NULL,
  stored_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Payload (the domain event, serialized)
  payload         JSONB NOT NULL
);

-- Unique on event id within unit
CREATE UNIQUE INDEX idx_event_log_id ON event_log (unit_id, id);

-- Idempotency: reject duplicates (partial index — only where key exists)
CREATE UNIQUE INDEX idx_event_log_idempotency
  ON event_log (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Query: all events for a participant (ordered)
CREATE INDEX idx_event_log_participant
  ON event_log (unit_id, participant_id, sequence)
  WHERE participant_id IS NOT NULL;

-- Query: events by type (for projectors, analytics)
CREATE INDEX idx_event_log_type
  ON event_log (unit_id, event_type, sequence);

-- Query: correlation chain (all events from one story)
CREATE INDEX idx_event_log_correlation
  ON event_log (correlation_id, sequence);

-- Query: time-based (for replay, exports)
CREATE INDEX idx_event_log_occurred
  ON event_log (unit_id, occurred_at);

-- ════════════════════════════════════════════════════════════════════
-- 3. SNAPSHOT_CACHE (computed read model)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS snapshot_cache (
  -- Composite key: unit + participant
  unit_id         TEXT NOT NULL REFERENCES account(id),
  participant_id  TEXT NOT NULL,

  -- Snapshot data
  snapshot        JSONB NOT NULL,

  -- Versioning
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_event_seq  BIGINT,  -- sequence of last event included

  -- TTL support
  expires_at      TIMESTAMPTZ,

  PRIMARY KEY (unit_id, participant_id)
);

CREATE INDEX idx_snapshot_expires ON snapshot_cache (expires_at)
  WHERE expires_at IS NOT NULL;

-- ════════════════════════════════════════════════════════════════════
-- 4. HELPER FUNCTION — auto-update updated_at
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_account_updated
  BEFORE UPDATE ON account
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
