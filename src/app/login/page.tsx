import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";
import type { User } from "@/types/database";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single<User>();

    if (data?.name) {
      redirect("/");
    } else {
      redirect("/account");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <LoginForm />
    </div>
  );
}
