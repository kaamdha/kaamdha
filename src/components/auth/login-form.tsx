"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { checkUserRole } from "@/app/login/actions";
import { PhoneStep } from "./phone-step";
import { OtpStep } from "./otp-step";

type Step = "phone" | "otp";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = `+91${phone}`;

  const mapError = useCallback(
    (message: string): string => {
      const lower = message.toLowerCase();
      if (lower.includes("rate") || lower.includes("limit")) {
        return t("rateLimited");
      }
      if (lower.includes("expired")) {
        return t("otpExpired");
      }
      if (lower.includes("invalid") && lower.includes("otp")) {
        return t("otpVerifyError");
      }
      return message;
    },
    [t]
  );

  const handleSendOtp = useCallback(async () => {
    if (phone.length !== 10) {
      setError(t("invalidPhone"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (otpError) {
        setError(mapError(otpError.message));
        return;
      }

      setStep("otp");
    } catch {
      setError(t("otpSendError"));
    } finally {
      setLoading(false);
    }
  }, [phone, fullPhone, t, mapError]);

  const handleVerifyOtp = useCallback(
    async (otp: string) => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otp,
          type: "sms",
        });

        if (verifyError) {
          setError(mapError(verifyError.message));
          return;
        }

        const redirectTo = await checkUserRole();
        router.push(redirectTo);
      } catch {
        setError(t("otpVerifyError"));
      } finally {
        setLoading(false);
      }
    },
    [fullPhone, t, router, mapError]
  );

  const handleBack = useCallback(() => {
    setStep("phone");
    setError(null);
  }, []);

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="font-heading text-[32px] font-extrabold tracking-tight text-primary">
          kaamdha
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("loginSubtitle")}
        </p>
      </div>

      {/* Form */}
      <div className="px-1">
        {step === "phone" ? (
          <PhoneStep
            phone={phone}
            onPhoneChange={setPhone}
            onSubmit={handleSendOtp}
            loading={loading}
            error={error}
          />
        ) : (
          <OtpStep
            phone={phone}
            onVerify={handleVerifyOtp}
            onResend={handleSendOtp}
            onBack={handleBack}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
