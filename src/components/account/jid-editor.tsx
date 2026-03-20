"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JOB_CATEGORIES } from "@/lib/constants";
import {
  updateJobListing,
  deactivateJobListing,
} from "@/app/account/job/[jid]/actions";

const TIMING_OPTIONS = [
  { value: "morning", labelEn: "Morning", labelHi: "सुबह" },
  { value: "afternoon", labelEn: "Afternoon", labelHi: "दोपहर" },
  { value: "evening", labelEn: "Evening", labelHi: "शाम" },
  { value: "12_hour", labelEn: "12 hours", labelHi: "12 घंटे" },
  { value: "24_hour", labelEn: "24 hours", labelHi: "24 घंटे" },
];

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
    createdAt: string;
  };
}

export function JidEditor({ job }: JidEditorProps) {
  const router = useRouter();
  const t = useTranslations("jidEdit");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeactivating, startDeactivateTransition] = useTransition();

  const catInfo = JOB_CATEGORIES.find((c) => c.id === job.category);
  const catLabel = catInfo
    ? locale === "hi" ? catInfo.labelHi : catInfo.labelEn
    : "";
  const catEmoji = catInfo?.emoji ?? "📋";

  const [title, setTitle] = useState(job.title ?? "");
  const [description, setDescription] = useState(job.description ?? "");
  const [salaryMin, setSalaryMin] = useState(job.salaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(job.salaryMax?.toString() ?? "");
  const [timings, setTimings] = useState<string[]>(job.preferredTimings);

  const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(job.createdAt ?? job.expiresAt).getTime()) / (1000 * 60 * 60 * 24)));
  const createdText = daysAgo === 0 ? tc("createdToday") : tc("createdDaysAgo", { days: daysAgo });

  function toggleTiming(t: string) {
    setTimings((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t]
    );
  }

  function handleSave() {
    startSaveTransition(async () => {
      const formData = new FormData();
      formData.set("job_id", job.id);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("salary_min", salaryMin);
      formData.set("salary_max", salaryMax);
      timings.forEach((t) => formData.append("preferred_timings", t));

      await updateJobListing(formData);
    });
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">{tc("back")}</span>
        </button>
      </div>

      {/* Category (read-only) */}
      <div className="mx-4 mt-4 rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
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
        <p className="mt-1 text-[11px] text-slate-400">
          {job.locality} · {createdText}
        </p>
      </div>

      <div className="mt-4 space-y-4 px-4">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            {t("jobTitle")}
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("jobTitlePlaceholder", { category: catLabel })}
            className="mt-1 bg-white text-[13px]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
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
          <label className="text-xs font-semibold text-slate-500">
            {t("salaryRange")}
          </label>
          <div className="mt-1 flex gap-2">
            <Input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder={tc("minSalary")}
              className="flex-1 bg-white text-[13px]"
            />
            <Input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder={tc("maxSalary")}
              className="flex-1 bg-white text-[13px]"
            />
          </div>
        </div>

        {/* Timings */}
        <div>
          <label className="text-xs font-semibold text-slate-500">
            {t("preferredTimings")}
          </label>
          <div className="mt-1.5 flex gap-1.5">
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

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isSaving ? tc("saving") : t("saveChanges")}
        </button>

        {/* Deactivate */}
        {job.status === "active" && (
          <button
            onClick={() => startDeactivateTransition(async () => { await deactivateJobListing(job.id); })}
            disabled={isDeactivating}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-red-200 bg-white py-2.5 text-[13px] font-bold text-red-500 disabled:opacity-60"
          >
            {isDeactivating && <Loader2 className="size-4 animate-spin text-red-500" />}
            {isDeactivating ? tc("deactivating") : t("deactivate")}
          </button>
        )}
      </div>
    </div>
  );
}
