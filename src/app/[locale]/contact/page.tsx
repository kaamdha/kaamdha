import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = {
  title: "Help and support",
  description: "Get help with kaamdha. Contact us at kaamdha@gmail.com for any questions or support.",
};

export default function ContactPage() {
  return <PlaceholderPage titleKey="Help & Support" />;
}
