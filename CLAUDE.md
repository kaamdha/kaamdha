# CLAUDE.md — Kaamdha Project Brief (v3.1 — Final)

> **Single source of truth. Read this fully before writing any code.**

---

## 1. Project Overview

**Kaamdha** (कामधा) is a two-sided marketplace connecting household workers with employers in India.

- **Website:** kaamdha.com
- **Tagline:** "Post or find jobs in just ₹10"
- **Platform:** Responsive web (mobile-first, no native app)
- **Launch:** Gurgaon first, organic registrations accepted from all cities

### Core Model — Asymmetric Marketplace

The marketplace has two discovery paths:

**Path 1 — Employer-initiated:**
Employer searches for help → search auto-creates a Job Listing (JID) → Workers discover these JIDs → Worker reveals employer's phone via WhatsApp

**Path 2 — Worker-initiated:**
Worker creates a profile → Employers search and browse worker profiles → Employer reveals worker's phone via WhatsApp

Both sides can discover each other. Both sides pay to reveal phone numbers.

### Monetization
- **Phase 1 (Launch):** Everything FREE. Price shown crossed out: ~~₹10~~ FREE
- **Phase 2+:** ₹10 per phone reveal. First 3 free for new users. Both sides pay.

---

## 2. ID System

| Entity | Prefix | Format | Example |
|---|---|---|---|
| Employer | E | E + 9 digits | E000000001 |
| Worker | W | W + 9 digits | W000000001 |
| Category | C | C + 4 digits | C0001 |
| Job Listing | JID | JID + 10 digits | JID0000000001 |

- Auto-generated sequentially via `next_custom_id()` Postgres function
- Displayed on all cards, profiles, detail pages, and WhatsApp communications
- Stored alongside UUID primary keys (UUID for DB relations, custom ID for human-facing)

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + PostGIS) |
| DB Access | Supabase JS SDK (no ORM) |
| Auth | Supabase Auth (Phone OTP → Gupshup custom SMS hook) |
| Storage | Supabase Storage (profile photos) |
| SMS/WhatsApp | Gupshup |
| Payments | Razorpay (Phase 2+ only — NOT in Phase 1) |
| Analytics | PostHog (free tier) |
| Errors | Sentry (free tier) |
| Hosting | Vercel (auto-deploy from GitHub) |
| VCS | GitHub |

### Key Technical Decisions
- No ORM — Supabase JS SDK for all DB operations
- PostGIS for km-radius location search
- Phone OTP only — no email/password
- Supabase RLS for all access control
- Server Components by default, Client Components only for interactivity
- Server Actions for form submissions and mutations
- Role detected from behavior, not explicit selection

---

## 4. Roles

**No explicit role selection.** One phone number = one account. Role detected from behavior:
- Uses "Find Help" tab → Employer
- Uses "Find Jobs" tab → Worker
- A user can be both (e.g., a driver who also needs a maid)
- `last_active_mode` field tracks current mode

---

## 5. JID System — Core Concept

### How JIDs Are Created

**Auto-creation from employer search:**
When an employer hits "Search" with criteria (category + area + optional salary), a JID is automatically created with those search parameters. This JID becomes discoverable by workers in their listings.

**Deduplication:**
If the same employer already has an **active** JID with the **same category + same locality**, the existing JID is reused and updated (e.g., salary changed) instead of creating a duplicate.

**Manual creation:**
Employers can also create JIDs explicitly via the "Create Job Listing" button (in search page header or Account page).

### JID Lifecycle
```
Created (auto from search or manual)
  → Active (visible to workers for 30 days)
    → Employer can edit anytime (add title, description, change salary, etc.)
    → Day 27: WhatsApp reminder sent ("expires in 3 days")
      → Employer renews → 30-day timer resets
      → No action → Day 30: status = 'expired' (hidden from worker search)
        → Employer can reactivate later from Favorites → Jobs Created
  → Employer deactivates manually (hired someone) → status = 'deactivated'
  → Employer marks as filled → status = 'filled'
```

