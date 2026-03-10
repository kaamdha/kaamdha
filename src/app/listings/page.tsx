import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StaffListings } from "@/components/listings/staff-listings";

export default async function ListingsPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Fetch active worker profiles
  const { data: workersRaw } = await supabase
    .from("worker_profiles")
    .select("id, user_id, categories, experience_years, salary_min, salary_max, available_days, available_timings, locality, gender")
    .eq("is_active", true)
    .eq("city", "gurgaon")
    .order("created_at", { ascending: false })
    .limit(30);

  // Fetch names for workers
  const workers: Array<{
    id: string;
    name: string;
    gender: string | null;
    categories: string[];
    experienceYears: number;
    salaryMin: number | null;
    salaryMax: number | null;
    availableDays: string[];
    availableTimings: string[];
    locality: string | null;
  }> = [];

  const workerRows = (workersRaw ?? []) as Record<string, unknown>[];
  for (const w of workerRows) {
    const { data: userRow } = await supabase
      .from("users")
      .select("name")
      .eq("id", w.user_id as string)
      .single();

    const userName = (userRow as { name: string | null } | null)?.name ?? "Worker";

    workers.push({
      id: w.id as string,
      name: userName,
      gender: w.gender as string | null,
      categories: w.categories as string[],
      experienceYears: w.experience_years as number,
      salaryMin: w.salary_min as number | null,
      salaryMax: w.salary_max as number | null,
      availableDays: w.available_days as string[],
      availableTimings: w.available_timings as string[],
      locality: w.locality as string | null,
    });
  }

  return <StaffListings workers={workers} />;
}
