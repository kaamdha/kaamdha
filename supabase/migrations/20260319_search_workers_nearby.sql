-- PostGIS distance-based search functions

-- Search workers nearby (used by employer search)
CREATE OR REPLACE FUNCTION search_workers_nearby(
  p_category TEXT,
  p_location GEOGRAPHY,
  p_radius_m INTEGER DEFAULT 10000
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  categories TEXT[],
  experience_years INTEGER,
  salary_min INTEGER,
  salary_max INTEGER,
  available_timings TEXT[],
  locality TEXT,
  gender TEXT,
  distance_m DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wp.id,
    wp.user_id,
    wp.categories,
    wp.experience_years,
    wp.salary_min,
    wp.salary_max,
    wp.available_timings,
    wp.locality,
    wp.gender,
    ST_Distance(wp.location, p_location) AS distance_m
  FROM worker_profiles wp
  WHERE wp.is_active = true
    AND p_category = ANY(wp.categories)
    AND wp.location IS NOT NULL
    AND ST_DWithin(wp.location, p_location, p_radius_m)
  ORDER BY distance_m ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Search jobs nearby (used by worker home page)
CREATE OR REPLACE FUNCTION search_jobs_nearby(
  p_categories TEXT[],
  p_location GEOGRAPHY,
  p_radius_m INTEGER DEFAULT 10000
)
RETURNS TABLE (
  id UUID,
  custom_id TEXT,
  employer_id UUID,
  category TEXT,
  title TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  preferred_timings TEXT[],
  locality TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  distance_m DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    jl.id,
    jl.custom_id,
    jl.employer_id,
    jl.category,
    jl.title,
    jl.salary_min,
    jl.salary_max,
    jl.preferred_timings,
    jl.locality,
    jl.status,
    jl.created_at,
    ST_Distance(jl.location, p_location) AS distance_m
  FROM job_listings jl
  WHERE jl.status = 'active'
    AND jl.category = ANY(p_categories)
    AND jl.location IS NOT NULL
    AND ST_DWithin(jl.location, p_location, p_radius_m)
  ORDER BY distance_m ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
