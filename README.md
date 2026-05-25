# Collision Growth Network

The operating system for coordinated LinkedIn growth. A centralized platform where growth agents execute daily engagement missions, build strategic networks, publish aligned content, and earn XP through gamified participation.

## What is this?

Collision Growth Network is a **distributed personal branding engine** — think Duolingo meets LinkedIn meets Discord. Growth agents log in daily to:

- **Engage** with curated LinkedIn posts (comment, repost, react)
- **Connect** with other agents in the network (peer-to-peer networking)
- **Post** content aligned with coordinated narratives
- **Earn XP** and climb the leaderboard through consistent execution

Admins coordinate the entire operation through a Command Center — creating missions, setting narratives, managing agents, and reviewing submissions.

## Features

### For Growth Agents
- **Dashboard** — daily missions overview, streak counter, XP progress, leaderboard position
- **Engagement Missions** — curated posts to engage with, suggested angles, priority levels, expiry timers
- **People** — peer-to-peer networking, randomized agent profiles, connect and earn XP
- **Posting System** — daily post briefs with narrative alignment, structure guides, emotional direction
- **Leaderboard** — XP rankings, levels (Rookie → Ecosystem Lead), streak tracking
- **Personality.md** — define your unique voice so content stays authentic at scale
- **Settings** — profile management, network profile (pitch + niche tags)

### For Admins (Command Center)
- **Overview** — network health metrics, active narrative, top agents
- **Reviews** — approve/reject proof submissions, award XP
- **Missions** — create engagement tasks with suggested angles, archive old ones
- **Narratives** — monthly/weekly/daily narrative coordination
- **Post Briefs** — create content briefs with objectives, structure, emotional direction
- **Users** — add agents (auto-generated passwords), manage roles (agent/captain/admin)

### Gamification
- **Streaks** — daily activity tracking
- **XP System** — comment (5 XP), connect (10 XP), post (30 XP)
- **Levels** — Rookie → Operator → Growth Agent → Narrative Captain → Ecosystem Lead
- **Leaderboard** — weekly rankings by XP

### Auth System
- Admin-only account creation (no self-signup)
- Auto-generated passwords (first 4 chars of name + 4 random digits)
- Credentials displayed to admin for sharing with agents

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Postgres, RLS, Realtime)
- **Language**: TypeScript
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Vercel / Netlify

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### 1. Clone and install

```bash
git clone https://github.com/yourusername/collision-growth-network.git
cd collision-growth-network
npm install
```

### 2. Set up environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from your Supabase project: **Settings → API**

### 3. Set up the database

Run the migration in your Supabase SQL Editor (or use the MCP):

```bash
# The migration file is at:
supabase/migrations/001_initial_schema.sql
```

This creates all tables, indexes, enums, and RLS policies.

### 4. Seed sample data (optional)

```bash
# Run in Supabase SQL Editor:
supabase/seed.sql
```

### 5. Create your first admin

1. Sign up a user via Supabase Auth dashboard or the API
2. Run: `UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';`
3. Now you can add other agents from the Admin → Users panel

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Agent profiles, XP, streaks, levels, personality.md, pitch |
| `engagement_tasks` | Posts to engage with (created by admins) |
| `people_tasks` | Legacy people tasks (now peer-driven via user profiles) |
| `narratives` | Monthly/weekly/daily narrative coordination |
| `post_briefs` | Content briefs with objectives and structure |
| `submissions` | Proof of completed missions (pending/approved/rejected) |

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated routes
│   │   ├── admin/          # Admin command center
│   │   ├── dashboard/      # Main dashboard
│   │   ├── engage/         # Engagement missions
│   │   ├── leaderboard/    # XP rankings
│   │   ├── people/         # Peer networking
│   │   ├── posting/        # Post briefs
│   │   └── settings/       # Profile & personality
│   ├── api/admin/          # Admin API routes
│   ├── auth/callback/      # OAuth callback
│   └── login/              # Login page
├── components/
│   ├── admin/panels/       # Admin panel components
│   ├── dashboard/          # Dashboard widgets
│   ├── engage/             # Engage page components
│   ├── leaderboard/        # Leaderboard components
│   ├── people/             # People page components
│   ├── posting/            # Posting components
│   ├── settings/           # Settings components
│   └── ui/                 # shadcn/ui primitives
├── lib/supabase/           # Supabase client configs
└── types/                  # TypeScript types
```

## Design

- Dark mode first
- Large typography
- Mission-card based UI
- Minimal clutter, high information clarity
- Inspired by Linear, Raycast, Notion, Duolingo

## License

MIT
