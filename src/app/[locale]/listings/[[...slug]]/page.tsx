import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { StaffListings } from "@/components/listings/staff-listings";
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
    title = `Hire a ${cat.labelEn.toLowerCase()} in ${cityLabel}`;
    description = `Find verified ${cat.labelEn.toLowerCase()}s in ${cityLabel}. Browse profiles, check experience and connect directly — no agents.`;
  } else if (cityLabel) {
    title = `Household staff in ${cityLabel}`;
    description = `Find verified maids, cooks, drivers, nannies and more in ${cityLabel}. Browse profiles and connect directly.`;
  } else {
    title = "Staff listings — find verified household staff";
    description =
      "Browse verified household staff near you — maids, cooks, drivers, nannies and more.";
  }

  return { title, description };
}

export const dynamic = "force-dynamic";

export default async function ListingsPage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseListingSlug(slug);

  // Validate slug: if segments exist but couldn't be parsed, 404
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
    .from("worker_profiles")
    .select(
      "id, user_id, categories, experience_years, salary_min, salary_max, available_timings, locality, gender, location"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (parsed.city) {
    query = query.eq("city", parsed.city);
  }
  if (parsed.categoryId) {
    query = query.contains("categories", [parsed.categoryId]);
  }

  const { data: workersRaw } = await query;
  const workerRows = (workersRaw ?? []) as Record<string, unknown>[];

  // Batch fetch names
  const userIds = workerRows.map((w) => w.user_id as string);
  const nameMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: usersData } = await admin
      .from("users")
      .select("id, name")
      .in("id", userIds);
    for (const row of (usersData ?? []) as {
      id: string;
      name: string | null;
    }[]) {
      if (row.name) nameMap.set(row.id, row.name);
    }
  }

  // TODO: When logged in, sort by PostGIS distance from user's saved location
  const workers = workerRows.map((w) => ({
    id: w.id as string,
    name: nameMap.get(w.user_id as string) ?? "Staff",
    gender: w.gender as string | null,
    categories: w.categories as string[],
    experienceYears: w.experience_years as number,
    salaryMin: w.salary_min as number | null,
    salaryMax: w.salary_max as number | null,
    availableTimings: w.available_timings as string[],
    locality: w.locality as string | null,
  }));

  return (
    <StaffListings
      workers={workers}
      isPublic={!isLoggedIn}
      city={parsed.city}
      categorySlug={parsed.categorySlug}
    />
  );
}
