import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function WorkerProfilePage() {
  const t = useTranslations("dashboard");
  return <PlaceholderPage titleKey={t("myProfile")} />;
}
