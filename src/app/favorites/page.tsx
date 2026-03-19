import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";
import { FavoritesView } from "@/components/favorites/favorites-view";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your saved staff profiles and job listings on kaamdha.",
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: user } = await supabase
    .from("users")
    .select()
    .eq("id", authUser.id)
    .single<User>();

  if (!user?.name) {
    redirect("/onboard");
  }

  const isEmployer = user.last_active_mode === "find_help";

  // Parallel: fetch all base data at once
  const [revealsResult, favsResult, epResult] = await Promise.all([
    supabase
      .from("lead_reveals")
      .select("*")
      .eq("from_user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("favorites")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(20),
    isEmployer
      ? supabase
          .from("employer_profiles")
          .select("id")
          .eq("user_id", authUser.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const revealsData = (revealsResult.data ?? []) as Record<string, unknown>[];
  const favsData = (favsResult.data ?? []) as Record<string, unknown>[];

  // Jobs created (employer only)
  let jobsCreated: Record<string, unknown>[] = [];
  const ep = epResult.data as { id: string } | null;
  if (isEmployer && ep) {
    const { data } = await supabase
      .from("job_listings")
      .select("*")
      .eq("employer_id", ep.id)
      .order("created_at", { ascending: false })
      .limit(20);
    jobsCreated = (data ?? []) as Record<string, unknown>[];
  }

  // Collect all worker_profile_ids and job_listing_ids to batch-fetch
  const workerIds = new Set<string>();
  const jobIds = new Set<string>();

  for (const r of revealsData) {
    if (r.worker_profile_id) workerIds.add(r.worker_profile_id as string);
    if (r.job_listing_id) jobIds.add(r.job_listing_id as string);
  }
  for (const f of favsData) {
    if (f.worker_profile_id) workerIds.add(f.worker_profile_id as string);
    if (f.job_listing_id) jobIds.add(f.job_listing_id as string);
  }

  // Batch fetch all workers and jobs in parallel
  const [workersResult, jobsResult] = await Promise.all([
    workerIds.size > 0
      ? supabase
          .from("worker_profiles")
          .select("id, user_id, categories, experience_years, salary_min, salary_max, available_timings, locality, gender")
          .in("id", [...workerIds])
      : Promise.resolve({ data: [] }),
    jobIds.size > 0
      ? supabase
          .from("job_listings")
          .select("id, custom_id, category, title, salary_min, salary_max, preferred_timings, locality, status, employer_id")
          .in("id", [...jobIds])
      : Promise.resolve({ data: [] }),
  ]);

  const workersMap = new Map<string, Record<string, unknown>>();
  for (const w of (workersResult.data ?? []) as Record<string, unknown>[]) {
    workersMap.set(w.id as string, w);
  }

  const jobsMap = new Map<string, Record<string, unknown>>();
  for (const j of (jobsResult.data ?? []) as Record<string, unknown>[]) {
    jobsMap.set(j.id as string, j);
  }

  // Collect all user_ids we need names for (from workers + jobs' employers)
  const userIds = new Set<string>();
  for (const w of workersMap.values()) {
    userIds.add(w.user_id as string);
  }
  const employerProfileIds = new Set<string>();
  for (const j of jobsMap.values()) {
    if (j.employer_id) employerProfileIds.add(j.employer_id as string);
  }

  // Batch fetch employer profiles and all user names in parallel
  const [epProfilesResult, _] = await Promise.all([
    employerProfileIds.size > 0
      ? supabase
          .from("employer_profiles")
          .select("id, user_id")
          .in("id", [...employerProfileIds])
      : Promise.resolve({ data: [] }),
    Promise.resolve(null),
  ]);

  for (const epP of (epProfilesResult.data ?? []) as Record<string, unknown>[]) {
    userIds.add(epP.user_id as string);
  }

  // Single batch: fetch all user names
  const usersResult = userIds.size > 0
    ? await supabase
        .from("users")
        .select("id, name")
        .in("id", [...userIds])
    : { data: [] };

  const usersMap = new Map<string, string>();
  for (const u of (usersResult.data ?? []) as { id: string; name: string | null }[]) {
    usersMap.set(u.id, u.name ?? "");
  }

  // Build employer profiles map
  const epMap = new Map<string, string>();
  for (const epP of (epProfilesResult.data ?? []) as Record<string, unknown>[]) {
    epMap.set(epP.id as string, usersMap.get(epP.user_id as string) ?? "");
  }

  // Enrich reveals
  const reveals: Record<string, unknown>[] = revealsData.map((r) => {
    const enriched: Record<string, unknown> = { ...r };
    if (r.worker_profile_id) {
      const w = workersMap.get(r.worker_profile_id as string);
      if (w) {
        enriched.worker = { ...w, name: usersMap.get(w.user_id as string) ?? "Worker" };
      }
    }
    if (r.job_listing_id) {
      const j = jobsMap.get(r.job_listing_id as string);
      if (j) {
        enriched.job = { ...j, employer_name: epMap.get(j.employer_id as string) ?? "" };
      }
    }
    return enriched;
  });

  // Enrich favorites
  const savedFavorites: Record<string, unknown>[] = favsData.map((f) => {
    const enriched: Record<string, unknown> = { ...f };
    if (f.worker_profile_id) {
      const w = workersMap.get(f.worker_profile_id as string);
      if (w) {
        enriched.worker = { ...w, name: usersMap.get(w.user_id as string) ?? "Worker" };
      }
    }
    if (f.job_listing_id) {
      const j = jobsMap.get(f.job_listing_id as string);
      if (j) {
        enriched.job = { ...j, employer_name: epMap.get(j.employer_id as string) ?? "" };
      }
    }
    return enriched;
  });

  return (
    <FavoritesView
      isEmployer={isEmployer}
      jobsCreated={jobsCreated}
      reveals={reveals}
      savedFavorites={savedFavorites}
    />
  );
}
