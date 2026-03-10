"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { JOB_CATEGORIES } from "@/lib/constants";

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

  function daysLeft(expiresAt: string): number {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  if (isEmployer) {
    const tabs: { key: EmployerTab; label: string }[] = [
      { key: "jobs_created", label: t("jobsCreated") },
      { key: "recently_contacted", label: t("recentlyContacted") },
      { key: "saved", label: t("saved") },
    ];

    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4">
          <button onClick={() => router.back()} className="text-foreground">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="font-heading text-[16px] font-bold text-foreground">
            {t("title")}
          </h1>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-1.5 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setEmployerTab(tab.key)}
              className={`rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold transition-all ${
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
                    const catEmoji = catInfo?.emoji ?? "📋";
                    const status = job.status as string;
                    const remaining = daysLeft(job.expires_at as string);

                    return (
                      <div
                        key={job.id as string}
                        className="rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{catEmoji}</span>
                            <div>
                              <p className="text-[13px] font-bold text-foreground">
                                {(job.title as string) || catLabel}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {job.locality as string}
                              </p>
                            </div>
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
                              ✏️
                            </button>
                          </div>
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {remaining} {t("daysLeft")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message={t("noJobsCreated")} />
              )}
            </>
          )}

          {employerTab === "recently_contacted" && (
            <>
              {reveals.length > 0 ? (
                <div className="space-y-2">
                  {reveals.map((r) => (
                    <div
                      key={r.id as string}
                      className="rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
                    >
                      <p className="text-[12px] text-slate-500">
                        {t("contactRevealed")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t("noContacted")} />
              )}
            </>
          )}

          {employerTab === "saved" && (
            <>
              {savedFavorites.length > 0 ? (
                <div className="space-y-2">
                  {savedFavorites.map((f) => (
                    <div
                      key={f.id as string}
                      className="rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
                    >
                      <p className="text-[12px] text-slate-500">
                        {t("savedItem")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message={t("noSaved")} />
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
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => router.back()} className="text-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-heading text-[16px] font-bold text-foreground">
          {t("title")}
        </h1>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex gap-1.5 px-4">
        {workerTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setWorkerTab(tab.key)}
            className={`rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold transition-all ${
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
            {reveals.length > 0 ? (
              <div className="space-y-2">
                {reveals.map((r) => (
                  <div
                    key={r.id as string}
                    className="rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
                  >
                    <p className="text-[12px] text-slate-500">
                      {t("contactRevealed")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={t("noContacted")} />
            )}
          </>
        )}

        {workerTab === "saved" && (
          <>
            {savedFavorites.length > 0 ? (
              <div className="space-y-2">
                {savedFavorites.map((f) => (
                  <div
                    key={f.id as string}
                    className="rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
                  >
                    <p className="text-[12px] text-slate-500">
                      {t("savedItem")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={t("noSaved")} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="pt-8 text-center">
      <p className="text-[48px]">📋</p>
      <p className="mt-3 text-[12px] text-slate-500">{message}</p>
    </div>
  );
}
