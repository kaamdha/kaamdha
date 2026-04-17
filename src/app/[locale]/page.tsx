import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";
import { HomeLanding } from "@/components/landing/home-landing";
import { HomeEmployer } from "@/components/home/home-employer";
import { HomeWorker } from "@/components/home/home-worker";
import { getPhonePrefix } from "@/lib/phone";

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

  const isEmployer = user.last_active_mode === "find_staff";

  if (isEmployer) {
    // Parallel: fetch employer profile + recent jobs at once
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("id, locality")
      .eq("user_id", authUser.id)
      .single();

    const employerProfile = epRaw as { id: string; locality: string | null } | null;

    if (!user.locality && employerProfile?.locality) {
      user.locality = employerProfile.locality;
    }

    if (!employerProfile) {
      redirect("/onboard/employer");
    }

    const { data } = await supabase
      .from("job_listings")
      .select("*")
      .eq("employer_id", employerProfile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    return <HomeEmployer user={user} recentJobs={(data ?? []) as Record<string, unknown>[]} />;
  }

  // Worker mode — parallel fetch: worker profile + jobs + favorites
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
  const wpLocation = wp?.location as string | null;

  // Fetch jobs and favorites in parallel
  const jobsPromise = wpLocation && workerCategories.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (supabase.rpc as any)("search_jobs_nearby", {
        p_categories: workerCategories,
        p_location: wpLocation,
        p_radius_m: 10000,
      })
    : supabase
        .from("job_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);

  const favsPromise = supabase
    .from("favorites")
    .select("job_listing_id")
    .eq("user_id", authUser.id)
    .eq("target_type", "job_listing");

  const [jobsResult, favsResult] = await Promise.all([jobsPromise, favsPromise]);

  const rawJobs = (jobsResult.data ?? []) as Record<string, unknown>[];

  // Batch-fetch employer phone prefixes for jobs (workers see other employers' jobs)
  const phonePrefixByEmployerId = new Map<string, string>();
  if (rawJobs.length > 0) {
    const admin = createServiceClient();
    const employerIds = [...new Set(rawJobs.map((j) => j.employer_id as string))];
    const { data: epRows } = await admin
      .from("employer_profiles")
      .select("id, user_id")
      .in("id", employerIds);
    const epList = (epRows ?? []) as { id: string; user_id: string }[];
    const employerUserIds = [...new Set(epList.map((e) => e.user_id))];
    const { data: uRows } = await admin
      .from("users")
      .select("id, phone")
      .in("id", employerUserIds);
    const phoneByUserId = new Map<string, string>();
    for (const u of (uRows ?? []) as { id: string; phone: string | null }[]) {
      phoneByUserId.set(u.id, getPhonePrefix(u.phone));
    }
    for (const e of epList) {
      const prefix = phoneByUserId.get(e.user_id);
      if (prefix) phonePrefixByEmployerId.set(e.id, prefix);
    }
  }

  const jobs = rawJobs.map((j) => ({
    ...j,
    phone_prefix: phonePrefixByEmployerId.get(j.employer_id as string),
    distance_km:
      wpLocation && j.distance_m != null
        ? Math.round(((j.distance_m as number) / 1000) * 10) / 10
        : j.distance_km ?? null,
  }));

  const favoritedJobIds = ((favsResult.data ?? []) as { job_listing_id: string }[]).map(
    (f) => f.job_listing_id
  );

  return (
    <HomeWorker
      user={user}
      jobs={jobs}
      workerCategories={workerCategories}
      favoritedJobIds={favoritedJobIds}
    />
  );
}
