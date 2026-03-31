import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmployerSearch } from "@/components/search/employer-search";

export const metadata: Metadata = {
  title: "Search staff",
  description:
    "Search for maids, cooks, drivers, nannies and more near you on kaamdha. Find verified household staff in Gurgaon.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; locality?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Fetch user locality for pre-filling
  const { data: userRaw } = await supabase
    .from("users")
    .select("name, locality, last_active_mode")
    .eq("id", authUser.id)
    .single();

  const user = userRaw as { name: string | null; locality: string | null; last_active_mode: string | null } | null;

  if (!user?.name) {
    redirect("/onboard");
  }

  const params = await searchParams;

  return (
    <EmployerSearch
      initialLocality={params.locality || user.locality || ""}
      initialCategory={params.category}
    />
  );
}
