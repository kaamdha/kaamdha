import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CITY_SLUGS, JOB_CATEGORIES } from "@/lib/constants";

const BASE = "https://kaamdha.com";

function localeEntry(
  path: string,
  opts: { lastModified?: Date; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number }
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}/en${path}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: {
        en: `${BASE}/en${path}`,
        hi: `${BASE}/hi${path}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    localeEntry("", { changeFrequency: "daily", priority: 1 }),

    // Staff listings: /listings, /listings/{city}, /listings/{city}/{category}
    localeEntry("/listings", { changeFrequency: "daily", priority: 0.8 }),
    ...CITY_SLUGS.flatMap((city) => [
      localeEntry(`/listings/${city}`, { changeFrequency: "daily", priority: 0.8 }),
      ...JOB_CATEGORIES.map((cat) =>
        localeEntry(`/listings/${city}/${cat.slug}`, { changeFrequency: "daily", priority: 0.7 })
      ),
    ]),

    // Job listings: /jobs, /jobs/{city}, /jobs/{city}/{category}
    localeEntry("/jobs", { changeFrequency: "daily", priority: 0.8 }),
    ...CITY_SLUGS.flatMap((city) => [
      localeEntry(`/jobs/${city}`, { changeFrequency: "daily", priority: 0.8 }),
      ...JOB_CATEGORIES.map((cat) =>
        localeEntry(`/jobs/${city}/${cat.slug}`, { changeFrequency: "daily", priority: 0.7 })
      ),
    ]),

    localeEntry("/login", { changeFrequency: "monthly", priority: 0.5 }),
    localeEntry("/about", { changeFrequency: "monthly", priority: 0.3 }),
    localeEntry("/contact", { changeFrequency: "monthly", priority: 0.3 }),
    localeEntry("/terms", { changeFrequency: "monthly", priority: 0.2 }),
    localeEntry("/privacy", { changeFrequency: "monthly", priority: 0.2 }),
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const [jobsResult, workersResult] = await Promise.all([
        supabase
          .from("job_listings")
          .select("custom_id, updated_at")
          .eq("status", "active")
          .order("updated_at", { ascending: false })
          .limit(500),
        supabase
          .from("worker_profiles")
          .select("id, updated_at")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(500),
      ]);

      if (jobsResult.data) {
        for (const job of jobsResult.data) {
          entries.push(
            localeEntry(`/details/${job.custom_id}`, {
              lastModified: new Date(job.updated_at),
              changeFrequency: "weekly",
              priority: 0.7,
            })
          );
        }
      }

      if (workersResult.data) {
        for (const worker of workersResult.data) {
          entries.push(
            localeEntry(`/details/${worker.id}`, {
              lastModified: new Date(worker.updated_at),
              changeFrequency: "weekly",
              priority: 0.6,
            })
          );
        }
      }
    }
  } catch {
    // Silently fail — static entries are still returned
  }

  return entries;
}
