-- Kaamdha Database Schema
-- Apply this via Supabase SQL Editor

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- Reference Tables
-- ============================================================

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
-- Core Tables
-- ============================================================

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
  languages TEXT[] DEFAULT '{}',
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

CREATE UNIQUE INDEX idx_unique_interest_worker_job
  ON interest_requests (from_user_id, job_post_id)
  WHERE job_post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_interest_employer_worker
  ON interest_requests (from_user_id, worker_profile_id)
  WHERE worker_profile_id IS NOT NULL;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_requests ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Worker profiles
CREATE POLICY "Owner full access to worker profile" ON worker_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active worker profiles" ON worker_profiles
  FOR SELECT USING (is_active = true);

-- Employer profiles
CREATE POLICY "Owner full access to employer profile" ON employer_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active employer profiles" ON employer_profiles
  FOR SELECT USING (is_active = true);

-- Job posts
CREATE POLICY "Owner full access to job posts" ON job_posts
  FOR ALL USING (
    employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Anyone can view active job posts" ON job_posts
  FOR SELECT USING (is_active = true);

-- Interest requests
CREATE POLICY "Users can create interest requests" ON interest_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can view own interest requests" ON interest_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "To user can update interest status" ON interest_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Reference tables (public read)
CREATE POLICY "Anyone can read job types" ON job_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read cities" ON cities FOR SELECT USING (true);

-- Users can insert their own row (needed for the trigger fallback)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

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
