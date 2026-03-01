"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export async function checkUserRole(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "/login";
  }

  const { data } = await supabase
    .from("users")
    .select()
    .eq("id", user.id)
    .single<User>();

  if (!data?.active_role) {
    return "/onboarding";
  }

  return "/dashboard";
}
