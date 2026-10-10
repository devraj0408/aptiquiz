-- ============================================================================
-- AptiQuiz Supabase Migration 000006: Revoke Direct Grants on Question Answer Keys
-- Description: Strictly revokes all direct table-level privileges (SELECT, INSERT,
--              UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER) on question_answer_keys
--              from PUBLIC, anon, and authenticated roles. Preserves existing RLS policies
--              and function definitions.
-- ============================================================================

-- Revoke direct table privileges on secret answer keys from browser-facing roles
REVOKE ALL PRIVILEGES ON TABLE public.question_answer_keys FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.question_answer_keys FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.question_answer_keys FROM authenticated;
