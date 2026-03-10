import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";
import { WorkerProfileEditor } from "@/components/account/worker-profile-editor";
import { EmployerProfileEditor } from "@/components/account/employer-profile-editor";

export default async function ProfileEditorPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: user } = await supabase
    .from("users")
    .select()
    .eq("id", authUser.id)
    .single<User>();

  if (!user?.name) {
    redirect("/onboard");
  }

  const isEmployer = user.last_active_mode === "find_help";

  if (isEmployer) {
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .single();

    const ep = epRaw as Record<string, unknown> | null;

    return (
      <EmployerProfileEditor
        user={user}
        profile={
          ep
            ? {
                id: ep.id as string,
                householdType: ep.household_type as string | null,
                locality: ep.locality as string | null,
              }
            : null
        }
      />
    );
  }

  // Worker
  const { data: wpRaw } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("user_id", authUser.id)
    .single();

  const wp = wpRaw as Record<string, unknown> | null;

  return (
    <WorkerProfileEditor
      user={user}
      profile={
        wp
          ? {
              id: wp.id as string,
              categories: wp.categories as string[],
              experienceYears: wp.experience_years as number,
              salaryMin: wp.salary_min as number | null,
              salaryMax: wp.salary_max as number | null,
              availableDays: wp.available_days as string[],
              availableTimings: wp.available_timings as string[],
              languages: wp.languages as string[],
              bio: wp.bio as string | null,
              locality: wp.locality as string | null,
              isActive: wp.is_active as boolean,
            }
          : null
      }
    />
  );
}
