"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";

type Mode = "find_help" | "find_jobs";

export function HomeLanding() {
  const [mode, setMode] = useState<Mode>("find_help");
  const t = useTranslations("landing");
  const locale = useLocale();

  const steps =
    mode === "find_help"
      ? [
          { title: t("findHelpStep1Title"), desc: t("findHelpStep1Desc") },
          { title: t("findHelpStep2Title"), desc: t("findHelpStep2Desc") },
          { title: t("findHelpStep3Title"), desc: t("findHelpStep3Desc") },
        ]
      : [
          { title: t("findJobsStep1Title"), desc: t("findJobsStep1Desc") },
          { title: t("findJobsStep2Title"), desc: t("findJobsStep2Desc") },
          { title: t("findJobsStep3Title"), desc: t("findJobsStep3Desc") },
        ];

  return (
    <div className="flex flex-col">
      {/* Equi-sized toggle buttons */}
      <div className="flex gap-1.5 px-4 pt-3">
        <button
          onClick={() => setMode("find_help")}
          className={`flex-1 rounded-lg py-2.5 text-center text-[12px] font-bold transition-all ${
            mode === "find_help"
              ? "bg-primary text-white"
              : "border-[1.5px] border-slate-200 bg-white text-slate-600"
          }`}
        >
          {t("findStaff")}
        </button>
        <button
          onClick={() => setMode("find_jobs")}
          className={`flex-1 rounded-lg py-2.5 text-center text-[12px] font-bold transition-all ${
            mode === "find_jobs"
              ? "bg-primary text-white"
              : "border-[1.5px] border-slate-200 bg-white text-slate-600"
          }`}
        >
          {t("findJobs")}
        </button>
      </div>

      {/* Headline */}
      <div className="px-4 pt-6 text-center">
        <h2 className="font-heading text-[22px] font-extrabold leading-tight text-foreground">
          {mode === "find_help" ? t("findHelpTitle") : t("findJobsTitle")}
        </h2>
      </div>

      {/* How it works steps */}
      <div className="space-y-3 px-4 pt-5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-light font-heading text-[11px] font-extrabold text-primary">
              {i + 1}
            </div>
            <div className="text-[11px] leading-snug text-slate-500">
              <strong className="block text-[13px] text-foreground">
                {step.title}
              </strong>
              {step.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Category grid */}
      <div className="px-4 pt-5">
        <p className="mb-2 text-[14px] font-bold text-foreground">
          {mode === "find_help"
            ? t("findHelpGridTitle")
            : t("findJobsGridTitle")}
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {JOB_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href="/login"
              className="flex flex-col items-center rounded-[10px] bg-slate-100 px-1 py-2.5 transition-colors hover:bg-teal-light"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="mt-1 text-center text-[9px] font-semibold text-slate-600">
                {locale === "hi" ? cat.labelHi : cat.labelEn}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Login CTA */}
      <div className="px-4 pb-6 pt-5">
        <Link
          href="/login"
          className="block w-full rounded-[10px] bg-primary py-3 text-center text-[13px] font-bold text-white"
        >
          {t("loginCta")}
        </Link>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          {t("registerSubtext")}
        </p>
      </div>
    </div>
  );
}
