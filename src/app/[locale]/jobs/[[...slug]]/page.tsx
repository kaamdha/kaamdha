import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { JobListings } from "@/components/listings/job-listings";
import { JobDetail } from "@/components/details/job-detail";
import { JobPostingJsonLd } from "@/components/shared/json-ld";
import {
  JOB_CATEGORIES,
  CITY_LABELS,
  parseListingSlug,
  jobDetailUrl,
} from "@/lib/constants";

interface Props {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { city, categorySlug, detailId } = parseListingSlug(slug);

  // Detail page metadata
  if (detailId) {
    const admin = createServiceClient();
    const { data: jobRaw } = await admin
      .from("job_listings")
      .select("title, category, locality")
      .eq("custom_id", detailId)
      .single();
    const job = jobRaw as { title: string | null; category: string; locality: string | null } | null;
    if (job) {
      const catInfo = JOB_CATEGORIES.find((c) => c.id === job.category);
      const title = job.title || `${catInfo?.labelEn ?? "Staff"} needed`;
      const location = job.locality ?? CITY_LABELS[city ?? "gurgaon"]?.en ?? "Gurgaon";
      const url = jobDetailUrl(city ?? null, job.category, detailId);
      return {
        title: `${title} in ${location}`,
        description: `${title} job in ${location}. Connect directly on kaamdha — no middlemen.`,
        alternates: { canonical: url },
        openGraph: {
          title: `${title} in ${location} | kaamdha`,
          description: `${title} job in ${location}. Connect directly on kaamdha.`,
          images: ["/og-image.png"],
        },
      };
    }
  }

  const cat = categorySlug
    ? JOB_CATEGORIES.find((c) => c.slug === categorySlug)
    : undefined;
  const cityLabel = city ? CITY_LABELS[city]?.en : undefined;

  let title: string;
  let description: string;

  if (cat && cityLabel) {
    title = `${cat.labelEn} jobs in ${cityLabel}`;
    description = `Find ${cat.labelEn.toLowerCase()} jobs in ${cityLabel}. Browse open positions and connect directly with employers — no agents.`;
  } else if (cityLabel) {
    title = `Household jobs in ${cityLabel}`;
    description = `Find household jobs in ${cityLabel} — maid, cook, driver, nanny and more. Connect directly with employers.`;
  } else {
    title = "Job listings — find household jobs near you";
    description =
      "Browse household job openings — maid, cook, driver, nanny and more jobs near you.";
  }

  const canonicalParts = ["/jobs"];
  if (city) canonicalParts.push(city);
  if (categorySlug) canonicalParts.push(categorySlug);
  const canonical = canonicalParts.join("/");

  return { title, description, alternates: { canonical } };
}

export const dynamic = "force-dynamic";

export default async function JobListingsPage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseListingSlug(slug);

  // Validate slug
  if (slug && slug.length > 0 && !parsed.city) {
    notFound();
  }
  if (slug && slug.length > 1 && !parsed.categoryId) {
    notFound();
  }
  if (slug && slug.length > 3) {
    notFound();
  }

  // 3 segments = detail view
  if (parsed.detailId) {
    return renderJobDetail(parsed.detailId);
  }

  const supabase = await createClient();
  const admin = createServiceClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!authUser;

  // Build query with filters
  let query = admin
    .from("job_listings")
    .select(
      "id, custom_id, title, category, locality, city, salary_min, salary_max, preferred_timings"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50);

  if (parsed.city) {
    query = query.eq("city", parsed.city);
  }
  if (parsed.categoryId) {
    query = query.eq("category", parsed.categoryId);
  }

  const { data: jobsRaw } = await query;

  const jobs = ((jobsRaw ?? []) as Record<string, unknown>[]).map((j) => ({
    id: j.id as string,
    customId: j.custom_id as string,
    title: j.title as string | null,
    category: j.category as string,
    locality: j.locality as string | null,
    city: j.city as string | null,
    salaryMin: j.salary_min as number | null,
    salaryMax: j.salary_max as number | null,
    preferredTimings: (j.preferred_timings as string[]) ?? [],
  }));

  return (
    <JobListings
      jobs={jobs}
      isPublic={!isLoggedIn}
      city={parsed.city}
      categorySlug={parsed.categorySlug}
    />
  );
}

async function renderJobDetail(customId: string) {
  const supabase = await createClient();
  const admin = createServiceClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: jobRaw } = await admin
    .from("job_listings")
    .select("*")
    .eq("custom_id", customId)
    .single();

  const job = jobRaw as Record<string, unknown> | null;
  if (!job) {
    notFound();
  }

  // Get employer profile + name (needed for both public and auth views)
  const { data: epRaw } = await admin
    .from("employer_profiles")
    .select("id, user_id, household_type, locality")
    .eq("id", job.employer_id as string)
    .single();
  const ep = epRaw as { id: string; user_id: string; household_type: string | null; locality: string | null } | null;

  let employerName = "Employer";
  if (ep) {
    const { data: uRaw } = await admin
      .from("users")
      .select("name")
      .eq("id", ep.user_id)
      .single();
    employerName = (uRaw as { name: string | null } | null)?.name ?? "Employer";
  }

  const jobProps = {
    id: job.id as string,
    customId: job.custom_id as string,
    category: job.category as string,
    title: job.title as string | null,
    description: job.description as string | null,
    salaryMin: job.salary_min as number | null,
    salaryMax: job.salary_max as number | null,
    schedule: job.schedule as string | null,
    preferredDays: (job.preferred_days as string[]) ?? [],
    preferredTimings: (job.preferred_timings as string[]) ?? [],
    locality: job.locality as string | null,
    city: job.city as string | null,
    status: job.status as string,
    createdAt: job.created_at as string,
    expiresAt: job.expires_at as string,
  };

  const employerProps = {
    name: employerName,
    householdType: ep?.household_type ?? null,
    locality: ep?.locality ?? null,
  };

  // Public view — no auth
  if (!authUser) {
    return (
      <>
        <JobPostingJsonLd
          title={(job.title as string | null) ?? ""}
          description={job.description as string | null}
          category={job.category as string}
          locality={job.locality as string | null}
          salaryMin={job.salary_min as number | null}
          salaryMax={job.salary_max as number | null}
          createdAt={job.created_at as string}
          expiresAt={job.expires_at as string}
          employerName={employerName}
        />
        <JobDetail
          job={jobProps}
          employer={employerProps}
          isOwner={false}
          isFavorited={false}
          isPublic
        />
      </>
    );
  }

  // Authenticated view
  const [, favResult] = await Promise.all([
    admin
      .from("recently_viewed")
      .insert({
        user_id: authUser.id,
        target_type: "job_listing",
        job_listing_id: job.id as string,
      } as Record<string, unknown> as never),
    admin
      .from("favorites")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("job_listing_id", job.id as string)
      .single(),
  ]);

  const isOwner = ep?.user_id === authUser.id;
  const isFavorited = !isOwner && !!favResult.data;

  return (
    <>
      <JobPostingJsonLd
        title={(job.title as string | null) ?? ""}
        description={job.description as string | null}
        category={job.category as string}
        locality={job.locality as string | null}
        salaryMin={job.salary_min as number | null}
        salaryMax={job.salary_max as number | null}
        createdAt={job.created_at as string}
        expiresAt={job.expires_at as string}
        employerName={employerName}
      />
      <JobDetail
        job={jobProps}
        employer={employerProps}
        isOwner={isOwner}
        isFavorited={isFavorited}
      />
    </>
  );
}