### JID Fields
- **Auto-populated from search:** category, area/locality, location (PostGIS point), search radius, salary range (if entered)
- **Editable later:** title, description/requirements, salary range, schedule, preferred days, preferred timings
- **System-managed:** JID number, employer_id, created_at, updated_at, expires_at, status

---

## 6. User Journey Flows

### Flow 1: New Employer
```
Home (Not Logged In)
  → "Find Help" tab
    → "Login to Get Started"
      → Login Page → Enter Phone → OTP → Verify
        → New user detected
          → Ask: Name, Location (auto-detect via GPS, manual fallback)
            → Redirect to Search Page (/search)
              → Select category tab (Cook, Maid, etc.)
              → Area/locality (pre-filled from profile, editable)
              → Distance (3km / 5km / 10km)
              → Hit "Search Workers"
                → JID auto-created (or existing one reused)
                → "✅ Job listing created: JID0000000045"
                → Worker results shown (Listings Page)
                  → Browse worker cards
                    → Tap card → Worker Detail Page → Reveal Phone
                    → Tap ❤️ → Added to Favorites
                    → Tap 📤 → Share via WhatsApp/link
                    → Card auto-added to Recently Viewed
```

### Flow 2: New Worker
```
Home (Not Logged In)
  → "Find Jobs" tab
    → "Login to Get Started"
      → Login Page → Enter Phone → OTP → Verify
        → New user detected
          → Ask: Name, Location (auto-detect), Categories, Availability (days + timings)
            → Redirect to Listings Page (/listings)
              → JID cards matching their criteria shown immediately
              → Filter bar on top: Category tabs, Area, Distance
                → Browse JID cards (employer job listings)
                  → Tap card → Job Detail Page (/details/JID...) → Reveal Phone
                  → Tap ❤️ → Added to Favorites
                  → Tap 📤 → Share
                  → Card auto-added to Recently Viewed
```

### Flow 3: Returning User (Employer)
```
Login → OTP → Returning user detected
  → Redirect to Home (Logged In)
    → "Welcome back, Priya 👋"
    → Recent JIDs created shown
    → Search bar at top
      → Tap search → Search Page → same employer search flow
    → Quick category tiles → tap → Search Page pre-filtered
```

### Flow 4: Returning User (Worker)
```
Login → OTP → Returning user detected
  → Redirect to Home (Logged In)
    → "Welcome back, Ramesh 👋"
    → Recent JIDs near location shown
    → Search bar at top
      → Tap search → Listings Page with filters → browse JIDs
```

### Flow 5: Phone Number Reveal
```
Tap [Reveal] or masked phone on any card/detail page
  → Confirmation modal:
    "Reveal [Name]'s number?"
    "~~₹10~~ FREE (X of 3 free leads remaining)"
    "Number will be sent to your WhatsApp"
    [Reveal via WhatsApp] [Cancel]
  → User confirms:
    1. Check uniqueness (no duplicate reveals)
    2. Decrement free_leads_remaining
    3. Send phone number to user's WhatsApp (Gupshup)
    4. Send notification to other party via WhatsApp
    5. Log in lead_reveals table
    6. Unmask number on screen: "981-234-5678"
    7. Show "Sent to your WhatsApp ✓"
```
Phase 1: Always free. Counter displays but does not block after 3.
Phase 2: Razorpay payment triggered after 3 free leads used.

### Flow 6: Account & Profile Management
```
Account Page (/account)
  → Edit Profile → Worker or Employer profile editor
  → Search Preferences → Status (Actively Looking / Not Looking), Categories, Days, Timings
  → My Job Listings → Favorites page, Jobs Created tab (employer only)
  → Favorites → /favorites
  → Role Switch → Toggle between Worker/Employer mode
  → Logout
```

---

## 7. Site Structure — Pages

### Global Footer Navigation (persistent on all pages)

