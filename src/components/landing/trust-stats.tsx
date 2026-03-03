import { useTranslations } from "next-intl";

export function TrustStats() {
  const t = useTranslations("landing");

  const stats = [
    { value: "500+", label: t("statWorkers") },
    { value: "300+", label: t("statHouseholds") },
    { value: "200+", label: t("statConnections") },
  ];

  return (
    <section className="bg-[#CCFBF1] px-4 py-6">
      <div className="mx-auto flex max-w-sm justify-around">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-heading text-2xl font-extrabold text-[#0D9488]">
              {stat.value}
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-[#0F766E]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
