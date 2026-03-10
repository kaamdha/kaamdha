"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateJobListing(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const jobId = formData.get("job_id") as string;
  const title = (formData.get("title") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const salaryMin =
    parseInt((formData.get("salary_min") as string) || "0", 10) || null;
  const salaryMax =
    parseInt((formData.get("salary_max") as string) || "0", 10) || null;
  const schedule = (formData.get("schedule") as string) || null;
  const preferredDays = formData.getAll("preferred_days") as string[];
  const preferredTimings = formData.getAll("preferred_timings") as string[];

  const updateFields = {
    title,
    description,
    salary_min: salaryMin,
    salary_max: salaryMax,
    schedule,
    preferred_days: preferredDays,
    preferred_timings: preferredTimings,
    updated_at: new Date().toISOString(),
  };

  await supabase
    .from("job_listings")
    .update(updateFields as Record<string, unknown> as never)
    .eq("id", jobId);

  redirect("/favorites");
}

export async function renewJobListing(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateFields = {
    status: "active",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("job_listings")
    .update(updateFields as Record<string, unknown> as never)
    .eq("id", jobId);

  if (error) {
    return { error: "Could not renew. Please try again." };
  }

  redirect("/favorites");
}

export async function deactivateJobListing(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateFields = {
    status: "deactivated",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("job_listings")
    .update(updateFields as Record<string, unknown> as never)
    .eq("id", jobId);

  if (error) {
    return { error: "Could not deactivate. Please try again." };
  }

  redirect("/favorites");
}
