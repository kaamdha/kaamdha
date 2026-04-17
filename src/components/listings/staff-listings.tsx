"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";
import { WorkerCard } from "@/components/shared/worker-card";

interface WorkerData {
  id: string;
  customId: string;
  city: string | null;
  name: string;
  gender: string | null;
  categories: string[];
  experienceYears: number;
  salaryMin: number | null;
  salaryMax: number | null;
  availableTimings: string[];
  locality: string | null;
  phonePrefix?: string;
}

interface StaffListingsProps {
  workers: WorkerData[];
  isPublic?: boolean;
  city?: string;
  categorySlug?: string;
}

export function StaffListings({
  workers,
  isPublic = false,
  city,
  categorySlug,
}: StaffListingsProps) {
  const t = useTranslations("listings");
  const locale = useLocale();

  const basePath = city ? `/listings/${city}` : "/listings";

  return (
    <div className="flex flex-col">
      {/* Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
        <Link
          href={basePath}
          className={`shrink-0 rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold transition-all ${
            !categorySlug
              ? "border-primary bg-teal-light text-teal-dark"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          {t("all")}
        </Link>
        {JOB_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={city ? `/listings/${city}/${cat.slug}` : `/listings`}
            className={`shrink-0 rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold transition-all ${
              categorySlug === cat.slug
                ? "border-primary bg-teal-light text-teal-dark"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {locale === "hi" ? cat.labelHi : cat.labelEn}
          </Link>
        ))}
      </div>

      {/* Results */}
      {workers.length > 0 ? (
        <div className="mt-2 space-y-2 px-4 pb-6">
          {workers.map((w) => (
            <WorkerCard
              key={w.id}
              id={w.id}
              customId={w.customId}
              city={w.city}
              name={w.name}
              gender={w.gender}
              categories={w.categories}
              experienceYears={w.experienceYears}
              salaryMin={w.salaryMin}
              salaryMax={w.salaryMax}
              availableTimings={w.availableTimings}
              locality={w.locality}
              phonePrefix={w.phonePrefix}
              isPublic={isPublic}
            />
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-6 rounded-[14px] bg-slate-50 px-6 py-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/no-results.png"
            alt=""
            className="mx-auto size-16"
          />
          <h3 className="mt-3 font-heading text-[16px] font-bold text-foreground">
            {t("noResultsTitle")}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
            {t("noResultsDesc")}
          </p>
          <p className="mt-3 text-[12px] text-slate-400">
            {t("noResultsHint")}
          </p>
        </div>
      )}
    </div>
  );
}
