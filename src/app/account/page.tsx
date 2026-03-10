import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";
import { AccountMenu } from "@/components/account/account-menu";

export default async function AccountPage() {
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

  // Count active job listings for employer
  let activeJobCount = 0;
  if (user.last_active_mode === "find_help") {
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", authUser.id)
      .single();

    const ep = epRaw as { id: string } | null;
    if (ep) {
      const { count } = await supabase
        .from("job_listings")
        .select("id", { count: "exact", head: true })
        .eq("employer_id", ep.id)
        .eq("status", "active");

      activeJobCount = count ?? 0;
    }
  }

  return (
    <AccountMenu
      user={user}
      activeJobCount={activeJobCount}
    />
  );
}
