-- 00005_event_store.sql
-- Domain event store, snapshots, and event subscriptions

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE domain_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id    text NOT NULL,
  aggregate_type  text NOT NULL,
  event_type      text NOT NULL,
  version         int NOT NULL,
  payload         jsonb NOT NULL,
  metadata        jsonb,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  causation_id    text,
  correlation_id  text,
  idempotency_key text UNIQUE
);

CREATE TABLE snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id    text NOT NULL,
  aggregate_type  text NOT NULL,
  version         int NOT NULL,
  state           jsonb NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aggregate_id, aggregate_type)
);

CREATE TABLE event_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_name text NOT NULL UNIQUE,
  last_event_id   uuid REFERENCES domain_events(id),
  last_processed  timestamptz,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER event_subscriptions_updated_at
  BEFORE UPDATE ON event_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_id, aggregate_type);
CREATE INDEX idx_domain_events_type ON domain_events(event_type);
CREATE INDEX idx_domain_events_occurred ON domain_events(occurred_at);
CREATE INDEX idx_domain_events_correlation ON domain_events(correlation_id);
CREATE INDEX idx_snapshots_aggregate ON snapshots(aggregate_id, aggregate_type);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;

-- Events are server-side only (accessed via service role)
-- No public policies — accessed through admin client
CREATE POLICY domain_events_service ON domain_events FOR ALL USING (false);
CREATE POLICY snapshots_service ON snapshots FOR ALL USING (false);
CREATE POLICY event_subscriptions_service ON event_subscriptions FOR ALL USING (false);
