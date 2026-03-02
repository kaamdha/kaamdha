"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Search, Heart, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/search", icon: Search, labelKey: "search" },
  { href: "/favorites", icon: Heart, labelKey: "favorites" },
  { href: "/account", icon: User, labelKey: "account" },
] as const;

export function Footer() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <nav className="mx-auto flex h-14 max-w-lg items-stretch">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
                isActive
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
