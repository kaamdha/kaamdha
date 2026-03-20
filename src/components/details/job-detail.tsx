"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { JOB_CATEGORIES } from "@/lib/constants";
import { RevealModal } from "@/components/shared/reveal-modal";
import { ShareModal } from "@/components/shared/share-modal";
import { EditIcon } from "@/components/shared/edit-icon";
import { ShareIcon } from "@/components/shared/share-icon";
import { revealEmployerPhone } from "@/app/actions/reveal";
import { toggleFavorite } from "@/app/actions/favorite";
import { events } from "@/lib/posthog";

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
  const tc = useTranslations("common");
  const tShare = useTranslations("share");
  const locale = useLocale();
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

  const catInfo = JOB_CATEGORIES.find((c) => c.id === job.category);
  const catLabel = catInfo
    ? locale === "hi"
      ? catInfo.labelHi
      : catInfo.labelEn
    : "";
  const catEmoji = catInfo?.emoji ?? "📋";

  const title = job.title || tc("needed", { category: catLabel });

  const salaryText =
    job.salaryMin || job.salaryMax
      ? `₹${job.salaryMin ? (job.salaryMin / 1000).toFixed(0) + "k" : ""}${job.salaryMin && job.salaryMax ? " - " : ""}${job.salaryMax ? "₹" + (job.salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
      : "—";

  const timingsText = job.preferredTimings
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");

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
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">{tc("back")}</span>
        </button>
      </div>

      {/* Title card */}
      <div className="mx-4 mt-4 rounded-[14px] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[16px] font-bold text-foreground">
              {title}
            </p>
            <p className="mt-1 font-mono text-[12px] font-semibold text-foreground">
              +91 981-XXX-XXXX
            </p>
          </div>
          {!isOwner && (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex size-8 items-center justify-center"
            >
              <ShareIcon className="size-4 text-slate-500" />
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => router.push(`/account/job/${job.customId}`)}
              className="flex size-8 items-center justify-center"
            >
              <EditIcon className="size-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Details section */}
      <div className="mx-4 mt-3 space-y-0 rounded-[14px] bg-white">
        <DetailRow label={t("name")} value={employer.name} />
        {householdLabel && (
          <DetailRow label={t("householdType")} value={householdLabel} />
        )}
        <DetailRow label={t("location")} value={job.locality || "—"} />
        <DetailRow label={t("salary")} value={salaryText} />
        {job.preferredTimings.length > 0 && (
          <DetailRow label={t("timings")} value={timingsText} />
        )}
        <DetailRow label={t("posted")} value={postedDate} />
        <DetailRow label={t("status")} value={job.status.charAt(0).toUpperCase() + job.status.slice(1)} />
      </div>

      {/* Requirements */}
      {job.description && (
        <div className="mx-4 mt-3 rounded-[14px] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">
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
                if (result.isFavorited) {
                  events.favoriteAdded({ targetType: "job_listing", targetId: job.id });
                } else {
                  events.favoriteRemoved({ targetType: "job_listing", targetId: job.id });
                }
              }}
              className={`flex size-11 items-center justify-center rounded-lg border-[1.5px] ${
                isFavorited ? "border-primary bg-teal-50" : "border-slate-200"
              }`}
            >
              <img
                src={isFavorited ? "/icons/bookmark-nav.png" : "/icons/bookmark.png"}
                alt=""
                className={`size-5 ${isFavorited ? "opacity-100" : "opacity-30"}`}
              />
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
                {tc("connectFree")}
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={tShare("shareJob")}
        shareUrl={typeof window !== "undefined" ? `${window.location.origin}/details/${job.customId}` : `https://kaamdha.com/details/${job.customId}`}
        shareName={title}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-50 px-4 py-3 last:border-b-0">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-[12px] font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
