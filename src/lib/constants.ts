export const SALARY_MIN = 1000;
export const SALARY_MAX = 100000;
export const SALARY_STEP = 500;

export const DAYS_OF_WEEK = [
  { value: "mon", labelEn: "Monday", labelHi: "सोमवार" },
  { value: "tue", labelEn: "Tuesday", labelHi: "मंगलवार" },
  { value: "wed", labelEn: "Wednesday", labelHi: "बुधवार" },
  { value: "thu", labelEn: "Thursday", labelHi: "गुरुवार" },
  { value: "fri", labelEn: "Friday", labelHi: "शुक्रवार" },
  { value: "sat", labelEn: "Saturday", labelHi: "शनिवार" },
  { value: "sun", labelEn: "Sunday", labelHi: "रविवार" },
] as const;

export const LANGUAGES = [
  { value: "hindi", labelEn: "Hindi", labelHi: "हिन्दी" },
  { value: "english", labelEn: "English", labelHi: "अंग्रेज़ी" },
  { value: "tamil", labelEn: "Tamil", labelHi: "तमिल" },
  { value: "bengali", labelEn: "Bengali", labelHi: "बंगाली" },
  { value: "marathi", labelEn: "Marathi", labelHi: "मराठी" },
  { value: "telugu", labelEn: "Telugu", labelHi: "तेलुगु" },
  { value: "gujarati", labelEn: "Gujarati", labelHi: "गुजराती" },
  { value: "kannada", labelEn: "Kannada", labelHi: "कन्नड़" },
  { value: "punjabi", labelEn: "Punjabi", labelHi: "पंजाबी" },
  { value: "odia", labelEn: "Odia", labelHi: "ओड़िया" },
] as const;

export const EXPERIENCE_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 15, 20] as const;

export const HOUSEHOLD_TYPES = [
  "apartment",
  "independent_house",
  "villa",
  "other",
] as const;

export const JID_STATUSES = [
  "active",
  "expired",
  "deactivated",
  "filled",
] as const;

export const JOB_CATEGORIES = [
  { id: "C0001", slug: "maid", emoji: "🧹", labelEn: "Maid", labelHi: "कामवाली बाई" },
  { id: "C0002", slug: "cook", emoji: "🍳", labelEn: "Cook", labelHi: "रसोइया" },
  { id: "C0003", slug: "driver", emoji: "🚗", labelEn: "Driver", labelHi: "ड्राइवर" },
  { id: "C0006", slug: "nanny", emoji: "👶", labelEn: "Nanny", labelHi: "आया" },
  { id: "C0007", slug: "personal-trainer", emoji: "💪", labelEn: "Trainer", labelHi: "ट्रेनर" },
  { id: "C0008", slug: "eldercare", emoji: "👴", labelEn: "Elder Care", labelHi: "बुज़ुर्गों की देखभाल" },
] as const;

export const CITY_SLUGS = ["gurgaon", "delhi", "noida", "faridabad", "ghaziabad", "greater-noida", "manesar"] as const;

export const CITY_LABELS: Record<string, { en: string; hi: string }> = {
  gurgaon: { en: "Gurgaon", hi: "गुरुग्राम" },
  delhi: { en: "Delhi", hi: "दिल्ली" },
  noida: { en: "Noida", hi: "नोएडा" },
  faridabad: { en: "Faridabad", hi: "फरीदाबाद" },
  ghaziabad: { en: "Ghaziabad", hi: "गाज़ियाबाद" },
  "greater-noida": { en: "Greater Noida", hi: "ग्रेटर नोएडा" },
  manesar: { en: "Manesar", hi: "मानेसर" },
};

/**
 * Parse optional catch-all slug segments into city, category, and detail ID.
 * e.g. ["gurgaon", "maid"] → { city: "gurgaon", categorySlug: "maid", categoryId: "C0001" }
 * e.g. ["gurgaon", "maid", "W000000001"] → { city, categorySlug, categoryId, detailId: "W000000001" }
 */
export function parseListingSlug(slug?: string[]): {
  city?: string;
  categorySlug?: string;
  categoryId?: string;
  detailId?: string;
} {
  if (!slug || slug.length === 0) return {};
  const first = slug[0] as string;
  if (!first) return {};
  const city = (CITY_SLUGS as readonly string[]).includes(first) ? first : undefined;
  if (!city) return {};
  if (slug.length === 1) return { city };
  const second = slug[1];
  const cat = JOB_CATEGORIES.find((c) => c.slug === second);
  if (!cat) return { city };
  if (slug.length === 2) return { city, categorySlug: cat.slug, categoryId: cat.id };
  const detailId = slug[2];
  if (!detailId) return { city, categorySlug: cat.slug, categoryId: cat.id };
  return { city, categorySlug: cat.slug, categoryId: cat.id, detailId };
}

/**
 * Build a detail page URL for a worker profile.
 */
export function workerDetailUrl(city: string | null, categoryId: string | null, customId: string): string {
  const catSlug = categoryId ? JOB_CATEGORIES.find((c) => c.id === categoryId)?.slug : undefined;
  if (city && catSlug) return `/listings/${city}/${catSlug}/${customId}`;
  return `/listings/gurgaon/${catSlug ?? "maid"}/${customId}`;
}

/**
 * Build a detail page URL for a job listing.
 */
export function jobDetailUrl(city: string | null, categoryId: string | null, customId: string): string {
  const catSlug = categoryId ? JOB_CATEGORIES.find((c) => c.id === categoryId)?.slug : undefined;
  if (city && catSlug) return `/jobs/${city}/${catSlug}/${customId}`;
  return `/jobs/gurgaon/${catSlug ?? "maid"}/${customId}`;
}
