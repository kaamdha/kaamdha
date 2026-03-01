# CLAUDE.md — Kaamdha Project Brief

> **This file is the single source of truth for the Kaamdha project. Read this fully before writing any code or making architectural decisions.**

---

## 1. Project Overview

**Kaamdha** (कामधा — "the one who gives work") is a peer-to-peer platform connecting blue-collar household workers (maids, cooks, drivers, gardeners, car cleaners, personal trainers, etc.) with households looking to employ them in India.

- **Website:** kaamdha.com
- **Platform:** Responsive web app (mobile-first, no native app in Phase 1)
- **Target Market:** India, launching in Gurgaon first
- **Core Value Prop:** Eliminate middlemen (staffing agencies) and democratize household employment through direct connections

### The Problem
- 50M+ domestic workers in India operate in a completely unorganized market
- Discovery is word-of-mouth or through local agents who charge 1-2 months' salary as commission
- Workers struggle to find steady employment; households struggle to find reliable help
- No platform exists specifically for ongoing household employment relationships (not gig/task-based)

### How It's Different from Urban Company, etc.
- **Ongoing employment**, not one-time gigs
- **P2P marketplace** — no company in the middle taking a cut of every transaction
- **Both sides are individuals**, not businesses
- Workers build long-term relationships with households

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Full-stack, server components, server actions |
| **Language** | TypeScript | Everywhere — frontend, API, edge functions |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, pre-built components |
| **Database** | Supabase (PostgreSQL + PostGIS) | Managed DB with spatial queries |
| **DB Access** | Supabase JS SDK | No ORM — use Supabase client directly |
| **Auth** | Supabase Auth (Phone OTP) | Custom SMS hook → Gupshup |
| **File Storage** | Supabase Storage | Profile photos, verification docs |
| **SMS/OTP** | Gupshup | Custom SMS hook in Supabase for OTP delivery |
| **WhatsApp** | Gupshup | Notifications to workers/employers on interest |
| **Payments** | Razorpay | Phase 2+ only. Not needed in Phase 1. |
| **Analytics** | PostHog | Product analytics, free tier |
| **Error Tracking** | Sentry | Free tier |
| **Hosting** | Vercel | Auto-deploys from GitHub |
| **Version Control** | GitHub | Main branch → auto-deploy to Vercel |

### Key Technical Decisions
- **No ORM** — use Supabase JS SDK for all DB operations
- **PostGIS** — all location fields use `geography(Point, 4326)` type for km-radius search
- **Phone OTP only** — no email/password auth. Phone number is the universal identifier in India.
- **Supabase RLS** — enforce all access control at the database level
- **Server Components by default** — use client components only when interactivity is needed
- **English + Hindi** — UI supports both languages from the start using next-intl or similar

---

## 3. User Types & Roles

### Single Account, Dual Role
- One phone number = one account
- Users choose their role after first login: **Worker** or **Employer**
- Users can switch between roles (role switcher in dashboard)
- Each role has its own profile data
- A driver who needs a maid for their own home can be both

### Worker (कामगार)
Domestic help seeking employment: maids, cooks, drivers, gardeners, car cleaners, nannies, personal trainers, etc.

### Employer (गृहस्वामी)
Households looking to hire domestic help. Typically middle-class to upper-middle-class families.

---

## 4. Phase 1 — MVP Features

> **Goal: Let workers and employers find each other and connect.**
> No payments, no chat, no ratings, no verification. Just a functional marketplace.

### 4.1 Authentication
- Phone number + OTP login (Gupshup via Supabase custom SMS hook)
- After first login → choose role: Worker / Employer
- Role switcher available in dashboard for dual-role users

### 4.2 Worker Profile
- Name, photo (upload to Supabase Storage)
- Phone (auto-filled from auth — never shown publicly on website)
- Job types offered (multi-select from predefined list)
- Location / area they can work in (locality-level with lat/lng via PostGIS)
- Experience (years)
- Salary expectation (min-max range, monthly ₹)
- Availability: full-time / part-time / flexible
- Available days (for part-time): mon, tue, wed, etc.
- Languages spoken: hindi, english, tamil, etc.
- Short bio / description (optional free text)

### 4.3 Employer Profile
- Name, photo
- Phone (auto-filled — never shown publicly)
- Location (locality with lat/lng)
- Household type: apartment / independent house / villa / other

