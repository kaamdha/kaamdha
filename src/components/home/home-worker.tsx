"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";
import { EditIcon } from "@/components/shared/edit-icon";
import { RevealModal } from "@/components/shared/reveal-modal";
import { revealEmployerPhone } from "@/app/actions/reveal";
import type { User } from "@/types/database";

function useGreeting() {
  const tc = useTranslations("common");
  const [greeting, setGreeting] = useState(tc("welcome"));
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(tc("goodMorning"));
    else if (hour < 17) setGreeting(tc("goodAfternoon"));
    else setGreeting(tc("goodEvening"));
  }, [tc]);
  return greeting;
}

interface HomeWorkerProps {
  user: User;
  jobs: Record<string, unknown>[];
  workerCategories?: string[];
  favoritedJobIds?: string[];
}

export function HomeWorker({ user, jobs, workerCategories = [], favoritedJobIds = [] }: HomeWorkerProps) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale();
  const greeting = useGreeting();

  // Build category label string like "Cook, Driver"
  const categoryLabels = workerCategories
    .map((catId) => {
      const cat = JOB_CATEGORIES.find((c) => c.id === catId);
      return cat ? (locale === "hi" ? cat.labelHi : cat.labelEn) : null;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col">
      {/* Greeting + Name + Location */}
      <div className="px-4 pt-4">
        <p className="text-[13px] leading-tight text-slate-500">👋 {greeting}</p>
        <p className="font-heading text-[26px] font-[800] leading-tight text-foreground">
          {user.name}
        </p>
        <div className="mt-1">
          <Link
            href="/account/profile"
            className="flex items-center gap-1"
          >
            <span className="font-heading text-[13px] font-medium leading-none text-slate-500">
              {user.locality || t("locationPlaceholder")}
            </span>
            <EditIcon className="size-3 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Jobs near you */}
      <div className="px-4 pt-5">
        <h3 className="font-heading text-[14px] font-bold text-foreground">
          {categoryLabels ? t("categoryJobsNearYou", { categories: categoryLabels }) : t("jobsNearYou")}
        </h3>
      </div>

      {jobs.length > 0 ? (
        <div className="mt-2 space-y-2 px-4 pb-6">
          {jobs.map((job) => (
            <JobCard key={job.id as string} job={job} locale={locale} isFavorited={favoritedJobIds.includes(job.id as string)} />
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-6 rounded-[14px] bg-slate-50 px-6 py-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/no-results.png" alt="" className="mx-auto size-16" />
          <h3 className="mt-3 font-heading text-[16px] font-bold text-foreground">
            {t("noJobsTitle")}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
            {t("noJobsDesc")}
          </p>
        </div>
      )}
    </div>
  );
}

function JobCard({ job, locale, isFavorited = false }: { job: Record<string, unknown>; locale: string; isFavorited?: boolean }) {
  const router = useRouter();
  const tc = useTranslations("common");
  const [showReveal, setShowReveal] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

  const categoryId = job.category as string;
  const catInfo = JOB_CATEGORIES.find((c) => c.id === categoryId);
  const catLabel = catInfo
    ? locale === "hi" ? catInfo.labelHi : catInfo.labelEn
    : "";
  const jobLocality = (job.locality as string) ?? "";
  const employerName = (job.employer_name as string) ?? catLabel;

  const salaryMin = job.salary_min as number | null;
  const salaryMax = job.salary_max as number | null;
  const salaryText =
    salaryMin || salaryMax
      ? `₹${salaryMin ? (salaryMin / 1000).toFixed(0) + "k" : ""}${salaryMin && salaryMax ? "-" : ""}${salaryMax ? "₹" + (salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
      : "";

  const timings = (job.preferred_timings as string[]) ?? [];
  const timingsText = timings
    .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");

  return (
    <>
      <div
        onClick={() => router.push(`/details/${job.custom_id as string}`)}
        className="relative block cursor-pointer rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
      >
        {/* Bookmark top-right */}
        <img
          src={isFavorited ? "/icons/bookmark-nav.png" : "/icons/bookmark.png"}
          alt=""
          className={`absolute right-3 top-2.5 size-4 ${isFavorited ? "opacity-100" : "opacity-30"}`}
        />

        {/* Content */}
        <div>
          <p className="text-[13px] font-bold text-foreground">
            {(job.title as string) || tc("needed", { category: catLabel })}
          </p>
          <p className="text-[11px] text-slate-500">
            {jobLocality}{jobLocality && (job.distance_km as number | null) != null ? ` · ${job.distance_km} km` : ""}
          </p>
          {salaryText && (
            <p className="text-[11px] text-slate-500">{salaryText}</p>
          )}
          {timingsText && (
            <p className="text-[11px] text-slate-500">{timingsText}</p>
          )}
        </div>

        {/* Phone + Connect footer */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (revealedPhone) {
              window.location.href = `tel:+91${revealedPhone.replace(/-/g, "")}`;
            } else {
              setShowReveal(true);
            }
          }}
          className="mt-2 flex cursor-pointer items-center justify-between border-t border-slate-100 pt-2"
        >
          {revealedPhone ? (
            <span className="font-mono text-[12px] font-bold text-green-700">
              +91 {revealedPhone}
            </span>
          ) : (
            <span className="font-mono text-[12px] font-semibold text-foreground">
              +91 981-XXX-XXXX
            </span>
          )}
          <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
            {tc("connect")}
          </span>
        </div>
      </div>

      <RevealModal
        isOpen={showReveal}
        onClose={() => setShowReveal(false)}
        name={employerName}
        type="employer"
        onReveal={async () => {
          const result = await revealEmployerPhone(job.id as string);
          if (result.success && result.phone) {
            setRevealedPhone(result.phone);
          }
          return result;
        }}
      />
    </>
  );
}
