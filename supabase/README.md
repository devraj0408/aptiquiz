# AptiQuiz Database Migrations & Security Architecture

**Problem Statement 3: AptiQuiz — Production-Minded PostgreSQL Schema**

This directory contains the production-grade Supabase PostgreSQL migrations, security policies, transactional stored procedures, and Realtime configurations for **AptiQuiz**.

---

## 1. Overview & Architecture Assumptions

### Technology Stack
- **Database Engine:** Supabase PostgreSQL 15+
- **Auth Provider:** Supabase Auth (`auth.users`) + SHA256 Guest Credential Tokens
- **Realtime Layer:** Supabase Realtime (`supabase_realtime` publication)
- **API Access Layer:** Supabase Data API (PostgREST) + SECURITY DEFINER PL/pgSQL functions

### Core Security & Correctness Guarantees
1. **Secure Guest Credential Flow (`join_room_as_guest` / `submit_game_answer`):** Unauthenticated guest players generate a 32-byte secure random hex token on join. The database stores `guest_token_hash = digest(guest_token, 'sha256')` on `room_players`. Anonymous calls to `submit_game_answer` MUST provide this valid token to authenticate. An `anon` role can never arbitrarily claim or query room player records.
2. **Option Mapping & Prompt Validation:** `submit_game_answer` verifies that the submitted `selected_option_id` belongs to the round's target question AND is present in the player's randomized option mapping (`round_player_options`).
3. **Database-Authoritative Timestamps & Concurrency Locks:** Round deadlines (`deadline_at`) and answer receipt timestamps (`submitted_at`) use PostgreSQL `clock_timestamp()`. `game_rounds` and `game_sessions` use row locks (`FOR SHARE` / `FOR UPDATE`) to prevent overlapping rounds and race conditions.
4. **Idempotent Concurrency-Safe Evaluation (`evaluate_game_round`):** Uses row locking `FOR UPDATE` on `game_rounds` and checks status (`'completed'` returns idempotently). Duplicate evaluation event emissions are guarded.
5. **Interval-Bounded Speed Scoring:** Speed bonus uses exact interval math in milliseconds (`EXTRACT(EPOCH FROM (submitted_at - started_at)) * 1000.0`), bounded between 0 and the round duration denominator.
6. **Hardened PL/pgSQL Functions:** All `SECURITY DEFINER` functions explicitly set `SET search_path = public, pg_temp;` and revoke default `PUBLIC` execution privileges.

---

## 2. Versioned Migration Chain

| Migration File | Description |
|----------------|-------------|
| `20261010000001_initial_schema.sql` | Core 21 domain tables with UUID PKs, FKs, CHECK, UNIQUE constraints, and indexes. |
| `20261010000002_rls_security_policies.sql` | RLS enablement on all 21 tables, default-deny, and protection of secret `question_answer_keys`. |
| `20261010000003_game_logic_functions.sql` | Initial PL/pgSQL procedures for room creation, round lifecycle, submission, and scoring. |
| `20261010000004_realtime_setup.sql` | Selective Supabase Realtime publication configuration (excluding secret answer keys). |
| `20261010000005_security_and_correctness_hardening.sql` | **Hardening Migration:** `guest_token_hash` schema addition, option mapping checks, concurrency locks, search path fixes, input validation, and idempotent evaluation. |

---

## 3. Migration Execution & Verification Guide

### Local Database Setup (Supabase CLI)
```bash
# 1. Start local Supabase development container
npx supabase start

# 2. Reset local database and execute all 5 versioned migrations in order
npx supabase db reset

# 3. Execute the security & concurrency test suite
npx supabase db query --file supabase/tests/security_tests.sql
```

### Dry-Run Pre-flight Check (No Remote Mutations)
```bash
npx supabase db push --dry-run
```

---

## 4. Required Environment Variables

```env
# Client-side Browser Environment (.env.local) — Safe for public disclosure
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key

# Trusted Server Environment Only (Vercel Serverless / Node — DO NOT expose to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

---

## 5. Unresolved Security & Policy Decisions

1. **Guest Session Lifespan:** `guest_token_hash` credentials are valid for the duration of the room session. Optional expiration timestamps (`guest_token_expires_at`) can be added in a future migration if inactive rooms need automatic token cleanup.
2. **Team Relay Mode Multiplier Constraints:** Team relay score multipliers are bounded between 0.50x and 5.00x in `team_round_results`; dynamic streak multiplier logic can be extended as gameplay modes evolve.