| Icon | Label | Route (Employer) | Route (Worker) |
|---|---|---|---|
| 🏠 | Home | `/` | `/` |
| 🔍 | Search | `/search` | `/listings` |
| ❤️ | Favorites | `/favorites` | `/favorites` |
| 👤 | Account | `/account` | `/account` |

Note: 🔍 Search icon routes differently based on active role.

---

### Page 1: Home `/`

**Not Logged In — Two tabs:**

**Tab 1: "Find Help" (default)**
- Headline: "Find trusted household help near you"
- Subtext: "Search for maids, cooks, drivers & more. Get leads in just ₹10."
- Trust badge: "🎉 First 3 leads are FREE"
- How it works: Register → Search → Connect
- Category icons grid (tappable — each opens search pre-filtered)
- CTA: "Login to Get Started" → /login

**Tab 2: "Find Jobs"**
- Headline: "Get hired by families near you"
- Subtext: "Share your profile and connect with employers. List yourself for just ₹10."
- Trust badge: "🎉 First 3 listings are FREE"
- How it works: Register → Create Profile → Get Calls
- CTA: "Login to Get Started" → /login

**Logged In:**
- Time-aware greeting: "Good morning, Priya 👋"
- Prominent search bar → tapping opens /search (employer) or /listings (worker)
- **Employer mode:** Category quick tiles + recent JIDs created (with status) + stats (free leads, leads used, profile views)
- **Worker mode:** Recent JIDs near their location + stats
- Option to switch mode via tabs at top

---

### Page 2: Login `/login`

- Phone number input with +91 prefix
- "Send OTP" button → OTP sent via Gupshup
- 6-digit OTP input
- Resend timer (30 seconds)
- "Verify & Continue" button

**Post-verification routing:**

| User Type | Data Collected | Redirect To |
|---|---|---|
| New Employer (from "Find Help") | Name, Location (auto-detect + manual) | `/search` |
| New Worker (from "Find Jobs") | Name, Location, Categories, Availability (days + timings) | `/listings` (with matching JIDs) |
| Returning User | — | `/` (Home, logged in) |

**Location auto-detection:**
Use browser Geolocation API on first visit. Show "📍 Detecting your location..." → resolve to nearest locality name. User can override with manual text entry. Saved to user profile for future sessions.

---

### Page 3: Search `/search` — Employer Only

This page is the employer's search interface. **Workers do not use this page** — they go directly to `/listings` with filters.

**Elements:**
- "Create Job Listing" button in header
- Category tabs (horizontal scroll): Maid, Cook, Driver, Gardener, Car Cleaner, Nanny, Trainer, Elder Care, etc.
- Area/locality search bar (auto-filled from profile, editable) with 📍 auto-detect button
- Distance pills: 3km / 5km / 10km
- Salary range (optional): Min-Max inputs
- **"Search Workers" button**

**On search:**
1. JID auto-created (or existing one reused per dedup rule)
2. Green notification: "✅ Job listing created: JID0000000045 — Workers can now find you!"
3. Worker profile cards load below (or navigate to /listings)

---

### Page 4: Listings `/listings`

#### Employer View — Worker Profile Cards:

Filter pills on top: Category, Distance, Salary, Experience
"Create Job Listing" button in header

Each worker card:
- Photo / Default gender icon (👨/👩)
- Name
- Categories offered (tags: Cook, Maid)
- Experience (years)
- Salary expectations (₹ range/month)
- Day availability (Mon-Sun)
- Time availability (Morning / Afternoon / Evening / 12-hour / 24-hour)
- Originally from (state/city)
- ❤️ Favorite icon
- 📤 Share icon (native share sheet)
- 📞 Masked phone: "981-XXX-XXXX" + [Reveal] button
- Worker ID (W000000123) + distance (📍 1.2km)

#### Worker View — JID Cards:

