import { useTranslations } from "next-intl";

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">{titleKey}</h1>
      <p className="text-muted-foreground">{t("underConstruction")}</p>
    </div>
  );
}
