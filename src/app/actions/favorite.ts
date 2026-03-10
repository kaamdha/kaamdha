"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(
  targetType: "worker_profile" | "job_listing",
  targetId: string
): Promise<{ isFavorited: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isFavorited: false, error: "Not authenticated" };
  }

  const column =
    targetType === "worker_profile" ? "worker_profile_id" : "job_listing_id";

  // Check if already favorited
  const { data: existingRaw } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq(column, targetId)
    .single();

  if (existingRaw) {
    // Remove favorite
    const existing = existingRaw as { id: string };
    await supabase.from("favorites").delete().eq("id", existing.id);
    return { isFavorited: false };
  }

  // Add favorite
  const insertFields = {
    user_id: user.id,
    target_type: targetType,
    [column]: targetId,
  };

  const { error } = await supabase
    .from("favorites")
    .insert(insertFields as Record<string, unknown> as never);

  if (error) {
    return { isFavorited: false, error: "Could not save. Please try again." };
  }

  return { isFavorited: true };
}
