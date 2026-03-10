"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";

interface WorkerCardProps {
  id: string;
  name: string;
  gender: string | null;
  categories: string[];
  experienceYears: number;
  salaryMin: number | null;
  salaryMax: number | null;
  availableDays: string[];
  availableTimings: string[];
  locality: string | null;
}

export function WorkerCard({
  id,
  name,
  gender,
  categories,
  experienceYears,
  salaryMin,
  salaryMax,
  availableDays,
  availableTimings,
  locality,
}: WorkerCardProps) {
  const locale = useLocale();

  const avatar = gender === "female" ? "👩" : "👨";

  const categoryTags = categories
    .map((cId) => {
      const cat = JOB_CATEGORIES.find((c) => c.id === cId);
      return cat ? (locale === "hi" ? cat.labelHi : cat.labelEn) : null;
    })
    .filter(Boolean);

  const salaryText =
    salaryMin || salaryMax
      ? `₹${salaryMin ? (salaryMin / 1000).toFixed(0) + "k" : ""}${salaryMin && salaryMax ? "-" : ""}${salaryMax ? "₹" + (salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
      : "";

  const daysText =
    availableDays.length === 7
      ? "Mon-Sun"
      : availableDays.length === 6
        ? "Mon-Sat"
        : availableDays
            .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
            .join(", ");

  const timingsText = availableTimings
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1, 4))
    .join(", ");

  const meta = [
    experienceYears > 0 ? `${experienceYears}yr exp` : null,
    salaryText,
    daysText,
    timingsText,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/details/${id}`}
      className="relative block rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
    >
      {/* Heart top-right */}
      <span className="absolute right-3 top-2.5 text-[14px] text-slate-300">
        ♥
      </span>
      {/* Distance below heart */}
      <span className="absolute right-3 top-7 text-[9px] text-slate-400">
        📍 --
      </span>

      <div className="flex gap-2.5 pr-10">
        {/* Avatar */}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
          {avatar}
        </span>

        <div className="min-w-0 flex-1">
          {/* Name */}
          <p className="text-[13px] font-bold text-foreground">{name}</p>

          {/* Category tags */}
          <div className="mt-1 flex flex-wrap gap-1">
            {categoryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-teal-light px-2 py-0.5 text-[9px] font-semibold text-teal-dark"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta */}
          {meta && (
            <p className="mt-1 text-[10px] text-slate-500">{meta}</p>
          )}

          {/* Locality */}
          {locality && (
            <p className="text-[10px] text-slate-400">{locality}</p>
          )}
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
}
