import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WorkerDetail } from "@/components/details/worker-detail";
import { JobDetail } from "@/components/details/job-detail";

export default async function DetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Determine if this is a worker profile UUID or a JID custom_id
  // UUIDs have dashes, JIDs start with "JID"
  const isJobListing = id.startsWith("JID");

  if (isJobListing) {
    // Fetch job listing by custom_id
    const { data: jobRaw } = await supabase
      .from("job_listings")
      .select("*")
      .eq("custom_id", id)
      .single();

    const job = jobRaw as Record<string, unknown> | null;
    if (!job) {
      redirect("/");
    }

    // Get employer info
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("id, user_id, household_type, locality")
      .eq("id", job.employer_id as string)
      .single();

    const ep = epRaw as { id: string; user_id: string; household_type: string | null; locality: string | null } | null;

    let employerName = "Employer";
    if (ep) {
      const { data: uRaw } = await supabase
        .from("users")
        .select("name")
        .eq("id", ep.user_id)
        .single();
      employerName = (uRaw as { name: string | null } | null)?.name ?? "Employer";
    }

    const isOwner = ep?.user_id === authUser.id;

    // Track recently viewed (if not owner)
    if (!isOwner) {
      await supabase
        .from("recently_viewed")
        .insert({
          user_id: authUser.id,
          target_type: "job_listing",
          job_listing_id: job.id as string,
        } as Record<string, unknown> as never);
    }

    return (
      <JobDetail
        job={{
          id: job.id as string,
          customId: job.custom_id as string,
          category: job.category as string,
          title: job.title as string | null,
          description: job.description as string | null,
          salaryMin: job.salary_min as number | null,
          salaryMax: job.salary_max as number | null,
          schedule: job.schedule as string | null,
          preferredDays: job.preferred_days as string[],
          preferredTimings: job.preferred_timings as string[],
          locality: job.locality as string | null,
          status: job.status as string,
          createdAt: job.created_at as string,
          expiresAt: job.expires_at as string,
        }}
        employer={{
          name: employerName,
          householdType: ep?.household_type ?? null,
          locality: ep?.locality ?? null,
        }}
        isOwner={isOwner}
      />
    );
  }

  // Worker profile — id is a UUID
  const { data: wpRaw } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", id)
    .single();

  const wp = wpRaw as Record<string, unknown> | null;
  if (!wp) {
    redirect("/");
  }

  // Get worker user info
  const { data: wuRaw } = await supabase
    .from("users")
    .select("name, phone")
    .eq("id", wp.user_id as string)
    .single();

  const workerUser = wuRaw as { name: string | null; phone: string } | null;
  const isOwner = (wp.user_id as string) === authUser.id;

  // Track recently viewed (if not owner)
  if (!isOwner) {
    await supabase
      .from("recently_viewed")
      .insert({
        user_id: authUser.id,
        target_type: "worker_profile",
        worker_profile_id: wp.id as string,
      } as Record<string, unknown> as never);
  }

  // Check if already revealed
  let isRevealed = false;
  let revealedPhone: string | null = null;
  if (!isOwner) {
    const { data: revealRaw } = await supabase
      .from("lead_reveals")
      .select("id")
      .eq("from_user_id", authUser.id)
      .eq("worker_profile_id", wp.id as string)
      .single();

    if (revealRaw) {
      isRevealed = true;
      // Mask partially — show last 4 digits
      const phone = workerUser?.phone ?? "";
      revealedPhone = phone.slice(-10, -4).replace(/./g, "X") + phone.slice(-4);
    }
  }

  return (
    <WorkerDetail
      worker={{
        id: wp.id as string,
        userId: wp.user_id as string,
        name: workerUser?.name ?? "Worker",
        gender: wp.gender as string | null,
        categories: wp.categories as string[],
        experienceYears: wp.experience_years as number,
        salaryMin: wp.salary_min as number | null,
        salaryMax: wp.salary_max as number | null,
        availableDays: wp.available_days as string[],
        availableTimings: wp.available_timings as string[],
        languages: wp.languages as string[],
        originallyFrom: wp.originally_from as string | null,
        bio: wp.bio as string | null,
        locality: wp.locality as string | null,
        isActive: wp.is_active as boolean,
      }}
      isOwner={isOwner}
      isRevealed={isRevealed}
      revealedPhone={revealedPhone}
    />
  );
}
