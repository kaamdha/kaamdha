# CLAUDE.md — Kaamdha Project Brief (Final v2)

> **Single source of truth for the Kaamdha project. Read fully before writing any code.**

---

## 1. Project Overview

**Kaamdha** (कामधा) is a two-sided directory connecting blue-collar household workers with households looking to employ them in India.

- **Website:** kaamdha.com
- **Tagline:** "Post or find jobs in just ₹10"
- **Platform:** Responsive web app (mobile-first)
- **Launch Market:** Gurgaon (organic registrations accepted from all cities)
- **Core Model:** Both sides create profiles. Both sides browse. Direct phone connection via WhatsApp.

### How It Works
- **Workers** list themselves with skills, availability, salary expectations
- **Employers** list themselves with what help they need, availability, salary offered
- **Both sides** search, browse, and reveal phone numbers to connect directly
- **No middlemen.** No agency fees. Just ₹10 per lead.

### Monetization
- **Phase 1:** Everything FREE. ₹10 price shown but crossed out (~~₹10~~ FREE)
- **Phase 2+:** ₹10 per lead. First 3 free for new users. Both sides pay.

---

## 2. ID System

| Entity | Format | Example |
|---|---|---|
| Employer | E + 9 digits | E000000001 |
| Worker | W + 9 digits | W000000001 |
| Category | C + 4 digits | C0001 |

- IDs are auto-generated sequentially
- Displayed on profiles and in communications for easy reference
- Stored alongside UUID primary keys (UUID for DB relations, custom ID for human-facing)

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Supabase (PostgreSQL + PostGIS) |
| **DB Access** | Supabase JS SDK (no ORM) |
| **Auth** | Supabase Auth (Phone OTP via Gupshup custom hook) |
| **File Storage** | Supabase Storage |
| **SMS/OTP** | Gupshup |
| **WhatsApp** | Gupshup (lead delivery + notifications) |
| **Payments** | Razorpay (Phase 2+ only) |
| **Analytics** | PostHog (free tier) |
| **Error Tracking** | Sentry (free tier) |
| **Hosting** | Vercel |
| **Version Control** | GitHub |

---

## 4. User Roles

### No Explicit Role Selection
One phone number = one account. Role detected from behavior:
- Uses "Find Help" tab → Employer
- Uses "Find Jobs" tab → Worker
- Can be both. A driver who needs a maid can have both profiles.

### Worker (कामगार)
Creates a profile listing their skills, experience, availability, salary expectations. Gets discovered by employers.

### Employer (गृहस्वामी)
Creates a profile listing what help they need (multiple categories allowed), availability, salary offered. Gets discovered by workers.

---

## 5. Site Structure

### Global Footer (persistent, 4 icons)

| Icon | Label | Route |
|---|---|---|
| 🏠 | Home | `/` |
| 🔍 | Search | `/search` |
| ❤️ | Favorites | `/favorites` |
| 👤 | Account | `/account` |

---

### Page 1: Home `/`

#### Not Logged In — Two tabs at top:

**Tab 1: "Find Help" (default)**
```
┌────────────────────────────────────┐
│  [Find Help]  [Find Jobs]          │
│                                    │
│  Find trusted household            │
│  help near you                     │
│                                    │
│  Search for maids, cooks,          │
│  drivers & more.                   │
│  Get leads in just ₹10.           │
│                                    │
│  🎉 First 3 leads are FREE        │
│                                    │
│  How it works:                     │
│  1. Register with phone number     │
│  2. Search for your requirements   │
│  3. Get leads for ~~₹10~~ FREE    │
│                                    │
│  [🧹 Maid] [🍳 Cook] [🚗 Driver] │
│  [🌿 Garden] [🚿 Car] [👶 Nanny] │
│  [💪 Trainer] [👴 Elder] [➕ More]│
│                                    │
│  [ Login to Get Started ]          │
└────────────────────────────────────┘
```

**Tab 2: "Find Jobs"**
```
┌────────────────────────────────────┐
│  [Find Help]  [Find Jobs]          │
│                                    │
│  Get hired by families             │
│  near you                          │
│                                    │
│  Share your profile and connect    │
│  with employers.                   │
│  List yourself for just ₹10.      │
│                                    │
│  🎉 First 3 listings are FREE     │
│                                    │
│  How it works:                     │
│  1. Register with phone number     │
│  2. Create your profile            │
│  3. Get calls from employers       │
│                                    │
│  [ Login to Get Started ]          │
└────────────────────────────────────┘
```

