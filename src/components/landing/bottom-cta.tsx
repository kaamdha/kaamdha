import Link from "next/link";
import { useTranslations } from "next-intl";

export function BottomCta() {
  const t = useTranslations("landing");

  return (
    <section className="px-4 py-10 text-center">
      <Link
        href="/login"
        className="mx-auto block max-w-sm rounded-xl bg-[#0D9488] px-6 py-4 text-[15px] font-semibold text-white shadow-lg transition-colors hover:bg-[#0F766E]"
      >
        {t("registerNow")}
      </Link>
      <p className="mt-3 text-sm text-[#1E293B]/60">{t("registerSubtext")}</p>
    </section>
  );
}
