"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES, CITY_LABELS } from "@/lib/constants";

const FOOTER_CITIES = ["gurgaon", "delhi", "noida", "faridabad", "ghaziabad", "greater-noida"] as const;
const CATEGORY_CITIES = ["gurgaon", "delhi", "noida", "faridabad"] as const;

const HIDDEN_ROUTES = ["/login", "/onboard"];

interface SiteFooterProps {
  userMode?: "find_staff" | "find_jobs" | null;
}

export function SiteFooter({ userMode = null }: SiteFooterProps) {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const locale = useLocale();

  if (HIDDEN_ROUTES.some((r) => pathname.includes(r))) return null;

  // Determine effective mode:
  // - Logged in: use userMode directly
  // - Logged out on /listings/*: employer flow (staff links)
  // - Logged out on /jobs/*: worker flow (job links)
  // - Logged out on homepage: show both
  let effectiveMode = userMode;
  if (!userMode) {
    if (pathname.includes("/listings")) effectiveMode = "find_staff";
    else if (pathname.includes("/jobs")) effectiveMode = "find_jobs";
    // else null = homepage, show both
  }

  const showStaffLinks = !effectiveMode || effectiveMode === "find_staff";
  const showJobLinks = !effectiveMode || effectiveMode === "find_jobs";

  const staffCategories = JOB_CATEGORIES.filter(
    (cat) => !["personal-trainer", "eldercare"].includes(cat.slug)
  );

  return (
    <footer className="bg-teal-50 px-4 pb-8 pt-6">
      {/* Find staff by city — shown to logged-out and employers */}
      {showStaffLinks && (
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800/60">
            {t("browseStaffByCity")}
          </h4>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {FOOTER_CITIES.map((city) => {
              const cityLabel = (locale === "hi" ? CITY_LABELS[city]?.hi : CITY_LABELS[city]?.en) ?? city;
              return (
                <Link
                  key={city}
                  href={`/listings/${city}`}
                  className="text-[11px] leading-relaxed text-teal-800 underline decoration-teal-300 hover:text-primary hover:decoration-primary"
                >
                  {cityLabel}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Find jobs by city — shown to logged-out and workers */}
      {showJobLinks && (
        <div className={showStaffLinks ? "mt-4" : ""}>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800/60">
            {t("browseJobsByCity")}
          </h4>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {FOOTER_CITIES.map((city) => {
              const cityLabel = (locale === "hi" ? CITY_LABELS[city]?.hi : CITY_LABELS[city]?.en) ?? city;
              return (
                <Link
                  key={city}
                  href={`/jobs/${city}`}
                  className="text-[11px] leading-relaxed text-teal-800 underline decoration-teal-300 hover:text-primary hover:decoration-primary"
                >
                  {cityLabel}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-category links — context-aware */}
      {staffCategories.map((cat) => {
        const catLabel = locale === "hi" ? cat.labelHi : cat.labelEn;
        return (
          <div key={cat.id} className="mt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800/60">
              {catLabel}
            </h4>
            {/* Hire links — shown to logged-out and employers */}
            {showStaffLinks && (
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {CATEGORY_CITIES.map((city) => {
                  const cityLabel = (locale === "hi" ? CITY_LABELS[city]?.hi : CITY_LABELS[city]?.en) ?? city;
                  return (
                    <Link
                      key={`hire-${city}`}
                      href={`/listings/${city}/${cat.slug}`}
                      className="text-[11px] leading-relaxed text-teal-800 underline decoration-teal-300 hover:text-primary hover:decoration-primary"
                    >
                      {t("hireIn", { city: cityLabel })}
                    </Link>
                  );
                })}
              </div>
            )}
            {/* Jobs links — shown to logged-out and workers */}
            {showJobLinks && (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {CATEGORY_CITIES.map((city) => {
                  const cityLabel = (locale === "hi" ? CITY_LABELS[city]?.hi : CITY_LABELS[city]?.en) ?? city;
                  return (
                    <Link
                      key={`jobs-${city}`}
                      href={`/jobs/${city}/${cat.slug}`}
                      className="text-[11px] leading-relaxed text-teal-800 underline decoration-teal-300 hover:text-primary hover:decoration-primary"
                    >
                      {t("jobsIn", { city: cityLabel })}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Divider + copyright */}
      <div className="my-5 h-px bg-teal-200" />
      <p className="text-center text-[11px] text-teal-700/60">
        Made with ❤️ for Bharat
      </p>
      <p className="mt-1 text-center text-[10px] text-teal-600/50">
        © 2026 kaamdha
      </p>
    </footer>
  );
}
