import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { StaffListings } from "@/components/listings/staff-listings";
import { WorkerDetail } from "@/components/details/worker-detail";
import { WorkerProfileJsonLd } from "@/components/shared/json-ld";
import {
  JOB_CATEGORIES,
  CITY_LABELS,
  parseListingSlug,
  workerDetailUrl,
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
    const { data: wpRaw } = await admin
      .from("worker_profiles")
      .select("user_id, categories, locality")
      .eq("custom_id", detailId)
      .single();
    const wp = wpRaw as { user_id: string; categories: string[]; locality: string | null } | null;
    if (wp) {
      const { data: uRaw } = await admin
        .from("users")
        .select("name")
        .eq("id", wp.user_id)
        .single();
      const name = (uRaw as { name: string | null } | null)?.name ?? "Staff";
      const skills = wp.categories
        .map((c) => JOB_CATEGORIES.find((j) => j.id === c)?.labelEn)
        .filter(Boolean)
        .join(", ");
      const location = wp.locality ?? CITY_LABELS[city ?? "gurgaon"]?.en ?? "Gurgaon";
      const url = workerDetailUrl(city ?? null, wp.categories[0] ?? null, detailId);
      return {
        title: `${name} — ${skills || "Staff"} in ${location}`,
        description: `${name} is available as ${skills || "staff"} in ${location}. Connect on kaamdha.`,
        alternates: { canonical: url },
        openGraph: {
          title: `${name} — ${skills || "Staff"} in ${location} | kaamdha`,
          description: `${name} is available as ${skills || "staff"} in ${location}. Connect on kaamdha.`,
          images: ["/assets/og-image.png"],
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

  // Build canonical URL for listing pages
  const canonicalParts = ["/listings"];
  if (city) canonicalParts.push(city);
  if (categorySlug) canonicalParts.push(categorySlug);
  const canonical = canonicalParts.join("/");

  return { title, description, alternates: { canonical } };
}

export const dynamic = "force-dynamic";

export default async function ListingsPage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseListingSlug(slug);

  // Validate slug segments
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
    return renderWorkerDetail(parsed.detailId);
  }

  // Listing view
  const supabase = await createClient();
  const admin = createServiceClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!authUser;

  let query = admin
    .from("worker_profiles")
    .select(
      "id, custom_id, user_id, categories, experience_years, salary_min, salary_max, available_timings, locality, city, gender, location"
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

  const workers = workerRows.map((w) => ({
    id: w.id as string,
    customId: w.custom_id as string,
    name: nameMap.get(w.user_id as string) ?? "Staff",
    gender: w.gender as string | null,
    categories: w.categories as string[],
    experienceYears: w.experience_years as number,
    salaryMin: w.salary_min as number | null,
    salaryMax: w.salary_max as number | null,
    availableTimings: w.available_timings as string[],
    locality: w.locality as string | null,
    city: w.city as string | null,
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

async function renderWorkerDetail(customId: string) {
  const supabase = await createClient();
  const admin = createServiceClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: wpRaw } = await admin
    .from("worker_profiles")
    .select("*")
    .eq("custom_id", customId)
    .single();

  const wp = wpRaw as Record<string, unknown> | null;
  if (!wp) {
    notFound();
  }

  // Public view — no auth
  if (!authUser) {
    const { data: uRaw } = await admin
      .from("users")
      .select("name")
      .eq("id", wp.user_id as string)
      .single();
    const name = (uRaw as { name: string | null } | null)?.name ?? "Staff";

    return (
      <>
        <WorkerProfileJsonLd
          name={name}
          skills={wp.categories as string[]}
          locality={wp.locality as string | null}
          experienceYears={wp.experience_years as number}
        />
        <WorkerDetail
          worker={{
            id: wp.id as string,
            customId: wp.custom_id as string,
            userId: wp.user_id as string,
            name,
            gender: wp.gender as string | null,
            categories: wp.categories as string[],
            experienceYears: wp.experience_years as number,
            salaryMin: wp.salary_min as number | null,
            salaryMax: wp.salary_max as number | null,
            availableDays: (wp.available_days as string[]) ?? [],
            availableTimings: (wp.available_timings as string[]) ?? [],
            languages: (wp.languages as string[]) ?? [],
            originallyFrom: wp.originally_from as string | null,
            bio: wp.bio as string | null,
            locality: wp.locality as string | null,
            city: wp.city as string | null,
            isActive: wp.is_active as boolean,
            updatedAt: wp.updated_at as string | null,
          }}
          isOwner={false}
          isRevealed={false}
          revealedPhone={null}
          isFavorited={false}
          isPublic
        />
      </>
    );
  }

  const isOwner = (wp.user_id as string) === authUser.id;

  const [wuResult, , favResult, revealResult] = await Promise.all([
    admin
      .from("users")
      .select("name, phone")
      .eq("id", wp.user_id as string)
      .single(),
    isOwner
      ? Promise.resolve({ data: null })
      : admin
          .from("recently_viewed")
          .insert({
            user_id: authUser.id,
            target_type: "worker_profile",
            worker_profile_id: wp.id as string,
          } as Record<string, unknown> as never),
    isOwner
      ? Promise.resolve({ data: null })
      : admin
          .from("favorites")
          .select("id")
          .eq("user_id", authUser.id)
          .eq("worker_profile_id", wp.id as string)
          .single(),
    isOwner
      ? Promise.resolve({ data: null })
      : admin
          .from("lead_reveals")
          .select("id")
          .eq("from_user_id", authUser.id)
          .eq("worker_profile_id", wp.id as string)
          .single(),
  ]);

  const workerUser = wuResult.data as { name: string | null; phone: string } | null;
  const isFavoritedWorker = !!favResult.data;
  const isRevealed = !!revealResult.data;

  let revealedPhone: string | null = null;
  if (isRevealed) {
    const phone = workerUser?.phone ?? "";
    revealedPhone = phone.slice(-10, -4).replace(/./g, "X") + phone.slice(-4);
  }

  return (
    <>
      <WorkerProfileJsonLd
        name={workerUser?.name ?? "Staff"}
        skills={wp.categories as string[]}
        locality={wp.locality as string | null}
        experienceYears={wp.experience_years as number}
      />
      <WorkerDetail
        worker={{
          id: wp.id as string,
          customId: wp.custom_id as string,
          userId: wp.user_id as string,
          name: workerUser?.name ?? "Worker",
          gender: wp.gender as string | null,
          categories: wp.categories as string[],
          experienceYears: wp.experience_years as number,
          salaryMin: wp.salary_min as number | null,
          salaryMax: wp.salary_max as number | null,
          availableDays: (wp.available_days as string[]) ?? [],
          availableTimings: (wp.available_timings as string[]) ?? [],
          languages: (wp.languages as string[]) ?? [],
          originallyFrom: wp.originally_from as string | null,
          bio: wp.bio as string | null,
          locality: wp.locality as string | null,
          city: wp.city as string | null,
          isActive: wp.is_active as boolean,
          updatedAt: wp.updated_at as string | null,
        }}
        isOwner={isOwner}
        isRevealed={isRevealed}
        revealedPhone={revealedPhone}
        isFavorited={isFavoritedWorker}
      />
    </>
  );
}
