import { useTranslations } from "next-intl";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>&copy; {new Date().getFullYear()} {t("appName")}</p>
        <nav className="flex gap-4">
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