**Filter bar on top** (this IS the worker's search experience — no separate search page):
- Category tabs (horizontal scroll)
- Area/locality search with 📍 auto-detect
- Distance pills (3/5/10km)

Each JID card:
- Category icon + Job title (if set by employer, else category name)
- Employer name (preview)
- Location / locality
- Salary offered (₹ range/month)
- Day availability
- Time availability
- ❤️ Favorite icon
- 📤 Share icon
- 📞 Masked phone + [Reveal] button
- JID number (JID0000000045) + distance

---

### Page 5: Detail Pages

#### Worker Detail `/details/W...` (viewed by employer):
- Large photo / gender icon
- Name + Worker ID (W000000123)
- Location + distance badge ("Sector 49 · 1.2km away")
- Category tags
- Experience, Salary expectations, Day availability, Time availability
- Languages spoken
- Originally from
- Bio / About section
- ❤️ Favorite + 📤 Share
- 📞 Reveal button (sticky bottom): "Reveal Number · ~~₹10~~ FREE"
- Free leads remaining counter
- 🚩 Report link

#### Job Detail `/details/JID...` (viewed by worker):
- Category icon + Job title
- JID number
- **Employer preview section:** Name, Employer ID (E000000045), Household type, Location
- Full description / requirements
- Salary offered
- Schedule (full-time/part-time/flexible)
- Preferred days + timings
- Location + distance
- Created date + expires in X days
- ❤️ Favorite + 📤 Share
- 📞 Reveal button (sticky bottom): "Reveal Employer's Number · ~~₹10~~ FREE"
- Free leads remaining counter
- 🚩 Report link

---

### Page 6: Favorites `/favorites`

#### Employer — 3 tabs:
1. **Jobs Created** — All JIDs created by this employer (active/expiring/expired/deactivated)
   - Each shows: Category, title, area, salary, status badge, created date, expiry, match count
   - Actions: Edit, Renew (if expiring/expired), Deactivate
2. **Recently Viewed** — Worker profiles they clicked on (auto-tracked, last 50)
   - Same card UI as worker listings
3. **❤️ Saved** — Worker profiles they hearted
   - Same card UI as worker listings

#### Worker — 2 tabs:
1. **Recently Viewed** — JIDs they clicked on (auto-tracked, last 50)
   - Same card UI as JID listings
2. **❤️ Saved** — JIDs they hearted
   - Same card UI as JID listings

---

### Page 7: Account `/account`

**User card at top:**
- Photo + Name
- Phone number
- Custom ID (W... or E...)
- Current mode indicator
- **[Switch to Worker / Employer]** button

**Menu items:**
- 📝 **Edit Profile →** Opens role-specific profile editor (`/account/profile`)
- 📋 **My Job Listings →** Opens Favorites → Jobs Created tab (employer only)
- 🔍 **Search Preferences →**
  - Status: Actively Looking / Not Looking (controls profile visibility)
  - Preferred categories (highlighted)
  - Preferred days
  - Preferred timings
- 📊 **My Activity** — Free leads remaining, total leads used, profile views received
- ❤️ **Favorites →** Links to `/favorites`
- 🌐 **Language:** English / हिंदी toggle
- 📄 **Terms & Privacy**
- 📞 **Help & Support**
- **[Logout]**
- **[Delete Account]** (danger zone)

---

### Page 8: Profile Editor `/account/profile`

Accessed from Account → Edit Profile. Shows fields for the currently active role.

#### Worker Profile Fields:
- Photo (upload)
- Name *
- Gender * (male/female/other — used for default avatar)
- Categories * (multi-select with icons)
- Experience * (years)
- Salary expectations * (min-max ₹/month)
- Day availability * (Mon-Sun checkboxes)
- Time availability * (Morning/Afternoon/Evening/12-hour/24-hour — multi-select)
- Languages (multi-select)
- Originally from (state/city)
- Bio / About (textarea)
- Location / Area * (with auto-detect 📍)
- **Profile Active toggle** (on/off — controls visibility in search)

#### Employer Profile Fields:
- Name *
- Photo (optional)
- Household type (Apartment/Independent House/Villa/Other)
- Location / Area * (with auto-detect 📍)
- **Profile Active toggle**

Note: Employer's job-specific details (category, salary, schedule, requirements) live in their JIDs, not in the employer profile itself.

---

### Page 9: JID Editor `/account/job/[jid]`

Accessed from Favorites → Jobs Created → Edit

**Fields:**
- Category (read-only — set from original search)
- Title (editable — e.g., "Cook for vegetarian family of 4")
- Description / Requirements (editable textarea)
- Salary range (editable min-max)
- Schedule: Full-time / Part-time / Flexible
- Preferred days (checkboxes)
- Preferred timings (multi-select)
- Location (editable with auto-detect)
- **Expiry info:** "Expires in X days" + expiry date
- **[Renew for 30 days]** button
- **[Save Changes]** button
- **[Deactivate]** / **[Delete]** buttons

---

### Static Pages:
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- `/contact` — Help & Support

---

## 8. Database Schema

### Enable PostGIS
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### id_counters
```sql
CREATE TABLE id_counters (
  entity_type TEXT PRIMARY KEY,
  last_id BIGINT DEFAULT 0
);

INSERT INTO id_counters VALUES
  ('worker', 0), ('employer', 0), ('job_listing', 0);

CREATE OR REPLACE FUNCTION next_custom_id(p_type TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_pad INTEGER;
  v_next BIGINT;
BEGIN
  CASE p_type
    WHEN 'worker' THEN v_prefix := 'W'; v_pad := 9;
    WHEN 'employer' THEN v_prefix := 'E'; v_pad := 9;
    WHEN 'job_listing' THEN v_prefix := 'JID'; v_pad := 10;
    ELSE RAISE EXCEPTION 'Invalid type: %', p_type;
  END CASE;

  UPDATE id_counters SET last_id = last_id + 1
  WHERE entity_type = p_type
  RETURNING last_id INTO v_next;

  RETURN v_prefix || LPAD(v_next::TEXT, v_pad, '0');
END;
$$ LANGUAGE plpgsql;
```

### categories
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label_en TEXT NOT NULL,
  label_hi TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO categories (id, slug, label_en, label_hi, sort_order) VALUES
  ('C0001', 'maid', 'Maid', 'कामवाली बाई', 1),
  ('C0002', 'cook', 'Cook', 'रसोइया', 2),
  ('C0003', 'driver', 'Driver', 'ड्राइवर', 3),
  ('C0004', 'gardener', 'Gardener', 'माली', 4),
  ('C0005', 'car_cleaner', 'Car Cleaner', 'कार क्लीनर', 5),
  ('C0006', 'nanny', 'Nanny / Babysitter', 'आया', 6),
  ('C0007', 'personal_trainer', 'Personal Trainer', 'पर्सनल ट्रेनर', 7),
  ('C0008', 'eldercare', 'Elder Care', 'बुज़ुर्गों की देखभाल', 8),
  ('C0009', 'pet_care', 'Pet Care', 'पेट केयर', 9),
  ('C0010', 'laundry', 'Laundry / Ironing', 'धोबी / प्रेस', 10),
  ('C0011', 'security_guard', 'Security Guard', 'सिक्योरिटी गार्ड', 11),
  ('C0099', 'other', 'Other', 'अन्य', 99);
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
  wallet_balance INTEGER DEFAULT 0,          -- paise, Phase 2
  last_active_mode TEXT CHECK (last_active_mode IN ('find_help', 'find_jobs')),
  search_status TEXT DEFAULT 'actively_looking'
    CHECK (search_status IN ('actively_looking', 'not_looking')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### worker_profiles
```sql
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_id TEXT UNIQUE NOT NULL,             -- W000000001
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categories TEXT[] NOT NULL DEFAULT '{}',    -- ['C0001','C0002']
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  salary_min INTEGER,                         -- monthly ₹
  salary_max INTEGER,
  available_days TEXT[] DEFAULT '{}',          -- ['mon','tue',...]
  available_timings TEXT[] DEFAULT '{}',       -- ['morning','evening',...]
  languages TEXT[] DEFAULT '{}',
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  originally_from TEXT,
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wp_location ON worker_profiles USING GIST (location);
CREATE INDEX idx_wp_categories ON worker_profiles USING GIN (categories);
CREATE INDEX idx_wp_city_active ON worker_profiles (city, is_active);
```

### employer_profiles
```sql
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_id TEXT UNIQUE NOT NULL,             -- E000000001
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_type TEXT CHECK (household_type IN ('apartment', 'independent_house', 'villa', 'other')),
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ep_location ON employer_profiles USING GIST (location);
```

### job_listings (JIDs)
```sql
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_id TEXT UNIQUE NOT NULL,              -- JID0000000001
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL REFERENCES categories(id),
  title TEXT,
  description TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  schedule TEXT CHECK (schedule IN ('full_time', 'part_time', 'flexible')),
  preferred_days TEXT[] DEFAULT '{}',
  preferred_timings TEXT[] DEFAULT '{}',
  search_radius_km INTEGER DEFAULT 5,
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'deactivated', 'filled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX idx_jl_location ON job_listings USING GIST (location);
CREATE INDEX idx_jl_category ON job_listings (category, city, status);
CREATE INDEX idx_jl_employer ON job_listings (employer_id);
CREATE INDEX idx_jl_expires ON job_listings (expires_at) WHERE status = 'active';

-- Deduplication: one active JID per employer per category per locality
CREATE UNIQUE INDEX idx_jl_dedup
  ON job_listings (employer_id, category, locality)
  WHERE status = 'active';
```

### lead_reveals
```sql
CREATE TABLE lead_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reveal_type TEXT NOT NULL
    CHECK (reveal_type IN ('employer_to_worker', 'worker_to_employer')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL,
  job_listing_id UUID REFERENCES job_listings(id) ON DELETE SET NULL,
  amount_paid INTEGER DEFAULT 0,              -- 0=free, 1000=₹10 in paise
  was_free_lead BOOLEAN DEFAULT true,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lr_from ON lead_reveals (from_user_id);
CREATE INDEX idx_lr_to ON lead_reveals (to_user_id);

-- Prevent duplicate reveals
CREATE UNIQUE INDEX idx_lr_unique_worker
  ON lead_reveals (from_user_id, worker_profile_id)
  WHERE worker_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_lr_unique_job
  ON lead_reveals (from_user_id, job_listing_id)
  WHERE job_listing_id IS NOT NULL;
```

### favorites
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('worker_profile', 'job_listing')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  job_listing_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, worker_profile_id),
  UNIQUE(user_id, job_listing_id)
);

