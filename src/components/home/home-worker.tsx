"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";
import type { User } from "@/types/database";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface HomeWorkerProps {
  user: User;
  jobs: Record<string, unknown>[];
}

export function HomeWorker({ user, jobs }: HomeWorkerProps) {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <div className="flex flex-col">
      {/* Greeting */}
      <div className="px-4 pt-4">
        <p className="text-[13px] text-slate-500">{getGreeting()},</p>
        <p className="font-heading text-[18px] font-extrabold text-foreground">
          {user.name} 👋
        </p>
      </div>

      {/* Jobs near you */}
      <div className="px-4 pt-4">
        <h3 className="font-heading text-[14px] font-bold text-foreground">
          {t("jobsNearYou")}
        </h3>
      </div>

      {jobs.length > 0 ? (
        <div className="mt-2 space-y-2 px-4 pb-6">
          {jobs.map((job) => {
            const categoryId = job.category as string;
            const catInfo = JOB_CATEGORIES.find((c) => c.id === categoryId);
            const catLabel = catInfo
              ? locale === "hi"
                ? catInfo.labelHi
                : catInfo.labelEn
              : "";
            const catEmoji = catInfo?.emoji ?? "📋";
            const jobLocality = (job.locality as string) ?? "";

            const salaryMin = job.salary_min as number | null;
            const salaryMax = job.salary_max as number | null;
            const salaryText =
              salaryMin || salaryMax
                ? `₹${salaryMin ? (salaryMin / 1000).toFixed(0) + "k" : ""}${salaryMin && salaryMax ? "-" : ""}${salaryMax ? "₹" + (salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
                : "";

            const days = (job.preferred_days as string[]) ?? [];
            const timings = (job.preferred_timings as string[]) ?? [];
            const daysText =
              days.length === 7
                ? "Mon-Sun"
                : days.length === 6
                  ? "Mon-Sat"
                  : days
                      .map((d: string) =>
                        d.charAt(0).toUpperCase() + d.slice(1, 3)
                      )
                      .join(", ");
            const timingsText = timings
              .map(
                (t: string) => t.charAt(0).toUpperCase() + t.slice(1, 4)
              )
              .join(", ");

            return (
              <Link
                key={job.id as string}
                href={`/details/${job.custom_id as string}`}
                className="relative block rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
              >
                {/* Heart + distance top-right */}
                <span className="absolute right-3 top-2.5 text-[14px] text-slate-400">
                  ♥
                </span>
                <span className="absolute right-3 top-7 text-[9px] text-slate-400">
                  📍 --
                </span>

                {/* Content */}
                <div className="flex gap-2.5 pr-10">
                  <span className="text-lg">{catEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-foreground">
                      {(job.title as string) || catLabel + " Needed"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {jobLocality}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {[salaryText, daysText, timingsText]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                {/* Masked phone + Reveal */}
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="font-mono text-[12px] font-semibold text-foreground">
                    📞 XXX-XXX-XXXX
                  </span>
                  <span className="rounded-md bg-orange px-2.5 py-1 text-[10px] font-bold text-white">
                    Reveal
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="px-4 pt-8 text-center">
          <p className="text-[48px]">🔍</p>
          <h3 className="mt-3 font-heading text-[16px] font-bold text-foreground">
            {t("noJobsTitle")}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
            {t("noJobsDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
