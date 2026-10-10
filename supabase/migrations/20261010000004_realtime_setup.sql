-- ============================================================================
-- AptiQuiz Supabase Migration 000004: Supabase Realtime Configuration
-- Description: Configures selective Postgres Changes publications for live lobby
--              and round state, explicitly excluding secret answer tables.
-- ============================================================================

-- Enable publication for Realtime if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- REALTIME PUBLICATION SUBSCRIPTIONS
-- Selective inclusion of live state tables only.
-- ----------------------------------------------------------------------------

-- 1. Lobby & Room Status Sync
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- 2. Live Participant Presence & Readiness
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;

-- 3. Game Round Timers & Deadlines
ALTER PUBLICATION supabase_realtime ADD TABLE game_rounds;

-- 4. Finalized Round Results & Leaderboard Updates (Post-evaluation)
ALTER PUBLICATION supabase_realtime ADD TABLE round_results;

-- 5. Game Event Stream for Synchronized Orchestration
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

-- ----------------------------------------------------------------------------
-- CRITICAL SECURITY GUARANTEE:
-- The following tables are EXPLICITLY EXCLUDED from Realtime publication:
--   - question_answer_keys  (Prevents correct option leakage via websocket)
--   - game_answers          (Prevents peer answer copying during active rounds)
--   - round_player_options  (Prevents option mapping inspection)
-- ----------------------------------------------------------------------------

COMMENT ON PUBLICATION supabase_realtime IS 'Selective Realtime publication for AptiQuiz live game state. Excludes secret answer keys.';
