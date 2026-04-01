import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms of service for kaamdha — the household staff marketplace.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <PlaceholderPage titleKey="Terms of Service" />;
}
