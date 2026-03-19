"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { JOB_CATEGORIES } from "@/lib/constants";
import { EditIcon } from "@/components/shared/edit-icon";
import { WorkerCard } from "@/components/shared/worker-card";

/* eslint-disable @next/next/no-img-element */

interface FavoritesViewProps {
  isEmployer: boolean;
  jobsCreated: Record<string, unknown>[];
  reveals: Record<string, unknown>[];
  savedFavorites: Record<string, unknown>[];
}

type EmployerTab = "jobs_created" | "recently_contacted" | "saved";
type WorkerTab = "recently_contacted" | "saved";

export function FavoritesView({
  isEmployer,
  jobsCreated,
  reveals,
  savedFavorites,
}: FavoritesViewProps) {
  const router = useRouter();
  const t = useTranslations("favorites");
  const locale = useLocale();

  const [employerTab, setEmployerTab] = useState<EmployerTab>("jobs_created");
  const [workerTab, setWorkerTab] = useState<WorkerTab>("recently_contacted");

  function daysAgo(createdAt: string): number {
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)));
  }

  function formatSalary(min?: number | null, max?: number | null): string {
    if (!min && !max) return "";
    const fmtK = (v: number) => v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`;
    if (min && max) return `${fmtK(min)}-${fmtK(max)}`;
    if (min) return `${fmtK(min)}+`;
    return `up to ${fmtK(max!)}`;
  }

  function formatTimings(timings?: string[] | null): string {
    if (!timings || timings.length === 0) return "";
    const labels: Record<string, string> = {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      "12_hour": "12-hour",
      "24_hour": "24-hour",
    };
    return timings.map((t) => labels[t] || t).join(", ");
  }

  if (isEmployer) {
    const tabs: { key: EmployerTab; label: string }[] = [
      { key: "jobs_created", label: t("jobsCreated") },
      { key: "recently_contacted", label: t("recentlyContacted") },
      { key: "saved", label: t("saved") },
    ];

    return (
      <div className="flex flex-col">
        {/* Back button */}
        <div className="px-4 pt-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
            <ArrowLeft className="size-4" />
            <span className="text-[13px] font-medium text-slate-500">Back</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-1.5 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setEmployerTab(tab.key)}
              className={`rounded-full border-[1.5px] px-3 py-1 text-[11px] font-semibold transition-all ${
                employerTab === tab.key
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-3 px-4 pb-6">
          {employerTab === "jobs_created" && (
            <>
              {jobsCreated.length > 0 ? (
                <div className="space-y-2">
                  {jobsCreated.map((job) => {
                    const catInfo = JOB_CATEGORIES.find(
                      (c) => c.id === (job.category as string)
                    );
                    const catLabel = catInfo
                      ? locale === "hi"
                        ? catInfo.labelHi
                        : catInfo.labelEn
                      : "";
                    const status = job.status as string;
                    const ago = daysAgo(job.created_at as string);
                    const salary = formatSalary(
                      job.salary_min as number | null,
                      job.salary_max as number | null
                    );
                    const timings = formatTimings(
                      job.preferred_timings as string[] | null
                    );

                    return (
                      <div
                        key={job.id as string}
                        className="rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                              <p className="text-[13px] font-bold text-foreground">
                                {(job.title as string) || catLabel}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {job.locality as string}
                                {salary ? ` · ${salary}` : ""}
                              </p>
                              {timings && (
                                <p className="text-[11px] text-slate-400">
                                  {timings}
                                </p>
                              )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                status === "active"
                                  ? "bg-green-100 text-green-600"
                                  : status === "expired"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {status === "active"
                                ? t("activeStatus")
                                : status === "expired"
                                  ? t("expiredStatus")
                                  : status}
                            </span>
                            <button
                              onClick={() =>
                                router.push(
                                  `/account/job/${job.custom_id as string}`
                                )
                              }
                              className="text-[14px]"
                            >
                              <EditIcon className="size-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-400">
                          {ago === 0 ? "Created today" : `Created ${ago} days ago`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message={t("noJobsCreated")} icon="/icons/no-content.png" />
              )}
            </>
          )}

          {employerTab === "recently_contacted" && (
            <>
              {reveals.filter((r) => r.worker).length > 0 ? (
                <div className="space-y-2">
                  {reveals.map((r) => {
                    const w = r.worker as Record<string, unknown> | undefined;
                    if (!w) return null;
                    return (
                      <WorkerCard
                        key={r.id as string}
                        id={w.id as string}
                        name={w.name as string}
                        gender={w.gender as string | null}
                        categories={w.categories as string[]}
                        experienceYears={w.experience_years as number}
                        salaryMin={w.salary_min as number | null}
                        salaryMax={w.salary_max as number | null}
                        availableTimings={w.available_timings as string[]}
                        locality={w.locality as string | null}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState message={t("noContacted")} icon="/icons/no-contact.png" />
              )}
            </>
          )}

          {employerTab === "saved" && (
            <>
              {savedFavorites.filter((f) => f.worker).length > 0 ? (
                <div className="space-y-2">
                  {savedFavorites.map((f) => {
                    const w = f.worker as Record<string, unknown> | undefined;
                    if (!w) return null;
                    return (
                      <WorkerCard
                        key={f.id as string}
                        id={w.id as string}
                        name={w.name as string}
                        gender={w.gender as string | null}
                        categories={w.categories as string[]}
                        experienceYears={w.experience_years as number}
                        salaryMin={w.salary_min as number | null}
                        salaryMax={w.salary_max as number | null}
                        availableTimings={w.available_timings as string[]}
                        locality={w.locality as string | null}
                        isFavorited={true}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState message={t("noSaved")} icon="/icons/no-content.png" />
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Worker view
  const workerTabs: { key: WorkerTab; label: string }[] = [
    { key: "recently_contacted", label: t("recentlyContacted") },
    { key: "saved", label: t("saved") },
  ];

  return (
    <div className="flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">Back</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-1.5 px-4">
        {workerTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setWorkerTab(tab.key)}
            className={`rounded-full border-[1.5px] px-3 py-1 text-[11px] font-semibold transition-all ${
              workerTab === tab.key
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-3 px-4 pb-6">
        {workerTab === "recently_contacted" && (
          <>
            {reveals.filter((r) => r.job).length > 0 ? (
              <div className="space-y-2">
                {reveals.map((r) => {
                  const job = r.job as Record<string, unknown> | undefined;
                  if (!job) return null;
                  return (
                    <JobCard key={r.id as string} job={job} locale={locale} isFavorited={false} />
                  );
                })}
              </div>
            ) : (
              <EmptyState message={t("noContacted")} icon="/icons/no-contact.png" />
            )}
          </>
        )}

        {workerTab === "saved" && (
          <>
            {savedFavorites.filter((f) => f.job).length > 0 ? (
              <div className="space-y-2">
                {savedFavorites.map((f) => {
                  const job = f.job as Record<string, unknown> | undefined;
                  if (!job) return null;
                  return (
                    <JobCard key={f.id as string} job={job} locale={locale} isFavorited={true} />
                  );
                })}
              </div>
            ) : (
              <EmptyState message={t("noSaved")} icon="/icons/no-content.png" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, locale, isFavorited }: { job: Record<string, unknown>; locale: string; isFavorited: boolean }) {
  const router = useRouter();
  const categoryId = job.category as string;
  const catInfo = JOB_CATEGORIES.find((c) => c.id === categoryId);
  const catLabel = catInfo
    ? locale === "hi" ? catInfo.labelHi : catInfo.labelEn
    : "";
  const jobLocality = (job.locality as string) ?? "";

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

      <div>
        <p className="text-[13px] font-bold text-foreground">
          {(job.title as string) || catLabel + " needed"}
        </p>
        <p className="text-[11px] text-slate-500">
          {jobLocality}{jobLocality ? " · --" : ""}
        </p>
        {salaryText && (
          <p className="text-[11px] text-slate-500">{salaryText}</p>
        )}
        {timingsText && (
          <p className="text-[11px] text-slate-500">{timingsText}</p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="font-mono text-[12px] font-semibold text-foreground">
          +91 981-XXX-XXXX
        </span>
        <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
          Connect
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon?: string }) {
  return (
    <div className="pt-8 text-center">
      {icon ? (
        <img src={icon} alt="" className="mx-auto size-16" />
      ) : (
        <p className="text-[48px]">📋</p>
      )}
      <p className="mt-3 text-[12px] text-slate-500">{message}</p>
    </div>
  );
}
