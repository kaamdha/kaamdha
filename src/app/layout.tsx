import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/components/layout/header";
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
  title: "Kaamdha — Find Trusted Household Help Near You",
  description:
    "Connect directly with maids, cooks, drivers, and more in your neighbourhood. No middlemen, no commissions.",
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
      <body className={`${dmSans.variable} ${outfit.variable} font-sans antialiased bg-slate-100`}>
        <NextIntlClientProvider messages={messages}>
          <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-background shadow-xl sm:my-0 sm:min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
