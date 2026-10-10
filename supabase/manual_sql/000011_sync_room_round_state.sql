-- ============================================================================
-- AptiQuiz Manual SQL Migration 000011: Room Round Synchronization
-- Description: Adds current_round_index column to public.rooms table and ensures
--              it is included in supabase_realtime publication for cross-device sync.
-- ============================================================================

-- 1. Add current_round_index to public.rooms table if not present
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS current_round_index INT NOT NULL DEFAULT 0;

-- 2. Ensure public.rooms is in supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
END $$;
