import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { OrganizationJsonLd } from "@/components/shared/json-ld";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import "./globals.css";

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
  },
  openGraph: {
    title: "kaamdha — Find household staff near you",
    description:
      "kaamdha connects households with verified maids, cooks, drivers, nannies and more in Gurgaon. Find staff or find jobs near you.",
    type: "website",
    url: "https://kaamdha.com",
    siteName: "kaamdha",
  },
  twitter: {
    card: "summary_large_image",
    title: "kaamdha — Find household staff near you",
    description:
      "kaamdha connects households with verified maids, cooks, drivers, nannies and more in Gurgaon. Find staff or find jobs near you.",
  },
  other: {
    "theme-color": "#0D9488",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

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
            </div>
          </NextIntlClientProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
