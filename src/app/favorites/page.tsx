import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";
import { FavoritesView } from "@/components/favorites/favorites-view";

export default async function FavoritesPage() {
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

  // Fetch jobs created (employer only)
  let jobsCreated: Record<string, unknown>[] = [];
  if (isEmployer) {
    const { data: epRaw } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", authUser.id)
      .single();

    const ep = epRaw as { id: string } | null;
    if (ep) {
      const { data } = await supabase
        .from("job_listings")
        .select("*")
        .eq("employer_id", ep.id)
        .order("created_at", { ascending: false })
        .limit(20);
      jobsCreated = (data ?? []) as Record<string, unknown>[];
    }
  }

  // Fetch recently viewed (lead_reveals for "contacted")
  const { data: revealsRaw } = await supabase
    .from("lead_reveals")
    .select("*")
    .eq("from_user_id", authUser.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const reveals = (revealsRaw ?? []) as Record<string, unknown>[];

  // Fetch saved favorites
  const { data: favsRaw } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const savedFavorites = (favsRaw ?? []) as Record<string, unknown>[];

  return (
    <FavoritesView
      isEmployer={isEmployer}
      jobsCreated={jobsCreated}
      reveals={reveals}
      savedFavorites={savedFavorites}
    />
  );
}
