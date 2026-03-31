"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface RevealResult {
  success: boolean;
  phone?: string;
  error?: string;
}

export async function revealWorkerPhone(
  workerProfileId: string
): Promise<RevealResult> {
  const supabase = await createClient();
  const admin = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if already revealed
  const { data: existingRaw } = await admin
    .from("lead_reveals")
    .select("id")
    .eq("from_user_id", user.id)
    .eq("worker_profile_id", workerProfileId)
    .single();

  if (existingRaw) {
    // Already revealed — just fetch the phone
    const { data: wpRaw } = await admin
      .from("worker_profiles")
      .select("user_id")
      .eq("id", workerProfileId)
      .single();

    const wp = wpRaw as { user_id: string } | null;
    if (!wp) return { success: false, error: "Worker not found" };

    const { data: uRaw } = await admin
      .from("users")
      .select("phone")
      .eq("id", wp.user_id)
      .single();

    const phone = (uRaw as { phone: string } | null)?.phone ?? "";
    return { success: true, phone: formatPhone(phone) };
  }

  // Get worker profile + user
  const { data: wpRaw } = await admin
    .from("worker_profiles")
    .select("user_id, categories, locality")
    .eq("id", workerProfileId)
    .single();

  const wp = wpRaw as {
    user_id: string;
    categories: string[];
    locality: string | null;
  } | null;
  if (!wp) return { success: false, error: "Worker not found" };

  // Record the reveal
  const revealFields = {
    from_user_id: user.id,
    to_user_id: wp.user_id,
    reveal_type: "employer_to_worker" as const,
    worker_profile_id: workerProfileId,
    amount_paid: 0,
    was_free_lead: true,
  };

  const { error: revealError } = await admin
    .from("lead_reveals")
    .insert(revealFields as Record<string, unknown> as never);

  if (revealError) {
    return { success: false, error: "Could not reveal. Please try again." };
  }

  // Fetch revealed worker's phone
  const { data: uRaw } = await admin
    .from("users")
    .select("phone")
    .eq("id", wp.user_id)
    .single();

  const phone = (uRaw as { phone: string } | null)?.phone ?? "";

  return { success: true, phone: formatPhone(phone) };
}

export async function revealEmployerPhone(
  jobListingId: string
): Promise<RevealResult> {
  const supabase = await createClient();
  const admin = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if already revealed
  const { data: existingRaw } = await admin
    .from("lead_reveals")
    .select("id")
    .eq("from_user_id", user.id)
    .eq("job_listing_id", jobListingId)
    .single();

  if (existingRaw) {
    // Already revealed — fetch employer phone
    const { data: jlRaw } = await admin
      .from("job_listings")
      .select("employer_id")
      .eq("id", jobListingId)
      .single();

    const jl = jlRaw as { employer_id: string } | null;
    if (!jl) return { success: false, error: "Job not found" };

    const { data: epRaw } = await admin
      .from("employer_profiles")
      .select("user_id")
      .eq("id", jl.employer_id)
      .single();

    const ep = epRaw as { user_id: string } | null;
    if (!ep) return { success: false, error: "Employer not found" };

    const { data: uRaw } = await admin
      .from("users")
      .select("phone")
      .eq("id", ep.user_id)
      .single();

    const phone = (uRaw as { phone: string } | null)?.phone ?? "";
    return { success: true, phone: formatPhone(phone) };
  }

  // Get job listing → employer → user
  const { data: jlRaw } = await admin
    .from("job_listings")
    .select("employer_id, category, locality")
    .eq("id", jobListingId)
    .single();

  const jl = jlRaw as {
    employer_id: string;
    category: string;
    locality: string | null;
  } | null;
  if (!jl) return { success: false, error: "Job not found" };

  const { data: epRaw } = await admin
    .from("employer_profiles")
    .select("user_id")
    .eq("id", jl.employer_id)
    .single();

  const ep = epRaw as { user_id: string } | null;
  if (!ep) return { success: false, error: "Employer not found" };

  // Record the reveal
  const revealFields = {
    from_user_id: user.id,
    to_user_id: ep.user_id,
    reveal_type: "worker_to_employer" as const,
    job_listing_id: jobListingId,
    amount_paid: 0,
    was_free_lead: true,
  };

  const { error: revealError } = await admin
    .from("lead_reveals")
    .insert(revealFields as Record<string, unknown> as never);

  if (revealError) {
    return { success: false, error: "Could not reveal. Please try again." };
  }

  // Fetch employer's phone
  const { data: uRaw } = await admin
    .from("users")
    .select("phone")
    .eq("id", ep.user_id)
    .single();

  const phone = (uRaw as { phone: string } | null)?.phone ?? "";

  return { success: true, phone: formatPhone(phone) };
}

function formatPhone(phone: string): string {
  // Format as XXX-XXX-XXXX from last 10 digits
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
