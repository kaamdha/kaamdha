"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES, CITY_SLUGS, CITY_LABELS } from "@/lib/constants";

const HIDDEN_ROUTES = ["/login", "/onboard"];

export function SiteFooter() {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const locale = useLocale();

  if (HIDDEN_ROUTES.some((r) => pathname.includes(r))) return null;

  return (
    <footer className="bg-[#1e293b] px-4 pb-8 pt-6">
      {/* Per-category links — exclude trainer & eldercare */}
      {JOB_CATEGORIES
        .filter((cat) => !["personal-trainer", "eldercare"].includes(cat.slug))
        .map((cat) => {
          const catLabel = locale === "hi" ? cat.labelHi : cat.labelEn;
          return (
            <div key={cat.id}>
              <h4 className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {catLabel}
              </h4>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {CITY_SLUGS.slice(0, 4).map((city) => {
                  const cityLabel = (locale === "hi" ? CITY_LABELS[city]?.hi : CITY_LABELS[city]?.en) ?? city;
                  return (
                    <Link
                      key={`hire-${city}`}
                      href={`/listings/${city}/${cat.slug}`}
                      className="text-[11px] leading-relaxed text-slate-400 hover:text-teal-300"
                    >
                      {t("hireIn", { city: cityLabel })}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {CITY_SLUGS.slice(0, 4).map((city) => {
                  const cityLabel = (locale === "hi" ? CITY_LABELS[city]?.hi : CITY_LABELS[city]?.en) ?? city;
                  return (
                    <Link
                      key={`jobs-${city}`}
                      href={`/jobs/${city}/${cat.slug}`}
                      className="text-[11px] leading-relaxed text-slate-400 hover:text-teal-300"
                    >
                      {t("jobsIn", { city: cityLabel })}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* Divider + copyright */}
      <div className="my-5 h-px bg-slate-700" />
      <p className="text-center text-[11px] text-slate-500">
        Made with ❤️ for Bharat
      </p>
      <p className="mt-1 text-center text-[10px] text-slate-600">
        © 2025 kaamdha
      </p>
    </footer>
  );
}
