# Kaamdha (कामधा)

**Find trusted household help near you.**

Kaamdha is a peer-to-peer platform connecting blue-collar household workers (maids, cooks, drivers, gardeners, etc.) with households looking to employ them in India. No middlemen, no commissions — just direct connections.

## The Problem

- 50M+ domestic workers in India operate in a completely unorganized market
- Discovery is word-of-mouth or through local agents who charge 1-2 months' salary as commission
- No platform exists specifically for ongoing household employment (not gig/task-based)

## How It Works

1. **Create Your Profile** — Sign up with your phone number and tell us what you need or what you offer
2. **Search Nearby** — Browse workers or jobs in your area, filtered by job type, distance, and salary
3. **Connect Directly** — Click "I'm Interested" to share your details and connect via phone or WhatsApp

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth (Phone OTP via Gupshup) |
| i18n | next-intl (English + Hindi) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Clone the repo
git clone https://github.com/kaamdha/kaamdha.git
cd kaamdha

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and Gupshup credentials

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

Apply the schema to your Supabase project via the SQL Editor:

```bash
# Copy contents of supabase/schema.sql into Supabase SQL Editor and run
```

This creates all tables (users, worker/employer profiles, job posts, interest requests), PostGIS indexes, and Row Level Security policies.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── login/              # Phone OTP login
│   ├── onboarding/         # Role selection + basic profile
│   ├── dashboard/          # Role-specific dashboards
│   │   ├── worker/         # Worker: profile, find jobs
│   │   ├── employer/       # Employer: profile, job posts, find workers
│   │   └── requests/       # Interest requests (sent & received)
│   ├── profile/[id]/       # Public profile view
│   ├── job/[id]/           # Public job post view
│   └── about/
├── components/
│   ├── layout/             # Header, footer, locale switcher
│   ├── shared/             # Reusable components
│   └── ui/                 # shadcn/ui components
├── i18n/                   # next-intl config
├── lib/
│   ├── supabase/           # Supabase clients (browser, server, middleware)
│   └── constants.ts        # App constants
├── types/
│   └── database.ts         # Supabase database types
└── middleware.ts            # Session refresh
messages/
├── en.json                 # English translations
└── hi.json                 # Hindi translations
supabase/
└── schema.sql              # Complete database schema
```

## Launch Plan

Launching in **Gurgaon** first, with registrations open for Delhi, Noida, and Greater Noida ("coming soon").

## License

All rights reserved.
