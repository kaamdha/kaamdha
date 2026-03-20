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
import { revealWorkerPhone } from "@/app/actions/reveal";
import { toggleFavorite } from "@/app/actions/favorite";
import { events } from "@/lib/posthog";

/* eslint-disable @next/next/no-img-element */

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
    updatedAt: string | null;
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
  const tShare = useTranslations("share");
  const locale = useLocale();
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(initialRevealed);
  const [revealedPhone, setRevealedPhone] = useState(initialPhone);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const avatarSrc = worker.gender === "female" ? "/icons/avatar-female.png" : "/icons/avatar-male.png";

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

  const timingsText = worker.availableTimings
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");

  return (
    <div className="flex flex-col pb-24">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">Back</span>
        </button>
      </div>

      {/* Profile card */}
      <div className="mx-4 mt-4 rounded-[14px] bg-white p-4">
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt=""
            className="size-14 rounded-full bg-slate-100 object-cover p-2"
          />
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[16px] font-bold text-foreground">
              {worker.name}
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
              onClick={() => router.push("/account/profile")}
              className="flex size-8 items-center justify-center"
            >
              <EditIcon className="size-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* About banner */}
      {worker.bio && (
        <div className="mx-4 mt-3 rounded-[14px] bg-teal-50 px-4 py-3">
          <p className="text-[11px] font-semibold text-teal-700">{t("about")}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-foreground">
            {worker.bio}
          </p>
        </div>
      )}

      {/* Details section */}
      <div className="mx-4 mt-3 space-y-0 rounded-[14px] bg-white">
        {/* Skills */}
        <DetailRow label={t("skills")} value={categoryTags.map((c) => c.label).join(", ")} />

        {/* Gender */}
        {worker.gender && (
          <DetailRow label={t("gender")} value={worker.gender.charAt(0).toUpperCase() + worker.gender.slice(1)} />
        )}

        {/* Location */}
        {worker.locality && (
          <DetailRow label={t("location")} value={worker.locality} />
        )}

        {/* Experience */}
        {worker.experienceYears > 0 && (
          <DetailRow
            label={t("experience")}
            value={`${worker.experienceYears} ${locale === "hi" ? "साल" : "years"}`}
          />
        )}

        {/* Salary */}
        <DetailRow label={t("salary")} value={salaryText} />

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


        {/* Last active */}
        {!isOwner && worker.updatedAt && (
          <DetailRow
            label={t("lastActive")}
            value={new Date(worker.updatedAt).toLocaleDateString(
              locale === "hi" ? "hi-IN" : "en-IN",
              { day: "numeric", month: "short", year: "numeric" }
            )}
          />
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
                if (result.isFavorited) {
                  events.favoriteAdded({ targetType: "worker_profile", targetId: worker.id });
                } else {
                  events.favoriteRemoved({ targetType: "worker_profile", targetId: worker.id });
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
                Connect · <s className="text-white/70">₹10</s> FREE
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={tShare("shareProfile")}
        shareUrl={typeof window !== "undefined" ? `${window.location.origin}/details/${worker.id}` : `https://kaamdha.com/details/${worker.id}`}
        shareName={worker.name}
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