### 4.4 Job Posting (by Employer)
- Job type (single select from predefined list)
- Title (optional custom title)
- Description (detailed requirements — free text)
- Schedule: full-time / part-time / flexible
- Preferred days (for part-time)
- Preferred timings (free text, e.g., "7am-11am")
- Salary offered (min-max range, monthly ₹)
- Location (can differ from employer's home address)

### 4.5 Search & Discovery
Both sides can search and browse:
- **Employers search workers** by: job type, distance (km radius), salary range, experience
- **Workers search job posts** by: job type, distance (km radius), salary offered
- Results sorted by proximity (PostGIS distance) and relevance
- Distance options: 3km, 5km, 10km radius
- City filter with "We'll be serving your area soon" message for inactive cities

### 4.6 Interest & Contact System (One-Way)
This is the core connection mechanism:
1. User (worker or employer) browses profiles/jobs
2. Clicks **"I'm Interested"** on a listing
3. **Phone number is instantly revealed** on screen to the interested party
4. **Other party receives SMS/WhatsApp notification** via Gupshup:
   - Example: "Hi! Priya (Cook, 3yr exp, DLF Phase 2) is interested in your job posting on Kaamdha. View profile: kaamdha.com/profile/xyz"
5. They connect directly via phone/WhatsApp (off-platform)

**Key Design Decisions:**
- **One-way interest** — no mutual matching required in Phase 1 (reduces friction)
- **Phone numbers are NOT displayed on profiles** — only revealed after clicking "I'm Interested" (prevents scraping, enables tracking)
- **No limits on interest requests** in Phase 1 (maximize engagement)
- **Every interest request is logged** in the database for metrics and future monetization
- Cost per connection: ~₹0.15-0.25 (single Gupshup SMS/WhatsApp to the contacted party)

### 4.7 Dashboard
**Worker Dashboard:**
- My Profile (edit)
- Find Jobs (search & browse job posts)
- Interest Requests (received from employers, sent to jobs)

**Employer Dashboard:**
- My Profile (edit)
- My Job Posts (create, edit, deactivate)
- Find Workers (search & browse worker profiles)
- Interest Requests (received from workers, sent to workers)

### 4.8 What is NOT in Phase 1
- No in-app chat/messaging
- No payments/subscriptions (Razorpay)
- No ratings/reviews
- No ID verification (Aadhaar)
- No admin panel (manage via Supabase dashboard directly)
- No mobile app (responsive web only, PWA later)
- No advanced matching/recommendations

---

## 5. Database Schema

### Enable PostGIS
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 5.1 job_types (reference table)
```sql
CREATE TABLE job_types (
  id TEXT PRIMARY KEY,                    -- 'maid', 'cook', 'driver', etc.
  label_en TEXT NOT NULL,                 -- "Maid"
  label_hi TEXT NOT NULL,                 -- "कामवाली बाई"
  icon TEXT,                              -- icon name or emoji
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Seed data
INSERT INTO job_types (id, label_en, label_hi, sort_order) VALUES
  ('maid', 'Maid', 'कामवाली बाई', 1),
  ('cook', 'Cook', 'रसोइया', 2),
  ('driver', 'Driver', 'ड्राइवर', 3),
  ('gardener', 'Gardener', 'माली', 4),
  ('car_cleaner', 'Car Cleaner', 'कार क्लीनर', 5),
  ('nanny', 'Nanny / Babysitter', 'आया', 6),
  ('personal_trainer', 'Personal Trainer', 'पर्सनल ट्रेनर', 7),
  ('eldercare', 'Elder Care', 'बुज़ुर्गों की देखभाल', 8),
  ('pet_care', 'Pet Care', 'पेट केयर', 9),
  ('laundry', 'Laundry / Ironing', 'धोबी / प्रेस', 10),
  ('security_guard', 'Security Guard', 'सिक्योरिटी गार्ड', 11),
  ('other', 'Other', 'अन्य', 99);
```

### 5.2 cities (launch control)
```sql
CREATE TABLE cities (
  id TEXT PRIMARY KEY,                    -- 'gurgaon', 'delhi', etc.
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,        -- only Gurgaon active at launch
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION
);

INSERT INTO cities (id, name_en, name_hi, is_active, center_lat, center_lng) VALUES
  ('gurgaon', 'Gurgaon', 'गुरुग्राम', true, 28.4595, 77.0266),
  ('delhi', 'Delhi', 'दिल्ली', false, 28.6139, 77.2090),
  ('noida', 'Noida', 'नोएडा', false, 28.5355, 77.3910),
  ('greater_noida', 'Greater Noida', 'ग्रेटर नोएडा', false, 28.4744, 77.5040);
```

### 5.3 users (core account)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  active_role TEXT CHECK (active_role IN ('worker', 'employer')),
  has_worker_profile BOOLEAN DEFAULT false,
  has_employer_profile BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.4 worker_profiles
```sql
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_types TEXT[] NOT NULL DEFAULT '{}',  -- ['maid', 'cook']
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  salary_min INTEGER,                      -- monthly ₹
  salary_max INTEGER,
  availability TEXT CHECK (availability IN ('full_time', 'part_time', 'flexible')),
  available_days TEXT[] DEFAULT '{}',       -- ['mon', 'tue', 'wed']
  languages TEXT[] DEFAULT '{}',            -- ['hindi', 'english']
  location GEOGRAPHY(Point, 4326),         -- PostGIS lat/lng
  locality TEXT,                            -- "Dwarka Sector 12"
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST (location);
CREATE INDEX idx_worker_profiles_job_types ON worker_profiles USING GIN (job_types);
CREATE INDEX idx_worker_profiles_city_active ON worker_profiles (city, is_active);
```

### 5.5 employer_profiles
```sql
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_type TEXT CHECK (household_type IN ('apartment', 'independent_house', 'villa', 'other')),
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_employer_profiles_location ON employer_profiles USING GIST (location);
```

### 5.6 job_posts
```sql
CREATE TABLE job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL REFERENCES job_types(id),
  title TEXT,
  description TEXT,
  schedule TEXT CHECK (schedule IN ('full_time', 'part_time', 'flexible')),
  preferred_days TEXT[] DEFAULT '{}',
  preferred_timings TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_posts_location ON job_posts USING GIST (location);
CREATE INDEX idx_job_posts_type_city_active ON job_posts (job_type, city, is_active);
```

### 5.7 interest_requests
```sql
CREATE TABLE interest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('worker_to_job', 'employer_to_worker')),
  job_post_id UUID REFERENCES job_posts(id) ON DELETE SET NULL,
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'connected')),
  notification_sent BOOLEAN DEFAULT false,
  phone_revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_interest_from_user ON interest_requests (from_user_id);
CREATE INDEX idx_interest_to_user ON interest_requests (to_user_id);

-- Prevent duplicate interest requests
CREATE UNIQUE INDEX idx_unique_interest_worker_job
  ON interest_requests (from_user_id, job_post_id)
  WHERE job_post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_interest_employer_worker
  ON interest_requests (from_user_id, worker_profile_id)
  WHERE worker_profile_id IS NOT NULL;
```

### 5.8 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_requests ENABLE ROW LEVEL SECURITY;

-- Users: read/update own row only
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Worker profiles: owner full access, others can read active
CREATE POLICY "Owner full access to worker profile" ON worker_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active worker profiles" ON worker_profiles
  FOR SELECT USING (is_active = true);

-- Employer profiles: owner full access, others can read active
CREATE POLICY "Owner full access to employer profile" ON employer_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active employer profiles" ON employer_profiles
  FOR SELECT USING (is_active = true);

-- Job posts: owner full access, others can read active
CREATE POLICY "Owner full access to job posts" ON job_posts
  FOR ALL USING (
    employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Anyone can view active job posts" ON job_posts
  FOR SELECT USING (is_active = true);

-- Interest requests: from_user can create/read, to_user can read/update
CREATE POLICY "Users can create interest requests" ON interest_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can view own interest requests" ON interest_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "To user can update interest status" ON interest_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Reference tables: anyone can read
CREATE POLICY "Anyone can read job types" ON job_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read cities" ON cities FOR SELECT USING (true);
```

---

## 6. User Flows

### Flow 1: Registration
```
kaamdha.com → Landing Page
  → "Register / Login" button
    → Enter phone number
      → OTP sent via Gupshup
        → Enter OTP → Verified → Account created in Supabase Auth
          → "I am a..." → Worker / Employer (sets active_role)
            → Fill basic profile (name, photo, location)
              → Redirect to role-specific dashboard
```

### Flow 2: Worker Completes Profile
```
Worker Dashboard → "Complete Your Profile"
  → Job types (multi-select checkboxes)
  → Area / locality (with map pin or locality search)
  → Experience (years dropdown)
  → Salary expectation (min-max sliders)
  → Availability (full-time / part-time / flexible)
  → Days available (if part-time)
  → Languages spoken
  → Bio (optional text)
  → Photo upload
  → Save → Profile goes live in search
```

### Flow 3: Employer Posts a Job
```
Employer Dashboard → "Post a Job"
  → Job type (dropdown)
  → Title (optional)
  → Description (textarea)
  → Schedule (full-time / part-time / flexible)
  → Preferred timings (text)
  → Salary range (min-max)
  → Location (default: employer's address, can change)
  → Save → Job goes live in search
```

### Flow 4: Employer Searches for Workers
```
Dashboard → "Find Workers"
  → Filters: job type, distance (3/5/10km), salary range, experience
    → Results: cards (photo, name, job types, experience, locality, salary range)
      → Click card → Full worker profile (no phone number visible)
        → "I'm Interested" button
          → Phone number revealed on screen
          → Worker gets SMS/WhatsApp notification via Gupshup
          → Interest request logged in database
```

### Flow 5: Worker Searches for Jobs
```
Dashboard → "Find Jobs"
  → Filters: job type, distance (3/5/10km), salary range
    → Results: cards (job type, locality, salary, schedule, employer name)
      → Click card → Full job details + employer profile (no phone)
        → "I'm Interested" button
          → Employer's phone number revealed on screen
          → Employer gets SMS/WhatsApp notification
          → Interest request logged in database
```

### Flow 6: Role Switching
```
Dashboard → Role Switcher (top nav or settings)
  → Switch to Worker / Employer
    → If no profile for that role exists → "Create [Worker/Employer] Profile" flow
    → If profile exists → Switch dashboard view
```

---

## 7. Page Structure

```
/                           → Landing page (hero, how it works, CTA)
/login                      → Phone + OTP login
/onboarding                 → Choose role + basic profile setup
/dashboard                  → Role-specific dashboard (redirect based on active_role)
/dashboard/worker           → Worker dashboard home
/dashboard/worker/profile   → Edit worker profile
/dashboard/worker/jobs      → Search/browse job posts
/dashboard/employer         → Employer dashboard home
/dashboard/employer/profile → Edit employer profile
/dashboard/employer/jobs    → Manage job posts (create, edit, list)
/dashboard/employer/workers → Search/browse workers
/dashboard/requests         → Interest requests (sent & received)
/profile/[id]               → Public profile view (worker or employer)
/job/[id]                   → Public job post view
/about                      → About Kaamdha
```

---

## 8. Notification Templates (Gupshup SMS/WhatsApp)

### OTP
```
Your Kaamdha verification code is {OTP}. Valid for 5 minutes. Do not share this code.
— Kaamdha
```

### Interest Notification (to Worker)
```
Hi {worker_name}! {employer_name} from {locality} is interested in hiring you as a {job_type} on Kaamdha.
View details: kaamdha.com/dashboard/requests
— Kaamdha
```

### Interest Notification (to Employer)
```
Hi {employer_name}! {worker_name} ({job_type}, {experience}yr exp, {locality}) is interested in your job posting on Kaamdha.
View profile: kaamdha.com/dashboard/requests
— Kaamdha
```

---

## 9. Design & UX Principles

- **Mobile-first** — most users will access on phones. Design for 360px width first.
- **Minimal friction** — fewest possible steps to register, post, and connect
- **Hindi + English** — all UI text in both languages, user can toggle
- **Simple language** — avoid jargon. "I'm Interested" not "Express Intent"
- **Fast** — optimize for slow 4G connections common in India
- **Accessible** — large touch targets, readable fonts, high contrast
- **Trust signals** — show number of connections made, active workers count, etc.

---

## 10. Launch Plan

### City: Gurgaon (primary), all others accept registrations with "Coming soon" message

### Launch Localities (seed these first):
- DLF Phase 1-4
- Sohna Road (Grand Arch, M3M, Bestech)
- Golf Course Road / Extension
- Sector 49-57 cluster
- South City / Nirvana Country

### Strategy:
1. **Week 1-2:** Seed 200-300 worker profiles via on-ground outreach
2. **Week 3-4:** Activate employers in same localities via society WhatsApp groups
3. **Week 5-8:** Expand to adjacent areas based on organic signups

### Key Metrics:
- Signups by role (worker vs employer)
- Signups by locality
- Profile completion rate
- Interest requests sent
- Connections made (phone revealed)
- Return visits
- Signups from inactive cities (expansion signals)

---

## 11. Future Phases (NOT for Phase 1)

**Phase 2 — Trust & Engagement:**
- Ratings and reviews (bilateral)
- Aadhaar-based ID verification
- In-app chat/messaging
- Push notifications (FCM)
- PWA (installable on phone)

**Phase 3 — Monetization:**
- Premium listings / subscription plans (Razorpay)
- Background verification
- Multi-language UI (Tamil, Bengali, Marathi, etc.)
- Salary payment facilitation (UPI-based)
- Admin dashboard

**Phase 4 — Scale:**
- AI-powered matching
- WhatsApp bot for worker-side interaction
- Insurance/benefits marketplace
- City-by-city expansion
- React Native mobile app

---

## 12. Development Guidelines

- Use **Supabase JS SDK** for all database operations — no raw SQL in application code
- Use **Server Components** by default, Client Components only for interactivity
- Use **Server Actions** for form submissions and mutations
- All location fields use **PostGIS geography** type — store as `POINT(lng lat)` — note: longitude first
- All monetary values stored as **integers** (paise or whole rupees — pick one, be consistent)
- Use **Supabase RLS** for authorization — never trust client-side role checks alone
- **TypeScript strict mode** — no `any` types
- **Responsive design** — test on 360px, 390px, and 1440px widths
- **Image optimization** — use Next.js Image component, compress uploads before storing
- Use **Supabase Edge Functions** for webhook handlers (Gupshup callbacks, etc.)
