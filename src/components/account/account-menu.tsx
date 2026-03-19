"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);
  return greeting;
}

interface AccountMenuProps {
  user: User;
  activeJobCount: number;
}

export function AccountMenu({ user, activeJobCount }: AccountMenuProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const greeting = useGreeting();
  const isEmployer = user.last_active_mode === "find_help";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-foreground">
          <ArrowLeft className="size-4" />
          <span className="text-[13px] font-medium text-slate-500">Back</span>
        </button>
      </div>

      {/* User info */}
      <div className="px-4 pt-3">
        <p className="text-[13px] leading-tight text-slate-500">👋 {greeting}</p>
        <p className="font-heading text-[26px] font-[800] leading-tight text-foreground">
          {user.name}
        </p>
        <p className="mt-1 text-[12px] text-slate-500">
          +91 {user.phone.slice(-10)}
        </p>
      </div>

      {/* Menu items */}
      <div className="mx-4 mt-4 overflow-hidden rounded-[14px] bg-white">
        <MenuItem
          icon="/icons/edit.png"
          label={t("editProfile")}
          href="/account/profile"
        />
        {isEmployer && (
          <MenuItem
            icon="/icons/job-listing.png"
            label={t("myJobListings")}
            value={activeJobCount > 0 ? `${activeJobCount} ${t("active")}` : undefined}
            href="/favorites"
          />
        )}
        <MenuItem
          icon="/icons/bookmark-nav.png"
          label={isEmployer ? t("savedProfiles") : t("savedJobs")}
          href="/favorites"
        />
        <MenuItem
          icon="/icons/help-support.png"
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

/* eslint-disable @next/next/no-img-element */
function MenuItem({
  emoji,
  icon,
  label,
  value,
  href,
}: {
  emoji?: string;
  icon?: string;
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
        {icon ? (
          <img src={icon} alt="" className="size-4" />
        ) : (
          <span className="text-[14px]">{emoji}</span>
        )}
        <span className="text-[13px] font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {value && (
          <span className="text-xs text-slate-400">{value}</span>
        )}
        <span className="text-slate-300">→</span>
      </div>
    </Link>
  );
}