CREATE INDEX idx_fav_user ON favorites (user_id);
```

### recently_viewed
```sql
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('worker_profile', 'job_listing')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  job_listing_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rv_user ON recently_viewed (user_id, viewed_at DESC);
-- Application logic enforces max 50 per user
```

### Row Level Security
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Worker profiles
CREATE POLICY "Owner all" ON worker_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active" ON worker_profiles FOR SELECT USING (is_active = true);

-- Employer profiles
CREATE POLICY "Owner all" ON employer_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active" ON employer_profiles FOR SELECT USING (is_active = true);

-- Job listings
CREATE POLICY "Owner all" ON job_listings FOR ALL
  USING (employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Read active" ON job_listings FOR SELECT USING (status = 'active');

-- Lead reveals
CREATE POLICY "Create own" ON lead_reveals FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Read own" ON lead_reveals FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Favorites & Recently Viewed
CREATE POLICY "Own" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own" ON recently_viewed FOR ALL USING (auth.uid() = user_id);

-- Reference tables (public read)
CREATE POLICY "Public" ON categories FOR SELECT USING (true);
CREATE POLICY "Public" ON cities FOR SELECT USING (true);
```

---

## 9. JID Auto-Creation Logic

```typescript
// Server Action: employer search → auto-create/reuse JID → return workers
async function employerSearch(params: {
  category: string;          // 'C0002'
  locality: string;          // 'DLF Phase 2'
  location: Point;           // PostGIS point
  radiusKm: number;          // 5
  salaryMin?: number;
  salaryMax?: number;
  employerProfileId: string;
}) {
  // 1. Check for existing active JID (dedup)
  const existing = await supabase
    .from('job_listings')
    .select('*')
    .eq('employer_id', params.employerProfileId)
    .eq('category', params.category)
    .eq('locality', params.locality)
    .eq('status', 'active')
    .single();

  let jid;
  if (existing.data) {
    // Reuse — update changed params
    jid = existing.data;
    await supabase
      .from('job_listings')
      .update({
        salary_min: params.salaryMin ?? jid.salary_min,
        salary_max: params.salaryMax ?? jid.salary_max,
        search_radius_km: params.radiusKm,
        updated_at: new Date(),
      })
      .eq('id', jid.id);
  } else {
    // Create new JID
    const customId = await supabase.rpc('next_custom_id', { p_type: 'job_listing' });
    const { data } = await supabase
      .from('job_listings')
      .insert({
        custom_id: customId,
        employer_id: params.employerProfileId,
        category: params.category,
        locality: params.locality,
        location: params.location,
        search_radius_km: params.radiusKm,
        salary_min: params.salaryMin,
        salary_max: params.salaryMax,
        city: 'gurgaon',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .select()
      .single();
    jid = data;
  }

  // 2. Find matching workers
  const workers = await supabase.rpc('search_workers_nearby', {
    p_category: params.category,
    p_location: params.location,
    p_radius_m: params.radiusKm * 1000,
  });

  return { jid, workers: workers.data };
}
```

