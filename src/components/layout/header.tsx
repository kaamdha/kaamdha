import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "@/components/shared/logo";

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

export async function Header() {
  const t = await getTranslations("common");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  let initials = "?";
  if (isLoggedIn) {
    const { data: userRow } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();
    initials = getInitials((userRow as { name: string | null } | null)?.name ?? null);
  }

  return (
    <header className="border-b border-slate-100 bg-background">
      <div className="flex h-12 items-center justify-between px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/favorites"
                className="flex size-8 items-center justify-center rounded-full bg-slate-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/bookmark-nav.png" alt="Favorites" className="size-4" />
              </Link>
              <Link
                href="/account"
                className="flex size-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white"
              >
                {initials}
              </Link>
            </>
          ) : (
            <>
              <LocaleSwitcher />
              <Link
                href="/login"
                className="rounded-lg border-[1.5px] border-primary px-3 py-1 text-xs font-bold text-primary"
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
