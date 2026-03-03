import { useTranslations } from "next-intl";

type Mode = "find_help" | "find_jobs";

interface HeroSectionProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function HeroSection({ mode, onModeChange }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <section className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] px-4 pb-10 pt-8 text-center text-white">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide">
        <span>🏠</span>
        <span>{t("badge")}</span>
      </div>

      {/* Title */}
      <h1 className="mx-auto max-w-sm font-heading text-[28px] font-bold leading-tight">
        {mode === "find_help" ? t("findHelpTitle") : t("findJobsTitle")}
      </h1>

      {/* Hindi subtitle */}
      <p className="mx-auto mt-3 max-w-xs text-sm text-white/85">
        {mode === "find_help" ? t("findHelpSubtitle") : t("findJobsSubtitle")}
      </p>

      {/* Mode toggle buttons */}
      <div className="mt-8 flex flex-col gap-3 px-4">
        <button
          onClick={() => onModeChange("find_help")}
          className={`rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all ${
            mode === "find_help"
              ? "bg-white text-[#0D9488] shadow-lg"
              : "border-2 border-white/50 text-white hover:bg-white/10"
          }`}
        >
          {t("findHelp")}
        </button>
        <button
          onClick={() => onModeChange("find_jobs")}
          className={`rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all ${
            mode === "find_jobs"
              ? "bg-white text-[#0D9488] shadow-lg"
              : "border-2 border-white/50 text-white hover:bg-white/10"
          }`}
        >
          {t("findJobs")}
        </button>
      </div>

      {/* Pricing badge */}
      <p className="mt-6 text-sm font-medium text-white/90">
        🎉 {t("pricingBadge")}
      </p>
    </section>
  );
}
