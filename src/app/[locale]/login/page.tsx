import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";
import type { User } from "@/types/database";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login or register on kaamdha with your phone number. Find household staff or jobs near you in Gurgaon.",
};

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
      redirect("/onboard");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <LoginForm />
    </div>
  );
}
