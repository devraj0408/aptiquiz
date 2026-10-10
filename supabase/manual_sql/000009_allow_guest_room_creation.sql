-- ============================================================================
-- AptiQuiz Manual SQL Migration 000009: Fix RLS Infinite Recursion & Allow Guest Rooms
-- Description: Fixes circular RLS policy recursion between rooms and room_players,
--              makes rooms.host_id nullable for guest hosts, and enables Realtime.
-- ============================================================================

-- 1. Allow rooms.host_id to be NULL for guest-created rooms
ALTER TABLE public.rooms ALTER COLUMN host_id DROP NOT NULL;

-- 2. Drop all old recursive policies on rooms table
DROP POLICY IF EXISTS "Rooms readable by players in room or host" ON public.rooms;
DROP POLICY IF EXISTS "Hosts can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Hosts can update room parameters" ON public.rooms;
DROP POLICY IF EXISTS "Allow room creation for hosts and testing guests" ON public.rooms;
DROP POLICY IF EXISTS "Allow room status updates by room host or players" ON public.rooms;

-- 3. Drop all old recursive policies on room_players table
DROP POLICY IF EXISTS "Room players viewable by fellow room members" ON public.room_players;
DROP POLICY IF EXISTS "Users or guests can join rooms" ON public.room_players;

-- ----------------------------------------------------------------------------
-- 4. NON-RECURSIVE ROOMS RLS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Rooms readable by all users and guests"
ON public.rooms FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Rooms insertable by all users and guests"
ON public.rooms FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Rooms updatable by all users and guests"
ON public.rooms FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. NON-RECURSIVE ROOM_PLAYERS RLS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Room players readable by all users and guests"
ON public.room_players FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Room players insertable by all users and guests"
ON public.room_players FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Room players updatable by all users and guests"
ON public.room_players FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. ENABLE SUPABASE REALTIME REPLICATION
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'room_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
  END IF;
END $$;