#### Logged In:
- Remembers last active mode (`find_help` or `find_jobs`) via `last_active_mode`
- Time-aware greeting: "Good morning, Priya 👋" / "Shubh sandhya, Ramesh 👋"
- Prominent search bar — tapping opens `/search`
- Below search:
  - **Employer mode:** Category quick-access tiles + recent activity
  - **Worker mode:** Recent employer listings near their location
- Stats summary (free leads remaining, recent profile views)

---

### Page 2: Login `/login`

```
┌────────────────────────────────────┐
│          kaamdha                   │
│                                    │
│   Login or Register                │
│                                    │
│   +91 [______________]             │
│                                    │
│   [ Send OTP ]                     │
│                                    │
│   Enter OTP:                       │
│   [_] [_] [_] [_] [_] [_]        │
│                                    │
│   Didn't receive? Resend in 0:28   │
│                                    │
│   [ Verify & Continue ]            │
└────────────────────────────────────┘
```

**Post-login flow:**

**New user (came from "Find Help" tab = Employer):**
1. Collect: Name, Location (area/locality)
2. Redirect to → `/search` (employer mode)
3. Prompt to complete full employer profile later

**New user (came from "Find Jobs" tab = Worker):**
1. Collect: Name, Location, Category (job types), Availability (days + timings)
2. Redirect to → `/listings` showing matches for their criteria
3. Prompt to complete full worker profile later

**Returning user:** → Home (logged in state)

---

### Page 3: Search `/search`

#### Employer Mode (Find Help):

```
┌────────────────────────────────────┐
│  ← Search                         │
│                                    │
│  [Maid][Cook][Driver][Garden]→     │
│                                    │
│  📍 Enter your area / locality     │
│  ○ 3km  ● 5km  ○ 10km            │
│                                    │
│  [ 🔍 Search Workers ]            │
│                                    │
│  ─── or ───                        │
│  [ + Create Employer Listing ]     │
│  So workers can find YOU           │
│                                    │
│  --- Results load below ---        │
│  (Worker listing cards)            │
└────────────────────────────────────┘
```

- Category tabs (horizontal scroll)
- Area search bar with location icon
- Distance pills: 3km / 5km / 10km
- Search button
- Prominent CTA to create employer listing ("So workers can find YOU")
- Results: Worker listing cards (same as Listings page)

#### Worker Mode (Find Jobs):

```
┌────────────────────────────────────┐
│  ← Search                         │
│                                    │
│  [Maid][Cook][Driver][Garden]→     │
│                                    │
│  📍 Enter your area / locality     │
│  ○ 3km  ● 5km  ○ 10km            │
│                                    │
│  [ 🔍 Search Jobs ]               │
│                                    │
│  --- Results load below ---        │
│  (Employer listing cards)          │
└────────────────────────────────────┘
```

- Same filter structure
- Results: Employer listing cards
- Loads immediately based on worker's saved location

---

### Page 4: Listings `/listings`

This is where search results are displayed. Can also be accessed directly.

#### Employer View — Worker Cards:

```
┌────────────────────────────────────┐
│ [Cook ▼] [5km ▼] [Salary ▼]       │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 👨 Ramesh Kumar        ❤️ 📤  │ │
│ │ Cook, Maid                     │ │
│ │ 5 years exp                    │ │
│ │ ₹10,000 - ₹14,000/mo          │ │
│ │ Mon-Sat · Morning              │ │
│ │ Originally from: Bihar         │ │
│ │ 📞 981-XXX-XXXX    [Reveal]   │ │
│ │ W000000123 · 1.2km away        │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 👩 Sunita Devi         ❤️ 📤  │ │
│ │ Cook                           │ │
│ │ 8 years exp                    │ │
│ │ ₹6,000 - ₹8,000/mo            │ │
│ │ Mon-Fri · Morning, Evening     │ │
│ │ Originally from: UP            │ │
│ │ 📞 987-XXX-XXXX    [Reveal]   │ │
│ │ W000000089 · 2.4km away        │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**Worker card fields:**
1. Photo / Default gender icon (👨/👩)
2. Name
3. Categories offered (tags: Cook, Maid)
4. Experience (years)
5. Salary expectations (min-max range/month)
6. Day availability (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
7. Time availability (Morning, Afternoon, Evening, 12-hour, 24-hour)
8. Originally from (city/state)
9. ❤️ Favorite icon
10. 📤 Share icon (native share sheet: WhatsApp, SMS, copy link)
11. 📞 Phone: masked "981-XXX-XXXX" with [Reveal] button
12. Worker ID (W-prefix)
13. Distance from user

#### Worker View — Employer Cards:

```
┌────────────────────────────────────┐
│ [Cook ▼] [5km ▼] [Salary ▼]       │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🏠 Priya Sharma        ❤️ 📤  │ │
│ │ Looking for: Cook, Maid        │ │
│ │ ₹8,000 - ₹12,000/mo           │ │
│ │ Mon-Sat · Morning, Evening     │ │
│ │ DLF Phase 2, Gurgaon          │ │
│ │ 📞 991-XXX-XXXX    [Reveal]   │ │
│ │ E000000045 · 1.8km away        │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

