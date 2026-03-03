import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { JOB_CATEGORIES } from "@/lib/constants";

type Mode = "find_help" | "find_jobs";

interface JobTypeGridProps {
  mode: Mode;
}

export function JobTypeGrid({ mode }: JobTypeGridProps) {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="bg-[#FFFBF5] px-4 py-10">
      <h2 className="mb-6 text-center font-heading text-xl font-bold text-[#1E293B]">
        {mode === "find_help" ? t("findHelpGridTitle") : t("findJobsGridTitle")}
      </h2>
      <div className="mx-auto grid max-w-sm grid-cols-4 gap-3">
        {JOB_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href="/login"
            className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-center text-[11px] font-medium leading-tight text-[#1E293B]">
              {locale === "hi" ? cat.labelHi : cat.labelEn}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
