"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JOB_CATEGORIES, DISTANCE_OPTIONS } from "@/lib/constants";
import { detectLocation, type LocationResult } from "@/lib/location";
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
  const t = useTranslations("search");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory ?? null
  );
  const [locality, setLocality] = useState(initialLocality);
  const [distance, setDistance] = useState(5);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  const [workers, setWorkers] = useState<WorkerResult[]>([]);
  const [jidNotice, setJidNotice] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function handleDetectLocation() {
    setDetectingLocation(true);
    try {
      const result: LocationResult = await detectLocation();
      if (result.locality) setLocality(result.locality);
      if (result.latitude) setLatitude(result.latitude.toString());
      if (result.longitude) setLongitude(result.longitude.toString());
    } catch {
      // User can type manually
    } finally {
      setDetectingLocation(false);
    }
  }

  function handleSearch() {
    if (!selectedCategory) {
      setSearchError(t("selectCategory"));
      return;
    }
    setSearchError(null);

    const formData = new FormData();
    formData.set("category", selectedCategory);
    formData.set("locality", locality);
    formData.set("distance", distance.toString());
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);

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
      } else {
        setJidNotice(null);
      }
    });
  }

  return (
    <div className="flex flex-col">
      {/* Search form */}
      <div className="mx-4 mt-4 rounded-[14px] bg-slate-100 p-3.5">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchError(null);
              }}
              className={`rounded-full border-[1.5px] px-2.5 py-1 text-[10px] font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "border-primary bg-teal-light text-teal-dark"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {cat.emoji} {locale === "hi" ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Location input */}
        <div className="mt-3 flex gap-2">
          <Input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder={t("locationPlaceholder")}
            className="flex-1 bg-white text-[13px]"
          />
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-slate-200 bg-teal-light"
          >
            {detectingLocation ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <MapPin className="size-4 text-primary" />
            )}
          </button>
        </div>

        {/* Distance pills */}
        <div className="mt-3 flex gap-1.5">
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDistance(opt.value)}
              className={`rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold transition-all ${
                distance === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {searchError && (
          <p className="mt-2 text-[11px] text-red-500">{searchError}</p>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>🔍 {t("searchWorkers")}</>
          )}
        </button>
      </div>

      {/* JID notice */}
      {jidNotice && (
        <div className="mx-4 mt-3 rounded-lg bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-700">
          ✅ {jidNotice}
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="px-4 pt-4">
          <h3 className="font-heading text-[14px] font-bold text-foreground">
            {t("results")} ({workers.length})
          </h3>
        </div>
      )}

      {hasSearched && workers.length > 0 && (
        <div className="mt-2 space-y-2 px-4 pb-6">
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
              availableDays={w.available_days}
              availableTimings={w.available_timings}
              locality={w.locality}
            />
          ))}
        </div>
      )}

      {hasSearched && workers.length === 0 && (
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
