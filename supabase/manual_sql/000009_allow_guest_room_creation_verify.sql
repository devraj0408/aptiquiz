-- ============================================================================
-- AptiQuiz Manual SQL Verification Script: Migration 000009
-- Read-only verification script for checking guest room RLS and Realtime setup.
-- ============================================================================

-- 1. Check if rooms.host_id is nullable
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'host_id';

-- 2. Check active RLS policies on rooms and room_players
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('rooms', 'room_players')
ORDER BY tablename, policyname;

-- 3. Check tables added to supabase_realtime publication
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename IN ('rooms', 'room_players');
