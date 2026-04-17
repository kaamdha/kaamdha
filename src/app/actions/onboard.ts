"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function buildLocationPoint(
  lat: string | null,
  lng: string | null
): string | null {
  if (!lat || !lng) return null;
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) return null;
  // PostGIS expects POINT(longitude latitude)
  return `POINT(${lngNum} ${latNum})`;
}

export async function saveEmployerOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = (formData.get("name") as string)?.trim();
  const locality = (formData.get("locality") as string)?.trim() || null;
  const lat = formData.get("latitude") as string | null;
  const lng = formData.get("longitude") as string | null;
  const city = (formData.get("city") as string)?.trim() || null;
  const category = (formData.get("category") as string)?.trim() || null;
  const jobTitle = (formData.get("jobTitle") as string)?.trim() || null;
  const requirements = (formData.get("requirements") as string)?.trim() || null;
  const salaryMin =
    parseInt((formData.get("salaryMin") as string) || "0", 10) || null;
  const salaryMax =
    parseInt((formData.get("salaryMax") as string) || "0", 10) || null;
  const timings = formData.getAll("timings") as string[];

  if (!name) {
    return { error: "Name is required" };
  }

  const location = buildLocationPoint(lat, lng);

  // Upsert user record — handles case where trigger hasn't fired yet
  const userFields = {
    id: user.id,
    phone: user.phone ?? "",
    name,
    locality,
    last_active_mode: "find_staff" as const,
    updated_at: new Date().toISOString(),
    ...(city ? { city } : {}),
    ...(location ? { location } : {}),
  };

  const { error: userError } = await supabase
    .from("users")
    .upsert(userFields as Record<string, unknown> as never, { onConflict: "id" });

  if (userError) {
    console.error("User upsert error:", userError);
    return { error: "Could not save profile. Please try again." };
  }

  // Generate custom ID and create employer profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: customId, error: idError } = await (supabase.rpc as any)(
    "next_custom_id",
    { p_type: "employer" }
  );

  if (idError) {
    console.error("RPC next_custom_id error:", idError);
    return { error: "Could not create profile. Please try again." };
  }

  const profileFields = {
    custom_id: customId as string,
    user_id: user.id,
    locality,
    ...(city ? { city } : {}),
    ...(location ? { location } : {}),
  };

  const { error: profileError } = await supabase
    .from("employer_profiles")
    .insert(profileFields as Record<string, unknown> as never);

  if (profileError) {
    console.error("Employer profile insert error:", profileError);
    if (!profileError.message.includes("duplicate")) {
      return { error: "Could not create profile. Please try again." };
    }
  }

  // Auto-create JID from onboarding criteria (per CLAUDE.md §7)
  if (category && locality) {
    const { data: epRow } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    const employerProfileId = (epRow as { id: string } | null)?.id;

    if (employerProfileId) {
      // Dedup: same employer + category + locality with status=active → update
      const { data: existing } = await supabase
        .from("job_listings")
        .select("id")
        .eq("employer_id", employerProfileId)
        .eq("category", category)
        .eq("locality", locality)
        .eq("status", "active")
        .maybeSingle();

      const jidFields = {
        title: jobTitle,
        description: requirements,
        salary_min: salaryMin,
        salary_max: salaryMax,
        preferred_timings: timings,
        updated_at: new Date().toISOString(),
        ...(location ? { location } : {}),
      };

      if (existing) {
        await supabase
          .from("job_listings")
          .update(jidFields as Record<string, unknown> as never)
          .eq("id", (existing as { id: string }).id);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: jidCustomId } = await (supabase.rpc as any)(
          "next_custom_id",
          { p_type: "job_listing" }
        );
        if (jidCustomId) {
          const insertFields = {
            custom_id: jidCustomId as string,
            employer_id: employerProfileId,
            category,
            locality,
            expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            ...(city ? { city } : {}),
            ...jidFields,
          };
          await supabase
            .from("job_listings")
            .insert(insertFields as Record<string, unknown> as never);
        }
      }
    }
  }

  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (locality) params.set("locality", locality);
  const qs = params.toString();
  redirect(qs ? `/search?${qs}` : "/search");
}

export async function saveWorkerOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = (formData.get("name") as string)?.trim();
  const gender = formData.get("gender") as string;
  const locality = (formData.get("locality") as string)?.trim() || null;
  const lat = formData.get("latitude") as string | null;
  const lng = formData.get("longitude") as string | null;
  const city = (formData.get("city") as string)?.trim() || null;
  const categories = formData.getAll("categories") as string[];
  const experienceYears = parseInt(
    (formData.get("experience_years") as string) || "0",
    10
  );
  const salaryMin =
    parseInt((formData.get("salary_min") as string) || "0", 10) || null;
  const salaryMax =
    parseInt((formData.get("salary_max") as string) || "0", 10) || null;
  const availableTimings = formData.getAll("available_timings") as string[];

  if (!name) {
    return { error: "Name is required" };
  }
  if (categories.length === 0) {
    return { error: "Select at least one job category" };
  }

  const location = buildLocationPoint(lat, lng);

  // Upsert user record — handles case where trigger hasn't fired yet
  const userFields = {
    id: user.id,
    phone: user.phone ?? "",
    name,
    locality,
    last_active_mode: "find_jobs" as const,
    updated_at: new Date().toISOString(),
    ...(city ? { city } : {}),
    ...(location ? { location } : {}),
  };

  const { error: userError } = await supabase
    .from("users")
    .upsert(userFields as Record<string, unknown> as never, { onConflict: "id" });

  if (userError) {
    console.error("User upsert error:", userError);
    return { error: "Could not save profile. Please try again." };
  }

  // Generate custom ID and create worker profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: customId, error: idError } = await (supabase.rpc as any)(
    "next_custom_id",
    { p_type: "worker" }
  );

  if (idError) {
    return { error: "Could not create profile. Please try again." };
  }

  const profileFields = {
    custom_id: customId as string,
    user_id: user.id,
    categories,
    experience_years: experienceYears,
    salary_min: salaryMin,
    salary_max: salaryMax,
    available_timings: availableTimings,
    locality,
    ...(city ? { city } : {}),
    ...(gender ? { gender } : {}),
    ...(location ? { location } : {}),
  };

  const { error: profileError } = await supabase
    .from("worker_profiles")
    .insert(profileFields as Record<string, unknown> as never);

  if (profileError) {
    if (!profileError.message.includes("duplicate")) {
      return { error: "Could not create profile. Please try again." };
    }
  }

  redirect("/");
}
