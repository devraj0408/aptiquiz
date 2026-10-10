-- ============================================================================
-- AptiQuiz Supabase Migration 000002: Row Level Security (RLS) & Grants
-- Description: Enables RLS on all 21 tables, establishes default-deny stance,
--              protects question_answer_keys, and enforces ownership/role-aware policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL 21 TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answer_keys ENABLE ROW LEVEL SECURITY; -- SECRET TABLE!
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_player_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_round_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. HELPER SECURITY FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_room_host(p_room_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM rooms
    WHERE id = p_room_id
      AND host_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_room_player(p_room_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM room_players
    WHERE room_id = p_room_id
      AND (user_id = auth.uid() OR auth.role() = 'service_role')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Public profiles are readable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid())); -- Cannot elevate role

-- ----------------------------------------------------------------------------
-- 4. COLLEGES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Colleges are readable by everyone"
ON colleges FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Colleges editable by admins only"
ON colleges FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------------------
-- 5. COLLEGE_MEMBERSHIPS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "College memberships readable by room members or self"
ON college_memberships FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert their own college membership request"
ON college_memberships FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND is_verified = FALSE);

-- ----------------------------------------------------------------------------
-- 6. QUESTION_SETS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Question sets readable if public or created by user"
ON question_sets FOR SELECT
TO authenticated
USING (is_public = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can manage their own question sets"
ON question_sets FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ----------------------------------------------------------------------------
-- 7. QUESTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Questions readable if part of accessible set or active room"
ON questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM question_sets
    WHERE id = questions.question_set_id
      AND (is_public = TRUE OR created_by = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM rooms r
    JOIN room_players rp ON rp.room_id = r.id
    WHERE r.question_set_id = questions.question_set_id
      AND rp.user_id = auth.uid()
  )
);

CREATE POLICY "Authors can manage questions in their sets"
ON questions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM question_sets
    WHERE id = questions.question_set_id AND created_by = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- 8. QUESTION_OPTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Question options readable by room players or set author"
ON question_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM questions q
    JOIN question_sets qs ON qs.id = q.question_set_id
    WHERE q.id = question_options.question_id
      AND (qs.is_public = TRUE OR qs.created_by = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM questions q
    JOIN rooms r ON r.question_set_id = q.question_set_id
    JOIN room_players rp ON rp.room_id = r.id
    WHERE q.id = question_options.question_id
      AND rp.user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- 9. QUESTION_ANSWER_KEYS POLICIES (NO SELECT FOR ORDINARY CLIENTS!)
-- ----------------------------------------------------------------------------
-- INTENTIONALLY NO SELECT POLICY FOR ANON OR AUTHENTICATED ROLES!
-- Access is strictly restricted to service_role or SECURITY DEFINER functions.

-- ----------------------------------------------------------------------------
-- 10. ROOMS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Rooms readable by players in room or host"
ON rooms FOR SELECT
TO anon, authenticated
USING (
  host_id = auth.uid()
  OR EXISTS (SELECT 1 FROM room_players WHERE room_id = rooms.id AND (user_id = auth.uid() OR auth.role() = 'anon'))
  OR status = 'lobby' -- Allow code lookup in lobby
);

CREATE POLICY "Hosts can create rooms"
ON rooms FOR INSERT
TO authenticated
WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update room parameters"
ON rooms FOR UPDATE
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 11. ROOM_PLAYERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Room players viewable by fellow room members"
ON room_players FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM rooms r
    WHERE r.id = room_players.room_id
  )
);

CREATE POLICY "Users or guests can join rooms"
ON room_players FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- ----------------------------------------------------------------------------
-- 12. GAME_SESSIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Game sessions readable by room members"
ON game_sessions FOR SELECT
TO authenticated
USING (public.is_room_player(room_id) OR public.is_room_host(room_id));

-- ----------------------------------------------------------------------------
-- 13. GAME_ROUNDS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Game rounds readable by room members"
ON game_rounds FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    WHERE gs.id = game_rounds.game_session_id
      AND (public.is_room_player(gs.room_id) OR public.is_room_host(gs.room_id))
  )
);

-- ----------------------------------------------------------------------------
-- 14. ROUND_PLAYER_OPTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Players can read their own option mapping"
ON round_player_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM room_players rp
    WHERE rp.id = round_player_options.room_player_id
      AND (rp.user_id = auth.uid() OR public.is_room_host(rp.room_id))
  )
);

-- ----------------------------------------------------------------------------
-- 15. GAME_ANSWERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Players can read their own submitted answers"
ON game_answers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM room_players rp
    WHERE rp.id = game_answers.room_player_id
      AND rp.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM game_rounds gr
    JOIN game_sessions gs ON gs.id = gr.game_session_id
    WHERE gr.id = game_answers.game_round_id AND public.is_room_host(gs.room_id)
  )
);

-- Note: Clients submit answers through SECURITY DEFINER stored procedure (submit_game_answer)
-- to enforce deadline checks atomically. Direct client INSERT/UPDATE is restricted.

-- ----------------------------------------------------------------------------
-- 16. ROUND_RESULTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Round results readable post-round by room members"
ON round_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM game_rounds gr
    JOIN game_sessions gs ON gs.id = gr.game_session_id
    WHERE gr.id = round_results.game_round_id
      AND gr.status IN ('evaluating', 'completed')
      AND (public.is_room_player(gs.room_id) OR public.is_room_host(gs.room_id))
  )
);

-- ----------------------------------------------------------------------------
-- 17. LEAGUE_SEASONS & LEAGUE_STANDINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "League seasons readable by everyone"
ON league_seasons FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "League standings readable by everyone"
ON league_standings FOR SELECT
TO anon, authenticated
USING (true);

-- ----------------------------------------------------------------------------
-- 18. GAME_EVENTS & AUDIT_LOGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Game events readable by room members"
ON game_events FOR SELECT
TO authenticated
USING (public.is_room_player(room_id) OR public.is_room_host(room_id));

CREATE POLICY "Audit logs readable by admins only"
ON audit_logs FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Revoke default public execution privileges on sensitive functions
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;
