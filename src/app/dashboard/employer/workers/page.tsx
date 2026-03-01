import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function FindWorkersPage() {
  const t = useTranslations("dashboard");
  return <PlaceholderPage titleKey={t("findWorkers")} />;
}
