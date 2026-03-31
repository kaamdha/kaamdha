"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function toggleLocale() {
    const nextLocale = locale === "en" ? "hi" : "en";
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale}>
      {locale === "en" ? "हिन्दी" : "English"}
    </Button>
  );
}
