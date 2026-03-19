# CLAUDE.md — kaamdha project brief (v5 — final MVP)

> **Single source of truth. Read this fully before writing any code.**

---

## 1. Project overview

**kaamdha** (कामधा) is a two-sided marketplace connecting household staff (workers) with employers in India.

- **Website:** kaamdha.com
- **Platform:** Responsive web (mobile-first, no native app)
- **Launch:** Gurgaon first, organic registrations accepted from all cities

### Core model — asymmetric marketplace

**Path 1 — Employer-initiated:**
Employer searches for staff → search auto-creates a job listing (JID) → Workers discover these JIDs → Worker connects with employer via WhatsApp

**Path 2 — Worker-initiated:**
Worker creates a profile → Employers search and browse worker profiles → Employer connects with worker via WhatsApp

Both sides can discover each other. Both sides pay ₹10 to connect (reveal phone numbers).

### Monetization
- **Phase 1 (launch):** Everything FREE. Price shown crossed out: ~~₹10~~ FREE
- **Phase 2+:** ₹10 per phone reveal. First 3 free for new users. Both sides pay.

---

## 2. Terminology & style rules

### Naming
| Old term | New term (use everywhere) |
|---|---|
| Find Help | Find staff |
| Workers | Staff |
| Help | Staff |
| Reveal | Connect |
| Reveal number | Connect |

### Style rules
- **Sentence casing everywhere** — "Find staff" not "Find Staff", "Edit profile" not "Edit Profile"
- **Brand name without logo** — always lowercase "kaamdha" (never "Kaamdha" or "KAAMDHA")
- **Brand with logo** — use the logo image file (provided separately)
- **No tagline** displayed anywhere in UI
- **6 categories only** for MVP: Maid, Cook, Driver, Nanny, Personal trainer, Elder care
- **Phone format:** Always show `+91` prefix with first 3 digits visible, rest masked: `+91 981-XXX-XXXX`
- **No telephone icon (📞)** before phone numbers
- **"Connect"** button with teal background (brand color) — replaces all instances of orange "Reveal"

---

## 3. ID system

| Entity | Prefix | Format | Example |
|---|---|---|---|
| Employer | E | E + 9 digits | E000000001 |
| Worker (staff) | W | W + 9 digits | W000000001 |
| Category | C | C + 4 digits | C0001 |
| Job listing | JID | JID + 10 digits | JID0000000001 |

- Auto-generated sequentially via `next_custom_id()` Postgres function
- **IDs are NOT displayed** on cards or detail pages to end users
- Used internally for URLs, WhatsApp messages, and support reference

---

## 4. Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + PostGIS) |
| DB access | Supabase JS SDK (no ORM) |
| Auth | Supabase Auth (phone OTP → Gupshup custom SMS hook) |
| Storage | Supabase Storage (profile photos, logo) |
| SMS/WhatsApp | Gupshup |
| Payments | Razorpay (Phase 2+ only — NOT in Phase 1) |
| Analytics | PostHog |
| Errors | Sentry |
| Hosting | Vercel |
| VCS | GitHub |

---

## 5. Roles

**Role selected after OTP verification** during onboarding. User chooses:
- "I'm looking for staff" → Employer
- "I'm looking for jobs" → Worker (staff)

One phone = one account. Role switching is NOT in Phase 1 MVP. `last_active_mode` tracks current mode.

---

## 6. Categories (6 only for MVP)

| ID | Slug | Label (EN) | Label (HI) | Icon |
|---|---|---|---|---|
| C0001 | maid | Maid | कामवाली बाई | 🧹 |
| C0002 | cook | Cook | रसोइया | 🍳 |
| C0003 | driver | Driver | ड्राइवर | 🚗 |
| C0004 | nanny | Nanny | आया | 👶 |
| C0005 | personal_trainer | Personal trainer | पर्सनल ट्रेनर | 💪 |
| C0006 | eldercare | Elder care | बुज़ुर्गों की देखभाल | 👴 |

No other categories. Remove Gardener, Car Cleaner, Pet Care, Laundry, Security Guard, Other from all pages.

---

## 7. JID system — core concept

### How JIDs are created

**Auto-creation from employer search:**
When an employer hits "Search staff" with criteria (category + area + optional salary), a JID is automatically created. Workers can then discover it.

