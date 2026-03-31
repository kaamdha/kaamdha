"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: "en" | "hi") {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold overflow-hidden">
      <button
        onClick={() => switchTo("en")}
        className={`px-2 py-1 transition-colors ${
          locale === "en"
            ? "bg-primary text-white"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("hi")}
        className={`px-2 py-1 transition-colors ${
          locale === "hi"
            ? "bg-primary text-white"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        हि
      </button>
    </div>
  );
}
