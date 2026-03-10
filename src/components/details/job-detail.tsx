"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { JOB_CATEGORIES, DAYS_OF_WEEK } from "@/lib/constants";
import { RevealModal } from "@/components/shared/reveal-modal";
import { revealEmployerPhone } from "@/app/actions/reveal";
import { toggleFavorite } from "@/app/actions/favorite";

interface JobDetailProps {
  job: {
    id: string;
    customId: string;
    category: string;
    title: string | null;
    description: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    schedule: string | null;
    preferredDays: string[];
    preferredTimings: string[];
    locality: string | null;
    status: string;
    createdAt: string;
    expiresAt: string;
  };
  employer: {
    name: string;
    householdType: string | null;
    locality: string | null;
  };
  isOwner: boolean;
  isFavorited: boolean;
}

export function JobDetail({ job, employer, isOwner, isFavorited: initialFavorited }: JobDetailProps) {
  const router = useRouter();
  const t = useTranslations("detail");
  const locale = useLocale();
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

  const catInfo = JOB_CATEGORIES.find((c) => c.id === job.category);
  const catLabel = catInfo
    ? locale === "hi"
      ? catInfo.labelHi
      : catInfo.labelEn
    : "";
  const catEmoji = catInfo?.emoji ?? "📋";

  const title = job.title || `${catLabel} Needed`;

  const salaryText =
    job.salaryMin || job.salaryMax
      ? `₹${job.salaryMin ? (job.salaryMin / 1000).toFixed(0) + "k" : ""}${job.salaryMin && job.salaryMax ? " - " : ""}${job.salaryMax ? "₹" + (job.salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
      : "—";

  const scheduleText = job.schedule
    ? job.schedule === "full_time"
      ? locale === "hi" ? "पूर्णकालिक" : "Full-time"
      : job.schedule === "part_time"
        ? locale === "hi" ? "अंशकालिक" : "Part-time"
        : locale === "hi" ? "लचीला" : "Flexible"
    : "—";

  const daysText =
    job.preferredDays.length === 7
      ? "Mon - Sun"
      : job.preferredDays.length === 6
        ? "Mon - Sat"
        : job.preferredDays
            .map((d) => {
              const day = DAYS_OF_WEEK.find((dw) => dw.value === d);
              return day ? (locale === "hi" ? day.labelHi.slice(0, 3) : day.labelEn.slice(0, 3)) : d;
            })
            .join(", ");

  const timingsText = job.preferredTimings
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(job.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const postedDate = new Date(job.createdAt).toLocaleDateString(
    locale === "hi" ? "hi-IN" : "en-IN",
    { day: "numeric", month: "short", year: "numeric" }
  );

  const householdLabel = employer.householdType
    ? employer.householdType === "apartment"
      ? locale === "hi" ? "अपार्टमेंट" : "Apartment"
      : employer.householdType === "independent_house"
        ? locale === "hi" ? "स्वतंत्र मकान" : "Independent House"
        : employer.householdType === "villa"
          ? locale === "hi" ? "विला" : "Villa"
          : locale === "hi" ? "अन्य" : "Other"
    : null;

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => router.back()} className="text-foreground">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-heading text-[16px] font-bold text-foreground">
          {t("jobDetail")}
        </h1>
      </div>

      {/* Title card */}
      <div className="mx-4 mt-4 rounded-[14px] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{catEmoji}</span>
          <div>
            <p className="font-heading text-[16px] font-bold text-foreground">
              {title}
              {isOwner && " ✏️"}
            </p>
            {job.locality && (
              <p className="text-[11px] text-slate-500">
                📍 {job.locality}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Employer section */}
      <div className="mx-4 mt-3 rounded-[14px] bg-white p-4">
        <p className="text-[11px] font-semibold text-slate-500">{t("postedBy")}</p>
        <div className="mt-2 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-lg">
            🏠
          </span>
          <div>
            <p className="text-[13px] font-bold text-foreground">
              {employer.name}
            </p>
            <p className="text-[10px] text-slate-500">
              {[householdLabel, employer.locality].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="mx-4 mt-3 space-y-0 rounded-[14px] bg-white">
        <DetailRow label={t("salary")} value={salaryText} />
        <DetailRow label={t("schedule")} value={scheduleText} />
        {job.preferredDays.length > 0 && (
          <DetailRow label={t("days")} value={daysText} />
        )}
        {job.preferredTimings.length > 0 && (
          <DetailRow label={t("timings")} value={timingsText} />
        )}
        <DetailRow label={t("location")} value={job.locality ?? "—"} />
        <DetailRow label={t("posted")} value={postedDate} />
        <DetailRow
          label={t("expires")}
          value={`${daysLeft} ${locale === "hi" ? "दिन बाकी" : "days left"}`}
        />
      </div>

      {/* Requirements */}
      {job.description && (
        <div className="mx-4 mt-3 rounded-[14px] bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500">
            {t("requirements")}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-foreground">
            {job.description}
          </p>
        </div>
      )}

      {/* Sticky footer */}
      {!isOwner && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-[420px] -translate-x-1/2 border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const result = await toggleFavorite("job_listing", job.id);
                setIsFavorited(result.isFavorited);
              }}
              className={`flex size-11 items-center justify-center rounded-lg border-[1.5px] text-[16px] ${
                isFavorited ? "border-red-200 bg-red-50" : "border-slate-200"
              }`}
            >
              {isFavorited ? "❤️" : "♥"}
            </button>
            {revealedPhone ? (
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
                {t("revealEmployerNumber")} · <s className="text-white/70">₹10</s> FREE
              </button>
            )}
          </div>
        </div>
      )}

      <RevealModal
        isOpen={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        name={employer.name}
        type="employer"
        onReveal={async () => {
          const result = await revealEmployerPhone(job.id);
          if (result.success && result.phone) {
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
