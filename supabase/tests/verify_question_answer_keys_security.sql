-- ============================================================================
-- Read-Only Verification Script: Table Privileges, RLS Policies & Scoring Permissions
-- File: supabase/tests/verify_question_answer_keys_security.sql
-- Description: Queries information_schema and pg_catalog to inspect effective
--              table privileges, RLS configuration, policies, and function grants.
-- ============================================================================

-- 1. INSPECT DIRECT TABLE GRANTS ON QUESTION_ANSWER_KEYS FOR BROWSER ROLES
-- Expected result after 000006: 0 rows for 'anon', 'authenticated', and 'public'.
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'question_answer_keys'
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- 2. INSPECT EFFECTIVE RLS STATUS & POLICIES ON QUESTION_ANSWER_KEYS
-- Expected result: rowsecurity = TRUE, 0 RLS policies for browser roles.
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'question_answer_keys';

SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'question_answer_keys';

-- 3. INSPECT SCORING FUNCTION DEFINITION, OWNER & SECURITY ATTRIBUTES
-- Expected result: prosecdef = true, proconfig contains search_path=public, pg_temp.
SELECT p.proname, p.prosecdef, p.proconfig, pg_get_userbyid(p.proowner) AS function_owner
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'evaluate_game_round';

-- 4. INSPECT FUNCTION EXECUTION GRANTS FOR EVALUATE_GAME_ROUND
-- Expected result: Only authenticated/service_role have EXECUTE; PUBLIC/anon revoked.
SELECT routine_schema, routine_name, grantee, privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'evaluate_game_round'
ORDER BY grantee;
