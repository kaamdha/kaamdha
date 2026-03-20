"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Mode = "find_help" | "find_jobs";

export function HomeLanding() {
  const [mode, setMode] = useState<Mode>("find_help");
  const t = useTranslations("landing");

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
          className={`flex-1 rounded-xl py-6 text-center text-[15px] font-bold transition-all ${
            mode === "find_help"
              ? "bg-primary text-white"
              : "border-[1.5px] border-slate-200 bg-white text-slate-600"
          }`}
        >
          {t("findStaff")}
        </button>
        <button
          onClick={() => setMode("find_jobs")}
          className={`flex-1 rounded-xl py-6 text-center text-[15px] font-bold transition-all ${
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
          {mode === "find_help"
            ? t("findHelpTitle")
            : t("findJobsTitle")}
        </h2>
      </div>

      {/* How it works steps */}
      <div className="space-y-3 px-4 pt-5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-light font-heading text-xs font-extrabold text-primary">
              {i + 1}
            </div>
            <div className="text-xs leading-snug text-slate-500">
              <strong className="block text-[13px] text-foreground">
                {step.title}
              </strong>
              {step.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Hero image */}
      <div className="mx-4 mt-5">
        <img
          src="/hero-staff.png"
          alt="kaamdha staff"
          className="w-full rounded-[14px] object-cover"
        />
      </div>

      {/* Login CTA */}
      <div className="px-4 pb-6 pt-5">
        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-white"
        >
          {t("loginCta")}
        </Link>
        <p className="mt-2 text-center text-[12px] text-slate-500">
          {t("valueSubtext", { price: "₹10" })}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-5 bg-slate-100 py-12 pl-6 text-left">
        <p className="font-heading text-[53px] font-extrabold leading-tight text-slate-300">
          {t("madeWithLove")}
        </p>
        <p className="mt-4 text-[11px] text-slate-400">
          © 2026 kaamdha. All rights reserved.
        </p>
      </div>
    </div>
  );
}