**Employer card fields:**
1. Name
2. Categories needed (tags: Cook, Maid)
3. Salary offered (min-max range/month)
4. Day availability required
5. Time availability required
6. Location / locality
7. ❤️ Favorite icon
8. 📤 Share icon
9. 📞 Phone: masked with [Reveal] button
10. Employer ID (E-prefix)
11. Distance from user

---

### Phone Number Reveal Flow (applies on all cards + detail pages)

```
User taps [Reveal] or masked phone number
  → Confirmation modal:
  ┌─────────────────────────────────┐
  │  📞 Reveal Ramesh's number?     │
  │                                 │
  │  ~~₹10~~ FREE                   │
  │  (2 of 3 free leads remaining)  │
  │                                 │
  │  Number will be sent to         │
  │  your WhatsApp                  │
  │                                 │
  │  [Reveal via WhatsApp] [Cancel] │
  └─────────────────────────────────┘
  → User confirms
    → Backend:
      1. Check not already revealed (unique constraint)
      2. Decrement free_leads_remaining
      3. Send phone number to user's WhatsApp (Gupshup)
      4. Notify other party via WhatsApp
      5. Log in lead_reveals table
      6. Unmask on screen: "981-234-5678"
    → UI: Number unmasked + "Sent to your WhatsApp ✓"
```

Phase 1: Always free. Counter shows but doesn't block.
Phase 2: Razorpay payment after 3 free leads.

---

### Page 5: Details `/details/[id]`

#### Worker Detail (viewed by employer):

```
┌────────────────────────────────────┐
│  ← Worker Profile          🚩     │
│                                    │
│         [  👨 Photo  ]             │
│       Ramesh Kumar                 │
│    W000000123 · Sector 49          │
│       📍 1.2km away               │
│                                    │
│  [🍳 Cook] [🧹 Maid]              │
│                                    │
│  Experience      5 years           │
│  Salary          ₹10,000-₹14,000  │
│  Days            Mon-Sat           │
│  Timings         Morning           │
│  Languages       Hindi, English    │
│  Originally from Bihar             │
│                                    │
│  About:                            │
│  "Experienced cook, can prepare    │
│   North Indian, South Indian,      │
│   and Chinese food..."             │
│                                    │
│  ❤️ Save    📤 Share               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📞 Reveal Number             │  │
│  │ ~~₹10~~ FREE (2 remaining)  │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

- Full photo, name, worker ID, location + distance
- Category tags
- All profile fields: experience, salary, days, timings, languages, origin
- Bio/about section
- ❤️ Favorite + 📤 Share
- 📞 Reveal button (sticky bottom)
- 🚩 Report link (top right)

#### Employer Detail (viewed by worker):

```
┌────────────────────────────────────┐
│  ← Employer Profile         🚩    │
│                                    │
│       Priya Sharma                 │
│    E000000045 · DLF Phase 2        │
│       📍 1.8km away               │
│                                    │
│  Looking for: [🍳 Cook] [🧹 Maid] │
│                                    │
│  Salary offered  ₹8,000-₹12,000   │
│  Days needed     Mon-Sat           │
│  Timings needed  Morning, Evening  │
│  Household       Apartment         │
│                                    │
│  Requirements:                     │
│  "Need vegetarian cook for family  │
│   of 4. Breakfast and dinner..."   │
│                                    │
│  ❤️ Save    📤 Share               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 📞 Reveal Number             │  │
│  │ ~~₹10~~ FREE (1 remaining)  │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

### Page 6: Favorites `/favorites`

Two tabs. Same card UI as listings page.

```
┌────────────────────────────────────┐
│  Favorites                         │
│                                    │
│  [Recently Viewed] [❤️ Saved]      │
│                                    │
│  (Listing cards identical to       │
│   /listings page)                  │
│                                    │
│  Recently Viewed: auto-tracked,    │
│  last 50 items                     │
│                                    │
│  Saved: items user tapped ❤️ on    │
└────────────────────────────────────┘
```

