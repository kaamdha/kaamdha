-- Kaamdha Database Schema (v2)
-- Apply this via Supabase SQL Editor

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- Reference Tables
-- ============================================================

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

-- ============================================================
-- ID Counters (for generating E/W sequential IDs)
-- ============================================================

CREATE TABLE id_counters (
  entity_type TEXT PRIMARY KEY,          -- 'worker', 'employer'
  last_id INTEGER DEFAULT 0
);

INSERT INTO id_counters VALUES ('worker', 0), ('employer', 0);

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

-- ============================================================
-- Core Tables
-- ============================================================

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

-- ============================================================
-- Lead Reveals
-- ============================================================

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

-- ============================================================
-- Favorites & Recently Viewed
-- ============================================================

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

CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'employer_profile')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  employer_profile_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recent_user ON recently_viewed (user_id, viewed_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users read own" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Worker profiles
CREATE POLICY "Owner full access" ON worker_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active profiles" ON worker_profiles
  FOR SELECT USING (is_active = true);

-- Employer profiles
CREATE POLICY "Owner full access" ON employer_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active profiles" ON employer_profiles
  FOR SELECT USING (is_active = true);

-- Lead reveals
CREATE POLICY "Create own" ON lead_reveals
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Read own" ON lead_reveals
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Favorites & Recently Viewed
CREATE POLICY "Manage own" ON favorites
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own" ON recently_viewed
  FOR ALL USING (auth.uid() = user_id);

-- Reference tables (public read)
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read" ON cities FOR SELECT USING (true);

-- ============================================================
-- Auth Trigger: auto-create public.users row on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, phone)
  VALUES (NEW.id, NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