**Deduplication:**
Same employer + same category + same locality (active) = reuse existing JID, update changed params.

### JID lifecycle
```
Created (auto from search or manual)
  → Active (visible to workers for 30 days)
    → Employer can edit anytime
    → Day 27: WhatsApp reminder
      → No action → Day 30: status = 'expired'
  → Employer deactivates manually → status = 'deactivated'
  → Employer marks filled → status = 'filled'
```

### JID fields
- **Auto-populated from search:** category, area/locality, location (PostGIS)
- **Editable later:** title, description/requirements, salary range, preferred timings
- **System-managed:** JID number, employer_id, created_at, updated_at, expires_at, status
- **Removed from JID:** schedule (full-time/part-time), preferred days, distance/km, "renew for 30 days" button

---

## 8. Navigation & layout

### NO bottom navigation bar. NO search page.

Navigation is handled via:
- **Logo (top-left):** Tapping the logo always returns to home page. Logo is a full image file.
- **Top-right (logged out):** Language toggle (EN/हि) + "Login" button
- **Top-right (logged in):** ❤️ Favorites icon + 👤 Account icon
- **Search is embedded directly on the home page** (employer logged in state)
- **Search triggers actual search** — does not navigate to a separate search page

### Header variants

**Logged out:**
```
[Logo]                    [EN/हि] [Login]
```

**Logged in:**
```
[Logo]                    [❤️] [👤]
```

**Inner pages:**
```
[← Back] [Page title]    [📤 share or ✏️ edit]
```

**Account page:**
```
[← Back] (no icons in top right)
```

---

## 9. User journey flows

### Flow 1: New employer
```
Home (logged out) → "Find staff" tab → "Login to get started"
  → Login page → Phone + OTP → Verify
    → Onboarding: Role selection → "I'm looking for staff"
    → Onboarding: Employer details (name, area, category, optional: title, requirements, salary, timings)
    → "Find staff" → Staff listings page with search results
      → Tap card → Worker detail → Connect
      → Tap ❤️ → Favorites
      → Tap 📤 → Share modal
```

### Flow 2: New worker (staff)
```
Home (logged out) → "Find jobs" tab → "Login to get started"
  → Login page → Phone + OTP → Verify
    → Onboarding: Role selection → "I'm looking for jobs"
    → Onboarding: Worker details (name, area, skills, timings, experience, salary, about)
    → "Create profile" → Home (worker mode) with nearby JIDs
      → Tap card → Job detail → Connect
```

### Flow 3: Returning user
```
Login → OTP → Returning user → Home (logged in, last active mode)
```

### Flow 4: Phone connect
```
Tap [Connect] on any card or detail page
  → Bottom sheet modal:
    "Connect with [Name]?"
    "~~₹10~~ FREE"
    "Number will be sent to your WhatsApp"
    [Connect via WhatsApp] [Cancel]
  → Confirm → Number sent to WhatsApp + shown on screen with +91 prefix
```

### Flow 5: Share
```
Tap 📤 on any detail page
  → Custom bottom sheet:
    "Share this profile" / "Share this job"
    [Link preview: kaamdha.com/details/[id]]
    [WhatsApp] [Copy link] [SMS] [Email]
    [Cancel]
```

---

## 10. Site structure — pages

### Page 1a: Home `/` (not logged in — "Find staff" tab active)

**Header:** `[Logo] [EN/हि] [Login]`

- Two big square toggle buttons: "Find staff" (active/teal) | "Find jobs"
- Headline: "How kaamdha works for household owners"
- Steps:
  1. Register for free → Sign up with your phone number in under a minute
  2. Find staff → Find verified staff like cook, driver, maids etc. near your area
  3. Get contact → Connect directly via WhatsApp
- **Hero image** (provided separately — replaces category grid)
- CTA: "Login to get started"
- **Footer:** Grey background, "Made with ❤️ for Bharat"

### Page 1b: Home `/` (not logged in — "Find jobs" tab active)

Same layout, content changes:
- Headline: "How kaamdha works for job seekers"
- Steps:
  1. Register for free → Sign up with your phone number in under a minute
  2. Find jobs → Find households offering jobs near you
  3. Get contact → Connect directly via WhatsApp
