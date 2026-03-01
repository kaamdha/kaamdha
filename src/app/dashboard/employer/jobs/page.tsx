import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function EmployerJobsPage() {
  const t = useTranslations("dashboard");
  return <PlaceholderPage titleKey={t("myJobPosts")} />;
}
