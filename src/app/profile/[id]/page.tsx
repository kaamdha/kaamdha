import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function PublicProfilePage() {
  const t = useTranslations("common");
  return <PlaceholderPage titleKey={t("viewProfile")} />;
}
