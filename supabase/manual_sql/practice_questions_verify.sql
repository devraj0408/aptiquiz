-- ============================================================================
-- AptiQuiz Manual SQL Verification Script: Practice Questions Bank
-- Read-Only Verification Script. Safe to run at any time in Supabase SQL Editor.
-- ============================================================================

-- 1. Check total count of practice questions per category
SELECT 
  category, 
  count(*) as total_questions,
  count(CASE WHEN option_a IS NOT NULL AND option_b IS NOT NULL AND option_c IS NOT NULL AND option_d IS NOT NULL THEN 1 END) as complete_options,
  count(CASE WHEN correct_option IN ('A', 'B', 'C', 'D') THEN 1 END) as valid_answers
FROM public.questions
WHERE is_practice_bank = true
GROUP BY category
ORDER BY category;

-- 2. Verify duplicate question prompts
SELECT prompt, count(*) as occurrence_count
FROM public.questions
WHERE is_practice_bank = true
GROUP BY prompt
HAVING count(*) > 1;

-- 3. Check for any missing options or invalid correct_option keys
SELECT id, category, prompt, correct_option
FROM public.questions
WHERE is_practice_bank = true
  AND (
    option_a IS NULL OR option_b IS NULL OR option_c IS NULL OR option_d IS NULL
    OR correct_option NOT IN ('A', 'B', 'C', 'D')
  );