- Category pills showing what job seekers can register as (6 categories)
- CTA: "Login to get started"
- Footer: "Made with ❤️ for Bharat"

---

### Page 2a: Home `/` (logged in — employer)

**Header:** `[Logo] [❤️] [👤]`

- No Find staff/Find jobs tabs (user already registered under one role)
- Greeting: "Good morning, Priya 👋"
- No stats boxes (free leads, jobs created, etc. — deferred to later)

**Embedded search section:**
- Area/locality input with 📍 (on top, right below greeting)
- Category pills (6 only)
- No km/distance selection
- "Search staff" button (no 🔍 icon)
- Clicking search triggers actual search → navigates to staff listings page
- Search auto-creates JID

**Your recent searches section:**
- Cards showing: category icon + category name, location + salary range
- Status badge (Active) with ✏️ edit icon below it
- Time display: "Created today" / "Created 3 days ago" — NOT expiry/days left
- Clicking a recent search card triggers that search again
- No "Create new job listing" banner

---

### Page 2b: Home `/` (logged in — worker/staff)

**Header:** `[Logo] [❤️] [👤]`

- No tabs
- Greeting: "Good evening, Ramesh 👋"
- No stats boxes
- No "Browse jobs near you" search bar

**Jobs near you section:**
- JID cards with this format:
  - Line 1: Job title (or "Category needed" if blank)
  - Line 2: Location · distance (with . delimiter)
  - Line 3: Salary (if available)
  - Line 4: Timings (no days)
  - Separator line
  - Below separator: `+91 981-XXX-XXXX` (no 📞 icon)
  - ♡ heart in top-right of card
  - "Connect" button (teal background) on right of phone
  - No 📤 share icon on cards

---

### Page 3a: Login `/login`

**Header:** `[Logo] [EN/हि]`

- No "Login to kaamdha" heading
- Centered: "Login or register with your phone number" (bigger, bolder text)
- Phone input (+91 prefix) — centered in middle of screen
- "Send OTP" button

### Page 3b: OTP `/login` (after send OTP)

- "Enter OTP" heading centered in middle of screen
- 6-digit input boxes
- "Verify & continue" button
- Resend timer + "← Change number" link

---

### Page 4a: Onboarding — Role selection `/onboard`

**Header:** `[Logo]`

- "What are you looking for?"
- Two cards centered at horizontal middle of screen:
  - 🏠 "I'm looking for staff" — Find maids, cooks, drivers and more near you
  - 💼 "I'm looking for jobs" — Get hired by households near you
- "Continue" button

### Page 4b: Onboarding — Employer `/onboard/employer`

**Header:** `[Logo]`

- Starts from top of page (no white space above)
- "What are you looking for?" + "Tell us so we can find the right staff"
- Fields (in order):
  1. Your name * (required)
  2. Your area / locality * (required, with 📍 auto-detect)
  3. Select category * (required, 6 pills)
  4. Job title (optional)
  5. Requirements (optional, textarea)
  6. Salary range (optional, min-max)
  7. Preferred timings (optional): Morning, Afternoon, Evening, 12 hours, 24 hours
- No distance/km fields
- CTA: "Find staff" (no 🔍 icon)
- Subtext: "You'll be taken to matching staff listings"

### Page 4c: Onboarding — Worker `/onboard/worker`

**Header:** `[Logo]`

- Starts from top (no white space)
- "Set up your profile" + "So employers can find you"
- Fields (in order):
  1. Your name * (required)
  2. Your area / locality * (required, with 📍)
  3. What work do you do? * (required, 6 category pills)
  4. Available timings * (required): Morning, Afternoon, Evening, 12 hours, 24 hours
  5. Experience (years) (optional, numeric input)
  6. Expected salary ₹/month (optional, min-max)
  7. About (optional, textarea)
- No "Available days" field
- CTA: "Create profile"
- Subtext: "We will find the right jobs for you"

---

### Page 5: Staff listings / Search results `/search`

**Header:** `[Logo] [❤️] [👤]`

- Search bar on top (same as employer homepage): area input + 📍 + category pills
- JID creation notice: "✅ Job listing created — workers can now find you!"
- Results count: "Results (2)"

