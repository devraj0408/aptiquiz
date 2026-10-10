-- ============================================================================
-- AptiQuiz Supabase Proposed Migration 000007: Refine Evaluate Game Round Timing & Idempotency
-- Description: Updates evaluate_game_round(uuid) with explicit deadline validation,
--              concurrency serialization (FOR UPDATE), host authorization, and
--              idempotent event generation.
-- ============================================================================

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
  v_active_players INT;
  v_submitted_players INT;
BEGIN
  -- 1. CONCURRENCY SERIALIZATION: Lock round row with FOR UPDATE
  SELECT gr.*, gs.room_id
  INTO v_round
  FROM game_rounds gr
  JOIN game_sessions gs ON gs.id = gr.game_session_id
  WHERE gr.id = p_game_round_id
  FOR UPDATE;

  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Game round % does not exist', p_game_round_id;
  END IF;

  -- 2. HOST AUTHORIZATION CHECK
  IF NOT public.is_room_host(v_round.room_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only the room host can trigger round evaluation';
  END IF;

  -- 3. IDEMPOTENT FINALIZATION CHECK
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

  -- 4. TIMING & DEADLINE VALIDATION
  -- If round is active, allow early evaluation ONLY IF all active players submitted, otherwise require deadline expiration
  IF v_round.status = 'active' AND clock_timestamp() < v_round.deadline_at THEN
    SELECT count(*) INTO v_active_players
    FROM room_players
    WHERE room_id = v_round.room_id AND status IN ('joined', 'ready', 'playing');

    SELECT count(*) INTO v_submitted_players
    FROM game_answers
    WHERE game_round_id = p_game_round_id;

    IF v_submitted_players < v_active_players THEN
      RAISE EXCEPTION 'Evaluation rejected: Round deadline has not passed (% remaining) and not all players have submitted (%/%)',
        (v_round.deadline_at - clock_timestamp()), v_submitted_players, v_active_players;
    END IF;
  END IF;

  -- Transition status to evaluating
  UPDATE game_rounds SET status = 'evaluating' WHERE id = p_game_round_id;

  -- 5. FETCH SECRET ANSWER KEY (Executes via SECURITY DEFINER owner privileges)
  SELECT correct_option_id, points
  INTO v_answer_key
  FROM question_answer_keys
  WHERE question_id = v_round.question_id;

  IF v_answer_key.correct_option_id IS NULL THEN
    RAISE EXCEPTION 'Evaluation failed: Secret answer key missing for question %', v_round.question_id;
  END IF;

  -- 6. DURATION DENOMINATOR (in milliseconds)
  v_max_duration_ms := (EXTRACT(EPOCH FROM (v_round.deadline_at - v_round.started_at)) * 1000.0)::NUMERIC;
  IF v_max_duration_ms <= 0 THEN v_max_duration_ms := 30000.0; END IF;

  -- 7. SCORE EVALUATION LOOP
  FOR v_answer IN
    SELECT * FROM game_answers WHERE game_round_id = p_game_round_id
  LOOP
    v_is_correct := (v_answer.selected_option_id = v_answer_key.correct_option_id);

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

  -- 8. IDEMPOTENT EVENT BROADCAST
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
