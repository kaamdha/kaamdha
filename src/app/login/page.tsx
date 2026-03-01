import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");
  return <PlaceholderPage titleKey={t("loginTitle")} />;
}
