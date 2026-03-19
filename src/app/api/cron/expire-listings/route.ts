import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron job: Expire stale job listings and flag upcoming expiries.
 *
 * Called daily by Vercel Cron at midnight UTC.
 * Secured via CRON_SECRET header check.
 *
 * 1. Marks active listings past their expires_at as 'expired'.
 * 2. Finds listings expiring within 3 days (placeholder for WhatsApp reminder).
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // 1. Expire listings past their expires_at
    const { data: expiredListings, error: expireError } = await supabase
      .from("job_listings")
      .update({
        status: "expired",
        updated_at: now,
      } as never)
      .eq("status", "active")
      .lt("expires_at", now)
      .select("id, custom_id, employer_id, category, locality");

    if (expireError) {
      console.error("Error expiring listings:", expireError);
      return NextResponse.json(
        { error: "Failed to expire listings", details: expireError.message },
        { status: 500 }
      );
    }

    const expiredCount = expiredListings?.length ?? 0;
    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} job listings:`, expiredListings);
    }

    // 2. Find listings expiring in the next 3 days (for WhatsApp reminders)
    const threeDaysFromNow = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: soonExpiring, error: soonError } = await supabase
      .from("job_listings")
      .select("id, custom_id, employer_id, category, locality, expires_at")
      .eq("status", "active")
      .gt("expires_at", now)
      .lte("expires_at", threeDaysFromNow);

    if (soonError) {
      console.error("Error fetching soon-expiring listings:", soonError);
      // Non-fatal: we still expired the stale ones
    }

    const soonExpiringCount = soonExpiring?.length ?? 0;
    if (soonExpiringCount > 0) {
      // TODO: Send WhatsApp reminders via Gupshup when integration is ready.
      // Template: "Your listing ({category}, {locality}) expires in 3 days."
      console.log(
        `Found ${soonExpiringCount} listings expiring within 3 days:`,
        soonExpiring
      );
    }

    return NextResponse.json({
      success: true,
      expired: expiredCount,
      expiring_soon: soonExpiringCount,
      timestamp: now,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
