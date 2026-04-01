import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { workerDetailUrl, jobDetailUrl } from "@/lib/constants";

/**
 * Legacy detail page — redirects to new SEO-friendly URLs:
 *   /details/JID... → /jobs/{city}/{category}/{customId}
 *   /details/{uuid} → /listings/{city}/{category}/{customId}
 */
export default async function DetailsRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createServiceClient();

  if (id.startsWith("JID")) {
    const { data: job } = await admin
      .from("job_listings")
      .select("custom_id, category, city")
      .eq("custom_id", id)
      .single();

    if (job) {
      const j = job as { custom_id: string; category: string; city: string | null };
      redirect(jobDetailUrl(j.city, j.category, j.custom_id));
    }
  } else {
    const { data: wp } = await admin
      .from("worker_profiles")
      .select("custom_id, categories, city")
      .eq("id", id)
      .single();

    if (wp) {
      const w = wp as { custom_id: string; categories: string[]; city: string | null };
      redirect(workerDetailUrl(w.city, w.categories[0] ?? null, w.custom_id));
    }
  }

  redirect("/");
}
