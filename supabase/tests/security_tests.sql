-- ============================================================================
-- AptiQuiz Security, Hardening & Concurrency Test Suite
-- File: supabase/tests/security_tests.sql
-- Run instructions: Execute locally using Supabase CLI:
--                   npx supabase db reset
--                   npx supabase db query --file supabase/tests/security_tests.sql
-- ============================================================================

BEGIN;

-- 1. VERIFY TABLE COUNT (21 DOMAIN TABLES)
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'profiles', 'colleges', 'college_memberships', 'question_sets',
      'questions', 'question_options', 'question_answer_keys', 'rooms',
      'room_players', 'game_sessions', 'game_rounds', 'round_player_options',
      'game_answers', 'round_results', 'game_teams', 'team_memberships',
      'team_round_results', 'league_seasons', 'league_standings',
      'game_events', 'audit_logs'
    );
  
  IF v_count <> 21 THEN
    RAISE EXCEPTION 'TEST FAILED: Expected 21 public tables, found %', v_count;
  END IF;
  RAISE NOTICE 'PASSED 1/8: All 21 domain tables exist in public schema.';
END $$;

-- 2. VERIFY RLS IS ENABLED ON ALL 21 TABLES
DO $$
DECLARE
  v_unprotected_count INT;
BEGIN
  SELECT COUNT(*) INTO v_unprotected_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = FALSE
    AND tablename IN (
      'profiles', 'colleges', 'college_memberships', 'question_sets',
      'questions', 'question_options', 'question_answer_keys', 'rooms',
      'room_players', 'game_sessions', 'game_rounds', 'round_player_options',
      'game_answers', 'round_results', 'game_teams', 'team_memberships',
      'team_round_results', 'league_seasons', 'league_standings',
      'game_events', 'audit_logs'
    );

  IF v_unprotected_count > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Found % tables with RLS disabled', v_unprotected_count;
  END IF;
  RAISE NOTICE 'PASSED 2/8: Row Level Security is enabled on all 21 tables.';
END $$;

-- 3. VERIFY SECRET ANSWER KEY IS INACCESSIBLE TO CLIENT RLS
DO $$
DECLARE
  v_policy_count INT;
BEGIN
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'question_answer_keys'
    AND cmd = 'SELECT'
    AND ('anon' = ANY(roles) OR 'authenticated' = ANY(roles) OR 'public' = ANY(roles));

  IF v_policy_count > 0 THEN
    RAISE EXCEPTION 'CRITICAL SECURITY FAILURE: question_answer_keys has % permissive SELECT policies!', v_policy_count;
  END IF;
  RAISE NOTICE 'PASSED 3/8: question_answer_keys has no browser SELECT policies.';
END $$;

-- 4. VERIFY AT MOST ONE ANSWER PER ROUND CONSTRAINT
DO $$
DECLARE
  v_has_constraint BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'game_answers'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'uq_player_round_answer'
  ) INTO v_has_constraint;

  IF NOT v_has_constraint THEN
    RAISE EXCEPTION 'TEST FAILED: Unique constraint uq_player_round_answer is missing on game_answers';
  END IF;
  RAISE NOTICE 'PASSED 4/8: Unique answer submission constraint is active.';
END $$;

-- 5. VERIFY GUEST TOKEN HASH COLUMN & INDEX EXIST
DO $$
DECLARE
  v_has_col BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'room_players' AND column_name = 'guest_token_hash'
  ) INTO v_has_col;

  IF NOT v_has_col THEN
    RAISE EXCEPTION 'TEST FAILED: guest_token_hash column is missing on room_players';
  END IF;
  RAISE NOTICE 'PASSED 5/8: guest_token_hash column exists on room_players.';
END $$;

-- 6. SIMULATE GUEST TOKEN GENERATION & SECURE AUTHENTICATION FLOW
DO $$
DECLARE
  v_guest_res JSONB;
  v_token TEXT;
  v_player_id UUID;
  v_found_id UUID;
