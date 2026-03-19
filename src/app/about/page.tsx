import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("common");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold">{t("appName")}</h1>
      <p className="text-xl text-muted-foreground">{t("tagline")}</p>
    </div>
  );
}
