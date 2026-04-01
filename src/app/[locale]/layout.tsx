import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DM_Sans, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { OrganizationJsonLd } from "@/components/shared/json-ld";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SiteFooter } from "@/components/shared/site-footer";
import { createClient } from "@/lib/supabase/server";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "kaamdha — Find household staff near you",
    template: "%s | kaamdha",
  },
  description:
    "kaamdha connects households with verified maids, cooks, drivers, nannies and more in Gurgaon. Find staff or find jobs near you.",
  metadataBase: new URL("https://kaamdha.com"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      hi: "/hi",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "kaamdha — Find household staff near you",
    description:
      "kaamdha connects households with verified maids, cooks, drivers, nannies and more in Gurgaon. Find staff or find jobs near you.",
    type: "website",
    url: "https://kaamdha.com",
    siteName: "kaamdha",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "kaamdha — Find household staff near you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "kaamdha — Find household staff near you",
    description:
      "kaamdha connects households with verified maids, cooks, drivers, nannies and more in Gurgaon. Find staff or find jobs near you.",
    images: ["/og-image.png"],
  },
  other: {
    "theme-color": "#0D9488",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as "en" | "hi")) {
    notFound();
  }

  const messages = await getMessages();

  // Fetch user mode for footer personalization
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let userMode: "find_staff" | "find_jobs" | null = null;
  if (user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("last_active_mode")
      .eq("id", user.id)
      .single();
    userMode = (userRow as { last_active_mode: string | null } | null)?.last_active_mode as typeof userMode;
  }

  return (
    <html lang={locale}>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className={`${dmSans.variable} ${outfit.variable} font-sans antialiased bg-slate-100`}>
        <PostHogProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-background shadow-xl sm:my-0 sm:min-h-screen">
              <Header />
              <main role="main" className="flex-1">{children}</main>
              <SiteFooter userMode={userMode} />
            </div>
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
