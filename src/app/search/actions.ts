"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function buildLocationPoint(
  lat: string | null,
  lng: string | null
): string | null {
  if (!lat || !lng) return null;
  return `POINT(${parseFloat(lng)} ${parseFloat(lat)})`;
}

export interface WorkerResult {
  id: string;
  user_id: string;
  name: string;
  gender: string | null;
  categories: string[];
  experience_years: number;
  salary_min: number | null;
  salary_max: number | null;
  available_days: string[];
  available_timings: string[];
  locality: string | null;
}

export interface SearchResult {
  jidCustomId: string | null;
  jidReused: boolean;
  workers: WorkerResult[];
  error?: string;
}

export async function employerSearch(formData: FormData): Promise<SearchResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const category = formData.get("category") as string;
  const locality = (formData.get("locality") as string)?.trim() || "";
  const lat = formData.get("latitude") as string | null;
  const lng = formData.get("longitude") as string | null;
  const distance = parseInt((formData.get("distance") as string) || "5", 10);

  if (!category) {
    return { jidCustomId: null, jidReused: false, workers: [], error: "Select a category" };
  }

  // Get employer profile
  const { data: epRaw } = await supabase
    .from("employer_profiles")
    .select("id, locality")
    .eq("user_id", user.id)
    .single();

  const employerProfile = epRaw as { id: string; locality: string | null } | null;

  if (!employerProfile) {
    redirect("/onboard");
  }

  const location = buildLocationPoint(lat, lng);
  const searchLocality = locality || employerProfile.locality || "";

  // Check for existing active JID (dedup: same employer + category + locality)
  let jidCustomId: string | null = null;
  let jidReused = false;

  if (searchLocality) {
    const { data: existingRaw } = await supabase
      .from("job_listings")
      .select("id, custom_id")
      .eq("employer_id", employerProfile.id)
      .eq("category", category)
      .eq("locality", searchLocality)
      .eq("status", "active")
      .single();

    const existing = existingRaw as { id: string; custom_id: string } | null;

    if (existing) {
      jidCustomId = existing.custom_id;
      jidReused = true;

      // Update search params
      const updateFields = {
        search_radius_km: distance,
        updated_at: new Date().toISOString(),
        ...(location ? { location } : {}),
      };

      await supabase
        .from("job_listings")
        .update(updateFields as Record<string, unknown> as never)
        .eq("id", existing.id);
    } else {
      // Create new JID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: customId, error: idError } = await (supabase.rpc as any)(
        "next_custom_id",
        { p_type: "job_listing" }
      );

      if (!idError && customId) {
        const insertFields = {
          custom_id: customId as string,
          employer_id: employerProfile.id,
          category,
          locality: searchLocality,
          search_radius_km: distance,
          city: "gurgaon",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          ...(location ? { location } : {}),
        };

        const { error: insertError } = await supabase
          .from("job_listings")
          .insert(insertFields as Record<string, unknown> as never);

        if (!insertError) {
          jidCustomId = customId as string;
        }
      }
    }
  }

  // Fetch matching workers — simple query (PostGIS radius search would need RPC)
  // For now, filter by category and city
  const { data: workersRaw } = await supabase
    .from("worker_profiles")
    .select("id, user_id, categories, experience_years, salary_min, salary_max, available_days, available_timings, locality, gender")
    .eq("is_active", true)
    .eq("city", "gurgaon")
    .contains("categories", [category])
    .limit(20);

  // Join worker names from users table
  const workers: WorkerResult[] = [];
  const workerRows = (workersRaw ?? []) as Record<string, unknown>[];

  for (const w of workerRows) {
    const { data: userRow } = await supabase
      .from("users")
      .select("name")
      .eq("id", w.user_id as string)
      .single();

    const userName = (userRow as { name: string | null } | null)?.name ?? "Worker";

    workers.push({
      id: w.id as string,
      user_id: w.user_id as string,
      name: userName,
      gender: w.gender as string | null,
      categories: w.categories as string[],
      experience_years: w.experience_years as number,
      salary_min: w.salary_min as number | null,
      salary_max: w.salary_max as number | null,
      available_days: w.available_days as string[],
      available_timings: w.available_timings as string[],
      locality: w.locality as string | null,
    });
  }

  return { jidCustomId, jidReused, workers };
}
