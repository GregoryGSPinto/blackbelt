-- ============================================================
-- Migration 00013: Fix missing updated_at triggers
--
-- Tables ai_social_connections and ai_question_bank have
-- updated_at columns but were missing auto-update triggers.
-- ============================================================

CREATE TRIGGER ai_social_connections_updated_at
  BEFORE UPDATE ON ai_social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ai_question_bank_updated_at
  BEFORE UPDATE ON ai_question_bank
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
