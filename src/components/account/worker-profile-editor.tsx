"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JOB_CATEGORIES } from "@/lib/constants";
import { LocationInput } from "@/components/shared/location-input";
import { updateWorkerProfile } from "@/app/account/profile/actions";
import type { User } from "@/types/database";

const HERO_CROPS: Record<string, string> = {
  C0001: "0%",
  C0002: "20%",
  C0003: "48%",
  C0006: "66%",
  C0007: "84%",
  C0008: "100%",
};

const TIMING_OPTIONS = [
  { value: "morning", labelEn: "Morning", labelHi: "सुबह" },
  { value: "afternoon", labelEn: "Afternoon", labelHi: "दोपहर" },
  { value: "evening", labelEn: "Evening", labelHi: "शाम" },
  { value: "12_hour", labelEn: "12 hours", labelHi: "12 घंटे" },
  { value: "24_hour", labelEn: "24 hours", labelHi: "24 घंटे" },
];

interface WorkerProfileEditorProps {
  user: User;
  profile: {
    id: string;
    gender: string | null;
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

  const nameParts = (user.name ?? "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [gender, setGender] = useState<string | null>(profile?.gender ?? null);
  const [locality, setLocality] = useState(profile?.locality ?? user.locality ?? "");
  const [categories, setCategories] = useState<string[]>(profile?.categories ?? []);
  const [experience, setExperience] = useState(profile?.experienceYears?.toString() ?? "");
  const [timings, setTimings] = useState<string[]>(profile?.availableTimings ?? []);
  const [salaryMin, setSalaryMin] = useState(profile?.salaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(profile?.salaryMax?.toString() ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  function toggleCategory(id: string) {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleTiming(t: string) {
    setTimings((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t]
    );
  }

  async function handleSubmit() {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const formData = new FormData();
    formData.set("profile_id", profile?.id ?? "");
    formData.set("name", fullName);
    if (gender) formData.set("gender", gender);
    formData.set("locality", locality);
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);
    categories.forEach((c) => formData.append("categories", c));
    timings.forEach((t) => formData.append("available_timings", t));
    formData.set("salary_min", salaryMin);
    formData.set("salary_max", salaryMax);
    formData.set("bio", bio);
    formData.set("experience_years", experience);

    await updateWorkerProfile(formData);
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">Back</span>
        </button>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {/* Phone (read-only) */}
        <div>
          <label className="text-xs font-semibold text-slate-500">{t("phoneNumber")}</label>
          <Input value={`+91 ${user.phone.slice(-10)}`} disabled className="mt-1 bg-slate-50 text-[13px] text-slate-400" />
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            Name
          </label>
          <div className="mt-1 flex gap-2">
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="flex-1 bg-white text-[13px]"
            />
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="flex-1 bg-white text-[13px]"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs font-semibold text-slate-500">Gender</label>
          <div className="mt-1 flex gap-2">
            {[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
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
          <label className="text-xs font-semibold text-slate-500">
            {t("location")}
          </label>
          <div className="mt-1">
            <LocationInput
              value={locality}
              onChange={setLocality}
              onCoords={(lat, lng) => {
                setLatitude(lat.toString());
                setLongitude(lng.toString());
              }}
            />
          </div>
        </div>

        {/* Categories — hero image grid */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            {t("skills")}
          </label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`relative overflow-hidden rounded-[14px] transition-all duration-150 active:scale-[1.02] ${
                  categories.includes(cat.id)
                    ? "border-[2.5px] border-primary shadow-[0_0_0_1px_#0D9488,0_2px_8px_rgba(13,148,136,0.2)]"
                    : "border-[1.5px] border-slate-200"
                }`}
                style={{ aspectRatio: "1 / 1" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url(/hero-staff.png)",
                    backgroundSize: "600% auto",
                    backgroundPosition: `${HERO_CROPS[cat.id] ?? "50%"} ${cat.id === "C0003" || cat.id === "C0007" ? "5%" : "15%"}`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6">
                  <span className="text-[12px] font-bold text-white drop-shadow-sm">
                    {locale === "hi" ? cat.labelHi : cat.labelEn}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="text-xs font-semibold text-slate-500">{t("experience")}</label>
          <Input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5" className="mt-1 bg-white text-[13px]" />
        </div>

        {/* Salary range */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
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

        {/* Timings */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            {t("availableTimings")}
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TIMING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleTiming(opt.value)}
                className={`rounded-full border-[1.5px] px-3 py-1 text-[11px] font-semibold transition-all ${
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
          <label className="text-xs font-semibold text-slate-500">
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
