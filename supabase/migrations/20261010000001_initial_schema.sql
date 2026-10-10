-- ============================================================================
-- AptiQuiz Supabase Migration 000001: Initial Core Schema
-- Description: Establishes all 21 domain tables with UUID PKs, FKs,
--              NOT NULL, CHECK, UNIQUE constraints, indexes and timestamps.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')) DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically sync new auth.users into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. COLLEGES
-- ----------------------------------------------------------------------------
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (char_length(trim(name)) >= 2),
  code TEXT NOT NULL UNIQUE CHECK (char_length(trim(code)) >= 2),
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_colleges_updated_at
BEFORE UPDATE ON colleges
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. COLLEGE_MEMBERSHIPS
-- ----------------------------------------------------------------------------
CREATE TABLE college_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role TEXT NOT NULL CHECK (role IN ('member', 'lead', 'faculty_advisor')) DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_college_user UNIQUE (college_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 4. QUESTION_SETS
-- ----------------------------------------------------------------------------
CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_question_sets_updated_at
BEFORE UPDATE ON question_sets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5. QUESTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL CHECK (char_length(trim(prompt)) >= 5),
  explanation TEXT, -- Private explanation revealed post-round
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. QUESTION_OPTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL, -- e.g. 'A', 'B', 'C', 'D'
  option_text TEXT NOT NULL CHECK (char_length(trim(option_text)) >= 1),
  order_index INT NOT NULL DEFAULT 0 CHECK (order_index >= 0),
  CONSTRAINT uq_question_option_key UNIQUE (question_id, option_key)
);

-- ----------------------------------------------------------------------------
-- 7. QUESTION_ANSWER_KEYS (SECRET - INACCESSIBLE TO CLIENT RLS)
-- ----------------------------------------------------------------------------
CREATE TABLE question_answer_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL UNIQUE REFERENCES questions(id) ON DELETE CASCADE,
  correct_option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  points INT NOT NULL DEFAULT 10 CHECK (points > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. ROOMS (CIRCULAR DEPENDENCY SOLVED BY DEFERRED FK)
-- ----------------------------------------------------------------------------
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  join_code TEXT NOT NULL UNIQUE CHECK (join_code ~ '^[A-Z0-9]{6}$'),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_set_id UUID REFERENCES question_sets(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('lobby', 'in_game', 'paused', 'completed')) DEFAULT 'lobby',
  game_mode TEXT NOT NULL CHECK (game_mode IN ('Standard', 'Pressure Cooker', 'Team Relay')) DEFAULT 'Standard',
  max_players INT NOT NULL DEFAULT 50 CHECK (max_players >= 2 AND max_players <= 200),
  time_per_question_sec INT NOT NULL DEFAULT 30 CHECK (time_per_question_sec >= 10 AND time_per_question_sec <= 300),
  current_game_session_id UUID, -- Foreign key added after game_sessions table creation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 9. ROOM_PLAYERS
-- ----------------------------------------------------------------------------
CREATE TABLE room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 2),
  college_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('joined', 'ready', 'playing', 'disconnected', 'left')) DEFAULT 'joined',
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_room_user UNIQUE (room_id, user_id),
  CONSTRAINT uq_room_display_name UNIQUE (room_id, display_name)
);

-- ----------------------------------------------------------------------------
-- 10. GAME_SESSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  started_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  total_rounds INT NOT NULL CHECK (total_rounds > 0),
  current_round_index INT NOT NULL DEFAULT 0 CHECK (current_round_index >= 0),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'aborted')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Circular dependency resolution for rooms.current_game_session_id
ALTER TABLE rooms
  ADD CONSTRAINT fk_rooms_current_game_session
  FOREIGN KEY (current_game_session_id)
  REFERENCES game_sessions(id)
  ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 11. GAME_ROUNDS
-- ----------------------------------------------------------------------------
CREATE TABLE game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  round_number INT NOT NULL CHECK (round_number > 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline_at TIMESTAMPTZ NOT NULL, -- Database authoritative deadline
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'evaluating', 'completed')) DEFAULT 'pending',
  CONSTRAINT uq_session_round_number UNIQUE (game_session_id, round_number),
  CONSTRAINT chk_deadline_after_start CHECK (deadline_at > started_at)
);

