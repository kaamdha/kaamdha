"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RevealModal } from "@/components/shared/reveal-modal";
import { revealWorkerPhone } from "@/app/actions/reveal";

interface WorkerCardProps {
  id: string;
  name: string;
  gender: string | null;
  categories: string[];
  experienceYears: number;
  salaryMin: number | null;
  salaryMax: number | null;
  availableTimings: string[];
  locality: string | null;
  isFavorited?: boolean;
  distanceKm?: number | null;
}

export function WorkerCard({
  id,
  name,
  gender,
  experienceYears,
  salaryMin,
  salaryMax,
  availableTimings,
  locality,
  isFavorited = false,
  distanceKm,
}: WorkerCardProps) {
  const router = useRouter();
  const avatarSrc = gender === "female" ? "/icons/avatar-female.png" : "/icons/avatar-male.png";
  const [showReveal, setShowReveal] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

  const salaryText =
    salaryMin || salaryMax
      ? `₹${salaryMin ? (salaryMin / 1000).toFixed(0) + "k" : ""}${salaryMin && salaryMax ? "-" : ""}${salaryMax ? "₹" + (salaryMax / 1000).toFixed(0) + "k" : ""}/mo`
      : "";

  const timingsText = availableTimings
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");

  return (
    <>
      <div
        onClick={() => router.push(`/details/${id}`)}
        className="relative block cursor-pointer rounded-[12px] border-[1.5px] border-slate-200 bg-white p-3"
      >
        {/* Bookmark top-right */}
        <img
          src={isFavorited ? "/icons/bookmark-nav.png" : "/icons/bookmark.png"}
          alt=""
          className={`absolute right-3 top-2.5 size-4 ${isFavorited ? "opacity-100" : "opacity-30"}`}
        />

        <div className="flex items-center gap-2.5 pr-9">
          <img
            src={avatarSrc}
            alt=""
            className="size-12 shrink-0 rounded-full bg-slate-100 object-cover p-2"
          />
          <div className="min-w-0 flex-1">
            {/* Name */}
            <p className="text-[13px] font-bold text-foreground">{name}</p>

            {/* Location + distance */}
            {locality && (
              <p className="text-[11px] text-slate-500">
                {locality}{distanceKm != null ? ` · ${distanceKm} km` : ""}
              </p>
            )}

            {/* Experience */}
            {experienceYears > 0 && (
              <p className="text-[11px] text-slate-500">{experienceYears} yr experience</p>
            )}

            {/* Salary */}
            {salaryText && (
              <p className="text-[11px] text-slate-500">{salaryText}</p>
            )}

            {/* Timings */}
            {timingsText && (
              <p className="text-[11px] text-slate-500">{timingsText}</p>
            )}
          </div>
        </div>

        {/* Phone + Connect footer */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (revealedPhone) {
              window.location.href = `tel:+91${revealedPhone.replace(/-/g, "")}`;
            } else {
              setShowReveal(true);
            }
          }}
          className="mt-2 flex cursor-pointer items-center justify-between border-t border-slate-100 pt-2"
        >
          {revealedPhone ? (
            <span className="font-mono text-[12px] font-bold text-green-700">
              +91 {revealedPhone}
            </span>
          ) : (
            <span className="font-mono text-[12px] font-semibold text-foreground">
              +91 981-XXX-XXXX
            </span>
          )}
          <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
            Connect
          </span>
        </div>
      </div>

      <RevealModal
        isOpen={showReveal}
        onClose={() => setShowReveal(false)}
        name={name}
        type="worker"
        onReveal={async () => {
          const result = await revealWorkerPhone(id);
          if (result.success && result.phone) {
            setRevealedPhone(result.phone);
          }
          return result;
        }}
      />
    </>
  );
}
