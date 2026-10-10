-- ============================================================================
-- AptiQuiz Manual SQL Verification Script: Migration 000010
-- Read-only verification script for auditing question set RLS policies.
-- ============================================================================

-- 1. Verify question_sets.created_by nullability
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'question_sets' AND column_name = 'created_by';

-- 2. Check active RLS policies on question_sets, questions, question_options, question_answer_keys
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('question_sets', 'questions', 'question_options', 'question_answer_keys')
ORDER BY tablename, policyname;
