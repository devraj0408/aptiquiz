# AptiQuiz — Competitive Aptitude Arena

**Problem Statement 3: AptiQuiz**

AptiQuiz is a real-time multiplayer aptitude platform where students compete in timed quantitative aptitude, logical reasoning, verbal ability, and data interpretation challenges. It combines synchronized quiz rounds, speed-and-accuracy scoring, live leaderboards, and college leagues to make placement preparation more engaging and measurable.

## Done / Left / Plan

### Done
- Project concept and initial feature scope defined.
- Slate & Teal visual design system selected.
- Technology stack and database architecture planned.

*These are planning milestones, not claims that the application is implemented.*

### Left
- Build the React and TypeScript frontend.
- Implement question authoring and reusable question sets.
- Implement rooms, join codes, lobby, and synchronized gameplay.
- Add server-authoritative scoring and live leaderboards.
- Implement reconnection and cheating protections.
- Add college leagues and Pressure Cooker Mode.
- Configure Supabase database schema, authentication, and security policies.
- Write and run a 50-player load-test script.
- Complete accessibility, mobile responsiveness, testing, and deployment.

### Plan
1. Establish the frontend foundation and Slate & Teal design system.
2. Implement the question bank and room-management workflows.
3. Build real-time gameplay, answer validation, scoring, and leaderboards.
4. Add reconnection, college leagues, and Pressure Cooker Mode.
5. Run functional, security, and 50-player load tests.
6. Deploy the verified application and finalize documentation.

## Architecture and Why

### Frontend
- **React + Vite + TypeScript:** Component-based development, fast local development, and type safety.
- **Tailwind CSS:** Consistent styling and responsive layouts.
- **Lucide React:** Consistent line icons.

### Backend and real-time communication
- **Vercel:** Frontend hosting and server-side API routes.
- **Supabase Realtime:** Broadcast game events and track lobby presence.
- **Trusted server-side operations:** Validate answers, enforce deadlines, and calculate scores independently of client clocks.

The initial deployment design avoids a separate persistent Socket.IO server. PostgreSQL-backed game state and trusted server-side operations will remain authoritative; Realtime will distribute updates to connected clients.

### Data store and authentication
- **Supabase PostgreSQL:** Persistent questions, rooms, participants, answers, results, and league standings.
- **Supabase Auth:** User authentication where required.
- **SQL migrations and Row-Level Security (RLS):** Reproducible schema setup and controlled data access.
- **Supabase JavaScript client:** Database and authentication integration without Prisma.

### Timing and fairness
The server records round start times, deadlines, and accepted answer timestamps. Duplicate and late answers are rejected, and scores are calculated by trusted server-side logic. Network latency cannot be eliminated completely; the implementation and load-test results will document the approach and its limitations.

## What We Added

The following are planned enhancements beyond the core requirements:

- **Pressure Cooker Mode:** Progressively shorter rounds and a predefined high-stakes final to simulate placement-test pressure.
- **Team Relay Battle:** Teams of three to five compete through coordinated individual rounds.
- **Skill Progress Map:** Track topic-wise accuracy, response time, and improvement.
- **Projector Mode:** Display live competition standings for college events.

These features will be marked as implemented only after they are built and tested.

## How to Run It

*Local setup instructions will be finalized after the initial project scaffold is created.*

### Prerequisites
- Node.js and npm
- Git
- A Supabase project with the required environment variables configured

### Setup
1. Clone the repository.
2. Install the frontend dependencies.
3. Configure local environment variables using `.env.example`.
4. Apply the Supabase SQL migrations.
5. Start the local development server.

Exact commands, required environment variables, test credentials, and the live URL will be added after the deployment is verified.

**Live URL:** Not deployed yet.

**Test login:** Not available yet.

## Tools and AI Used

- React, Vite, TypeScript, Tailwind CSS, and Lucide React.
- Supabase PostgreSQL, Supabase Auth, and Supabase Realtime.
- Vercel for hosting and server-side API routes.
- Git and GitHub for version control.
- Antigravity and ChatGPT may be used as development assistance tools.

No AI model or AI-powered user-facing feature is planned for the initial MVP. If this changes, the README will identify the model or service and explain clearly how users are informed when interacting with AI.

## Who It Is For

AptiQuiz is designed for college students preparing for campus placements, faculty conducting aptitude assessments, and colleges organizing inter-college competitions.

Students can practise under time pressure, compare performance, identify weaker topics, and participate in recurring challenges. Faculty and college organizers can use question sets, results, and league standings to run structured competitions.

## Testing

The project will include functional tests for gameplay and scoring, checks for duplicate and late answers, reconnection tests, and a reproducible script simulating 50 players.

Actual test commands, environment details, measured results, and known limitations will be documented here after execution.

## Security and Privacy

- Never commit `.env` files, API secrets, or database passwords.
- Keep privileged Supabase credentials on the server.
- Protect correct answers until the round ends.
- Validate user input and authorization on trusted server-side operations.
- Collect only the information required for gameplay and competition.

## License

License to be determined.
