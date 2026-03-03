import { useTranslations } from "next-intl";

type Mode = "find_help" | "find_jobs";

interface HowItWorksProps {
  mode: Mode;
}

export function HowItWorks({ mode }: HowItWorksProps) {
  const t = useTranslations("landing");

  const steps =
    mode === "find_help"
      ? [
          { title: t("findHelpStep1Title"), desc: t("findHelpStep1Desc") },
          { title: t("findHelpStep2Title"), desc: t("findHelpStep2Desc") },
          { title: t("findHelpStep3Title"), desc: t("findHelpStep3Desc") },
        ]
      : [
          { title: t("findJobsStep1Title"), desc: t("findJobsStep1Desc") },
          { title: t("findJobsStep2Title"), desc: t("findJobsStep2Desc") },
          { title: t("findJobsStep3Title"), desc: t("findJobsStep3Desc") },
        ];

  return (
    <section className="px-4 py-10">
      <h2 className="mb-8 text-center font-heading text-xl font-bold text-[#1E293B]">
        {t("howItWorks")}
      </h2>
      <div className="mx-auto grid max-w-md gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCFBF1] font-heading text-lg font-bold text-[#0D9488]">
              {i + 1}
            </div>
            <div>
              <h3 className="font-heading text-[15px] font-semibold text-[#1E293B]">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-[#1E293B]/60">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
