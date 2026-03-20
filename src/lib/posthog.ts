import posthog from "posthog-js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST = "https://us.i.posthog.com";

export function initPostHog() {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage",
  });
}

// ---------- Identity ----------

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

// ---------- Events ----------

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

// Pre-defined events for type safety
export const events = {
  // Auth
  loginStarted: () => trackEvent("login_started"),
  loginCompleted: (role?: string) => trackEvent("login_completed", { role }),
  otpRequested: () => trackEvent("otp_requested"),
  otpVerified: () => trackEvent("otp_verified"),
  logout: () => trackEvent("logout"),

  // Onboarding
  roleSelected: (role: string) => trackEvent("role_selected", { role }),
  onboardCompleted: (role: string) => trackEvent("onboard_completed", { role }),

  // Search & Discovery
  searchPerformed: (props: { category: string; locality: string }) =>
    trackEvent("search_performed", props),
  profileViewed: (props: { workerId: string; category?: string }) =>
    trackEvent("profile_viewed", props),
  jobViewed: (props: { jobId: string; category?: string }) =>
    trackEvent("job_viewed", props),

  // Connect (reveal)
  connectTapped: (props: { targetType: "worker" | "employer"; targetId: string }) =>
    trackEvent("connect_tapped", props),
  connectCompleted: (props: { targetType: "worker" | "employer"; targetId: string }) =>
    trackEvent("connect_completed", props),
  callTapped: (props: { targetType: "worker" | "employer"; targetId: string }) =>
    trackEvent("call_tapped", props),

  // Favorites
  favoriteAdded: (props: { targetType: string; targetId: string }) =>
    trackEvent("favorite_added", props),
  favoriteRemoved: (props: { targetType: string; targetId: string }) =>
    trackEvent("favorite_removed", props),

  // Share
  shareTapped: (props: { channel: string; targetType: string; targetId: string }) =>
    trackEvent("share_tapped", props),

  // Profile
  profileEdited: (role: string) => trackEvent("profile_edited", { role }),
  jobListingCreated: (props: { category: string; locality: string }) =>
    trackEvent("job_listing_created", props),
};
