"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { saveWorkerOnboarding } from "@/app/onboard/actions";
import { JOB_CATEGORIES } from "@/lib/constants";
import { LocationInput } from "@/components/shared/location-input";
import { events } from "@/lib/posthog";

const TIMINGS = [
  { value: "morning", labelEn: "Morning", labelHi: "सुबह" },
  { value: "afternoon", labelEn: "Afternoon", labelHi: "दोपहर" },
  { value: "evening", labelEn: "Evening", labelHi: "शाम" },
  { value: "12_hour", labelEn: "12 hours", labelHi: "12 घंटे" },
  { value: "24_hour", labelEn: "24 hours", labelHi: "24 घंटे" },
] as const;

export function WorkerOnboard() {
  const t = useTranslations("onboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [locality, setLocality] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [availableTimings, setAvailableTimings] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [bio, setBio] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  function toggle(list: string[], item: string): string[] {
    return list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
  }

  function handleSubmit() {
    if (!firstName.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (categories.length === 0) {
      setError(t("categoriesRequired"));
      return;
    }

    setError(null);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const formData = new FormData();
    formData.set("name", fullName);
    if (gender) formData.set("gender", gender);
    formData.set("locality", locality);
    if (coords) {
      formData.set("latitude", String(coords.lat));
      formData.set("longitude", String(coords.lng));
    }
    categories.forEach((c) => formData.append("categories", c));
    availableTimings.forEach((t) => formData.append("available_timings", t));
    if (experience) formData.set("experience", experience);
    if (salaryMin) formData.set("salaryMin", salaryMin);
    if (salaryMax) formData.set("salaryMax", salaryMax);
    if (bio) formData.set("bio", bio);

    startTransition(async () => {
      const result = await saveWorkerOnboarding(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        events.onboardCompleted("worker");
      }
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
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {tc("name")} *
          </label>
          <div className="flex gap-2">
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={tc("firstName")}
              className="flex-1"
              autoFocus
            />
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={tc("lastName")}
              className="flex-1"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {tc("gender")}
          </label>
          <div className="flex gap-2">
            {[
              { value: "male", label: tc("male") },
              { value: "female", label: tc("female") },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(opt.value)}
                className={`flex-1 rounded-lg border-[1.5px] py-2 text-[13px] font-semibold transition-all ${
                  gender === opt.value
                    ? "border-primary bg-teal-light text-teal-dark"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("locationLabel")} *
          </label>
          <LocationInput
            value={locality}
            onChange={setLocality}
            onCoords={(lat, lng) => setCoords({ lat, lng })}
            placeholder={t("locationPlaceholder")}
          />
        </div>

        {/* Categories */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("categoriesLabel")} *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategories(toggle(categories, cat.id))}
                className={`flex flex-col items-center justify-center rounded-xl border-[1.5px] py-3.5 px-1.5 ${
                  categories.includes(cat.id)
                    ? "border-primary bg-teal-light"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-[28px]">{cat.emoji}</span>
                <span
                  className={`mt-1 text-[10px] font-semibold ${
                    categories.includes(cat.id)
                      ? "text-teal-dark"
                      : "text-slate-600"
                  }`}
                >
                  {locale === "hi" ? cat.labelHi : cat.labelEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("experienceLabel2")}
          </label>
          <Input
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder={t("experiencePlaceholder")}
          />
        </div>

        {/* Salary range */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("salaryLabel2")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder={tc("minSalary")}
              className="flex-1"
            />
            <span className="text-xs text-slate-400">{tc("to")}</span>
            <Input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder={tc("maxSalary")}
              className="flex-1"
            />
          </div>
        </div>

        {/* Available Timings */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
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
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-all ${
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

        {/* About */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("aboutLabel")}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("aboutPlaceholder")}
            className="w-full rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-[13px] placeholder:text-slate-400 focus:border-primary focus:outline-none"
            rows={3}
          />
        </div>

        {/* Error */}
        {error && <p className="text-[12px] text-destructive">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending || !firstName.trim() || categories.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-3 text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("createProfile")}
        </button>
      </div>
    </div>
  );
}
