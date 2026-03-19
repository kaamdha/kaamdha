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
  ];

  // Fetch active job listings for dynamic URLs
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: jobs } = await supabase
        .from("job_listings")
        .select("custom_id, updated_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(500);

      if (jobs) {
        for (const job of jobs) {
          entries.push({
            url: `https://kaamdha.com/details/${job.custom_id}`,
            lastModified: new Date(job.updated_at),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }

      // Fetch active worker profiles
      const { data: workers } = await supabase
        .from("worker_profiles")
        .select("id, updated_at")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(500);

      if (workers) {
        for (const worker of workers) {
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
