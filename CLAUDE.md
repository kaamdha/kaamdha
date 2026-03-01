# CLAUDE.md — Kaamdha Project Brief (Final)

> **This file is the single source of truth for the Kaamdha project. Read this fully before writing any code or making architectural decisions.**

---

## 1. Project Overview

**Kaamdha** (कामधा — "the one who gives work") is a peer-to-peer platform connecting blue-collar household workers (maids, cooks, drivers, gardeners, car cleaners, personal trainers, etc.) with households looking to employ them in India.

- **Website:** kaamdha.com
- **Tagline:** "Post or find jobs in just ₹10"
- **Platform:** Responsive web app (mobile-first, no native app in Phase 1)
- **Target Market:** India, launching in Gurgaon first (organic registrations accepted from all cities)
- **Core Value Prop:** Eliminate middlemen (staffing agencies) and democratize household employment through direct connections

### The Problem
- 50M+ domestic workers in India operate in a completely unorganized market
- Discovery is word-of-mouth or through local agents who charge 1-2 months' salary as commission
- Workers struggle to find steady employment; households struggle to find reliable help
- No platform exists specifically for ongoing household employment relationships (not gig/task-based like Urban Company)

### Monetization Model
- **₹10 per lead** (employer reveals worker's number) / **₹10 per listing** (worker lists their profile)
- **Phase 1 (Launch):** Everything is FREE. The ₹10 price is displayed but crossed out (~~₹10~~ FREE). This creates perceived value while removing friction.
- **Phase 2+:** Activate ₹10 payments. First 3 leads/listings are free for new users as onboarding hook.
- Both sides (workers and employers) pay when monetization is activated.

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
| **WhatsApp** | Gupshup | Lead delivery, notifications |
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
- **English + Hindi** — UI supports both languages
- **Role detection from behavior** — do NOT ask users to pick Worker/Employer during signup. Detect role based on which tab they interact with first (Find Help = Employer, Find Jobs = Worker). Users can use both sides freely.

---

## 3. User Types & Roles

### No Explicit Role Selection
One phone number = one account. The app detects intent based on behavior:
- User uses "Find Help" tab → treated as Employer
- User uses "Find Jobs" tab → treated as Worker
- Users can do both — a driver can search for a maid for their own home
- Profile data is collected contextually

### Worker (कामगार)
Domestic help seeking employment: maids, cooks, drivers, gardeners, car cleaners, nannies, personal trainers, etc.

### Employer (गृहस्वामी)
Households looking to hire domestic help.

---

## 4. Site Structure & Pages

### Global Elements

**Header:** Kaamdha logo + tagline "Post or find jobs in just ₹10"

**Global Footer Navigation (persistent, 4 icons):**
| Icon | Label | Route |
|---|---|---|
| 🏠 Home | Home | `/` |
| 🔍 Search | Search | `/search` |
| ❤️ Favorites | Favorites | `/favorites` |
| 👤 Account | Profile | `/profile` |

---

### Page 1: Home Page `/`

#### State A: Not Logged In
Two prominent tabs at the top:

**Tab 1: "Find Help" (default)**
- Headline: "Find trusted household help near you"
- Pricing badge: "Get leads for just ~~₹10~~ FREE"
- Trust hook: "🎉 First 3 leads are FREE"
- How it works: Login → Search → Get leads
- Job type icons grid
- CTA: "Login to Get Started"

**Tab 2: "Find Jobs"**
- Headline: "Get hired by families near you"
- Pricing badge: "List yourself for just ~~₹10~~ FREE"
- Trust hook: "🎉 First 3 listings are FREE"
- How it works: Login → Create Profile → Get Calls
- CTA: "Login to Get Started"

#### State B: Logged In
- Remembers last used mode via `last_active_mode`
- Time-aware greeting: "Good morning, Priya 👋"
- Prominent search bar → tapping opens `/search`
- Quick access tiles / recent activity below

---

### Page 2: Login Page `/login`

- Phone number input with +91 prefix
- OTP flow (6 digits) via Gupshup
- New user → redirect to `/profile` for setup
- Returning user → redirect to `/`
- **No role selection during signup**

---

### Page 3: Search Page `/search`

**Employer mode:**
- Two buttons: "Find Help" (active) / "Create Job" → `/create-job`
- Job type tabs (horizontal scroll)
- Area search bar + distance pills (3/5/10km)
- Results below

**Worker mode:**
- Directly shows job listings
- Job type tabs + area filter
- Results based on saved location

---

### Page 4: Create Job Post `/create-job`

- Job type chip selector
- Title (optional), Description (textarea)
- Schedule: Full-time / Part-time / Flexible
- Preferred days + timings
- Salary range (min-max)
- Location (defaults to saved, changeable)
- "Post Job" button
- Pricing: "~~₹10~~ FREE"

---

### Page 5: Listings Page `/listings`

**Employer View (worker cards):**
Each card: Photo/icon, Name, Experience, Salary expectations, Day availability, Time availability, ❤️ Fav, 📤 Share, 📞 Masked phone ("981-XXX-XXXX")

**Worker View (job cards):**
Each card: Employer name, Job type, Location, Salary offered, Day/time availability, ❤️ Fav, 📤 Share, 📞 Masked phone

---

### Phone Number Reveal Flow

```
Tap masked number → Modal:
  "Reveal [Name]'s number?"
  "~~₹10~~ FREE (X of 3 free leads remaining)"
  "📞 Number will be sent to your WhatsApp"
  [Reveal via WhatsApp] [Cancel]
→ Confirm → Number sent to WhatsApp + unmasked on screen
→ Other party notified via WhatsApp
→ Logged in lead_reveals table
```

Phase 1: Always free (counter shows but doesn't block).
Phase 2: Razorpay payment after 3 free leads.

---

### Page 6: Details Page `/details/[id]`

**Worker Detail:** Photo, name, location+distance, job types, experience, salary, availability, languages, bio, ❤️+📤, masked phone+reveal, report link

**Job Detail:** Job type+title, employer name, location+distance, description, schedule+timings, salary, ❤️+📤, masked phone+reveal, report link

---

### Page 7: Profile Page `/profile`

**Common:** Name, photo, phone (read-only), location, free leads counter, logout, delete account

**Employer section (if applicable):** My job posts (edit/delete), create new job, household type

**Worker section (if applicable):** Job types, experience, salary, availability, languages, bio, active toggle

Both sections show with tabs if user has done both.

---

### Page 8: Favorites Page `/favorites`

Two tabs: **Recently Viewed** (auto-tracked, last 50) + **Favorites** (❤️ saved). Same card UI as listings.

---

### Additional: `/terms`, `/privacy`, `/contact`

---

## 5. Database Schema

### Enable PostGIS
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### job_types
```sql
CREATE TABLE job_types (
  id TEXT PRIMARY KEY,
  label_en TEXT NOT NULL,
  label_hi TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

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

### cities
```sql
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION
);

INSERT INTO cities (id, name_en, name_hi, is_active, center_lat, center_lng) VALUES
  ('gurgaon', 'Gurgaon', 'गुरुग्राम', true, 28.4595, 77.0266),
  ('delhi', 'Delhi', 'दिल्ली', false, 28.6139, 77.2090),
  ('noida', 'Noida', 'नोएडा', false, 28.5355, 77.3910),
  ('greater_noida', 'Greater Noida', 'ग्रेटर नोएडा', false, 28.4744, 77.5040);
```

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  free_leads_remaining INTEGER DEFAULT 3,
  wallet_balance INTEGER DEFAULT 0,
  last_active_mode TEXT CHECK (last_active_mode IN ('find_help', 'find_jobs')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### worker_profiles
```sql
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_types TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  salary_min INTEGER,
  salary_max INTEGER,
  availability TEXT CHECK (availability IN ('full_time', 'part_time', 'flexible')),
  available_days TEXT[] DEFAULT '{}',
  available_timings TEXT,
  languages TEXT[] DEFAULT '{}',
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST (location);
CREATE INDEX idx_worker_profiles_job_types ON worker_profiles USING GIN (job_types);
CREATE INDEX idx_worker_profiles_city_active ON worker_profiles (city, is_active);
```

### employer_profiles
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

### job_posts
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

### lead_reveals
```sql
CREATE TABLE lead_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reveal_type TEXT NOT NULL CHECK (reveal_type IN ('employer_to_worker', 'worker_to_job')),
  job_post_id UUID REFERENCES job_posts(id) ON DELETE SET NULL,
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL,
  amount_paid INTEGER DEFAULT 0,
  was_free_lead BOOLEAN DEFAULT true,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_from_user ON lead_reveals (from_user_id);
CREATE INDEX idx_leads_to_user ON lead_reveals (to_user_id);
CREATE UNIQUE INDEX idx_unique_reveal_worker ON lead_reveals (from_user_id, worker_profile_id) WHERE worker_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_reveal_job ON lead_reveals (from_user_id, job_post_id) WHERE job_post_id IS NOT NULL;
```

### favorites
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'job_post')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  job_post_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, worker_profile_id),
  UNIQUE(user_id, job_post_id)
);

CREATE INDEX idx_favorites_user ON favorites (user_id);
```

### recently_viewed
```sql
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'job_post')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  job_post_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recently_viewed_user ON recently_viewed (user_id, viewed_at DESC);
```

### Row Level Security
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owner full access to worker profile" ON worker_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active worker profiles" ON worker_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Owner full access to employer profile" ON employer_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active employer profiles" ON employer_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Owner full access to job posts" ON job_posts FOR ALL USING (employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view active job posts" ON job_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create lead reveals" ON lead_reveals FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can view own lead reveals" ON lead_reveals FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recently viewed" ON recently_viewed FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read job types" ON job_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read cities" ON cities FOR SELECT USING (true);
```

---

## 6. WhatsApp Templates (Gupshup)

### OTP
```
Your Kaamdha verification code is {OTP}. Valid for 5 minutes. Do not share. — Kaamdha
```

### Lead Reveal — To Requester
```
✅ Contact from Kaamdha:
👤 {name} | 📞 {phone} | 💼 {job_type} · {exp}yr | 📍 {locality}
— Kaamdha (kaamdha.com)
```

### Lead Reveal — To Person Revealed
```
📢 Someone viewed your number on Kaamdha!
👤 {viewer_name} from {locality} is interested in your {job_type} profile.
— Kaamdha (kaamdha.com)
```

---

## 7. Design

### Colors
Primary Teal `#0D9488` | Dark Teal `#0F766E` | Orange `#EA580C` | Charcoal `#1E293B` | Warm BG `#FFFBF5` | Teal Light `#CCFBF1` | Orange Light `#FFF7ED`

### Fonts
**Outfit** (headings/logo) · **DM Sans** (body/UI)

### UX Rules
Mobile-first (360px) · Minimal friction · Hindi+English · Simple language · Fast (slow 4G) · 44px touch targets · Phone masking server-side · WhatsApp-first notifications · Native share sheet

---

## 8. Phase 1 Scope

**Build:** Home, Login, Search, Create Job, Listings, Details, Profile, Favorites, Phone reveal flow, Share, PostGIS search, Footer nav, "Coming soon" for inactive cities

**Don't Build:** Payments, Wallet, Ratings, Aadhaar, Admin panel, Push notifications, Chat, Notifications page, Multi-language beyond EN+HI, Native app

---

## 9. Launch: Gurgaon

Seed localities: DLF Phase 1-4, Sohna Road, Golf Course Road, Sector 49-57, South City

Week 1-2: Seed 200-300 workers (on-ground) → Week 3-4: Activate employers (WhatsApp groups) → Week 5-8: Expand based on data

**Metrics:** Signups, profile completions, searches, lead reveals, favorites, shares, return visits, inactive city signups

---

## 10. Dev Guidelines

Supabase JS SDK · Server Components default · Server Actions for mutations · PostGIS `POINT(lng lat)` · Money in paise · RLS for auth · TypeScript strict · Test 360/390/768/1440px · Next.js Image · Edge Functions for webhooks · Web Share API · Server-side phone masking · Deduplicate lead_reveals
