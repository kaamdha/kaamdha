"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function toggleLocale() {
    const nextLocale = locale === "en" ? "hi" : "en";
    document.cookie = `locale=${nextLocale};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale}>
      {locale === "en" ? "हिन्दी" : "English"}
    </Button>
  );
}