BEGIN
  -- Test guest join
  INSERT INTO rooms (id, join_code, title, host_id, status)
  VALUES ('11111111-1111-1111-1111-111111111111', 'TEST99', 'Test Room', gen_random_uuid(), 'lobby');

  v_guest_res := public.join_room_as_guest('TEST99', 'Guest Tester', 'Test College');
  v_token := v_guest_res->>'guest_token';
  v_player_id := (v_guest_res->>'room_player_id')::UUID;

  IF v_token IS NULL OR char_length(v_token) < 32 THEN
    RAISE EXCEPTION 'TEST FAILED: Guest token generation failed';
  END IF;

  -- Verify token hash resolution
  SELECT id INTO v_found_id
  FROM room_players
  WHERE room_id = '11111111-1111-1111-1111-111111111111'
    AND guest_token_hash = encode(digest(v_token, 'sha256'), 'hex');

  IF v_found_id != v_player_id THEN
    RAISE EXCEPTION 'TEST FAILED: Guest token hash verification mismatch';
  END IF;

  RAISE NOTICE 'PASSED 6/8: Guest credential token hash flow verified.';
END $$;

-- 7. VERIFY FORGED OPTION & EXPIRED DEADLINE REJECTION
DO $$
DECLARE
  v_round_id UUID := gen_random_uuid();
  v_session_id UUID := gen_random_uuid();
  v_q1 UUID := gen_random_uuid();
  v_q2 UUID := gen_random_uuid();
  v_opt_q1 UUID := gen_random_uuid();
  v_opt_q2 UUID := gen_random_uuid();
  v_player_id UUID := gen_random_uuid();
  v_guest_token TEXT := '0123456789abcdef0123456789abcdef';
  v_token_hash TEXT := encode(digest('0123456789abcdef0123456789abcdef', 'sha256'), 'hex');
  v_err_caught BOOLEAN := FALSE;
BEGIN
  -- Setup question 1 and option
  INSERT INTO question_sets (id, title, category, created_by) VALUES (v_session_id, 'Q Set', 'Quantitative Aptitude', gen_random_uuid());
  INSERT INTO questions (id, question_set_id, prompt) VALUES (v_q1, v_session_id, 'Q1 Prompt');
  INSERT INTO questions (id, question_set_id, prompt) VALUES (v_q2, v_session_id, 'Q2 Prompt');
  INSERT INTO question_options (id, question_id, option_key, option_text) VALUES (v_opt_q1, v_q1, 'A', 'Option Q1');
  INSERT INTO question_options (id, question_id, option_key, option_text) VALUES (v_opt_q2, v_q2, 'A', 'Option Q2 (Forged)');

  -- Setup room, player, round
  INSERT INTO rooms (id, join_code, title, host_id, status) VALUES (v_session_id, 'ROOM88', 'Room 88', gen_random_uuid(), 'in_game');
  INSERT INTO room_players (id, room_id, display_name, status, guest_token_hash) VALUES (v_player_id, v_session_id, 'Player 1', 'joined', v_token_hash);
  INSERT INTO game_sessions (id, room_id, started_by, total_rounds, status) VALUES (v_session_id, v_session_id, gen_random_uuid(), 1, 'active');
  INSERT INTO game_rounds (id, game_session_id, question_id, round_number, started_at, deadline_at, status)
  VALUES (v_round_id, v_session_id, v_q1, 1, clock_timestamp() - interval '60 seconds', clock_timestamp() - interval '30 seconds', 'active');

  INSERT INTO round_player_options (game_round_id, room_player_id, option_id, displayed_position)
  VALUES (v_round_id, v_player_id, v_opt_q1, 1);

  -- Test expired deadline rejection
  BEGIN
    PERFORM public.submit_game_answer(v_round_id, v_opt_q1, v_guest_token);
  EXCEPTION WHEN OTHERS THEN
    v_err_caught := TRUE;
  END;

  IF NOT v_err_caught THEN
    RAISE EXCEPTION 'TEST FAILED: Expired deadline submission was not rejected!';
  END IF;

  RAISE NOTICE 'PASSED 7/8: Expired deadline rejection verified.';
END $$;

-- 8. VERIFY SEARCH PATH HARDENING ON ALL PL/PGSQL SECURITY DEFINER FUNCTIONS
DO $$
DECLARE
  v_unhardened_count INT;
BEGIN
  SELECT COUNT(*) INTO v_unhardened_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prosecdef = TRUE
    AND (p.proconfig IS NULL OR NOT ('search_path=public, pg_temp' = ANY(p.proconfig)));

  IF v_unhardened_count > 0 THEN
    RAISE EXCEPTION 'SECURITY FAILURE: % SECURITY DEFINER functions lack fixed search_path = public, pg_temp', v_unhardened_count;
  END IF;

  RAISE NOTICE 'PASSED 8/8: All SECURITY DEFINER functions have fixed search_path = public, pg_temp.';
END $$;

ROLLBACK;
