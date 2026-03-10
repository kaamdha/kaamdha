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

export async function updateWorkerProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileId = formData.get("profile_id") as string;
  const name = (formData.get("name") as string)?.trim();
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
  const bio = (formData.get("bio") as string)?.trim() || null;

  if (!name) {
    return { error: "Name is required" };
  }

  const location = buildLocationPoint(lat, lng);

  // Update user name + locality
  const userFields = {
    name,
    locality,
    updated_at: new Date().toISOString(),
    ...(location ? { location } : {}),
  };

  await supabase
    .from("users")
    .update(userFields as Record<string, unknown> as never)
    .eq("id", user.id);

  // Update worker profile
  const profileFields = {
    categories,
    experience_years: experienceYears,
    salary_min: salaryMin,
    salary_max: salaryMax,
    available_days: availableDays,
    available_timings: availableTimings,
    bio,
    locality,
    updated_at: new Date().toISOString(),
    ...(location ? { location } : {}),
  };

  await supabase
    .from("worker_profiles")
    .update(profileFields as Record<string, unknown> as never)
    .eq("id", profileId);

  redirect("/account");
}

export async function updateEmployerProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileId = formData.get("profile_id") as string;
  const name = (formData.get("name") as string)?.trim();
  const locality = (formData.get("locality") as string)?.trim() || null;
  const lat = formData.get("latitude") as string | null;
  const lng = formData.get("longitude") as string | null;
  const householdType = (formData.get("household_type") as string) || null;

  if (!name) {
    return { error: "Name is required" };
  }

  const location = buildLocationPoint(lat, lng);

  // Update user name + locality
  const userFields = {
    name,
    locality,
    updated_at: new Date().toISOString(),
    ...(location ? { location } : {}),
  };

  await supabase
    .from("users")
    .update(userFields as Record<string, unknown> as never)
    .eq("id", user.id);

  // Update employer profile
  const profileFields = {
    household_type: householdType,
    locality,
    updated_at: new Date().toISOString(),
    ...(location ? { location } : {}),
  };

  await supabase
    .from("employer_profiles")
    .update(profileFields as Record<string, unknown> as never)
    .eq("id", profileId);

  redirect("/account");
}
