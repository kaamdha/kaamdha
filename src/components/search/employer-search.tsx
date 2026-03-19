"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { JOB_CATEGORIES } from "@/lib/constants";
import { employerSearch, type WorkerResult } from "@/app/search/actions";
import { WorkerCard } from "@/components/shared/worker-card";

interface EmployerSearchProps {
  initialLocality: string;
  initialCategory?: string;
}

export function EmployerSearch({
  initialLocality,
  initialCategory,
}: EmployerSearchProps) {
  const router = useRouter();
  const t = useTranslations("search");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory] = useState<string | null>(
    initialCategory ?? null
  );
  const [locality] = useState(initialLocality);

  const [workers, setWorkers] = useState<WorkerResult[]>([]);
  const [jidNotice, setJidNotice] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTriggered = useRef(false);

  // Get category label for header
  const catInfo = selectedCategory
    ? JOB_CATEGORIES.find((c) => c.id === selectedCategory)
    : null;
  const catLabel = catInfo
    ? locale === "hi" ? catInfo.labelHi : catInfo.labelEn
    : "";

  // Auto-trigger search on mount if we have category + locality
  useEffect(() => {
    if (searchTriggered.current) return;
    if (!selectedCategory) return;
    searchTriggered.current = true;

    const formData = new FormData();
    formData.set("category", selectedCategory);
    formData.set("locality", locality);

    startTransition(async () => {
      const result = await employerSearch(formData);
      if (result.error) {
        setSearchError(result.error);
        return;
      }
      setWorkers(result.workers);
      setHasSearched(true);
      if (result.jidCustomId && !result.jidReused) {
        setJidNotice(t("jidCreated"));
      }
    });
  }, [selectedCategory, locality, startTransition, t]);

  return (
    <div className="flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">Back</span>
        </button>
      </div>

      {/* Result count */}
      {hasSearched && !isPending && workers.length > 0 && (
        <div className="px-4 pt-2">
          <p className="text-[12px] text-slate-400">
            {workers.length} {workers.length === 1 ? "result" : "results"}{locality ? ` in ${locality}` : ""}
          </p>
        </div>
      )}

      {/* JID notice */}
      {jidNotice && (
        <div className="mx-4 mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
          ✅ {jidNotice}
        </div>
      )}

      {/* Loading state */}
      {isPending && (
        <div className="flex items-center justify-center px-4 pt-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {searchError && (
        <p className="mx-4 mt-4 text-xs text-red-500">{searchError}</p>
      )}

      {/* Results */}
      {hasSearched && !isPending && workers.length > 0 && (
        <>
          <div className="mt-5 space-y-2 px-4 pb-6">
            {workers.map((w) => (
              <WorkerCard
                key={w.id}
                id={w.id}
                name={w.name}
                gender={w.gender}
                categories={w.categories}
                experienceYears={w.experience_years}
                salaryMin={w.salary_min}
                salaryMax={w.salary_max}
                availableTimings={w.available_timings}
                locality={w.locality}
                isFavorited={w.is_favorited}
                distanceKm={w.distance_km}
              />
            ))}
          </div>
        </>
      )}

      {hasSearched && !isPending && workers.length === 0 && (
        <div className="mx-4 mt-6 rounded-[14px] bg-slate-50 px-6 py-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/no-results.png" alt="No results found" className="mx-auto size-16" />
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
