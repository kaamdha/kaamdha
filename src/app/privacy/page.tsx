import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy for kaamdha — how we handle your data.",
};

export default function PrivacyPage() {
  return <PlaceholderPage titleKey="Privacy Policy" />;
}
