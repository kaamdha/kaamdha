"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { saveWorkerOnboarding } from "@/app/onboard/actions";
import { detectLocation, type LocationResult } from "@/lib/location";
import { JOB_CATEGORIES, DAYS_OF_WEEK } from "@/lib/constants";

const TIMINGS = [
  { value: "morning", labelEn: "Morning", labelHi: "सुबह" },
  { value: "afternoon", labelEn: "Afternoon", labelHi: "दोपहर" },
  { value: "evening", labelEn: "Evening", labelHi: "शाम" },
] as const;

export function WorkerOnboard() {
  const t = useTranslations("onboard");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [locality, setLocality] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimings, setAvailableTimings] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [detectingLocation, setDetectingLocation] = useState(false);

  function toggle(list: string[], item: string): string[] {
    return list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
  }

  async function handleDetectLocation() {
    setDetectingLocation(true);
    try {
      const result: LocationResult = await detectLocation();
      setCoords({ lat: result.latitude, lng: result.longitude });
      if (result.locality) setLocality(result.locality);
    } catch {
      // User can type manually
    } finally {
      setDetectingLocation(false);
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (categories.length === 0) {
      setError(t("categoriesRequired"));
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("locality", locality);
    if (coords) {
      formData.set("latitude", String(coords.lat));
      formData.set("longitude", String(coords.lng));
    }
    categories.forEach((c) => formData.append("categories", c));
    availableDays.forEach((d) => formData.append("available_days", d));
    availableTimings.forEach((t) => formData.append("available_timings", t));

    startTransition(async () => {
      const result = await saveWorkerOnboarding(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 text-center">
        <h1 className="font-heading text-[18px] font-bold text-foreground">
          {t("workerTitle")}
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {t("workerSubtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500">
            {t("nameLabel")} *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            autoFocus
          />
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500">
            {t("locationLabel")} *
          </label>
          <div className="flex gap-2">
            <Input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder={t("locationPlaceholder")}
              className="flex-1"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-slate-200 bg-teal-light text-sm"
            >
              {detectingLocation ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <MapPin className="size-4 text-primary" />
              )}
            </button>
          </div>
          {detectingLocation && (
            <p className="mt-1 text-[11px] text-primary">
              📍 {t("detectingLocation")}
            </p>
          )}
        </div>

        {/* Categories */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500">
            {t("categoriesLabel")} *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategories(toggle(categories, cat.id))}
                className={`rounded-full border-[1.5px] px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                  categories.includes(cat.id)
                    ? "border-primary bg-teal-light text-teal-dark"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {cat.emoji} {locale === "hi" ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Available Days */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500">
            {t("daysLabel")} *
          </label>
          <div className="flex gap-1.5">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() =>
                  setAvailableDays(toggle(availableDays, day.value))
                }
                className={`flex size-9 items-center justify-center rounded-full border-[1.5px] text-[11px] font-semibold transition-all ${
                  availableDays.includes(day.value)
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                {day.labelEn.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        {/* Available Timings */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500">
            {t("timingsLabel")} *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TIMINGS.map((timing) => (
              <button
                key={timing.value}
                type="button"
                onClick={() =>
                  setAvailableTimings(toggle(availableTimings, timing.value))
                }
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  availableTimings.includes(timing.value)
                    ? "border-primary bg-teal-light text-teal-dark"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                {locale === "hi" ? timing.labelHi : timing.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-[12px] text-destructive">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending || !name.trim() || categories.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-3 text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("createProfile")}
        </button>
      </div>
    </div>
  );
}
