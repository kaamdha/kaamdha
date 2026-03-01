import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function WorkerDashboardPage() {
  const t = useTranslations("dashboard");
  return <PlaceholderPage titleKey={t("myProfile")} />;
}
