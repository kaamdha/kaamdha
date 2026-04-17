"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES, jobDetailUrl } from "@/lib/constants";

/* eslint-disable @next/next/no-img-element */

interface JobData {
  id: string;
  customId: string;
  title: string | null;
  category: string;
  locality: string | null;
  city: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  preferredTimings: string[];
  phonePrefix?: string;
}

interface JobListingsProps {
  jobs: JobData[];
  isPublic?: boolean;
  city?: string;
  categorySlug?: string;
}

export function JobListings({
  jobs,
  isPublic = false,
  city,
  categorySlug,
}: JobListingsProps) {
  const t = useTranslations("listings");
  const locale = useLocale();

  const basePath = city ? `/jobs/${city}` : "/jobs";

  return (
    <div className="flex flex-col">
      {/* Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
        <Link
          href={basePath}
          className={`shrink-0 rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold transition-all ${
            !categorySlug
              ? "border-primary bg-teal-light text-teal-dark"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          {t("all")}
        </Link>
        {JOB_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={city ? `/jobs/${city}/${cat.slug}` : `/jobs`}
            className={`shrink-0 rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold transition-all ${
              categorySlug === cat.slug
                ? "border-primary bg-teal-light text-teal-dark"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {locale === "hi" ? cat.labelHi : cat.labelEn}
          </Link>
        ))}
      </div>

      {/* Results */}
      {jobs.length > 0 ? (
        <div className="mt-2 space-y-2 px-4 pb-6">
          {jobs.map((job) => (
            <PublicJobCard
              key={job.id}
              job={job}
              locale={locale}
              isPublic={isPublic}
            />
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-6 rounded-[14px] bg-slate-50 px-6 py-8 text-center">
          <img src="/assets/no-results.png" alt="" className="mx-auto size-16" />
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

function PublicJobCard({
  job,
  locale,
  isPublic,
}: {
  job: JobData;
  locale: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const tc = useTranslations("common");
  const tl = useTranslations("listings");

  const catInfo = JOB_CATEGORIES.find((c) => c.id === job.category);
  const catLabel = catInfo
    ? locale === "hi"
      ? catInfo.labelHi
      : catInfo.labelEn
    : "";

  const salaryText =
    !isPublic && (job.salaryMin || job.salaryMax)
      ? `₹${job.salaryMin ? (job.salaryMin / 1000).toFixed(0) + "k" : ""}${job.salaryMin && job.salaryMax ? "-" : ""}${job.salaryMax ? "₹" + (job.salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
      : "";

  const timingsText = job.preferredTimings
    .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");

  return (
    <div
      onClick={() => router.push(jobDetailUrl(job.city, job.category, job.customId))}
      className="relative block cursor-pointer rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
    >
      <div>
        <p className="text-[13px] font-bold text-foreground">
          {job.title || tc("needed", { category: catLabel })}
        </p>
        {job.locality && (
          <p className="text-[11px] text-slate-500">{job.locality}</p>
        )}
        {salaryText && (
          <p className="text-[11px] text-slate-500">{salaryText}</p>
        )}
        {timingsText && (
          <p className="text-[11px] text-slate-500">{timingsText}</p>
        )}
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          if (isPublic) {
            router.push("/login");
          }
        }}
        className="mt-2 flex cursor-pointer items-center justify-between border-t border-slate-100 pt-2"
      >
        <span
          className={`font-mono text-[12px] font-semibold ${isPublic ? "text-slate-400" : "text-foreground"}`}
        >
          +91 {isPublic ? "XXX-XXX-XXXX" : `${job.phonePrefix ?? "XXX"}-XXX-XXXX`}
        </span>
        <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
          {isPublic ? tl("loginToConnect") : tc("connect")}
        </span>
      </div>
    </div>
  );
}
