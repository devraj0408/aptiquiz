-- ============================================================================
-- AptiQuiz Supabase Migration 000008: Revoke Privileged RPC Execution from Anon & Public
-- Description: Strictly revokes EXECUTE privileges on evaluate_game_round, start_game_round,
--              and create_room from PUBLIC and anon roles. Ensures only authenticated hosts,
--              postgres, and service_role can trigger privileged game management functions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HARDEN EVALUATE_GAME_ROUND EXECUTION PRIVILEGES
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.evaluate_game_round(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.evaluate_game_round(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.evaluate_game_round(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_game_round(uuid) TO service_role;

-- ----------------------------------------------------------------------------
-- 2. HARDEN START_GAME_ROUND EXECUTION PRIVILEGES
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.start_game_round(uuid, uuid, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_game_round(uuid, uuid, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.start_game_round(uuid, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_game_round(uuid, uuid, integer, integer) TO service_role;

-- ----------------------------------------------------------------------------
-- 3. HARDEN CREATE_ROOM EXECUTION PRIVILEGES
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.create_room(text, uuid, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_room(text, uuid, text, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_room(text, uuid, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_room(text, uuid, text, integer, integer) TO service_role;
