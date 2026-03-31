import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: "https://kaamdha.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://kaamdha.com/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://kaamdha.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://kaamdha.com/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://kaamdha.com/terms",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: "https://kaamdha.com/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  // Fetch active job listings and worker profiles for dynamic URLs
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
          entries.push({
            url: `https://kaamdha.com/details/${job.custom_id}`,
            lastModified: new Date(job.updated_at),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      if (workersResult.data) {
        for (const worker of workersResult.data) {
          entries.push({
            url: `https://kaamdha.com/details/${worker.id}`,
            lastModified: new Date(worker.updated_at),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Silently fail — static entries are still returned
  }

  return entries;
}
