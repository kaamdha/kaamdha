import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";
import { RoleSelection } from "@/components/onboard/role-selection";

export default async function OnboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has completed onboarding (name + profile)
  const { data } = await supabase
    .from("users")
    .select()
    .eq("id", user.id)
    .single<User>();

  if (data?.name) {
    // Also check if they have a profile — if not, they need to redo onboarding
    const hasEmployer = data.last_active_mode === "find_help";
    if (hasEmployer) {
      const { data: ep } = await supabase
        .from("employer_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!ep) {
        // Name set but profile missing — let them re-onboard
      } else {
        redirect("/");
      }
    } else if (data.last_active_mode === "find_jobs") {
      const { data: wp } = await supabase
        .from("worker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!wp) {
        // Name set but profile missing — let them re-onboard
      } else {
        redirect("/");
      }
    } else {
      // No mode set yet — show role selection
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <RoleSelection />
    </div>
  );
}