---

## 10. Expiry System

**Daily cron** (Supabase Edge Function or pg_cron):
```sql
UPDATE job_listings
SET status = 'expired', updated_at = now()
WHERE status = 'active' AND expires_at < now();
```

**3-day warning** (daily check):
```sql
SELECT * FROM job_listings
WHERE status = 'active'
  AND expires_at BETWEEN now() AND now() + INTERVAL '3 days'
  AND NOT already_notified;  -- track via separate flag or table
```
→ Send WhatsApp reminder for each.

---

## 11. WhatsApp Templates (Gupshup)

### OTP
```
Your Kaamdha code is {OTP}. Valid 5 min. Don't share. — Kaamdha
```

### Lead Reveal — To Requester
```
✅ Contact from Kaamdha:
👤 {name} ({custom_id})
📞 {phone_number}
💼 {category} · {detail}
📍 {locality}
Connect directly. Good luck!
— Kaamdha (kaamdha.com)
```

### Lead Reveal — To Revealed Party
```
📢 Someone viewed your number on Kaamdha!
👤 {viewer_name} from {viewer_locality} is interested.
Keep your profile updated for more leads.
— Kaamdha (kaamdha.com)
```

### JID Expiry Reminder (3 days before)
```
⏰ Your listing {JID} ({category}, {locality}) expires in 3 days.
Renew now: kaamdha.com/account
— Kaamdha
```

