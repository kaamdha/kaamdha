import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";
import { AccountMenu } from "@/components/account/account-menu";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your kaamdha account, profile, and job listings.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Parallel: fetch user + employer profile at once
  const [userResult, epResult] = await Promise.all([
    supabase
      .from("users")
      .select()
      .eq("id", authUser.id)
      .single<User>(),
    supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", authUser.id)
      .single(),
  ]);

  const user = userResult.data;
  if (!user?.name) {
    redirect("/onboard");
  }

  // Count active job listings for employer
  let activeJobCount = 0;
  const ep = epResult.data as { id: string } | null;
  if (user.last_active_mode === "find_help" && ep) {
    const { count } = await supabase
      .from("job_listings")
      .select("id", { count: "exact", head: true })
      .eq("employer_id", ep.id)
      .eq("status", "active");

    activeJobCount = count ?? 0;
  }

  return (
    <AccountMenu
      user={user}
      activeJobCount={activeJobCount}
    />
  );
}
