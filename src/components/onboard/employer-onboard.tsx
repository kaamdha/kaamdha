"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { saveEmployerOnboarding } from "@/app/onboard/actions";
import { detectLocation, type LocationResult } from "@/lib/location";
import { JOB_CATEGORIES, DISTANCE_OPTIONS } from "@/lib/constants";

export function EmployerOnboard() {
  const t = useTranslations("onboard");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [locality, setLocality] = useState("");
  const [distance, setDistance] = useState(5);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [detectingLocation, setDetectingLocation] = useState(false);

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

    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("locality", locality);
    if (selectedCategory) formData.set("category", selectedCategory);
    formData.set("distance", String(distance));
    if (coords) {
      formData.set("latitude", String(coords.lat));
      formData.set("longitude", String(coords.lng));
    }

    startTransition(async () => {
      const result = await saveEmployerOnboarding(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 text-center">
        <h1 className="font-heading text-[18px] font-bold text-foreground">
          {t("employerTitle")}
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {t("employerSubtitle")}
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

        {/* Category selection */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500">
            {t("selectCategory")} *
          </label>
          <div className="flex flex-wrap gap-1.5">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full border-[1.5px] px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-teal-light text-teal-dark"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {cat.emoji} {locale === "hi" ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>
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

        {/* Distance */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-500">
            {t("distanceLabel")}
          </label>
          <div className="flex gap-1.5">
            {DISTANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDistance(opt.value)}
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  distance === opt.value
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-[12px] text-destructive">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-3 text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          🔍 {t("findStaffBtn")}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          {t("findStaffHint")}
        </p>
      </div>
    </div>
  );
}