---

## 12. Structured Data Values

### Days
`mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`

### Timings
| Value | Display (EN) | Display (HI) | Hours |
|---|---|---|---|
| `morning` | Morning | सुबह | 6am-12pm |
| `afternoon` | Afternoon | दोपहर | 12pm-5pm |
| `evening` | Evening | शाम | 5pm-10pm |
| `12_hour` | 12-hour shift | 12 घंटे | — |
| `24_hour` | 24-hour / Live-in | 24 घंटे / रहने वाला | — |

### Household Types
`apartment`, `independent_house`, `villa`, `other`

### JID Statuses
`active`, `expired`, `deactivated`, `filled`

### Search Status
`actively_looking`, `not_looking`

---

## 13. Design

### Brand Colors
| Name | Hex | Usage |
|---|---|---|
| Primary Teal | `#0D9488` | Buttons, links, active states |
| Dark Teal | `#0F766E` | Hover, emphasis |
| Orange | `#EA580C` | CTAs, pricing, badges |
| Orange Light | `#FFF7ED` | Orange backgrounds |
| Charcoal | `#1E293B` | Primary text |
| Warm BG | `#FFFBF5` | Page backgrounds |
| Teal Light | `#CCFBF1` | Tags, highlights |

### Fonts
- **Outfit** — headings, logo, numbers
- **DM Sans** — body text, UI elements

