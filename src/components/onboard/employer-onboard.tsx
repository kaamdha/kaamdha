"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { saveEmployerOnboarding } from "@/app/onboard/actions";
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

export function EmployerOnboard() {
  const t = useTranslations("onboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [locality, setLocality] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [timings, setTimings] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  function handleSubmit() {
    if (!firstName.trim()) {
      setError(t("nameRequired"));
      return;
    }

    setError(null);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const formData = new FormData();
    formData.set("name", fullName);
    formData.set("locality", locality);
    if (selectedCategory) formData.set("category", selectedCategory);
    if (jobTitle) formData.set("jobTitle", jobTitle);
    if (requirements) formData.set("requirements", requirements);
    if (salaryMin) formData.set("salaryMin", salaryMin);
    if (salaryMax) formData.set("salaryMax", salaryMax);
    timings.forEach((t) => formData.append("timings", t));
    if (coords) {
      formData.set("latitude", String(coords.lat));
      formData.set("longitude", String(coords.lng));
    }

    startTransition(async () => {
      const result = await saveEmployerOnboarding(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        events.onboardCompleted("employer");
      }
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

        {/* Category selection */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("selectCategory")} *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center rounded-xl border-[1.5px] py-3.5 px-1.5 ${
                  selectedCategory === cat.id
                    ? "border-primary bg-teal-light"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-[28px]">{cat.emoji}</span>
                <span
                  className={`mt-1 text-[10px] font-semibold ${
                    selectedCategory === cat.id
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

        {/* Job title (optional) */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("jobTitleLabel")}
          </label>
          <Input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={t("jobTitlePlaceholder")}
          />
        </div>

        {/* Requirements (optional) */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("requirementsLabel")}
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder={t("requirementsPlaceholder")}
            className="w-full rounded-lg border-[1.5px] border-slate-200 px-3 py-2 text-[13px] placeholder:text-slate-400 focus:border-primary focus:outline-none"
            rows={3}
          />
        </div>

        {/* Salary range (optional) */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("salaryRangeLabel")}
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

        {/* Preferred timings (optional) */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {t("preferredTimingsLabel")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TIMINGS.map((timing) => (
              <button
                key={timing.value}
                type="button"
                onClick={() =>
                  setTimings(
                    timings.includes(timing.value)
                      ? timings.filter((t) => t !== timing.value)
                      : [...timings, timing.value]
                  )
                }
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold transition-all ${
                  timings.includes(timing.value)
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
          disabled={isPending || !firstName.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-3 text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("findStaffBtn")}
        </button>
        <p className="text-center text-xs text-slate-400">
          {t("findStaffHint")}
        </p>
      </div>
    </div>
  );
}