**For Employer:** Shows worker cards
**For Worker:** Shows employer cards
Content adapts based on `last_active_mode`.

---

### Page 7: Account `/account`

The settings and management hub. Profile editing is accessed from here.

```
┌────────────────────────────────────┐
│  Account                           │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 👨 Ramesh Kumar              │  │
│  │ +91 98765 43210              │  │
│  │ W000000123                   │  │
│  │ Currently: Worker mode        │  │
│  │ [ Switch to Employer mode ]  │  │
│  └──────────────────────────────┘  │
│                                    │
│  📝 Edit Profile →                 │
│     (Opens profile edit for        │
│      current active role)          │
│                                    │
│  🔍 Search Preferences →           │
│     Status: [Actively Looking ▼]   │
│     Categories: [Cook ✓] [Maid]    │
│     Days: [Mon-Sat]                │
│     Timings: [Morning ✓]           │
│                                    │
│  📊 My Activity                    │
│     Free leads remaining: 2 of 3   │
│     Leads used: 1                  │
│     Profile views: 12              │
│                                    │
│  ❤️ Favorites →                    │
│  🌐 Language: English / हिंदी      │
│  📄 Terms & Privacy                │
│  📞 Help & Support                 │
│                                    │
│  [ Logout ]                        │
│  [ Delete Account ]                │
└────────────────────────────────────┘
```

**Key sections:**
1. **User card** — name, phone, ID, current mode with switch option
2. **Edit Profile** → Opens role-specific profile editor
3. **Search Preferences:**
   - Status: Actively Looking / Not Looking (pauses visibility)
   - Preferred categories, days, timings (filters their default search)
4. **My Activity** — leads counter, profile views
5. **Favorites** → Links to `/favorites`
6. **Language toggle** — English / Hindi
7. **Logout + Delete Account**

**"Switch to Employer/Worker mode"** — flips `last_active_mode`. If no profile exists for that role, prompts to create one.

---

### Profile Editor (accessed from Account → Edit Profile)

#### Worker Profile Editor:

Fields:
- Photo (upload)
- Name
- Gender (male/female/other — used for default avatar)
- Categories offered (multi-select with icons)
- Experience (years)
- Salary expectations (min-max range)
- Day availability (Mon through Sun checkboxes)
- Time availability (Morning / Afternoon / Evening / 12-hour / 24-hour — multi-select)
- Languages spoken (multi-select)
- Originally from (city/state dropdown or text)
- Bio / About (textarea)
- Location / Area (with map pin or "Use current location")
- "Profile Active" toggle

#### Employer Profile Editor:

Fields:
- Name
- Photo (optional)
- Household type (Apartment / Independent House / Villa / Other)
- Categories needed (multi-select with icons — e.g., Cook + Maid)
- Salary offered (min-max range)
- Day availability required (Mon through Sun)
- Time availability required (Morning / Afternoon / Evening / 12-hour / 24-hour)
- Requirements / Description (textarea)
- Location / Area
- "Profile Active" toggle

---

### Additional Pages:
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- `/contact` — Help & Support (WhatsApp number or simple form)

---

## 6. Database Schema

### Enable PostGIS
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### categories (reference table — replaces job_types)
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,                    -- 'C0001', 'C0002', etc.
  slug TEXT UNIQUE NOT NULL,              -- 'maid', 'cook', 'driver'
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

### id_counters (for generating E/W sequential IDs)
```sql
CREATE TABLE id_counters (
  entity_type TEXT PRIMARY KEY,          -- 'worker', 'employer'
  last_id INTEGER DEFAULT 0
);

INSERT INTO id_counters VALUES ('worker', 0), ('employer', 0);

-- Function to get next ID
CREATE OR REPLACE FUNCTION next_custom_id(p_type TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_next INTEGER;
BEGIN
  IF p_type = 'worker' THEN v_prefix := 'W';
  ELSIF p_type = 'employer' THEN v_prefix := 'E';
  ELSE RAISE EXCEPTION 'Invalid type: %', p_type;
  END IF;

  UPDATE id_counters SET last_id = last_id + 1
  WHERE entity_type = p_type
  RETURNING last_id INTO v_next;

  RETURN v_prefix || LPAD(v_next::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;
```

