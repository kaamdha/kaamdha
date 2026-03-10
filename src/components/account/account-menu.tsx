"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";

interface AccountMenuProps {
  user: User;
  activeJobCount: number;
}

export function AccountMenu({ user, activeJobCount }: AccountMenuProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const isEmployer = user.last_active_mode === "find_help";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      {/* User info */}
      <div className="px-4 pt-4">
        <p className="text-[11px] text-slate-500">{t("yourAccount")}</p>
        <p className="mt-1 font-heading text-[18px] font-extrabold text-foreground">
          {user.name} 👋
        </p>
        <p className="text-[12px] text-slate-500">
          +91 {user.phone.slice(-10)}
        </p>
      </div>

      {/* Menu items */}
      <div className="mx-4 mt-4 overflow-hidden rounded-[14px] bg-white">
        <MenuItem
          emoji="📝"
          label={t("editProfile")}
          href="/account/profile"
        />
        {isEmployer && (
          <MenuItem
            emoji="📋"
            label={t("myJobListings")}
            value={activeJobCount > 0 ? `${activeJobCount} ${t("active")}` : undefined}
            href="/favorites"
          />
        )}
        <MenuItem
          emoji="🌐"
          label={t("language")}
          value="English"
          href="#"
        />
        <MenuItem
          emoji="❤️"
          label={t("favorites")}
          href="/favorites"
        />
        <MenuItem
          emoji="📞"
          label={t("helpSupport")}
          value="kaamdha@gmail.com"
          href="mailto:kaamdha@gmail.com"
        />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mx-4 mt-4 mb-6 rounded-[12px] border-[1.5px] border-slate-200 bg-white py-3 text-center text-[13px] font-bold text-red-500"
      >
        {t("logout")}
      </button>
    </div>
  );
}

function MenuItem({
  emoji,
  label,
  value,
  href,
}: {
  emoji: string;
  label: string;
  value?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-slate-50 px-4 py-3.5 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-[14px]">{emoji}</span>
        <span className="text-[13px] font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {value && (
          <span className="text-[11px] text-slate-400">{value}</span>
        )}
        <span className="text-slate-300">→</span>
      </div>
    </Link>
  );
}