-- ----------------------------------------------------------------------------
-- 12. ROUND_PLAYER_OPTIONS (PER-PLAYER SHUFFLED OPTION MAPS)
-- ----------------------------------------------------------------------------
CREATE TABLE round_player_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  room_player_id UUID NOT NULL REFERENCES room_players(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  displayed_position INT NOT NULL CHECK (displayed_position >= 1 AND displayed_position <= 10),
  CONSTRAINT uq_round_player_option UNIQUE (game_round_id, room_player_id, option_id),
  CONSTRAINT uq_round_player_position UNIQUE (game_round_id, room_player_id, displayed_position)
);

-- ----------------------------------------------------------------------------
-- 13. GAME_ANSWERS (AT MOST ONE ANSWER PER PLAYER PER ROUND)
-- ----------------------------------------------------------------------------
CREATE TABLE game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  room_player_id UUID NOT NULL REFERENCES room_players(id) ON DELETE CASCADE,
  selected_option_id UUID NOT NULL REFERENCES question_options(id) ON DELETE RESTRICT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Database authoritative submission timestamp
  client_latency_ms INT CHECK (client_latency_ms >= 0),
  CONSTRAINT uq_player_round_answer UNIQUE (game_round_id, room_player_id)
);

-- ----------------------------------------------------------------------------
-- 14. ROUND_RESULTS
-- ----------------------------------------------------------------------------
CREATE TABLE round_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  room_player_id UUID NOT NULL REFERENCES room_players(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  score_awarded INT NOT NULL DEFAULT 0 CHECK (score_awarded >= 0),
  speed_bonus INT NOT NULL DEFAULT 0 CHECK (speed_bonus >= 0),
  response_time_ms INT CHECK (response_time_ms >= 0),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_round_player_result UNIQUE (game_round_id, room_player_id)
);

-- ----------------------------------------------------------------------------
-- 15. GAME_TEAMS
-- ----------------------------------------------------------------------------
CREATE TABLE game_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_room_team_name UNIQUE (room_id, name)
);

-- ----------------------------------------------------------------------------
-- 16. TEAM_MEMBERSHIPS
-- ----------------------------------------------------------------------------
CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES game_teams(id) ON DELETE CASCADE,
  room_player_id UUID NOT NULL REFERENCES room_players(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('captain', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_team_player UNIQUE (team_id, room_player_id),
  CONSTRAINT uq_player_single_team UNIQUE (room_player_id)
);

-- ----------------------------------------------------------------------------
-- 17. TEAM_ROUND_RESULTS
-- ----------------------------------------------------------------------------
CREATE TABLE team_round_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES game_teams(id) ON DELETE CASCADE,
  aggregate_score INT NOT NULL DEFAULT 0 CHECK (aggregate_score >= 0),
  multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (multiplier >= 0.50 AND multiplier <= 5.00),
  CONSTRAINT uq_round_team_result UNIQUE (game_round_id, team_id)
);

-- ----------------------------------------------------------------------------
-- 18. LEAGUE_SEASONS
-- ----------------------------------------------------------------------------
CREATE TABLE league_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_season_dates CHECK (end_date >= start_date)
);

-- ----------------------------------------------------------------------------
-- 19. LEAGUE_STANDINGS
-- ----------------------------------------------------------------------------
CREATE TABLE league_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES league_seasons(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  matches_played INT NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
  matches_won INT NOT NULL DEFAULT 0 CHECK (matches_won >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_season_college UNIQUE (season_id, college_id)
);

CREATE TRIGGER update_league_standings_updated_at
BEFORE UPDATE ON league_standings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 20. GAME_EVENTS (AUDIT LOG FOR REALTIME & SYNC)
-- ----------------------------------------------------------------------------
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 21. AUDIT_LOGS (SECURITY & PRIVILEGED ACTIONS)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_rooms_join_code ON rooms(join_code);
CREATE INDEX idx_rooms_host_status ON rooms(host_id, status);
CREATE INDEX idx_room_players_room_status ON room_players(room_id, status);
CREATE INDEX idx_room_players_user ON room_players(user_id);
CREATE INDEX idx_questions_set_id ON questions(question_set_id, order_index);
CREATE INDEX idx_question_options_question ON question_options(question_id, order_index);
CREATE INDEX idx_question_answer_keys_question ON question_answer_keys(question_id);
CREATE INDEX idx_game_rounds_session ON game_rounds(game_session_id, round_number);
CREATE INDEX idx_game_answers_round_player ON game_answers(game_round_id, room_player_id);
CREATE INDEX idx_round_results_round_player ON round_results(game_round_id, room_player_id);
CREATE INDEX idx_game_events_room ON game_events(room_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
