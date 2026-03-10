"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { JOB_CATEGORIES, DAYS_OF_WEEK } from "@/lib/constants";
import { RevealModal } from "@/components/shared/reveal-modal";
import { revealWorkerPhone } from "@/app/actions/reveal";
import { toggleFavorite } from "@/app/actions/favorite";

interface WorkerDetailProps {
  worker: {
    id: string;
    userId: string;
    name: string;
    gender: string | null;
    categories: string[];
    experienceYears: number;
    salaryMin: number | null;
    salaryMax: number | null;
    availableDays: string[];
    availableTimings: string[];
    languages: string[];
    originallyFrom: string | null;
    bio: string | null;
    locality: string | null;
    isActive: boolean;
  };
  isOwner: boolean;
  isRevealed: boolean;
  revealedPhone: string | null;
  isFavorited: boolean;
}

export function WorkerDetail({
  worker,
  isOwner,
  isRevealed: initialRevealed,
  revealedPhone: initialPhone,
  isFavorited: initialFavorited,
}: WorkerDetailProps) {
  const router = useRouter();
  const t = useTranslations("detail");
  const locale = useLocale();
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(initialRevealed);
  const [revealedPhone, setRevealedPhone] = useState(initialPhone);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const avatar = worker.gender === "female" ? "👩" : "👨";

  const categoryTags = worker.categories
    .map((cId) => {
      const cat = JOB_CATEGORIES.find((c) => c.id === cId);
      return cat
        ? { emoji: cat.emoji, label: locale === "hi" ? cat.labelHi : cat.labelEn }
        : null;
    })
    .filter(Boolean) as { emoji: string; label: string }[];

  const salaryText =
    worker.salaryMin || worker.salaryMax
      ? `₹${worker.salaryMin ? (worker.salaryMin / 1000).toFixed(0) + "k" : ""}${worker.salaryMin && worker.salaryMax ? " - " : ""}${worker.salaryMax ? "₹" + (worker.salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
      : "—";

  const daysText =
    worker.availableDays.length === 7
      ? "Mon - Sun"
      : worker.availableDays.length === 6
        ? "Mon - Sat"
        : worker.availableDays
            .map((d) => {
              const day = DAYS_OF_WEEK.find((dw) => dw.value === d);
              return day ? (locale === "hi" ? day.labelHi.slice(0, 3) : day.labelEn.slice(0, 3)) : d;
            })
            .join(", ");

  const timingsText = worker.availableTimings
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => router.back()} className="text-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-heading text-[16px] font-bold text-foreground">
          {t("staffProfile")}
        </h1>
      </div>

      {/* Profile card */}
      <div className="mx-4 mt-4 rounded-[14px] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            {avatar}
          </span>
          <div>
            <p className="font-heading text-[16px] font-bold text-foreground">
              {worker.name}
              {isOwner && " ✏️"}
            </p>
            {worker.locality && (
              <p className="text-[11px] text-slate-500">
                📍 {worker.locality}
              </p>
            )}
          </div>
        </div>

        {/* Category tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categoryTags.map((tag) => (
            <span
              key={tag.label}
              className="rounded-full bg-teal-light px-2.5 py-0.5 text-[10px] font-semibold text-teal-dark"
            >
              {tag.emoji} {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Details section */}
      <div className="mx-4 mt-3 space-y-0 rounded-[14px] bg-white">
        {/* Skills */}
        <DetailRow label={t("skills")} value={categoryTags.map((c) => c.label).join(", ")} />

        {/* Experience */}
        {worker.experienceYears > 0 && (
          <DetailRow
            label={t("experience")}
            value={`${worker.experienceYears} ${locale === "hi" ? "साल" : "years"}`}
          />
        )}

        {/* Salary */}
        <DetailRow label={t("salary")} value={salaryText} />

        {/* Days */}
        {worker.availableDays.length > 0 && (
          <DetailRow label={t("days")} value={daysText} />
        )}

        {/* Timings */}
        {worker.availableTimings.length > 0 && (
          <DetailRow label={t("timings")} value={timingsText} />
        )}

        {/* Languages */}
        {worker.languages.length > 0 && (
          <DetailRow
            label={t("languages")}
            value={worker.languages
              .map((l) => l.charAt(0).toUpperCase() + l.slice(1))
              .join(", ")}
          />
        )}

        {/* Originally from */}
        {worker.originallyFrom && (
          <DetailRow label={t("from")} value={worker.originallyFrom} />
        )}

        {/* About */}
        {worker.bio && (
          <DetailRow label={t("about")} value={worker.bio} />
        )}
      </div>

      {/* Sticky footer */}
      {!isOwner && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-[420px] -translate-x-1/2 border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const result = await toggleFavorite("worker_profile", worker.id);
                setIsFavorited(result.isFavorited);
              }}
              className={`flex size-11 items-center justify-center rounded-lg border-[1.5px] text-[16px] ${
                isFavorited ? "border-red-200 bg-red-50" : "border-slate-200"
              }`}
            >
              {isFavorited ? "❤️" : "♥"}
            </button>
            {isRevealed && revealedPhone ? (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-green-50 py-2.5">
                <span className="font-mono text-[13px] font-bold text-green-700">
                  📞 {revealedPhone}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowRevealModal(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white"
              >
                {t("revealNumber")} · <s className="text-white/70">₹10</s> FREE
              </button>
            )}
          </div>
        </div>
      )}

      <RevealModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        name={worker.name}
        type="worker"
        onReveal={async () => {
          const result = await revealWorkerPhone(worker.id);
          if (result.success && result.phone) {
            setIsRevealed(true);
            setRevealedPhone(result.phone);
          }
          return result;
        }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-50 px-4 py-3 last:border-b-0">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-[12px] font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