### UX Rules
- Mobile-first (360px width)
- Minimum friction — fewest taps to reach a phone number
- Hindi + English UI text
- Simple language ("Reveal Number" not "Purchase Lead")
- Optimize for slow 4G connections
- Min 44px touch targets
- Phone masking server-side ("981-XXX-XXXX")
- WhatsApp-first notifications
- Native share sheet (Web Share API + clipboard fallback)
- Location auto-detect as default, manual entry as fallback

---

## 14. Phase 1 Scope

### ✅ Build:
- Home page (2 tabs, logged in/out states)
- Login (phone OTP via Gupshup)
- Search page (employer-only, auto-creates JID)
- Listings page (worker cards for employers, JID cards with filter bar for workers)
- Detail pages (worker profile + JID job detail)
- Favorites (3 tabs employer: Jobs Created / Recently Viewed / Saved | 2 tabs worker: Recently Viewed / Saved)
- Account page (settings, search prefs, role switch, logout)
- Profile editor (worker + employer)
- JID editor (edit, renew, deactivate from Favorites)
- Phone reveal flow (modal → WhatsApp delivery → unmask on screen)
- JID auto-creation from search
- JID deduplication (same employer + category + locality)
- JID 30-day auto-expiry with WhatsApp reminder
- Share (native share sheet)
- PostGIS location search (3/5/10km)
- Location auto-detection (Geolocation API)
- Custom ID system (E/W/C/JID prefixes)
- Search status (actively looking / not looking)
- "Coming soon" for inactive cities
- 4-icon footer navigation

### ❌ Don't Build (Phase 2+):
- Actual ₹10 payments (Razorpay)
- Wallet / top-up system
- Ratings / reviews
- Aadhaar verification
- Admin panel (use Supabase dashboard)
- Push notifications (WhatsApp only)
- In-app chat / messaging
- Notifications page
- Native mobile app
- Multi-language beyond EN + HI

---

## 15. Launch Plan

**City:** Gurgaon (active). All others: "Coming soon to your area."

**Seed Localities:** DLF Phase 1-4, Sohna Road, Golf Course Road, Sector 49-57, South City / Nirvana Country

**Strategy:**
1. Week 1-2: Seed 200-300 worker profiles (on-ground outreach)
2. Week 3-4: Activate employers (society WhatsApp groups, Facebook)
3. Week 5-8: Expand based on organic signup data

**Key Metrics:**
Signups (by role), profile completions, JIDs created, searches, lead reveals, favorites, shares, return visits, inactive city signups

---

## 16. Dev Guidelines

- **Supabase JS SDK** for all DB operations — no raw SQL in app code
- **Server Components** by default, Client Components only for interactivity
- **Server Actions** for mutations (form submissions, JID creation, lead reveals)
- **PostGIS** — store locations as `POINT(lng lat)` — longitude first!
- **Money in paise** — ₹10 = 1000 paise
- **Supabase RLS** for authorization — never trust client-side checks
- **TypeScript strict** — no `any` types
- **Test on:** 360px, 390px, 768px, 1440px
- **Next.js Image** component for all images
- **Supabase Edge Functions** for Gupshup webhook handlers
- **Web Share API** for sharing, clipboard fallback
- **Phone masking server-side** — NEVER expose full phone numbers in API responses
- **JID dedup** enforced via unique index + application-level check
- **JID expiry** via daily cron (Edge Function or pg_cron)
- **Recently viewed** tracked on detail page open, max 50 per user
- **Location auto-detect** via Geolocation API, resolve to locality name, save to profile
