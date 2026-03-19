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

  // Fetch jobs created (employer only)
  let jobsCreated: Record<string, unknown>[] = [];
  if (isEmployer) {
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", authUser.id)
      .single();

    const ep = epRaw as { id: string } | null;
    if (ep) {
      const { data } = await supabase
        .from("job_listings")
        .select("*")
        .eq("employer_id", ep.id)
        .order("created_at", { ascending: false })
        .limit(20);
      jobsCreated = (data ?? []) as Record<string, unknown>[];
    }
  }

  // Fetch recently contacted (lead_reveals)
  const { data: revealsRaw } = await supabase
    .from("lead_reveals")
    .select("*")
    .eq("from_user_id", authUser.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const revealsData = (revealsRaw ?? []) as Record<string, unknown>[];

  // Enrich reveals with worker/job details
  const reveals: Record<string, unknown>[] = [];
  for (const r of revealsData) {
    const enriched: Record<string, unknown> = { ...r };

    if (isEmployer && r.worker_profile_id) {
      const { data: wp } = await supabase
        .from("worker_profiles")
        .select("id, user_id, categories, experience_years, salary_min, salary_max, available_timings, locality, gender")
        .eq("id", r.worker_profile_id as string)
        .single();
      if (wp) {
        const { data: wu } = await supabase
          .from("users")
          .select("name")
          .eq("id", (wp as Record<string, unknown>).user_id as string)
          .single();
        enriched.worker = { ...(wp as Record<string, unknown>), name: (wu as { name: string } | null)?.name ?? "Worker" };
      }
    } else if (!isEmployer && r.job_listing_id) {
      const { data: jl } = await supabase
        .from("job_listings")
        .select("id, custom_id, category, title, salary_min, salary_max, preferred_timings, locality, status")
        .eq("id", r.job_listing_id as string)
        .single();
      if (jl) {
        const jlData = jl as Record<string, unknown>;
        // Get employer name
        const { data: ep } = await supabase
          .from("job_listings")
          .select("employer_id")
          .eq("id", r.job_listing_id as string)
          .single();
        if (ep) {
          const { data: epProfile } = await supabase
            .from("employer_profiles")
            .select("user_id")
            .eq("id", (ep as Record<string, unknown>).employer_id as string)
            .single();
          if (epProfile) {
            const { data: eu } = await supabase
              .from("users")
              .select("name")
              .eq("id", (epProfile as Record<string, unknown>).user_id as string)
              .single();
            jlData.employer_name = (eu as { name: string } | null)?.name ?? "";
          }
        }
        enriched.job = jlData;
      }
    }

    reveals.push(enriched);
  }

  // Fetch saved favorites
  const { data: favsRaw } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const favsData = (favsRaw ?? []) as Record<string, unknown>[];

  // Enrich favorites with worker/job details
  const savedFavorites: Record<string, unknown>[] = [];
  for (const f of favsData) {
    const enriched: Record<string, unknown> = { ...f };

    if (f.target_type === "worker_profile" && f.worker_profile_id) {
      const { data: wp } = await supabase
        .from("worker_profiles")
        .select("id, user_id, categories, experience_years, salary_min, salary_max, available_timings, locality, gender")
        .eq("id", f.worker_profile_id as string)
        .single();
      if (wp) {
        const { data: wu } = await supabase
          .from("users")
          .select("name")
          .eq("id", (wp as Record<string, unknown>).user_id as string)
          .single();
        enriched.worker = { ...(wp as Record<string, unknown>), name: (wu as { name: string } | null)?.name ?? "Worker" };
      }
    } else if (f.target_type === "job_listing" && f.job_listing_id) {
      const { data: jl } = await supabase
        .from("job_listings")
        .select("id, custom_id, category, title, salary_min, salary_max, preferred_timings, locality, status")
        .eq("id", f.job_listing_id as string)
        .single();
      if (jl) {
        const jlData = jl as Record<string, unknown>;
        const { data: ep } = await supabase
          .from("job_listings")
          .select("employer_id")
          .eq("id", f.job_listing_id as string)
          .single();
        if (ep) {
          const { data: epProfile } = await supabase
            .from("employer_profiles")
            .select("user_id")
            .eq("id", (ep as Record<string, unknown>).employer_id as string)
            .single();
          if (epProfile) {
            const { data: eu } = await supabase
              .from("users")
              .select("name")
              .eq("id", (epProfile as Record<string, unknown>).user_id as string)
              .single();
            jlData.employer_name = (eu as { name: string } | null)?.name ?? "";
          }
        }
        enriched.job = jlData;
      }
    }

    savedFavorites.push(enriched);
  }

  return (
    <FavoritesView
      isEmployer={isEmployer}
      jobsCreated={jobsCreated}
      reveals={reveals}
      savedFavorites={savedFavorites}
    />
  );
}
