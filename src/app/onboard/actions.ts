"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function buildLocationPoint(
  lat: string | null,
  lng: string | null
): string | null {
  if (!lat || !lng) return null;
  // PostGIS expects POINT(longitude latitude)
  return `POINT(${parseFloat(lng)} ${parseFloat(lat)})`;
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
    city: "gurgaon" as const,
    last_active_mode: "find_help" as const,
    updated_at: new Date().toISOString(),
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

  console.log("Generated custom ID:", customId);

  const profileFields = {
    custom_id: customId as string,
    user_id: user.id,
    locality,
    city: "gurgaon",
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

  redirect("/search");
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
  const categories = formData.getAll("categories") as string[];
  const experienceYears = parseInt(
    (formData.get("experience_years") as string) || "0",
    10
  );
  const salaryMin =
    parseInt((formData.get("salary_min") as string) || "0", 10) || null;
  const salaryMax =
    parseInt((formData.get("salary_max") as string) || "0", 10) || null;
  const availableDays = formData.getAll("available_days") as string[];
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
    city: "gurgaon" as const,
    last_active_mode: "find_jobs" as const,
    updated_at: new Date().toISOString(),
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
    available_days: availableDays,
    available_timings: availableTimings,
    locality,
    city: "gurgaon",
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
