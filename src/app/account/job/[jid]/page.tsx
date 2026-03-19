import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JidEditor } from "@/components/account/jid-editor";

export default async function JidEditorPage({
  params,
}: {
  params: Promise<{ jid: string }>;
}) {
  const supabase = await createClient();
  const { jid } = await params;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Fetch job listing by custom_id
  const { data: jobRaw } = await supabase
    .from("job_listings")
    .select("*")
    .eq("custom_id", jid)
    .single();

  const job = jobRaw as Record<string, unknown> | null;
  if (!job) {
    redirect("/favorites");
  }

  // Verify ownership
  const { data: epRaw } = await supabase
    .from("employer_profiles")
    .select("id, user_id")
    .eq("id", job.employer_id as string)
    .single();

  const ep = epRaw as { id: string; user_id: string } | null;
  if (!ep || ep.user_id !== authUser.id) {
    redirect("/favorites");
  }

  return (
    <JidEditor
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
        expiresAt: job.expires_at as string,
        createdAt: job.created_at as string,
      }}
    />
  );
}
