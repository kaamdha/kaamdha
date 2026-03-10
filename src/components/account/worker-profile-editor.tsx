"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JOB_CATEGORIES, DAYS_OF_WEEK } from "@/lib/constants";
import { detectLocation, type LocationResult } from "@/lib/location";
import { updateWorkerProfile } from "@/app/account/profile/actions";
import type { User } from "@/types/database";

const TIMING_OPTIONS = [
  { value: "morning", labelEn: "Morning", labelHi: "सुबह" },
  { value: "afternoon", labelEn: "Afternoon", labelHi: "दोपहर" },
  { value: "evening", labelEn: "Evening", labelHi: "शाम" },
];

interface WorkerProfileEditorProps {
  user: User;
  profile: {
    id: string;
    categories: string[];
    experienceYears: number;
    salaryMin: number | null;
    salaryMax: number | null;
    availableDays: string[];
    availableTimings: string[];
    languages: string[];
    bio: string | null;
    locality: string | null;
    isActive: boolean;
  } | null;
}

export function WorkerProfileEditor({ user, profile }: WorkerProfileEditorProps) {
  const router = useRouter();
  const t = useTranslations("profileEdit");
  const locale = useLocale();

  const [name, setName] = useState(user.name ?? "");
  const [locality, setLocality] = useState(profile?.locality ?? user.locality ?? "");
  const [categories, setCategories] = useState<string[]>(profile?.categories ?? []);
  const [days, setDays] = useState<string[]>(profile?.availableDays ?? []);
  const [timings, setTimings] = useState<string[]>(profile?.availableTimings ?? []);
  const [salaryMin, setSalaryMin] = useState(profile?.salaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(profile?.salaryMax?.toString() ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  function toggleCategory(id: string) {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleDay(d: string) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((v) => v !== d) : [...prev, d]
    );
  }

  function toggleTiming(t: string) {
    setTimings((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t]
    );
  }

  async function handleDetectLocation() {
    setDetectingLocation(true);
    try {
      const result: LocationResult = await detectLocation();
      if (result.locality) setLocality(result.locality);
      if (result.latitude) setLatitude(result.latitude.toString());
      if (result.longitude) setLongitude(result.longitude.toString());
    } catch {
      // Manual fallback
    } finally {
      setDetectingLocation(false);
    }
  }

  async function handleSubmit() {
    const formData = new FormData();
    formData.set("profile_id", profile?.id ?? "");
    formData.set("name", name);
    formData.set("locality", locality);
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);
    categories.forEach((c) => formData.append("categories", c));
    days.forEach((d) => formData.append("available_days", d));
    timings.forEach((t) => formData.append("available_timings", t));
    formData.set("salary_min", salaryMin);
    formData.set("salary_max", salaryMax);
    formData.set("bio", bio);
    formData.set("experience_years", "0");

    await updateWorkerProfile(formData);
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => router.back()} className="text-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-heading text-[16px] font-bold text-foreground">
          {t("editProfile")}
        </h1>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("name")}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 bg-white text-[13px]"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("location")}
          </label>
          <div className="mt-1 flex gap-2">
            <Input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
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
        </div>

        {/* Categories */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("skills")}
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`rounded-full border-[1.5px] px-2.5 py-1 text-[10px] font-semibold transition-all ${
                  categories.includes(cat.id)
                    ? "border-primary bg-teal-light text-teal-dark"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {cat.emoji} {locale === "hi" ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Salary range */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("expectedSalary")}
          </label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="Min ₹"
              className="flex-1 bg-white text-[13px]"
            />
            <Input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="Max ₹"
              className="flex-1 bg-white text-[13px]"
            />
          </div>
        </div>

        {/* Days */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("availableDays")}
          </label>
          <div className="mt-1.5 flex gap-1.5">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`flex size-9 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold transition-all ${
                  days.includes(day.value)
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {day.labelEn.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        {/* Timings */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("availableTimings")}
          </label>
          <div className="mt-1.5 flex gap-1.5">
            {TIMING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleTiming(opt.value)}
                className={`rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold transition-all ${
                  timings.includes(opt.value)
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                {locale === "hi" ? opt.labelHi : opt.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("about")}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] focus:border-primary focus:outline-none"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSubmit}
          className="w-full rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white"
        >
          {t("saveChanges")}
        </button>
      </div>
    </div>
  );
}
