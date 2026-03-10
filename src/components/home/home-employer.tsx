"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JOB_CATEGORIES, DISTANCE_OPTIONS } from "@/lib/constants";
import { detectLocation, type LocationResult } from "@/lib/location";
import type { User } from "@/types/database";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function daysLeft(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

interface HomeEmployerProps {
  user: User;
  recentJobs: Record<string, unknown>[];
}

export function HomeEmployer({ user, recentJobs }: HomeEmployerProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [locality, setLocality] = useState(user.locality ?? "");
  const [distance, setDistance] = useState(5);
  const [detectingLocation, setDetectingLocation] = useState(false);

  async function handleDetectLocation() {
    setDetectingLocation(true);
    try {
      const result: LocationResult = await detectLocation();
      if (result.locality) setLocality(result.locality);
    } catch {
      // User can type manually
    } finally {
      setDetectingLocation(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Greeting */}
      <div className="px-4 pt-4">
        <p className="text-[13px] text-slate-500">{getGreeting()},</p>
        <p className="font-heading text-[18px] font-extrabold text-foreground">
          {user.name} 👋
        </p>
      </div>

      {/* Search section */}
      <div className="mx-4 mt-4 rounded-[14px] bg-slate-100 p-3.5">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full border-[1.5px] px-2.5 py-1 text-[10px] font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "border-primary bg-teal-light text-teal-dark"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {cat.emoji} {locale === "hi" ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Location input */}
        <div className="mt-3 flex gap-2">
          <Input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder={t("locationPlaceholder")}
            className="flex-1 bg-white text-[13px]"
          />
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-slate-200 bg-teal-light"
          >
            {detectingLocation ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <MapPin className="size-4 text-primary" />
            )}
          </button>
        </div>

        {/* Distance pills */}
        <div className="mt-3 flex gap-1.5">
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDistance(opt.value)}
              className={`rounded-full border-[1.5px] px-3 py-1 text-[10px] font-semibold transition-all ${
                distance === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search button */}
        <Link
          href={`/search?category=${selectedCategory ?? ""}&locality=${encodeURIComponent(locality)}&distance=${distance}`}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white"
        >
          🔍 {t("searchStaff")}
        </Link>
      </div>

      {/* Recent searches */}
      <div className="px-4 pt-5">
        <h3 className="font-heading text-[14px] font-bold text-foreground">
          {t("recentSearches")}
        </h3>
      </div>

      {recentJobs.length > 0 ? (
        <div className="mt-2 space-y-2 px-4">
          {recentJobs.map((job) => {
            const categoryId = job.category as string;
            const catInfo = JOB_CATEGORIES.find((c) => c.id === categoryId);
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
                        {catLabel}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {job.locality as string}
                        {job.salary_min || job.salary_max
                          ? ` · ₹${((job.salary_min as number) / 1000).toFixed(0)}k-₹${((job.salary_max as number) / 1000).toFixed(0)}k`
                          : ""}
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
                      {status === "active" ? "Active" : status === "expired" ? "Expired" : status}
                    </span>
                    <Link
                      href={`/details/${job.custom_id as string}`}
                      className="text-[14px]"
                    >
                      ✏️
                    </Link>
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
        <p className="px-4 pt-2 text-[12px] text-slate-400">
          {t("noRecentSearches")}
        </p>
      )}

      {/* Create job listing card */}
      <Link
        href="/search"
        className="mx-4 mt-3 mb-6 flex items-center gap-3 rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
      >
        <span className="text-lg">📋</span>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-foreground">
            {t("createJobListing")}
          </p>
          <p className="text-[10px] text-slate-500">
            {t("createJobListingDesc")}
          </p>
        </div>
        <span className="text-slate-400">→</span>
      </Link>
    </div>
  );
}
