# AptiQuiz 🎯

**A Real-Time Multiplayer Aptitude Quiz Platform**

AptiQuiz is a web-based aptitude practice platform designed to make learning more engaging through interactive quizzes and multiplayer competition. Users can participate in quiz sessions, answer questions, and track game progress through a live gaming experience.

## ✨ Features

- **Multiplayer Quiz Rooms** — Create or join quiz rooms.
- **Interactive Quiz Sessions** — Answer aptitude questions in timed rounds.
- **Real-Time Updates** — Synchronize game events and room state using Supabase Realtime.
- **Live Leaderboard** — View rankings based on quiz performance.
- **Authentication** — User authentication powered by Supabase.
- **Responsive Interface** — A clean interface designed for different screen sizes.
- **Secure Answer Evaluation** — Server-side database functions handle answer submission and game evaluation.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tooling |
| TypeScript | Type-safe application development |
| Tailwind CSS | Styling and responsive layouts |
| Lucide React | Icons |
| Supabase Auth | Authentication |
| Supabase PostgreSQL | Database |
| Supabase Realtime | Live application updates |
| Vercel | Deployment |

## 📋 Prerequisites

Before running AptiQuiz locally, install:

- Node.js (LTS recommended)
- npm
- Git
- A Supabase project with the required database schema and configuration

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd aptiquiz
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use the exact environment variable names expected by your existing source code. Obtain the values from your Supabase project settings.

**Security:** Never commit `.env.local`, service-role keys, database passwords, or other private credentials. Browser-exposed environment variables must never contain privileged secrets.

### 4. Configure Supabase

Ensure your Supabase project has the database schema, required SQL functions, Row Level Security (RLS) policies, and Realtime configuration expected by the application.

Apply database migrations only according to the project's documented migration workflow. Do not reset an existing database to set up the project.

### 5. Run the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

`http://localhost:5173`

### 6. Build for production

```bash
npm run build
```

The production build is generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## 🔐 Security

AptiQuiz uses Supabase authentication and database-level controls to protect application operations.

Security practices include:

- Row Level Security for protected database access.
- Server-side answer evaluation through database functions.
- Restricted access to correct-answer data.
- Validation of game operations and room membership.
- Environment variables for project configuration.

Security depends on the actual database policies, grants, and application implementation. Review these before deploying to production.

## 🌐 Deployment

AptiQuiz can be deployed to Vercel.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Select **Vite** as the framework preset, if detected automatically.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure the required Supabase environment variables.
7. Deploy and test the live application.

If the application uses client-side routing, configure appropriate Vercel rewrites when required.

## 📁 Project Structure

The repository includes the following key areas:

```text
aptiquiz/
├── public/
├── src/
├── supabase/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

The `src/` directory contains the application code, while `supabase/` contains database-related project files and migrations.

## 🗺️ Roadmap

Potential future improvements include:

- Group discussion rooms with text chat.
- LiveKit-powered voice and video calls.
- Improved user profiles and learning progress.
- Additional aptitude question categories.
- Further accessibility and performance improvements.

Roadmap items are planned enhancements and should not be considered available until implemented and tested.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the application.
5. Submit a pull request.

## 📄 License

No license has been specified yet. Add an appropriate `LICENSE` file before distributing the project under an open-source license.

---

**AptiQuiz — Learn, Compete, Improve.**