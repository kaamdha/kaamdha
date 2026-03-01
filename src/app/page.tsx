import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const t = useTranslations("landing");

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {t("heroSubtitle")}
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/login">{t("getStarted")}</Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
            {t("howItWorks")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Workers / Employers */}
      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col gap-3 p-6">
              <h3 className="text-xl font-semibold">{t("forWorkers")}</h3>
              <p className="text-muted-foreground">{t("forWorkersDesc")}</p>
              <Button asChild variant="outline" className="mt-2 self-start">
                <Link href="/login">{t("getStarted")}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3 p-6">
              <h3 className="text-xl font-semibold">{t("forEmployers")}</h3>
              <p className="text-muted-foreground">{t("forEmployersDesc")}</p>
              <Button asChild variant="outline" className="mt-2 self-start">
                <Link href="/login">{t("getStarted")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
