import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";
import { WorkerOnboard } from "@/components/onboard/worker-onboard";

export default async function WorkerOnboardPage() {
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
    <div className="px-6 py-8">
      <WorkerOnboard />
    </div>
  );
}
