-- Seed: 8 dummy worker profiles (one per category)
-- Run in Supabase SQL Editor

-- Create auth users first (required by foreign key on public.users)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111001"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111002"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111003"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111004"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111005"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111006"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111007"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, '', '{"provider":"phone","providers":["phone"]}', '{"phone":"+911111111008"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Create public users
INSERT INTO public.users (id, phone, name, locality, city, last_active_mode, search_status) VALUES
  ('00000000-0000-0000-0000-000000000001', '+911111111001', 'Sunita Devi', 'DLF Phase 2', 'gurgaon', 'find_jobs', 'actively_looking'),
  ('00000000-0000-0000-0000-000000000002', '+911111111002', 'Ramesh Kumar', 'Sector 49', 'gurgaon', 'find_jobs', 'actively_looking'),
  ('00000000-0000-0000-0000-000000000003', '+911111111003', 'Mohan Singh', 'Sohna Road', 'gurgaon', 'find_jobs', 'actively_looking'),
  ('00000000-0000-0000-0000-000000000004', '+911111111004', 'Babu Lal', 'Golf Course Road', 'gurgaon', 'find_jobs', 'actively_looking'),
  ('00000000-0000-0000-0000-000000000005', '+911111111005', 'Raju Sharma', 'Sector 56', 'gurgaon', 'find_jobs', 'actively_looking'),
  ('00000000-0000-0000-0000-000000000006', '+911111111006', 'Geeta Rani', 'Nirvana Country', 'gurgaon', 'find_jobs', 'actively_looking'),
  ('00000000-0000-0000-0000-000000000007', '+911111111007', 'Vikram Yadav', 'South City 1', 'gurgaon', 'find_jobs', 'actively_looking'),
  ('00000000-0000-0000-0000-000000000008', '+911111111008', 'Kamla Bai', 'Sector 53', 'gurgaon', 'find_jobs', 'actively_looking')
ON CONFLICT (id) DO NOTHING;

-- Create worker profiles
INSERT INTO worker_profiles (id, custom_id, user_id, categories, experience_years, salary_min, salary_max, available_days, available_timings, gender, locality, city, is_active) VALUES
  (gen_random_uuid(), 'W000000001', '00000000-0000-0000-0000-000000000001', '{C0001}', 5, 8000, 12000, '{mon,tue,wed,thu,fri,sat}', '{morning,afternoon}', 'female', 'DLF Phase 2', 'gurgaon', true),
  (gen_random_uuid(), 'W000000002', '00000000-0000-0000-0000-000000000002', '{C0002}', 8, 12000, 18000, '{mon,tue,wed,thu,fri,sat,sun}', '{morning,evening}', 'male', 'Sector 49', 'gurgaon', true),
  (gen_random_uuid(), 'W000000003', '00000000-0000-0000-0000-000000000003', '{C0003}', 10, 15000, 22000, '{mon,tue,wed,thu,fri,sat}', '{morning,afternoon,evening}', 'male', 'Sohna Road', 'gurgaon', true),
  (gen_random_uuid(), 'W000000004', '00000000-0000-0000-0000-000000000004', '{C0004}', 3, 6000, 9000, '{mon,wed,fri,sat}', '{morning}', 'male', 'Golf Course Road', 'gurgaon', true),
  (gen_random_uuid(), 'W000000005', '00000000-0000-0000-0000-000000000005', '{C0005}', 2, 5000, 8000, '{mon,tue,wed,thu,fri,sat,sun}', '{morning}', 'male', 'Sector 56', 'gurgaon', true),
  (gen_random_uuid(), 'W000000006', '00000000-0000-0000-0000-000000000006', '{C0006}', 6, 10000, 15000, '{mon,tue,wed,thu,fri}', '{morning,afternoon}', 'female', 'Nirvana Country', 'gurgaon', true),
  (gen_random_uuid(), 'W000000007', '00000000-0000-0000-0000-000000000007', '{C0007}', 4, 15000, 25000, '{mon,tue,wed,thu,fri,sat}', '{morning,evening}', 'male', 'South City 1', 'gurgaon', true),
  (gen_random_uuid(), 'W000000008', '00000000-0000-0000-0000-000000000008', '{C0008}', 7, 12000, 18000, '{mon,tue,wed,thu,fri,sat,sun}', '{morning,afternoon,evening}', 'female', 'Sector 53', 'gurgaon', true)
ON CONFLICT (custom_id) DO NOTHING;

-- Update id_counters to reflect seeded workers
UPDATE id_counters SET last_id = 8 WHERE entity_type = 'worker' AND last_id < 8;

-- Also create a few job listings so worker home page has content
-- First get the employer profile id
DO $$
DECLARE
  v_ep_id UUID;
BEGIN
  SELECT id INTO v_ep_id FROM employer_profiles LIMIT 1;

  IF v_ep_id IS NOT NULL THEN
    INSERT INTO job_listings (id, custom_id, employer_id, category, title, salary_min, salary_max, preferred_days, preferred_timings, locality, city, status, expires_at) VALUES
      (gen_random_uuid(), 'JID0000000001', v_ep_id, 'C0001', 'Maid needed for 3BHK', 8000, 12000, '{mon,tue,wed,thu,fri,sat}', '{morning}', 'Sector 53', 'gurgaon', 'active', now() + interval '30 days'),
      (gen_random_uuid(), 'JID0000000002', v_ep_id, 'C0002', 'Cook for vegetarian family', 12000, 18000, '{mon,tue,wed,thu,fri,sat,sun}', '{morning,evening}', 'Sector 53', 'gurgaon', 'active', now() + interval '30 days'),
      (gen_random_uuid(), 'JID0000000003', v_ep_id, 'C0003', 'Driver for daily office commute', 15000, 20000, '{mon,tue,wed,thu,fri}', '{morning,evening}', 'Sector 53', 'gurgaon', 'active', now() + interval '30 days')
    ON CONFLICT (custom_id) DO NOTHING;

    UPDATE id_counters SET last_id = 3 WHERE entity_type = 'job_listing' AND last_id < 3;
  END IF;
END $$;
