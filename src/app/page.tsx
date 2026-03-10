import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";
import { HomeLanding } from "@/components/landing/home-landing";
import { HomeEmployer } from "@/components/home/home-employer";
import { HomeWorker } from "@/components/home/home-worker";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return <HomeLanding />;
  }

  // Fetch user record
  const { data: user } = await supabase
    .from("users")
    .select()
    .eq("id", authUser.id)
    .single<User>();

  if (!user?.name) {
    return <HomeLanding />;
  }

  const isEmployer = user.last_active_mode === "find_help";

  if (isEmployer) {
    // Fetch employer profile
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", authUser.id)
      .single();

    const employerProfile = epRaw as { id: string } | null;

    let recentJobs: Record<string, unknown>[] = [];
    if (employerProfile) {
      const { data } = await supabase
        .from("job_listings")
        .select("*")
        .eq("employer_id", employerProfile.id)
        .order("created_at", { ascending: false })
        .limit(5);
      recentJobs = (data ?? []) as Record<string, unknown>[];
    }

    return <HomeEmployer user={user} recentJobs={recentJobs} />;
  }

  // Worker mode — fetch nearby active jobs
  const { data: jobsRaw } = await supabase
    .from("job_listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <HomeWorker
      user={user}
      jobs={(jobsRaw ?? []) as Record<string, unknown>[]}
    />
  );
}
