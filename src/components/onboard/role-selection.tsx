"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Role = "employer" | "worker" | null;

export function RoleSelection() {
  const t = useTranslations("onboard");
  const router = useRouter();
  const [selected, setSelected] = useState<Role>(null);

  function handleContinue() {
    if (selected === "employer") router.push("/onboard/employer");
    if (selected === "worker") router.push("/onboard/worker");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-[18px] font-bold text-foreground">
          {t("roleTitle")}
        </h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {t("roleSubtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Household Owner */}
        <button
          onClick={() => setSelected("employer")}
          className={`rounded-[14px] border-2 px-5 py-5 text-center transition-all ${
            selected === "employer"
              ? "border-primary bg-teal-50"
              : "border-slate-200 bg-white hover:border-primary/40"
          }`}
        >
          <div className="mb-2 text-[32px]">🏠</div>
          <p className="font-heading text-[16px] font-bold text-foreground">
            {t("householdOwner")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("householdOwnerDesc")}
          </p>
        </button>

        {/* Work Seeker */}
        <button
          onClick={() => setSelected("worker")}
          className={`rounded-[14px] border-2 px-5 py-5 text-center transition-all ${
            selected === "worker"
              ? "border-primary bg-teal-50"
              : "border-slate-200 bg-white hover:border-primary/40"
          }`}
        >
          <div className="mb-2 text-[32px]">💼</div>
          <p className="font-heading text-[16px] font-bold text-foreground">
            {t("workSeeker")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("workSeekerDesc")}
          </p>
        </button>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        className="mt-5 w-full rounded-[10px] bg-primary py-3 text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
      >
        {t("continue")}
      </button>
    </div>
  );
}
