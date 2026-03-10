"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";
import { WorkerCard } from "@/components/shared/worker-card";

interface WorkerData {
  id: string;
  name: string;
  gender: string | null;
  categories: string[];
  experienceYears: number;
  salaryMin: number | null;
  salaryMax: number | null;
  availableDays: string[];
  availableTimings: string[];
  locality: string | null;
}

interface StaffListingsProps {
  workers: WorkerData[];
}

export function StaffListings({ workers }: StaffListingsProps) {
  const t = useTranslations("listings");
  const locale = useLocale();
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filtered = filterCategory
    ? workers.filter((w) => w.categories.includes(filterCategory))
    : workers;

  return (
    <div className="flex flex-col">
      {/* Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterCategory(null)}
          className={`shrink-0 rounded-full border-[1.5px] px-2.5 py-1 text-[10px] font-semibold transition-all ${
            filterCategory === null
              ? "border-primary bg-teal-light text-teal-dark"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          {t("all")}
        </button>
        {JOB_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`shrink-0 rounded-full border-[1.5px] px-2.5 py-1 text-[10px] font-semibold transition-all ${
              filterCategory === cat.id
                ? "border-primary bg-teal-light text-teal-dark"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {cat.emoji} {locale === "hi" ? cat.labelHi : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="mt-2 space-y-2 px-4 pb-6">
          {filtered.map((w) => (
            <WorkerCard
              key={w.id}
              id={w.id}
              name={w.name}
              gender={w.gender}
              categories={w.categories}
              experienceYears={w.experienceYears}
              salaryMin={w.salaryMin}
              salaryMax={w.salaryMax}
              availableDays={w.availableDays}
              availableTimings={w.availableTimings}
              locality={w.locality}
            />
          ))}
        </div>
      ) : (
        <div className="px-4 pt-8 text-center">
          <p className="text-[48px]">🔍</p>
          <h3 className="mt-3 font-heading text-[16px] font-bold text-foreground">
            {t("noResultsTitle")}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
            {t("noResultsDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
