import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";
import { HomeLanding } from "@/components/landing/home-landing";
import { HomeEmployer } from "@/components/home/home-employer";
import { HomeWorker } from "@/components/home/home-worker";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return <HomeLanding />;
  }

  // Fetch user record
  const { data: user } = await supabase
    .from("users")
    .select()
    .eq("id", authUser.id)
    .single<User>();

  if (!user?.name) {
    return <HomeLanding />;
  }

  const isEmployer = user.last_active_mode === "find_help";

  if (isEmployer) {
    // Fetch employer profile
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("id, locality")
      .eq("user_id", authUser.id)
      .single();

    const employerProfile = epRaw as { id: string; locality: string | null } | null;

    // If user.locality is missing, fall back to employer profile locality
    if (!user.locality && employerProfile?.locality) {
      user.locality = employerProfile.locality;
    }

    // Profile missing — send back to onboarding
    if (!employerProfile) {
      redirect("/onboard/employer");
    }

    let recentJobs: Record<string, unknown>[] = [];
    if (employerProfile) {
      const { data } = await supabase
        .from("job_listings")
        .select("*")
        .eq("employer_id", employerProfile.id)
        .order("created_at", { ascending: false })
        .limit(5);
      recentJobs = (data ?? []) as Record<string, unknown>[];
    }

    return <HomeEmployer user={user} recentJobs={recentJobs} />;
  }

  // Worker mode — fetch worker profile for locality + categories + location
  const { data: wpRaw } = await supabase
    .from("worker_profiles")
    .select("locality, categories, location")
    .eq("user_id", authUser.id)
    .single();
  const wp = wpRaw as { locality: string | null; categories: string[]; location: unknown } | null;

  if (!user.locality && wp?.locality) {
    user.locality = wp.locality;
  }

  const workerCategories = wp?.categories ?? [];

  // Fetch nearby active jobs — use PostGIS RPC when location available
  let jobs: Record<string, unknown>[] = [];
  const wpLocation = wp?.location as string | null;

  if (wpLocation && workerCategories.length > 0) {
    // Use PostGIS distance-based search
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rpcRows } = await (supabase.rpc as any)(
      "search_jobs_nearby",
      {
        p_categories: workerCategories,
        p_location: wpLocation,
        p_radius_m: 10000,
      }
    );

    const rpcResults = (rpcRows ?? []) as Record<string, unknown>[];
    jobs = rpcResults.map((j) => ({
      ...j,
      distance_km: j.distance_m != null
        ? Math.round(((j.distance_m as number) / 1000) * 10) / 10
        : null,
    }));
  } else {
    // Fallback: basic query (no distance info)
    const { data: jobsRaw } = await supabase
      .from("job_listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    jobs = (jobsRaw ?? []) as Record<string, unknown>[];
  }

  // Fetch user's favorited job listing IDs
  let favoritedJobIds: string[] = [];
  if (jobs.length > 0) {
    const jobIds = jobs.map((j) => j.id as string);
    const { data: favRaw } = await supabase
      .from("favorites")
      .select("job_listing_id")
      .eq("user_id", authUser.id)
      .eq("target_type", "job_listing")
      .in("job_listing_id", jobIds);

    favoritedJobIds = ((favRaw ?? []) as { job_listing_id: string }[]).map(
      (f) => f.job_listing_id
    );
  }

  return (
    <HomeWorker
      user={user}
      jobs={jobs}
      workerCategories={workerCategories}
      favoritedJobIds={favoritedJobIds}
    />
  );
}
