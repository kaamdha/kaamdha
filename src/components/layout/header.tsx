import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "@/components/shared/logo";

export async function Header() {
  const t = await getTranslations("common");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  return (
    <header className="border-b border-slate-100 bg-background">
      <div className="flex h-12 items-center justify-between px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/favorites"
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-[14px]"
              >
                ❤️
              </Link>
              <Link
                href="/account"
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-[14px]"
              >
                👤
              </Link>
            </>
          ) : (
            <>
              <LocaleSwitcher />
              <Link
                href="/login"
                className="rounded-lg border-[1.5px] border-primary px-3 py-1 text-[11px] font-bold text-primary"
              >
                {t("login")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
