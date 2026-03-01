import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./locale-switcher";
import { Button } from "@/components/ui/button";

export function Header() {
  const t = useTranslations("common");

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          {t("appName")}
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button asChild size="sm">
            <Link href="/login">{t("login")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
