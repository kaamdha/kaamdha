import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function JobDetailPage() {
  const t = useTranslations("jobs");
  return <PlaceholderPage titleKey={t("description")} />;
}
