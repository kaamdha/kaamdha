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
    redirect("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-8">
      <EmployerOnboard />
    </div>
  );
}