### users (core account)
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
  custom_id TEXT UNIQUE NOT NULL,             -- 'W000000001'
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categories TEXT[] NOT NULL DEFAULT '{}',    -- ['C0001', 'C0002']
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  salary_min INTEGER,                         -- monthly ₹
  salary_max INTEGER,
  available_days TEXT[] DEFAULT '{}',          -- ['mon','tue','wed','thu','fri','sat','sun']
  available_timings TEXT[] DEFAULT '{}',       -- ['morning','afternoon','evening','12_hour','24_hour']
  languages TEXT[] DEFAULT '{}',              -- ['hindi','english','tamil']
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  originally_from TEXT,                       -- 'Bihar', 'UP', etc.
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_worker_location ON worker_profiles USING GIST (location);
CREATE INDEX idx_worker_categories ON worker_profiles USING GIN (categories);
CREATE INDEX idx_worker_city_active ON worker_profiles (city, is_active);
CREATE INDEX idx_worker_custom_id ON worker_profiles (custom_id);
```

### employer_profiles
```sql
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_id TEXT UNIQUE NOT NULL,             -- 'E000000001'
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categories_needed TEXT[] NOT NULL DEFAULT '{}',  -- ['C0001', 'C0002']
  description TEXT,                           -- requirements text
  household_type TEXT CHECK (household_type IN ('apartment', 'independent_house', 'villa', 'other')),
  salary_min INTEGER,
  salary_max INTEGER,
  available_days TEXT[] DEFAULT '{}',
  available_timings TEXT[] DEFAULT '{}',
  location GEOGRAPHY(Point, 4326),
  locality TEXT,
  city TEXT REFERENCES cities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_employer_location ON employer_profiles USING GIST (location);
