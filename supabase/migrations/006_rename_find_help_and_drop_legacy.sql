-- Align schema with CLAUDE.md §2 (rename "Find help" → "Find staff")
-- and §11 (drop legacy columns no longer used).

-- 1. Rename users.last_active_mode enum from 'find_help' to 'find_staff'.
--    The CHECK was created without an explicit name, so look it up.
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  SELECT conname INTO v_conname
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%last_active_mode%';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

UPDATE public.users
SET last_active_mode = 'find_staff'
WHERE last_active_mode = 'find_help';

ALTER TABLE public.users
  ADD CONSTRAINT users_last_active_mode_check
  CHECK (last_active_mode IN ('find_staff', 'find_jobs'));

-- 2. Drop legacy columns from worker_profiles.
ALTER TABLE public.worker_profiles
  DROP COLUMN IF EXISTS available_days;

-- 3. Drop legacy columns from job_listings.
ALTER TABLE public.job_listings
  DROP COLUMN IF EXISTS schedule,
  DROP COLUMN IF EXISTS preferred_days,
  DROP COLUMN IF EXISTS search_radius_km;
