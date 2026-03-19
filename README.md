# kaamdha

A two-sided marketplace connecting household staff (workers) with employers in India. Mobile-first web app built with Next.js, Supabase, and Tailwind CSS.

**Website:** [kaamdha.com](https://kaamdha.com)

## How it works

- **Employer flow:** Search for staff → auto-creates job listing (JID) → workers discover it → connect via phone
- **Worker flow:** Create profile → employers search and browse → connect via phone
- **Both sides pay ₹10 to connect** (Phase 1: everything free)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth (phone OTP) |
| SMS/WhatsApp | Gupshup / MSG91 |
| Hosting | Vercel |
| i18n | next-intl (English + Hindi) |

## Getting started

### Prerequisites
- Node.js 18+
- pnpm
- Supabase project

### Setup

```bash
# Clone
git clone https://github.com/kaamdha/kaamdha.git
cd kaamdha

# Install dependencies
pnpm install

# Copy env file and fill in values
cp .env.local.example .env.local

# Run migrations in Supabase SQL Editor:
# 1. supabase/migrations/001_full_schema.sql
# 2. supabase/migrations/20260319_search_workers_nearby.sql

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment variables

See `.env.local.example` for all required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `GUPSHUP_API_KEY` — Gupshup API key (optional, for notifications)
- `GUPSHUP_APP_NAME` — Gupshup app name
- `GUPSHUP_WHATSAPP_NUMBER` — WhatsApp business number (optional)
- `CRON_SECRET` — Secret for Vercel cron endpoint
- `NEXT_PUBLIC_APP_URL` — App URL

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── account/            # Account, profile editor, JID editor
│   ├── actions/            # Server actions (reveal, favorite)
│   ├── api/                # API routes (cron, location search)
│   ├── details/[id]/       # Worker/job detail pages
│   ├── favorites/          # Favorites page
│   ├── login/              # Login + OTP
│   ├── onboard/            # Role selection + onboarding
│   └── search/             # Search results
├── components/
│   ├── account/            # Account menu, profile editors
│   ├── auth/               # Login form, OTP step
│   ├── details/            # Worker detail, job detail
│   ├── favorites/          # Favorites view
│   ├── home/               # Employer home, worker home
│   ├── landing/            # Landing page
│   ├── layout/             # Header, footer, locale switcher
│   ├── listings/           # Staff listings
│   ├── onboard/            # Onboarding forms
│   ├── search/             # Employer search
│   ├── shared/             # Shared components (cards, modals, icons)
│   └── ui/                 # Base UI components
├── lib/
│   ├── supabase/           # Supabase clients (server, client, admin, middleware)
│   ├── constants.ts        # Categories, timings
│   ├── gupshup.ts          # WhatsApp + SMS integration
│   └── location.ts         # Geocoding utilities
├── types/                  # TypeScript types
messages/
├── en.json                 # English translations
└── hi.json                 # Hindi translations
supabase/
└── migrations/             # SQL migrations
```

## Categories (MVP)

| ID | Category | Hindi |
|---|---|---|
| C0001 | Maid | कामवाली बाई |
| C0002 | Cook | रसोइया |
| C0003 | Driver | ड्राइवर |
| C0004 | Nanny | आया |
| C0005 | Personal trainer | पर्सनल ट्रेनर |
| C0006 | Elder care | बुज़ुर्गों की देखभाल |

## Launch

Launching in **Gurgaon** first, with registrations open from all cities.

## License

All rights reserved.
