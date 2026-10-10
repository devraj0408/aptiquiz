-- ============================================================================
-- AptiQuiz Supabase Migration 000003: Game Logic & Transactional Procedures
-- Description: Database-authoritative functions for room creation, round start,
--              deadline-checked answer submission, and atomic scoring.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNCTION: create_room
-- Description: Generates collision-safe join code and registers host in room_players
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_room(
  p_title TEXT,
  p_question_set_id UUID,
  p_game_mode TEXT DEFAULT 'Standard',
  p_max_players INT DEFAULT 50,
  p_time_per_question_sec INT DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_join_code TEXT;
  v_room_id UUID;
  v_host_id UUID;
  v_host_name TEXT;
  v_attempts INT := 0;
  v_result JSONB;
BEGIN
  v_host_id := auth.uid();
  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a room';
  END IF;

  -- Get host name from profile
  SELECT full_name INTO v_host_name FROM profiles WHERE id = v_host_id;
  IF v_host_name IS NULL THEN
    v_host_name := 'Host User';
  END IF;

  -- Collision-safe random join code generation loop
  LOOP
    v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    v_attempts := v_attempts + 1;
    
    EXIT WHEN NOT EXISTS (SELECT 1 FROM rooms WHERE join_code = v_join_code AND status != 'completed');

    IF v_attempts > 20 THEN
      RAISE EXCEPTION 'Failed to generate a unique room code after 20 attempts';
    END IF;
  END LOOP;

  -- Create room
  INSERT INTO rooms (
    join_code, title, host_id, question_set_id, game_mode, max_players, time_per_question_sec, status
  )
  VALUES (
    v_join_code, p_title, v_host_id, p_question_set_id, p_game_mode, p_max_players, p_time_per_question_sec, 'lobby'
  )
  RETURNING id INTO v_room_id;

  -- Automatically register host in room_players
  INSERT INTO room_players (
    room_id, user_id, display_name, status, is_host
  )
  VALUES (
    v_room_id, v_host_id, v_host_name, 'joined', TRUE
  );

  -- Log audit event
  INSERT INTO audit_logs (user_id, action, target_type, target_id, metadata)
  VALUES (v_host_id, 'CREATE_ROOM', 'room', v_room_id, jsonb_build_object('join_code', v_join_code));

  v_result := jsonb_build_object(
    'room_id', v_room_id,
    'join_code', v_join_code,
    'title', p_title,
    'status', 'lobby'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_room TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. FUNCTION: start_game_round
-- Description: Starts a round with DB-authoritative timestamps & shuffles options
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.start_game_round(
  p_game_session_id UUID,
  p_question_id UUID,
  p_round_number INT,
  p_duration_seconds INT DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
  v_game_round_id UUID;
  v_start_time TIMESTAMPTZ := NOW();
  v_deadline TIMESTAMPTZ;
  v_room_id UUID;
  v_player RECORD;
  v_option RECORD;
  v_pos INT;
  v_result JSONB;
BEGIN
  -- Validate caller is host
  SELECT room_id INTO v_room_id FROM game_sessions WHERE id = p_game_session_id;
  IF NOT public.is_room_host(v_room_id) THEN
    RAISE EXCEPTION 'Only the room host can start game rounds';
  END IF;

  v_deadline := v_start_time + (p_duration_seconds || ' seconds')::interval;

  -- Insert game_round
  INSERT INTO game_rounds (
    game_session_id, question_id, round_number, started_at, deadline_at, status
  )
  VALUES (
    p_game_session_id, p_question_id, p_round_number, v_start_time, v_deadline, 'active'
  )
  RETURNING id INTO v_game_round_id;

  -- Populate per-player randomized option mappings (round_player_options)
  FOR v_player IN 
    SELECT id FROM room_players WHERE room_id = v_room_id AND status IN ('joined', 'ready', 'playing')
  LOOP
    v_pos := 1;
    FOR v_option IN 
      SELECT id FROM question_options WHERE question_id = p_question_id ORDER BY random()
    LOOP
      INSERT INTO round_player_options (
        game_round_id, room_player_id, option_id, displayed_position
      )
      VALUES (
        v_game_round_id, v_player.id, v_option.id, v_pos
      );
      v_pos := v_pos + 1;
    END LOOP;
  END LOOP;

  -- Log event for Realtime broadcast
  INSERT INTO game_events (room_id, game_session_id, event_type, payload)
  VALUES (
    v_room_id, p_game_session_id, 'ROUND_STARTED',
    jsonb_build_object(
      'game_round_id', v_game_round_id,
      'round_number', p_round_number,
      'started_at', v_start_time,
      'deadline_at', v_deadline
    )
  );

  v_result := jsonb_build_object(
    'game_round_id', v_game_round_id,
    'round_number', p_round_number,
    'started_at', v_start_time,
    'deadline_at', v_deadline,
    'status', 'active'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.start_game_round TO authenticated;

-- ----------------------------------------------------------------------------
-- 3. FUNCTION: submit_game_answer
-- Description: Accepts at most 1 answer per player per round, enforcing strict DB deadline
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_game_answer(
  p_game_round_id UUID,
  p_selected_option_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_round RECORD;
  v_room_player_id UUID;
  v_submittal_time TIMESTAMPTZ := NOW();
  v_user_id UUID := auth.uid();
  v_latency_ms INT;
BEGIN
  -- Fetch round details
  SELECT gr.id, gr.deadline_at, gr.started_at, gr.status, gs.room_id
  INTO v_round
  FROM game_rounds gr
  JOIN game_sessions gs ON gs.id = gr.game_session_id
  WHERE gr.id = p_game_round_id;

  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Specified game round does not exist';
  END IF;

  IF v_round.status != 'active' THEN
    RAISE EXCEPTION 'Game round is not active for answer submission';
  END IF;

  -- CRITICAL SECURITY CHECK: Enforce database authoritative deadline
  IF v_submittal_time > v_round.deadline_at THEN
    RAISE EXCEPTION 'Answer rejected: Round deadline has passed (Submittal: %, Deadline: %)',
      v_submittal_time, v_round.deadline_at;
  END IF;

  -- Find player record
  SELECT id INTO v_room_player_id
  FROM room_players
  WHERE room_id = v_round.room_id AND (user_id = v_user_id OR auth.role() = 'anon');

  IF v_room_player_id IS NULL THEN
    RAISE EXCEPTION 'Player is not registered in this room';
  END IF;

  v_latency_ms := EXTRACT(MILLISECONDS FROM (v_submittal_time - v_round.started_at))::INT;

  -- Insert answer (UNIQUE constraint uq_player_round_answer prevents duplicate answers!)
  INSERT INTO game_answers (
    game_round_id, room_player_id, selected_option_id, submitted_at, client_latency_ms
  )
  VALUES (
    p_game_round_id, v_room_player_id, p_selected_option_id, v_submittal_time, v_latency_ms
  );

  RETURN jsonb_build_object(
    'status', 'accepted',
    'submitted_at', v_submittal_time,
    'round_id', p_game_round_id
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Duplicate answer submission rejected. Only one answer allowed per round.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.submit_game_answer TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. FUNCTION: evaluate_game_round
-- Description: Server-side atomic scoring against secret question_answer_keys
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.evaluate_game_round(p_game_round_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_round RECORD;
  v_answer_key RECORD;
  v_answer RECORD;
  v_is_correct BOOLEAN;
  v_base_points INT;
  v_speed_bonus INT;
  v_total_score INT;
  v_eval_count INT := 0;
  v_max_duration_ms INT;
BEGIN
  -- Fetch round details
  SELECT gr.*, gs.room_id
  INTO v_round
  FROM game_rounds gr
  JOIN game_sessions gs ON gs.id = gr.game_session_id
  WHERE gr.id = p_game_round_id;

  IF NOT public.is_room_host(v_round.room_id) THEN
    RAISE EXCEPTION 'Only the host can trigger round evaluation';
  END IF;

  -- Update round status to evaluating
  UPDATE game_rounds SET status = 'evaluating' WHERE id = p_game_round_id;

  -- Get secret answer key
  SELECT correct_option_id, points
  INTO v_answer_key
  FROM question_answer_keys
  WHERE question_id = v_round.question_id;

  v_max_duration_ms := EXTRACT(MILLISECONDS FROM (v_round.deadline_at - v_round.started_at))::INT;
  IF v_max_duration_ms <= 0 THEN v_max_duration_ms := 30000; END IF;

  -- Evaluate each submitted answer
  FOR v_answer IN
    SELECT * FROM game_answers WHERE game_round_id = p_game_round_id
  LOOP
    v_is_correct := (v_answer.selected_option_id = v_answer_key.correct_option_id);
    
    IF v_is_correct THEN
      v_base_points := COALESCE(v_answer_key.points, 10);
      -- Speed bonus formula: up to 50% bonus for instant answer, decaying over duration
      v_speed_bonus := GREATEST(0, ROUND(v_base_points * 0.5 * (1.0 - (v_answer.client_latency_ms::numeric / v_max_duration_ms::numeric))))::INT;
      v_total_score := v_base_points + v_speed_bonus;
    ELSE
      v_base_points := 0;
      v_speed_bonus := 0;
      v_total_score := 0;
    END IF;

    INSERT INTO round_results (
      game_round_id, room_player_id, selected_option_id, is_correct, score_awarded, speed_bonus, response_time_ms
    )
    VALUES (
      p_game_round_id, v_answer.room_player_id, v_answer.selected_option_id, v_is_correct, v_total_score, v_speed_bonus, v_answer.client_latency_ms
    )
    ON CONFLICT (game_round_id, room_player_id) DO UPDATE SET
      is_correct = EXCLUDED.is_correct,
      score_awarded = EXCLUDED.score_awarded,
      speed_bonus = EXCLUDED.speed_bonus;

    v_eval_count := v_eval_count + 1;
  END LOOP;

  -- Mark round as completed
  UPDATE game_rounds SET status = 'completed', ended_at = NOW() WHERE id = p_game_round_id;

  -- Emit event
  INSERT INTO game_events (room_id, game_session_id, event_type, payload)
  VALUES (
    v_round.room_id, v_round.game_session_id, 'ROUND_EVALUATED',
    jsonb_build_object('game_round_id', p_game_round_id, 'evaluated_players', v_eval_count)
  );

  RETURN jsonb_build_object(
    'status', 'completed',
    'game_round_id', p_game_round_id,
    'evaluated_players', v_eval_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.evaluate_game_round TO authenticated;
