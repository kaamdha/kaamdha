import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { useTranslations } from "next-intl";

export default function WorkerJobsPage() {
  const t = useTranslations("dashboard");
  return <PlaceholderPage titleKey={t("findJobs")} />;
}