**Staff card format:**
- Avatar (👨/👩) + Name
- Location · distance (with . delimiter)
- Experience (if available)
- Salary (if available)
- Timings (no days)
- Separator
- `+91 981-XXX-XXXX` (no 📞 icon)
- ♡ heart in top-right
- "Connect" button (teal)
- No 📤 share icon on cards
- No JID/worker ID shown

**Empty state:** "Sorry, we don't have any staffers matching your criteria. We are working hard to find staff near you." — friendly tone with illustration

---

### Page 6a: Worker detail `/details/[uuid]`

**Header:** `[← Back] Staff profile [📤 share or ✏️ edit]`
- If viewing own profile → show ✏️ edit icon
- If viewing someone else's → show 📤 share icon

- Avatar + Name
- Below name: `+91 981-XXX-XXXX` (masked)
- No category tags below name (skill is in details table)
- No location below name (location is in details table)

**Details table:**
- Skills
- Location (with distance)
- Experience
- Salary
- Timings
- Languages
- From
- About

- No "Days" row
- No report button
- No worker ID shown
- No "2 of 3 leads remaining" subtext

**Sticky footer:** ♡ Heart + "Connect · ~~₹10~~ FREE" button (teal)

### Page 6b: Job detail `/details/JID...`

**Header:** `[← Back] Job detail [📤 share or ✏️ edit]`
- If own job → ✏️ edit icon
- If viewing others → 📤 share icon

- Category icon + Job title
- Below title: `+91 981-XXX-XXXX` (masked)
- No location below title (location in details table)

**Employer section:** "Posted by" — avatar + name + household type + location

**Details table:**
- Salary
- Timings
- Location (with distance)
- Posted date

- No "Days" row
- No "Schedule" row
- No "Expires" row
- No report button
- No JID shown
- No "1 of 3 leads remaining" subtext

**Sticky footer:** ♡ Heart + "Connect · ~~₹10~~ FREE" button (teal)

---

### Page 7a: Connect modal (before)

Bottom sheet overlay:
- "Connect with [Name]?"
- ~~₹10~~ FREE
- "Number will be sent to your WhatsApp"
- "Connect via WhatsApp" (teal button)
- "Cancel"

### Page 7b: Connect modal (after)

Bottom sheet:
- `+91 981-234-5678` (no 📞 icon, +91 prefix)
- "Call" button (green)
- "Sent to your WhatsApp ✓"
- "Close"

---

### Page 8: Share modal

Custom bottom sheet (not native Web Share API):
- "Share this profile" / "Share this job"
- Link preview: `kaamdha.com/details/[id]`
- 4 share options: WhatsApp, Copy link, SMS, Email
- "Cancel"

---

### Page 9a: Favorites `/favorites` (employer)

**Header:** `[← Back] Favorites`

3 tabs: Jobs created | Recently contacted | Saved

**Jobs created tab:**
- Same card format as job listings on worker home page
- Status badge (Active/Expired) + ✏️ edit icon
- Time: "Created X days ago"

**Recently contacted / Saved tabs:**
- Worker cards matching staff listings card format

### Page 9b: Favorites `/favorites` (worker)

2 tabs: Recently contacted | Saved

- Job cards matching worker home page card format
- Empty state: "No contacts revealed yet."

---

### Page 10: Account `/account`

**Header:** `[← Back]` — NO icons in top right, NO title "Your account"

- Name + phone number (no ID, no role badge)
- Menu items:
  - 📝 Edit profile →
  - 📋 My job listings → (employer only, shows count)
  - ❤️ Favorites →
  - 📞 Help and support → kaamdha@gmail.com
- Logout button (red text)

**Removed from account:**
- Language field
- Terms & privacy
- Delete account
- Profile status toggle
- Staff/Employer tab/ID

---

### Page 10a: Edit employer profile `/account/profile`

**Header:** `[← Back] Edit profile`

Fields:
1. Phone number (greyed out, non-editable, shown on top)
2. Name
3. Location (with 📍)
4. Household type (pills: Apartment, Independent house, Villa, Other)
- "Save changes" button

### Page 10b: Edit worker profile `/account/profile`

**Header:** `[← Back] Edit profile`

Fields:
1. Phone number (greyed out, non-editable, shown on top)
2. Name
3. Location (with 📍)
4. Skills (6 category pills)
5. Experience (years) — numeric input
6. Expected salary (₹/month) — min/max
7. Available timings: Morning, Afternoon, Evening, 12 hours, 24 hours
8. About (textarea)

