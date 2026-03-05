-- 00014_messaging.sql
-- Conversations, conversation members, and messages

-- ── Tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id  uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  type        text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'class')),
  title       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS conversation_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  last_read_at    timestamptz,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, profile_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text NOT NULL,
  message_type    text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'system')),
  media_url       text,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_conversations_academy ON conversations(academy_id);
CREATE INDEX idx_conversation_members_conversation ON conversation_members(conversation_id);
CREATE INDEX idx_conversation_members_profile ON conversation_members(profile_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations: only members can see
CREATE POLICY conversations_select ON conversations FOR SELECT USING (
  id IN (SELECT conversation_id FROM conversation_members WHERE profile_id = auth.uid())
);

CREATE POLICY conversations_insert ON conversations FOR INSERT WITH CHECK (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY conversations_update ON conversations FOR UPDATE USING (
  id IN (SELECT conversation_id FROM conversation_members WHERE profile_id = auth.uid() AND role = 'admin')
);

-- Conversation members: members of the conversation can view
CREATE POLICY conversation_members_select ON conversation_members FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM conversation_members WHERE profile_id = auth.uid())
);

CREATE POLICY conversation_members_insert ON conversation_members FOR INSERT WITH CHECK (true);

-- Messages: only conversation members can see and send
CREATE POLICY messages_select ON messages FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM conversation_members WHERE profile_id = auth.uid())
);

CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND conversation_id IN (SELECT conversation_id FROM conversation_members WHERE profile_id = auth.uid())
);

-- ── Enable Realtime ─────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
