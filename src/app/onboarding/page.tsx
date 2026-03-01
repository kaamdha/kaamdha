import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  return <PlaceholderPage titleKey={t("title")} />;
}
