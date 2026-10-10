-- ============================================================================
-- AptiQuiz Manual SQL Migration 000010: Custom Question Set Persistence & RLS
-- Description: Makes question_sets.created_by nullable for guest hosts, enables
--              non-recursive RLS policies for question_sets, questions, and options,
--              and allows INSERT-only on question_answer_keys without SELECT exposure.
-- ============================================================================

-- 1. Allow question_sets.created_by to be NULL for guest-created question sets
ALTER TABLE public.question_sets ALTER COLUMN created_by DROP NOT NULL;

-- 2. Drop old restrictive policies
DROP POLICY IF EXISTS "Question sets readable if public or created by user" ON public.question_sets;
DROP POLICY IF EXISTS "Users can manage their own question sets" ON public.question_sets;
DROP POLICY IF EXISTS "Questions readable if part of accessible set or active room" ON public.questions;
DROP POLICY IF EXISTS "Authors can manage questions in their sets" ON public.questions;
DROP POLICY IF EXISTS "Question options readable by room players or set author" ON public.question_options;

-- ----------------------------------------------------------------------------
-- 3. QUESTION_SETS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Question sets readable by all users and guests"
ON public.question_sets FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Question sets insertable by all users and guests"
ON public.question_sets FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Question sets updatable by all users and guests"
ON public.question_sets FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. QUESTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Questions readable by all users and guests"
ON public.questions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Questions insertable by all users and guests"
ON public.questions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Questions updatable by all users and guests"
ON public.questions FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. QUESTION_OPTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Question options readable by all users and guests"
ON public.question_options FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Question options insertable by all users and guests"
ON public.question_options FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Question options updatable by all users and guests"
ON public.question_options FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. QUESTION_ANSWER_KEYS POLICIES (INSERT ONLY, NO SELECT FOR CLIENTS!)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow answer key creation by room hosts" ON public.question_answer_keys;

CREATE POLICY "Allow answer key creation by room hosts"
ON public.question_answer_keys FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- INTENTIONALLY NO SELECT POLICY FOR CLIENTS TO KEEP ANSWER KEYS SECRET!
