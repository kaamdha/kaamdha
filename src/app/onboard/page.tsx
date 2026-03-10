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

  // If user already has a name, they've completed onboarding
  const { data } = await supabase
    .from("users")
    .select()
    .eq("id", user.id)
    .single<User>();

  if (data?.name) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <RoleSelection />
    </div>
  );
}
