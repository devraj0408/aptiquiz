# AptiQuiz — Competitive Aptitude Arena

**Problem Statement 3: AptiQuiz**

AptiQuiz is a real-time multiplayer aptitude platform where students compete in timed quantitative aptitude, logical reasoning, verbal ability, and data interpretation challenges. It combines synchronized quiz rounds, speed-and-accuracy scoring, live leaderboards, and college leagues to make placement preparation more engaging and measurable.

---

## Done / Left / Plan

### Done
- **Frontend Foundation:** Built with React 19, Vite 6, TypeScript, Tailwind CSS v4, and Lucide React.
- **Slate & Teal Visual System:** Exact color palette (`#F2F0EB`, `#FBFAF7`, `#D9D5CC`, `#1F2933`, `#5E6A75`, `#14595A`, `#D9822B`, `#2F7D4F`, `#B3392F`) with micro-animations, hover feedback, low-time warning countdowns, and reduced-motion support.
- **Database Schema & Migrations:** 7 production-minded SQL migrations covering all 21 domain tables with UUID PKs, FKs, CHECK constraints, and performance indexes.
- **Security & RLS Architecture:** Row-Level Security enabled on all 21 tables. Secret answer keys (`question_answer_keys`) strictly revoked from browser access (`anon` & `authenticated`).
- **Server-Authoritative Game Logic:** Stored procedures for room creation (`create_room`), secure guest authentication (`join_room_as_guest`), round launch (`start_game_round`), deadline-checked answer submittal (`submit_game_answer`), and idempotent evaluation (`evaluate_game_round`).
- **End-to-End Playable MVP:** Complete playable game loop: Dashboard → Room Lobby → Timed Arena Round → Option Selection & Instant Feedback → Live Standings → Champion Podium.

### Left
- Cross-device multi-browser WebSocket state synchronization during live multi-auditorium events.
- Faculty question set upload via CSV/JSON parser.
- Advanced college league season telemetry reports.

---

## Architecture and Why

### Frontend
- **React + Vite + TypeScript:** Component-driven UI, instant hot-reloading, and strict type safety.
- **Tailwind CSS v4:** Modern styling system utilizing `@tailwindcss/vite` and CSS custom design tokens.
- **Lucide React:** Consistent line icon set for visual clarity.

### Backend and Real-Time Communication
- **Supabase PostgreSQL:** Persistent data store for profiles, question sets, rooms, players, answers, results, and league standings.
- **Supabase Realtime:** Selective `supabase_realtime` publication streaming room status, presence, timers, and round evaluations (excluding secret answer keys).
- **PL/pgSQL Stored Procedures:** Database-authoritative business logic enforcing `clock_timestamp()` deadlines, option mapping validation, and speed-bonus scoring.

### Data Store & Security Model
- **Default-Deny RLS:** RLS active across all tables. Direct browser access to correct answer keys is revoked (`REVOKE ALL PRIVILEGES ON TABLE question_answer_keys FROM PUBLIC, anon, authenticated`).
- **Guest Credential Tokens:** Unauthenticated guest players authenticate using a 32-byte random hex token (`guest_token_hash` SHA256 digest on `room_players`).

---

## How to Run It

### Prerequisites
- Node.js (v18+) and npm (v9+)
- Git
- Supabase CLI (`npm install -g supabase`)

### Environment Variables
Copy `.env.example` to `.env.local` for local development:
```bash
cp .env.example .env.local
```

Required variable names:
- `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g. `https://your-project.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Anon/Publishable API Key (safe for browser exposure)
- `SUPABASE_SERVICE_ROLE_KEY`: Privileged service role secret key (trusted server environment only)

### Execution Commands

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Local Development Server:**
   ```bash
   npm run dev
   ```

3. **Production Build & Type-Check:**
   ```bash
   npm run build
   ```

4. **Apply Supabase Database Migrations:**
   ```bash
   npx supabase db push
   ```

5. **Execute Security & RLS Test Suite:**
   ```bash
   npx supabase db query --file supabase/tests/security_tests.sql
   ```

---

## Completed Features & Verified MVP Flow

1. **Dashboard Shell & Connection Badge:** Displays active backend status, environment configuration, and quick entry points.
2. **Room Scaffolding & Code Sharing:** Hosts can initialize custom rooms with topic, mode, max capacity, and round durations, generating 6-character join codes (`create_room`).
3. **Guest & Profile Authentication:** Secure registration via guest credential tokens (`join_room_as_guest`) or authenticated profiles.
4. **Room Lobby (`LobbyView`):** Real-time participant roster, readiness status, and host round launch trigger.
5. **Timed Arena Quiz Runner (`ArenaQuizRunner`):** Synchronized round timers, low-time warning countdown bar (`#D9822B`), option selection, and deadline-checked answer submittals (`submit_game_answer`).
6. **Server-Authoritative Scoring & Feedback:** Speed bonus calculations, post-round solution explanations, and answer correctness feedback (`#2F7D4F` / `#B3392F`).
7. **Live Leaderboard (`LiveLeaderboard`):** Real-time player standings and score progression.
8. **Podium Victory View (`PodiumView`):** Final tournament podium (1st, 2nd, 3rd place) with restart/return options.

---

## Known Limitations

- **Guest Session Scope:** Guest tokens are persisted in browser memory/localStorage per session. Cross-device session recovery requires signing into a permanent Supabase Auth profile.
- **Local Supabase Stack:** Running `npx supabase start` locally requires Docker Desktop running on your machine.

---

## Tools & AI Usage Disclosure

- **Technologies Used:** React, Vite, TypeScript, Tailwind CSS, Lucide React, Supabase PostgreSQL, Supabase Auth, Supabase Realtime.
- **AI Disclosure:** No AI model, AI API, or AI-powered user-facing feature is included in the application.

---

## License

MIT License.
