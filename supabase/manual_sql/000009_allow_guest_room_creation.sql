-- ============================================================================
-- AptiQuiz Manual SQL Migration 000009: Allow Guest Room Creation & RLS Updates
-- Description: Makes rooms.host_id nullable so unauthenticated guest hosts can
--              create rooms in Testing Mode and persist cross-device sessions.
-- ============================================================================

-- 1. Allow rooms.host_id to be NULL for guest-created rooms
ALTER TABLE public.rooms ALTER COLUMN host_id DROP NOT NULL;

-- 2. Update rooms INSERT RLS policy to allow anon & authenticated room creation
DROP POLICY IF EXISTS "Hosts can create rooms" ON public.rooms;

CREATE POLICY "Allow room creation for hosts and testing guests"
ON public.rooms FOR INSERT
TO anon, authenticated
WITH CHECK (
  host_id IS NULL OR host_id = auth.uid()
);

-- 3. Update rooms UPDATE RLS policy to allow hosts and room players to update room status (e.g. launching game)
DROP POLICY IF EXISTS "Hosts can update room parameters" ON public.rooms;

CREATE POLICY "Allow room status updates by room host or players"
ON public.rooms FOR UPDATE
TO anon, authenticated
USING (
  host_id IS NULL 
  OR host_id = auth.uid()
  OR EXISTS (SELECT 1 FROM room_players WHERE room_id = rooms.id AND is_host = true)
)
WITH CHECK (
  host_id IS NULL 
  OR host_id = auth.uid()
  OR EXISTS (SELECT 1 FROM room_players WHERE room_id = rooms.id AND is_host = true)
);

-- 4. Enable Supabase Realtime replication for rooms and room_players tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