**Removed:** Available days

- "Save changes" button

### Page 10c: Edit job listing `/account/job/[jid]`

**Header:** `[← Back] Edit job listing`

- Category header card: icon + category name + status badge + location + "Created X days ago"

Fields:
1. Job title
2. Requirements (textarea)
3. Salary range (min/max)
4. Preferred timings: Morning, Afternoon, Evening, 12 hours, 24 hours

**Removed:** Schedule (full-time/part-time), Preferred days, "Renew for 30 days" button

- "Save changes" button
- "Deactivate" button (red outline)

---

### Static pages
- `/terms` — Terms of service (Phase 2)
- `/privacy` — Privacy policy (Phase 2)
- `/contact` — Help & support

---

## 11. Database schema

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

INSERT INTO categories (id, slug, label_en, label_hi, icon, sort_order) VALUES
  ('C0001', 'maid', 'Maid', 'कामवाली बाई', '🧹', 1),
  ('C0002', 'cook', 'Cook', 'रसोइया', '🍳', 2),
  ('C0003', 'driver', 'Driver', 'ड्राइवर', '🚗', 3),
  ('C0004', 'nanny', 'Nanny', 'आया', '👶', 4),
  ('C0005', 'personal_trainer', 'Personal trainer', 'पर्सनल ट्रेनर', '💪', 5),
  ('C0006', 'eldercare', 'Elder care', 'बुज़ुर्गों की देखभाल', '👴', 6);
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
  ('noida', 'Noida', 'नोएडा', false, 28.5355, 77.3910);
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
  last_active_mode TEXT CHECK (last_active_mode IN ('find_staff', 'find_jobs')),
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
  custom_id TEXT UNIQUE NOT NULL,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categories TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  salary_min INTEGER,
  salary_max INTEGER,
  available_timings TEXT[] DEFAULT '{}',
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

Note: `available_days` column removed from worker_profiles — days field is no longer used.

### employer_profiles
```sql
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_id TEXT UNIQUE NOT NULL,
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
  custom_id TEXT UNIQUE NOT NULL,
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL REFERENCES categories(id),
  title TEXT,
  description TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  preferred_timings TEXT[] DEFAULT '{}',
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

CREATE UNIQUE INDEX idx_jl_dedup
  ON job_listings (employer_id, category, locality)
  WHERE status = 'active';
```

Note: Removed `schedule`, `preferred_days`, `search_radius_km` columns — these fields are no longer used.

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
  amount_paid INTEGER DEFAULT 0,
  was_free_lead BOOLEAN DEFAULT true,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lr_from ON lead_reveals (from_user_id);
CREATE INDEX idx_lr_to ON lead_reveals (to_user_id);

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
```

### Row level security
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update own" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owner all" ON worker_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active" ON worker_profiles FOR SELECT USING (is_active = true);

CREATE POLICY "Owner all" ON employer_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active" ON employer_profiles FOR SELECT USING (is_active = true);

CREATE POLICY "Owner all" ON job_listings FOR ALL
  USING (employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Read active" ON job_listings FOR SELECT USING (status = 'active');

CREATE POLICY "Create own" ON lead_reveals FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Read own" ON lead_reveals FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Own" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own" ON recently_viewed FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public" ON categories FOR SELECT USING (true);
CREATE POLICY "Public" ON cities FOR SELECT USING (true);
```

---

## 12. JID auto-creation logic

```typescript
async function employerSearch(params: {
  category: string;
  locality: string;
  location: Point;
  salaryMin?: number;
  salaryMax?: number;
  employerProfileId: string;
}) {
  // 1. Dedup check
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
    jid = existing.data;
    await supabase.from('job_listings').update({
      salary_min: params.salaryMin ?? jid.salary_min,
      salary_max: params.salaryMax ?? jid.salary_max,
      updated_at: new Date(),
    }).eq('id', jid.id);
  } else {
    const customId = await supabase.rpc('next_custom_id', { p_type: 'job_listing' });
    const { data } = await supabase.from('job_listings').insert({
      custom_id: customId,
      employer_id: params.employerProfileId,
      category: params.category,
      locality: params.locality,
      location: params.location,
      salary_min: params.salaryMin,
      salary_max: params.salaryMax,
      city: 'gurgaon',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).select().single();
    jid = data;
  }

  // 2. Find matching workers
  const workers = await supabase.rpc('search_workers_nearby', {
    p_category: params.category,
    p_location: params.location,
    p_radius_m: 10000, // 10km default
  });

  return { jid, workers: workers.data };
}
```

