-- ============================================================================
-- AptiQuiz Supabase Migration 000005: Security & Correctness Hardening
-- Description: Adds guest_token_hash to room_players, hardens search_path on all
--              SECURITY DEFINER functions, enforces strict option mapping checks,
--              concurrency locks, interval-bounded speed scoring, and idempotent evaluation.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHEMA HARDENING: GUEST PLAYER CREDENTIAL TOKEN HASH
-- ----------------------------------------------------------------------------
ALTER TABLE room_players
  ADD COLUMN IF NOT EXISTS guest_token_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_room_players_guest_token 
  ON room_players(room_id, guest_token_hash) 
  WHERE guest_token_hash IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. HARDENED FUNCTION: join_room_as_guest
-- Description: Registers an unauthenticated guest player with a secure token credential
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_room_as_guest(
  p_join_code TEXT,
  p_display_name TEXT,
  p_college_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_room RECORD;
  v_guest_token TEXT;
  v_token_hash TEXT;
  v_room_player_id UUID;
  v_clean_name TEXT;
BEGIN
  v_clean_name := trim(p_display_name);
  IF char_length(v_clean_name) < 2 THEN
    RAISE EXCEPTION 'Display name must be at least 2 characters long';
  END IF;

  SELECT id, status, max_players INTO v_room
  FROM rooms
  WHERE join_code = upper(trim(p_join_code));

  IF v_room.id IS NULL THEN
    RAISE EXCEPTION 'Invalid join code: Room not found';
  END IF;

  IF v_room.status != 'lobby' THEN
    RAISE EXCEPTION 'Cannot join room: Competition has already started or ended';
  END IF;

  IF (SELECT count(*) FROM room_players WHERE room_id = v_room.id AND status IN ('joined', 'ready', 'playing')) >= v_room.max_players THEN
    RAISE EXCEPTION 'Room has reached maximum player capacity (%)', v_room.max_players;
  END IF;

  -- Generate 32-byte secure random guest token hex string
  v_guest_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_guest_token, 'sha256'), 'hex');

  INSERT INTO room_players (
    room_id, user_id, display_name, college_name, status, is_host, guest_token_hash
  )
  VALUES (
    v_room.id, NULL, v_clean_name, p_college_name, 'joined', FALSE, v_token_hash
  )
  RETURNING id INTO v_room_player_id;

  RETURN jsonb_build_object(
    'room_player_id', v_room_player_id,
    'room_id', v_room.id,
    'display_name', v_clean_name,
    'guest_token', v_guest_token
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Display name "%" is already taken in this room. Please choose another.', v_clean_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.join_room_as_guest(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_room_as_guest(text, text, text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. HARDENED FUNCTION: create_room
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
  v_host_id UUID := auth.uid();
  v_host_name TEXT;
  v_attempts INT := 0;
  v_clean_title TEXT;
BEGIN
  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a room';
  END IF;

  v_clean_title := trim(p_title);
  IF char_length(v_clean_title) < 3 THEN
    RAISE EXCEPTION 'Room title must be at least 3 characters long';
  END IF;

  IF p_max_players < 2 OR p_max_players > 200 THEN
    RAISE EXCEPTION 'Max players must be between 2 and 200';
  END IF;

  IF p_time_per_question_sec < 10 OR p_time_per_question_sec > 300 THEN
    RAISE EXCEPTION 'Time per question must be between 10 and 300 seconds';
  END IF;

  IF p_game_mode NOT IN ('Standard', 'Pressure Cooker', 'Team Relay') THEN
    RAISE EXCEPTION 'Invalid game mode specified';
  END IF;

  -- Validate question set ownership or public access
  IF p_question_set_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM question_sets
      WHERE id = p_question_set_id AND (is_public = TRUE OR created_by = v_host_id)
    ) THEN
      RAISE EXCEPTION 'Access denied: Question set is private or does not exist';
    END IF;
  END IF;

  SELECT full_name INTO v_host_name FROM profiles WHERE id = v_host_id;
  IF v_host_name IS NULL THEN v_host_name := 'Host'; END IF;

  -- Generate unique 6-character room join code
  LOOP
    v_join_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    v_attempts := v_attempts + 1;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM rooms WHERE join_code = v_join_code AND status != 'completed');
    IF v_attempts > 20 THEN
      RAISE EXCEPTION 'Failed to generate a unique room code after 20 attempts';
    END IF;
  END LOOP;

  INSERT INTO rooms (
    join_code, title, host_id, question_set_id, game_mode, max_players, time_per_question_sec, status
  )
  VALUES (
    v_join_code, v_clean_title, v_host_id, p_question_set_id, p_game_mode, p_max_players, p_time_per_question_sec, 'lobby'
  )
  RETURNING id INTO v_room_id;

  INSERT INTO room_players (
    room_id, user_id, display_name, status, is_host
  )
  VALUES (
    v_room_id, v_host_id, v_host_name, 'joined', TRUE
  );

  INSERT INTO audit_logs (user_id, action, target_type, target_id, metadata)
  VALUES (v_host_id, 'CREATE_ROOM', 'room', v_room_id, jsonb_build_object('join_code', v_join_code));

  RETURN jsonb_build_object(
    'room_id', v_room_id,
    'join_code', v_join_code,
    'title', v_clean_title,
    'status', 'lobby'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.create_room(text, uuid, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_room(text, uuid, text, integer, integer) TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. HARDENED FUNCTION: start_game_round
-- Description: Validates no overlapping active rounds, locks session, populates option mappings
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
  v_start_time TIMESTAMPTZ := clock_timestamp();
  v_deadline TIMESTAMPTZ;
  v_session RECORD;
  v_player RECORD;
  v_option RECORD;
  v_pos INT;
BEGIN
  -- Lock game_session row to prevent concurrent round starts
  SELECT gs.*, r.host_id INTO v_session
  FROM game_sessions gs
  JOIN rooms r ON r.id = gs.room_id
  WHERE gs.id = p_game_session_id
  FOR UPDATE;

  IF v_session.id IS NULL THEN
    RAISE EXCEPTION 'Game session not found';
  END IF;

  IF v_session.host_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Only the room host can start game rounds';
  END IF;

  IF v_session.status != 'active' THEN
    RAISE EXCEPTION 'Cannot start round: Game session is not active';
  END IF;

  IF p_round_number < 1 OR p_round_number > v_session.total_rounds THEN
    RAISE EXCEPTION 'Invalid round number: Must be between 1 and total session rounds (%)', v_session.total_rounds;
  END IF;

  IF p_duration_seconds < 10 OR p_duration_seconds > 300 THEN
    RAISE EXCEPTION 'Round duration must be between 10 and 300 seconds';
  END IF;

  -- CRITICAL VALIDATION: Prevent overlapping active or evaluating rounds
  IF EXISTS (
    SELECT 1 FROM game_rounds
    WHERE game_session_id = p_game_session_id
      AND status IN ('active', 'evaluating')
  ) THEN
    RAISE EXCEPTION 'Cannot start new round: An active or evaluating round is already in progress';
  END IF;

  -- Validate question exists
  IF NOT EXISTS (SELECT 1 FROM questions WHERE id = p_question_id) THEN
    RAISE EXCEPTION 'Question % does not exist', p_question_id;
  END IF;

  v_deadline := v_start_time + (p_duration_seconds || ' seconds')::interval;

  INSERT INTO game_rounds (
    game_session_id, question_id, round_number, started_at, deadline_at, status
  )
  VALUES (
    p_game_session_id, p_question_id, p_round_number, v_start_time, v_deadline, 'active'
  )
  RETURNING id INTO v_game_round_id;

  -- Generate per-player randomized option mappings
  FOR v_player IN 
    SELECT id FROM room_players WHERE room_id = v_session.room_id AND status IN ('joined', 'ready', 'playing')
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

  -- Update session current round index
  UPDATE game_sessions SET current_round_index = p_round_number WHERE id = p_game_session_id;

  -- Broadcast event
  INSERT INTO game_events (room_id, game_session_id, event_type, payload)
  VALUES (
    v_session.room_id, p_game_session_id, 'ROUND_STARTED',
    jsonb_build_object(
      'game_round_id', v_game_round_id,
      'round_number', p_round_number,
      'started_at', v_start_time,
      'deadline_at', v_deadline
    )
  );

  RETURN jsonb_build_object(
    'game_round_id', v_game_round_id,
    'round_number', p_round_number,
    'started_at', v_start_time,
    'deadline_at', v_deadline,
    'status', 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.start_game_round(uuid, uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_game_round(uuid, uuid, integer, integer) TO authenticated;

-- ----------------------------------------------------------------------------
-- 5. HARDENED FUNCTION: submit_game_answer
-- Description: Validates guest/auth credentials, option mapping, deadline, and prevents duplicate answers
-- ----------------------------------------------------------------------------

-- Drop legacy 2-argument overload from migration 000003 to prevent ambiguity & lingering obsolete function
DROP FUNCTION IF EXISTS public.submit_game_answer(uuid, uuid);

CREATE OR REPLACE FUNCTION public.submit_game_answer(
  p_game_round_id UUID,
  p_selected_option_id UUID,
  p_guest_token TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_round RECORD;
  v_room_player_id UUID;
  v_submittal_time TIMESTAMPTZ := clock_timestamp();
  v_user_id UUID := auth.uid();
  v_latency_ms INT;
  v_token_hash TEXT;
BEGIN
  -- Lock game_round for share to ensure status consistency
  SELECT gr.id, gr.game_session_id, gr.question_id, gr.deadline_at, gr.started_at, gr.status, gs.room_id
  INTO v_round
  FROM game_rounds gr
  JOIN game_sessions gs ON gs.id = gr.game_session_id
  WHERE gr.id = p_game_round_id
  FOR SHARE;

  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Specified game round does not exist';
  END IF;

  IF v_round.status != 'active' THEN
    RAISE EXCEPTION 'Game round is not active for answer submission (Current status: %)', v_round.status;
  END IF;

  -- CRITICAL SECURITY CHECK: Enforce database receipt timestamp against deadline
  IF v_submittal_time > v_round.deadline_at THEN
    RAISE EXCEPTION 'Answer rejected: Round deadline has passed (Receipt time: %, Deadline: %)',
      v_submittal_time, v_round.deadline_at;
  END IF;

  -- SECURE PLAYER CREDENTIAL LOOKUP
  IF v_user_id IS NOT NULL THEN
    -- Authenticated user lookup
    SELECT id INTO v_room_player_id
    FROM room_players
    WHERE room_id = v_round.room_id AND user_id = v_user_id;
  ELSIF p_guest_token IS NOT NULL AND char_length(trim(p_guest_token)) >= 16 THEN
    -- Guest token credential hash lookup
    v_token_hash := encode(digest(trim(p_guest_token), 'sha256'), 'hex');
    SELECT id INTO v_room_player_id
    FROM room_players
    WHERE room_id = v_round.room_id AND guest_token_hash = v_token_hash;
  END IF;

  IF v_room_player_id IS NULL THEN
    RAISE EXCEPTION 'Authentication failed: Invalid credentials or player is not registered in this room';
  END IF;

  -- VALIDATE OPTION BELONGS TO QUESTION
  IF NOT EXISTS (
    SELECT 1 FROM question_options
    WHERE id = p_selected_option_id AND question_id = v_round.question_id
  ) THEN
    RAISE EXCEPTION 'Option validation failed: Option % does not belong to question %',
      p_selected_option_id, v_round.question_id;
  END IF;

  -- VALIDATE OPTION IS IN PLAYER'S GENERATED OPTION MAPPING
  IF NOT EXISTS (
    SELECT 1 FROM round_player_options
    WHERE game_round_id = p_game_round_id
      AND room_player_id = v_room_player_id
      AND option_id = p_selected_option_id
  ) THEN
    RAISE EXCEPTION 'Option validation failed: Option % is not in the assigned option mapping for this player',
      p_selected_option_id;
  END IF;

  v_latency_ms := (EXTRACT(EPOCH FROM (v_submittal_time - v_round.started_at)) * 1000.0)::INT;
  IF v_latency_ms < 0 THEN v_latency_ms := 0; END IF;

  -- INSERT ANSWER (UNIQUE constraint uq_player_round_answer enforces duplicate prevention)
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
    RAISE EXCEPTION 'Duplicate answer submission rejected. Player has already submitted an answer for this round.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.submit_game_answer(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_game_answer(uuid, uuid, text) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. HARDENED FUNCTION: evaluate_game_round
-- Description: Concurrency-safe, idempotent round evaluation with bounded interval scoring
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
  v_max_duration_ms NUMERIC;
  v_response_time_ms NUMERIC;
  v_bounded_response_ms NUMERIC;
  v_speed_ratio NUMERIC;
BEGIN
  -- Lock round with FOR UPDATE to guarantee single-evaluator execution
  SELECT gr.*, gs.room_id
  INTO v_round
  FROM game_rounds gr
  JOIN game_sessions gs ON gs.id = gr.game_session_id
  WHERE gr.id = p_game_round_id
  FOR UPDATE;

  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Game round % does not exist', p_game_round_id;
  END IF;

  IF NOT public.is_room_host(v_round.room_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only the room host can trigger round evaluation';
  END IF;

  -- IDEMPOTENCY CHECK
  IF v_round.status = 'completed' THEN
    RETURN jsonb_build_object(
      'status', 'already_completed',
      'game_round_id', p_game_round_id,
      'message', 'Round was previously evaluated and completed'
    );
  END IF;

  IF v_round.status NOT IN ('active', 'evaluating') THEN
    RAISE EXCEPTION 'Cannot evaluate round in state: %', v_round.status;
  END IF;

  -- Mark status evaluating
  UPDATE game_rounds SET status = 'evaluating' WHERE id = p_game_round_id;

  -- Fetch secret answer key
  SELECT correct_option_id, points
  INTO v_answer_key
  FROM question_answer_keys
  WHERE question_id = v_round.question_id;

  IF v_answer_key.correct_option_id IS NULL THEN
    RAISE EXCEPTION 'Evaluation failed: Secret answer key is missing for question %', v_round.question_id;
  END IF;

  -- Calculate denominator using EXTRACT(EPOCH FROM interval) in milliseconds
  v_max_duration_ms := (EXTRACT(EPOCH FROM (v_round.deadline_at - v_round.started_at)) * 1000.0)::NUMERIC;
  IF v_max_duration_ms <= 0 THEN v_max_duration_ms := 30000.0; END IF;

  -- Evaluate answers
  FOR v_answer IN
    SELECT * FROM game_answers WHERE game_round_id = p_game_round_id
  LOOP
    v_is_correct := (v_answer.selected_option_id = v_answer_key.correct_option_id);

    -- Calculate response time in ms bounded between 0 and total duration
    v_response_time_ms := (EXTRACT(EPOCH FROM (v_answer.submitted_at - v_round.started_at)) * 1000.0)::NUMERIC;
    v_bounded_response_ms := LEAST(GREATEST(0.0, v_response_time_ms), v_max_duration_ms);

    IF v_is_correct THEN
      v_base_points := COALESCE(v_answer_key.points, 10);
      v_speed_ratio := 1.0 - (v_bounded_response_ms / v_max_duration_ms);
      v_speed_bonus := ROUND(v_base_points * 0.5 * v_speed_ratio)::INT;
      IF v_speed_bonus < 0 THEN v_speed_bonus := 0; END IF;
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
      p_game_round_id, v_answer.room_player_id, v_answer.selected_option_id, v_is_correct, v_total_score, v_speed_bonus, v_bounded_response_ms::INT
    )
    ON CONFLICT (game_round_id, room_player_id) DO UPDATE SET
      is_correct = EXCLUDED.is_correct,
      score_awarded = EXCLUDED.score_awarded,
      speed_bonus = EXCLUDED.speed_bonus,
      response_time_ms = EXCLUDED.response_time_ms;

    v_eval_count := v_eval_count + 1;
  END LOOP;

  -- Mark round completed
  UPDATE game_rounds SET status = 'completed', ended_at = clock_timestamp() WHERE id = p_game_round_id;

  -- Broadcast event (prevent duplicate events)
  IF NOT EXISTS (
    SELECT 1 FROM game_events 
    WHERE room_id = v_round.room_id 
      AND event_type = 'ROUND_EVALUATED' 
      AND (payload->>'game_round_id')::text = p_game_round_id::text
  ) THEN
    INSERT INTO game_events (room_id, game_session_id, event_type, payload)
    VALUES (
      v_round.room_id, v_round.game_session_id, 'ROUND_EVALUATED',
      jsonb_build_object('game_round_id', p_game_round_id, 'evaluated_players', v_eval_count)
    );
  END IF;

  RETURN jsonb_build_object(
    'status', 'completed',
    'game_round_id', p_game_round_id,
    'evaluated_players', v_eval_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.evaluate_game_round(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evaluate_game_round(uuid) TO authenticated;
