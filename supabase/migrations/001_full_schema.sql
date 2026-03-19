-- Kaamdha Full Schema Migration (v2 — safe re-run)

-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. ID Counters
DROP TABLE IF EXISTS id_counters CASCADE;
CREATE TABLE id_counters (
  entity_type TEXT PRIMARY KEY,
  last_id BIGINT DEFAULT 0
);
INSERT INTO id_counters (entity_type, last_id) VALUES
  ('worker', 0), ('employer', 0), ('job_listing', 0);

-- 3. next_custom_id function
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

-- 4. Categories
DROP TABLE IF EXISTS categories CASCADE;
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

-- 5. Fix users table — add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);
ALTER TABLE users ADD COLUMN IF NOT EXISTS locality TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT REFERENCES cities(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_leads_remaining INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_mode TEXT CHECK (last_active_mode IN ('find_help', 'find_jobs'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_status TEXT DEFAULT 'actively_looking' CHECK (search_status IN ('actively_looking', 'not_looking'));

-- 6. Drop and recreate dependent tables (clean slate, no data to preserve)
DROP TABLE IF EXISTS recently_viewed CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS lead_reveals CASCADE;
DROP TABLE IF EXISTS job_listings CASCADE;
DROP TABLE IF EXISTS employer_profiles CASCADE;
DROP TABLE IF EXISTS worker_profiles CASCADE;

-- 7. Worker profiles
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_id TEXT UNIQUE NOT NULL,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  categories TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  salary_min INTEGER,
  salary_max INTEGER,
  available_days TEXT[] DEFAULT '{}',
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

-- 8. Employer profiles
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

-- 9. Job listings
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_id TEXT UNIQUE NOT NULL,
  employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
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
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'deactivated', 'filled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);
CREATE INDEX idx_jl_location ON job_listings USING GIST (location);
CREATE INDEX idx_jl_category ON job_listings (category, city, status);
CREATE INDEX idx_jl_employer ON job_listings (employer_id);
CREATE INDEX idx_jl_expires ON job_listings (expires_at) WHERE status = 'active';
CREATE UNIQUE INDEX idx_jl_dedup ON job_listings (employer_id, category, locality) WHERE status = 'active';

-- 10. Lead reveals
CREATE TABLE lead_reveals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reveal_type TEXT NOT NULL CHECK (reveal_type IN ('employer_to_worker', 'worker_to_employer')),
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
CREATE UNIQUE INDEX idx_lr_unique_worker ON lead_reveals (from_user_id, worker_profile_id) WHERE worker_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_lr_unique_job ON lead_reveals (from_user_id, job_listing_id) WHERE job_listing_id IS NOT NULL;

-- 11. Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'job_listing')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  job_listing_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, worker_profile_id),
  UNIQUE(user_id, job_listing_id)
);
CREATE INDEX idx_fav_user ON favorites (user_id);

-- 12. Recently viewed
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('worker_profile', 'job_listing')),
  worker_profile_id UUID REFERENCES worker_profiles(id) ON DELETE CASCADE,
  job_listing_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rv_user ON recently_viewed (user_id, viewed_at DESC);

-- 13. Auto-create public.users row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone)
  VALUES (NEW.id, NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Read own" ON users;
DROP POLICY IF EXISTS "Update own" ON users;
DROP POLICY IF EXISTS "Insert own" ON users;
CREATE POLICY "Read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Update own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert own" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Worker profiles policies
CREATE POLICY "Owner all" ON worker_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active" ON worker_profiles FOR SELECT USING (is_active = true);

-- Employer profiles policies
CREATE POLICY "Owner all" ON employer_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Read active" ON employer_profiles FOR SELECT USING (is_active = true);

-- Job listings policies
CREATE POLICY "Owner all" ON job_listings FOR ALL
  USING (employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Read active" ON job_listings FOR SELECT USING (status = 'active');

-- Lead reveals policies
CREATE POLICY "Create own" ON lead_reveals FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Read own" ON lead_reveals FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Favorites policy
CREATE POLICY "Own" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Recently viewed policy
CREATE POLICY "Own" ON recently_viewed FOR ALL USING (auth.uid() = user_id);

-- Categories public read
CREATE POLICY "Public" ON categories FOR SELECT USING (true);

-- 15. Backfill existing auth users
INSERT INTO public.users (id, phone)
SELECT id, phone FROM auth.users
ON CONFLICT (id) DO NOTHING;