---

## 13. Expiry system

Daily cron:
```sql
UPDATE job_listings SET status = 'expired', updated_at = now()
WHERE status = 'active' AND expires_at < now();
```

WhatsApp reminder 3 days before expiry.

---

## 14. WhatsApp templates

### OTP
```
Your kaamdha code is {OTP}. Valid 5 min. Don't share. — kaamdha
```

### Lead connect — to requester
```
✅ Contact from kaamdha:
👤 {name}
📞 +91 {phone_number}
💼 {category}
📍 {locality}
— kaamdha (kaamdha.com)
```

### Lead connect — to revealed party
```
📢 Someone viewed your number on kaamdha!
👤 {viewer_name} from {viewer_locality} is interested.
— kaamdha (kaamdha.com)
```

### JID expiry reminder
```
⏰ Your listing ({category}, {locality}) expires in 3 days.
Open kaamdha to renew: kaamdha.com/account
— kaamdha
```

---

## 15. Structured data values

### Timings
`morning` (6am-12pm), `afternoon` (12pm-5pm), `evening` (5pm-10pm), `12_hour`, `24_hour`

### Household types
`apartment`, `independent_house`, `villa`, `other`

### JID statuses
`active`, `expired`, `deactivated`, `filled`

---

## 16. Design

### Brand
- Logo: Full image file (placed top-left on all pages, links to home)
- Brand name without logo: always lowercase "kaamdha"
- No tagline anywhere

### Colors
| Name | Hex | Usage |
|---|---|---|
| Primary teal | `#0D9488` | Buttons, links, active states, Connect button |
| Dark teal | `#0F766E` | Hover, emphasis |
| Orange | `#EA580C` | Badges only (not buttons) |
| Charcoal | `#1E293B` | Primary text |
| Slate 100 | `#F1F5F9` | Page backgrounds, card backgrounds |
| Teal light | `#CCFBF1` | Tags, pill active states |

### Fonts
- **Outfit** — headings, numbers
- **DM Sans** — body text, UI elements

### UX rules
- Mobile-first (390px)
- Sentence casing everywhere
- No bottom nav bar
- Logo = home button
- 6 categories only
- Phone format: `+91 981-XXX-XXXX` (no 📞 icon)
- "Connect" button in teal (not orange "Reveal")
- No IDs (JID/W/E) shown to end users
- No report button
- No days field anywhere
- Share via custom bottom sheet modal
- Location auto-detect default, manual fallback

---

## 17. Phase 1 scope

### ✅ Build:
- Home (logged out: Find staff / Find jobs with square tabs, hero image, "Made with ❤️ for Bharat" footer)
- Home (logged in: employer with embedded search, worker with job cards)
- Login + OTP (separate screens)
- Onboarding (role selection + employer details + worker details)
- Staff listings / search results (with search bar on top)
- Detail pages (worker + job — with masked phone, share/edit icon in header)
- Connect modal (before + after states)
- Share modal (WhatsApp, Copy link, SMS, Email)
- Favorites (3 tabs employer / 2 tabs worker)
- Account (edit profile, my jobs, favorites, help, logout)
- Edit employer profile (with greyed phone on top)
- Edit worker profile (with greyed phone, no days, experience numeric)
- Edit job listing (no schedule, no days, 12h/24h timings, no renew button)
- JID auto-creation from search + deduplication
- JID 30-day auto-expiry + WhatsApp reminder
- PostGIS location search
- Location auto-detection
- Empty state for no search results

### ❌ Don't build (Phase 2+):
- Bottom navigation bar
- Role switching
- Stats boxes (free leads, jobs created, etc.)
- Payments (Razorpay)
- Wallet
- Ratings/reviews
- Aadhaar verification
- Admin panel
- Push notifications
- In-app chat
- Native app
- Terms & privacy pages
- Delete account
- Profile status toggle
- Language selector (in-app)
- Distance/km selection in search
