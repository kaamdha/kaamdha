"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";
import { LocationInput } from "@/components/shared/location-input";
import { EditIcon } from "@/components/shared/edit-icon";
import type { User } from "@/types/database";

// Crop positions for each worker from the hero image (background-position-x %)
const HERO_CROPS: Record<string, string> = {
  C0001: "0%",    // Maid - woman with mop (1st person)
  C0002: "20%",   // Cook - woman with apron (2nd person)
  C0003: "48%",   // Driver - man with cap & keys (3rd person)
  C0006: "66%",   // Nanny - woman holding child (4th person)
  C0007: "84%",   // Trainer - man with dumbbell (5th person)
  C0008: "100%",  // Elder care - woman with stethoscope (6th person)
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);
  return greeting;
}

function daysAgo(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)));
}

interface HomeEmployerProps {
  user: User;
  recentJobs: Record<string, unknown>[];
}

export function HomeEmployer({ user, recentJobs }: HomeEmployerProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const greeting = useGreeting();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [locality, setLocality] = useState(user.locality ?? "");
  const [editingLocation, setEditingLocation] = useState(false);
  const locationWrapperRef = useRef<HTMLDivElement>(null);

  // Close location editor on outside click
  useEffect(() => {
    if (!editingLocation) return;
    function handleClickOutside(e: MouseEvent) {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(e.target as Node)) {
        setEditingLocation(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingLocation]);

  return (
    <div className="flex flex-col">
      {/* Greeting + Name + Location */}
      <div className="px-4 pt-4">
        <p className="text-[13px] leading-tight text-slate-500">👋 {greeting}</p>
        <p className="font-heading text-[26px] font-[800] leading-tight text-foreground">
          {user.name}
        </p>
        <div ref={locationWrapperRef} className="mt-1">
          {editingLocation ? (
            <LocationInput
              value={locality}
              onChange={(val) => {
                setLocality(val);
              }}
              placeholder={t("locationPlaceholder")}
              startEditing
            />
          ) : (
            <button
              onClick={() => setEditingLocation(true)}
              className="flex items-center gap-1"
            >
              <span className="font-heading text-[13px] font-medium leading-none text-slate-500">
                {locality || t("locationPlaceholder")}
              </span>
              <EditIcon className="size-3 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Category grid — 3x2 */}
      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        {JOB_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`relative overflow-hidden rounded-[14px] transition-all duration-150 active:scale-[1.02] ${
              selectedCategory === cat.id
                ? "border-[2.5px] border-primary shadow-[0_0_0_1px_#0D9488,0_2px_8px_rgba(13,148,136,0.2)]"
                : "border-[1.5px] border-slate-200"
            }`}
            style={{ aspectRatio: "1 / 1" }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url(/hero-staff.png)",
                backgroundSize: "600% auto",
                backgroundPosition: `${HERO_CROPS[cat.id] ?? "50%"} ${cat.id === "C0003" || cat.id === "C0007" ? "5%" : "15%"}`,
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 pb-2 pt-6">
              <span className="text-[12px] font-bold text-white drop-shadow-sm">
                {locale === "hi" ? cat.labelHi : cat.labelEn}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Search button */}
      <div className="px-4 pt-3.5">
        <Link
          href={`/search?category=${selectedCategory ?? ""}&locality=${encodeURIComponent(locality)}`}
          className="flex h-12 w-full items-center justify-center rounded-[12px] bg-primary text-[14px] font-bold text-white"
        >
          Search staff
        </Link>
      </div>

      {/* Recent searches */}
      <div className="px-4 pt-5">
        <h3 className="font-heading text-[14px] font-bold text-foreground">
          Your recent searches
        </h3>
      </div>

      {recentJobs.length > 0 ? (
        <div className="mt-2 flex flex-col gap-2 px-4 pb-6">
          {recentJobs.map((job) => {
            const categoryId = job.category as string;
            const catInfo = JOB_CATEGORIES.find((c) => c.id === categoryId);
            const catLabel = catInfo
              ? locale === "hi"
                ? catInfo.labelHi
                : catInfo.labelEn
              : "";
            const status = job.status as string;
            const ago = daysAgo(job.created_at as string);
            const isExpired = status !== "active";
            const searchUrl = `/search?category=${categoryId}&locality=${encodeURIComponent((job.locality as string) ?? "")}`;

            return (
              <div
                key={job.id as string}
                className={`flex overflow-hidden rounded-[12px] border-[1.5px] border-slate-200 bg-white ${
                  isExpired ? "opacity-50" : ""
                }`}
              >
                {/* Left color strip */}
                <div
                  className={`w-1 shrink-0 ${
                    isExpired ? "bg-amber-500" : "bg-primary"
                  }`}
                />

                {/* Card content */}
                <div className="flex flex-1 items-center gap-2.5 p-3">
                  {/* Category thumbnail */}
                  <div
                    className="size-10 shrink-0 overflow-hidden rounded-full"
                    style={{
                      backgroundImage: "url(/hero-staff.png)",
                      backgroundSize: "600% auto",
                      backgroundPosition: `${HERO_CROPS[categoryId] ?? "50%"} ${categoryId === "C0003" || categoryId === "C0007" ? "5%" : "15%"}`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />

                  {/* Center — info */}
                  {isExpired ? (
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-foreground">
                        {catLabel}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {job.locality as string}
                        {job.salary_min || job.salary_max
                          ? ` · ₹${((job.salary_min as number) / 1000).toFixed(0)}k-₹${((job.salary_max as number) / 1000).toFixed(0)}k`
                          : ""}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {ago === 0 ? "Created today" : `Created ${ago} days ago`}
                      </p>
                    </div>
                  ) : (
                    <Link href={searchUrl} className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-foreground">
                        {catLabel}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {job.locality as string}
                        {job.salary_min || job.salary_max
                          ? ` · ₹${((job.salary_min as number) / 1000).toFixed(0)}k-₹${((job.salary_max as number) / 1000).toFixed(0)}k`
                          : ""}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {ago === 0 ? "Created today" : `Created ${ago} days ago`}
                      </p>
                    </Link>
                  )}

                  {/* Right — edit */}
                  <Link
                    href={`/account/job/${job.custom_id as string}`}
                    className="shrink-0 text-[14px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EditIcon className="size-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-4 pt-2 text-[12px] text-slate-400">
          {t("noRecentSearches")}
        </p>
      )}
    </div>
  );
}