CREATE INDEX idx_employer_categories ON employer_profiles USING GIN (categories_needed);
CREATE INDEX idx_employer_city_active ON employer_profiles (city, is_active);
CREATE INDEX idx_employer_custom_id ON employer_profiles (custom_id);
```

### lead_reveals
```sql
CREATE TABLE lead_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reveal_type TEXT NOT NULL CHECK (reveal_type IN ('employer_to_worker', 'worker_to_employer')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL,
  employer_profile_id UUID REFERENCES employer_profiles(id) ON DELETE SET NULL,
  amount_paid INTEGER DEFAULT 0,              -- 0 = free, 1000 = ₹10 in paise
  was_free_lead BOOLEAN DEFAULT true,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_from ON lead_reveals (from_user_id);
CREATE INDEX idx_leads_to ON lead_reveals (to_user_id);

-- Prevent duplicate reveals
CREATE UNIQUE INDEX idx_unique_reveal_worker
  ON lead_reveals (from_user_id, worker_profile_id)
  WHERE worker_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_reveal_employer
  ON lead_reveals (from_user_id, employer_profile_id)
  WHERE employer_profile_id IS NOT NULL;
```

### favorites
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'employer_profile')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  employer_profile_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, worker_profile_id),
  UNIQUE(user_id, employer_profile_id)
);

CREATE INDEX idx_favorites_user ON favorites (user_id);
```

### recently_viewed
```sql
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'employer_profile')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  employer_profile_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recent_user ON recently_viewed (user_id, viewed_at DESC);
```

### Row Level Security
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Worker profiles
CREATE POLICY "Owner full access" ON worker_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active profiles" ON worker_profiles FOR SELECT USING (is_active = true);

-- Employer profiles
CREATE POLICY "Owner full access" ON employer_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active profiles" ON employer_profiles FOR SELECT USING (is_active = true);

-- Lead reveals
CREATE POLICY "Create own" ON lead_reveals FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Read own" ON lead_reveals FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Favorites & Recently Viewed
CREATE POLICY "Manage own" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own" ON recently_viewed FOR ALL USING (auth.uid() = user_id);

-- Reference tables
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON cities FOR SELECT USING (true);
```

---

## 7. Structured Data Values

### Day Availability Options
| Value | Display |
|---|---|
| `mon` | Mon |
| `tue` | Tue |
| `wed` | Wed |
| `thu` | Thu |
| `fri` | Fri |
| `sat` | Sat |
| `sun` | Sun |

### Time Availability Options
| Value | Display (EN) | Display (HI) |
|---|---|---|
| `morning` | Morning (6am-12pm) | सुबह |
| `afternoon` | Afternoon (12pm-5pm) | दोपहर |
| `evening` | Evening (5pm-10pm) | शाम |
| `12_hour` | 12-hour shift | 12 घंटे |
| `24_hour` | 24-hour / Live-in | 24 घंटे / रहने वाला |

### Household Types
| Value | Display |
|---|---|
| `apartment` | Apartment |
| `independent_house` | Independent House |
| `villa` | Villa |
| `other` | Other |

### Search Status
| Value | Display |
|---|---|
| `actively_looking` | Actively Looking |
| `not_looking` | Not Looking |

---

## 8. WhatsApp Templates (Gupshup)

### OTP
```
Your Kaamdha verification code is {OTP}. Valid for 5 minutes. Do not share. — Kaamdha
```

### Lead Reveal — To Requester
```
✅ Contact from Kaamdha:

👤 {name} ({custom_id})
📞 {phone_number}
💼 {categories} · {experience}yr exp
📍 {locality}

Connect directly. Good luck!
— Kaamdha (kaamdha.com)
```

### Lead Reveal — To Person Revealed
```
📢 Someone viewed your number on Kaamdha!

👤 {viewer_name} from {locality} is interested in your profile.

Keep your profile updated for more leads.
— Kaamdha (kaamdha.com)
```

---

## 9. Design

### Colors
| Color | Hex | Usage |
|---|---|---|
| Primary Teal | `#0D9488` | Buttons, links, active states |
| Dark Teal | `#0F766E` | Hover, emphasis |
| Orange | `#EA580C` | CTAs, badges, pricing |
| Orange Light | `#FFF7ED` | Orange backgrounds |
| Charcoal | `#1E293B` | Primary text |
| Warm BG | `#FFFBF5` | Page backgrounds |
| Teal Light | `#CCFBF1` | Tags, highlights |

### Fonts
**Outfit** — headings, logo, numbers | **DM Sans** — body, UI

### UX Rules
- Mobile-first (360px)
- Minimal friction — fewest taps to reach a phone number
- Hindi + English
- Simple language
- Optimize for slow 4G
- Min 44px touch targets
- Phone masking server-side ("981-XXX-XXXX")
- WhatsApp-first notifications
- Native share sheet (Web Share API + clipboard fallback)

---

## 10. Phase 1 Scope

### Build:
- ✅ Home (two tabs, logged in/out states)
- ✅ Login (phone OTP)
- ✅ Search (employer + worker modes)
- ✅ Listings (worker cards + employer cards, symmetrical)
- ✅ Details (worker detail + employer detail)
- ✅ Favorites (recently viewed + saved, two tabs)
- ✅ Account (settings, search preferences, profile editor, role switch)
- ✅ Phone reveal flow (modal → WhatsApp → unmask)
- ✅ Share (native share sheet)
- ✅ PostGIS location search (3/5/10km)
- ✅ Custom IDs (E/W/C prefix)
- ✅ Search status (actively looking / not looking)
- ✅ "Coming soon" for inactive cities
- ✅ 4-icon footer nav

### Don't Build:
- ❌ Job posts / Create Job (Phase 2 — for multi-position hiring)
- ❌ Actual payments / Razorpay
- ❌ Wallet system
- ❌ Ratings / reviews
- ❌ Aadhaar verification
- ❌ Admin panel (use Supabase dashboard)
- ❌ Push notifications (WhatsApp only)
- ❌ In-app chat
- ❌ Notifications page
- ❌ Native mobile app

---

## 11. Launch Plan

**City:** Gurgaon (active). Others show "Coming soon."

**Seed Localities:** DLF Phase 1-4, Sohna Road, Golf Course Road, Sector 49-57, South City

**Strategy:**
1. Week 1-2: Seed 200-300 worker profiles (on-ground)
2. Week 3-4: Activate employers (society WhatsApp groups)
3. Week 5-8: Expand based on data

**Metrics:** Signups, profile completions, searches, lead reveals, favorites, shares, return visits, inactive city signups

---

## 12. Dev Guidelines

- **Supabase JS SDK** for all DB operations
- **Server Components** by default
- **Server Actions** for mutations
- **PostGIS** — `POINT(lng lat)` — longitude first
- **Money in paise** (₹10 = 1000)
- **Supabase RLS** for auth
- **TypeScript strict** — no `any`
- **Test:** 360px, 390px, 768px, 1440px
- **Next.js Image** for all images
- **Supabase Edge Functions** for Gupshup webhooks
- **Web Share API** + clipboard fallback
- **Phone masking server-side** — never expose full numbers in API
- **Custom IDs** generated via `next_custom_id()` function
- **Deduplicate leads** via unique constraints
- **Recently viewed** tracked on detail page open (max 50 per user)
- **Search preferences** filter default results on home/search pages
