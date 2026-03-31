import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { JobListings } from "@/components/listings/job-listings";
import {
  JOB_CATEGORIES,
  CITY_LABELS,
  parseListingSlug,
} from "@/lib/constants";

interface Props {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { city, categorySlug } = parseListingSlug(slug);
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

  return { title, description };
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
  if (slug && slug.length > 2) {
    notFound();
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
      "id, custom_id, title, category, locality, salary_min, salary_max, preferred_timings"
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
