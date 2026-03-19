import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";
import { EmployerOnboard } from "@/components/onboard/employer-onboard";

export default async function EmployerOnboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("users")
    .select()
    .eq("id", user.id)
    .single<User>();

  if (data?.name) {
    // Only redirect if they also have an employer profile
    const { data: ep } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (ep) {
      redirect("/");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-8">
      <EmployerOnboard />
    </div>
  );
}
