"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JOB_CATEGORIES, DAYS_OF_WEEK, SCHEDULE_OPTIONS } from "@/lib/constants";
import {
  updateJobListing,
  renewJobListing,
  deactivateJobListing,
} from "@/app/account/job/[jid]/actions";

const TIMING_OPTIONS = [
  { value: "morning", labelEn: "Morning", labelHi: "सुबह" },
  { value: "afternoon", labelEn: "Afternoon", labelHi: "दोपहर" },
  { value: "evening", labelEn: "Evening", labelHi: "शाम" },
];

const SCHEDULE_LABELS: Record<string, { en: string; hi: string }> = {
  full_time: { en: "Full-time", hi: "पूर्णकालिक" },
  part_time: { en: "Part-time", hi: "अंशकालिक" },
  flexible: { en: "Flexible", hi: "लचीला" },
};

interface JidEditorProps {
  job: {
    id: string;
    customId: string;
    category: string;
    title: string | null;
    description: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    schedule: string | null;
    preferredDays: string[];
    preferredTimings: string[];
    locality: string | null;
    status: string;
    expiresAt: string;
  };
}

export function JidEditor({ job }: JidEditorProps) {
  const router = useRouter();
  const t = useTranslations("jidEdit");
  const locale = useLocale();

  const catInfo = JOB_CATEGORIES.find((c) => c.id === job.category);
  const catLabel = catInfo
    ? locale === "hi" ? catInfo.labelHi : catInfo.labelEn
    : "";
  const catEmoji = catInfo?.emoji ?? "📋";

  const [title, setTitle] = useState(job.title ?? "");
  const [description, setDescription] = useState(job.description ?? "");
  const [salaryMin, setSalaryMin] = useState(job.salaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(job.salaryMax?.toString() ?? "");
  const [schedule, setSchedule] = useState(job.schedule ?? "");
  const [days, setDays] = useState<string[]>(job.preferredDays);
  const [timings, setTimings] = useState<string[]>(job.preferredTimings);

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(job.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const expiryDate = new Date(job.expiresAt).toLocaleDateString(
    locale === "hi" ? "hi-IN" : "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

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

  async function handleSave() {
    const formData = new FormData();
    formData.set("job_id", job.id);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("salary_min", salaryMin);
    formData.set("salary_max", salaryMax);
    formData.set("schedule", schedule);
    days.forEach((d) => formData.append("preferred_days", d));
    timings.forEach((t) => formData.append("preferred_timings", t));

    await updateJobListing(formData);
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => router.back()} className="text-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-heading text-[16px] font-bold text-foreground">
          {t("editJob")}
        </h1>
      </div>

      {/* Category (read-only) */}
      <div className="mx-4 mt-4 rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{catEmoji}</span>
          <span className="text-[13px] font-bold text-foreground">
            {catLabel}
          </span>
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold ${
              job.status === "active"
                ? "bg-green-100 text-green-600"
                : job.status === "expired"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {job.status === "active"
              ? t("active")
              : job.status === "expired"
                ? t("expired")
                : job.status}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          {job.locality} · {t("expiresOn")} {expiryDate} ({daysLeft} {t("daysLeft")})
        </p>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {/* Title */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("jobTitle")}
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. ${catLabel} for family of 4`}
            className="mt-1 bg-white text-[13px]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("requirements")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("requirementsPlaceholder")}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] focus:border-primary focus:outline-none"
          />
        </div>

        {/* Salary range */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("salaryRange")}
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

        {/* Schedule */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("schedule")}
          </label>
          <div className="mt-1.5 flex gap-1.5">
            {SCHEDULE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSchedule(opt)}
                className={`rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold transition-all ${
                  schedule === opt
                    ? "border-primary bg-teal-light text-teal-dark"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {locale === "hi"
                  ? SCHEDULE_LABELS[opt]?.hi ?? opt
                  : SCHEDULE_LABELS[opt]?.en ?? opt}
              </button>
            ))}
          </div>
        </div>

        {/* Days */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">
            {t("preferredDays")}
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
            {t("preferredTimings")}
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

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white"
        >
          {t("saveChanges")}
        </button>

        {/* Renew (if expiring/expired) */}
        {(job.status === "expired" || daysLeft <= 7) && (
          <button
            onClick={() => renewJobListing(job.id)}
            className="w-full rounded-[10px] border-[1.5px] border-primary bg-white py-2.5 text-[13px] font-bold text-primary"
          >
            {t("renewFor30Days")}
          </button>
        )}

        {/* Deactivate */}
        {job.status === "active" && (
          <button
            onClick={() => deactivateJobListing(job.id)}
            className="w-full rounded-[10px] border-[1.5px] border-red-200 bg-white py-2.5 text-[13px] font-bold text-red-500"
          >
            {t("deactivate")}
          </button>
        )}
      </div>
    </div>
  );
}
