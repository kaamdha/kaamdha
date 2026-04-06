"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { CITY_LABELS } from "@/lib/constants";

type Mode = "find_help" | "find_jobs";

const LANDING_CITIES = ["gurgaon", "delhi", "noida", "faridabad", "ghaziabad", "greater-noida"] as const;

export function HomeLanding() {
  const [mode, setMode] = useState<Mode>("find_help");
  const t = useTranslations("landing");
  const tf = useTranslations("footer");
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

  const basePath = mode === "find_help" ? "/listings" : "/jobs";

  function getCityLabel(city: string): string {
    return locale === "hi"
      ? CITY_LABELS[city]?.hi ?? city
      : CITY_LABELS[city]?.en ?? city;
  }

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
        <h1 className="font-heading text-[22px] font-extrabold leading-tight text-foreground">
          {mode === "find_help"
            ? t("findHelpTitle")
            : t("findJobsTitle")}
        </h1>
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
        <Image
          src="/assets/hero-staff.png"
          alt="kaamdha staff"
          width={800}
          height={331}
          priority
          className="w-full rounded-[14px] object-cover"
        />
      </div>

      {/* Login CTA */}
      <div className="px-4 pb-2 pt-5">
        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-white"
        >
          {t("loginCta")}
        </Link>
        <p className="mt-2 text-center text-[12px] text-slate-500">
          {t("noAgents")} <s>₹10</s> {t("freePerLead")}
        </p>
      </div>

      {/* Browse by city */}
      <div className="px-4 pt-6 pb-6">
        <h2 className="font-heading text-[14px] font-bold text-foreground">
          {mode === "find_help" ? tf("browseStaffByCity") : tf("browseJobsByCity")}
        </h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {LANDING_CITIES.map((city) => (
            <Link
              key={city}
              href={`${basePath}/${city}`}
              className="rounded-[12px] border-[1.5px] border-slate-200 bg-white px-2 py-3 text-center transition-all hover:border-primary hover:bg-teal-50"
            >
              <p className="text-[12px] font-bold text-foreground">
                {getCityLabel(city)}
              </p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
