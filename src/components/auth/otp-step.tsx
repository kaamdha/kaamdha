"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";

interface OtpStepProps {
  phone: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

const RESEND_COOLDOWN = 60;
const OTP_LENGTH = 6;

export function OtpStep({
  phone,
  onVerify,
  onResend,
  onBack,
  loading,
  error,
}: OtpStepProps) {
  const t = useTranslations("auth");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submitOtp = useCallback(
    (otpDigits: string[]) => {
      const otp = otpDigits.join("");
      if (otp.length === OTP_LENGTH) {
        onVerify(otp);
      }
    },
    [onVerify]
  );

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Only allow digits
      const digit = value.replace(/\D/g, "").slice(-1);
      const newDigits = [...digits];
      newDigits[index] = digit;
      setDigits(newDigits);

      if (digit && index < OTP_LENGTH - 1) {
        // Auto-advance to next input
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when last digit entered
      if (digit && index === OTP_LENGTH - 1) {
        submitOtp(newDigits);
      }
    },
    [digits, submitOtp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          // Clear current digit
          const newDigits = [...digits];
          newDigits[index] = "";
          setDigits(newDigits);
        } else if (index > 0) {
          // Move to previous input and clear it
          inputRefs.current[index - 1]?.focus();
          const newDigits = [...digits];
          newDigits[index - 1] = "";
          setDigits(newDigits);
        }
        e.preventDefault();
      } else if (e.key === "Enter") {
        const otp = digits.join("");
        if (otp.length === OTP_LENGTH) {
          onVerify(otp);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits, onVerify]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (!pasted) return;

      const newDigits = pasted.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);
      setDigits(newDigits);

      // Focus the next empty input or the last one
      const nextEmpty = newDigits.findIndex((d) => !d);
      const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();

      // Auto-submit if all digits pasted
      if (pasted.length === OTP_LENGTH) {
        submitOtp(newDigits);
      }
    },
    [submitOtp]
  );

  const handleResend = () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setCountdown(RESEND_COOLDOWN);
    onResend();
    inputRefs.current[0]?.focus();
  };

  const formattedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  const otp = digits.join("");
  const formattedCountdown = `0:${String(countdown).padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("changeNumber")}
      </button>

      {/* OTP label */}
      <div className="text-center">
        <p className="text-[13px] font-semibold text-muted-foreground">
          {t("otpSubtitle", { phone: formattedPhone })}
        </p>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-center gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={loading}
            className={`h-[52px] w-11 rounded-xl border-2 text-center font-heading text-[22px] font-bold text-foreground transition-colors focus:border-primary focus:outline-none disabled:opacity-50 ${
              digit
                ? "border-primary bg-teal-light"
                : "border-border bg-white"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-[13px] text-destructive">{error}</p>
      )}

      {/* Resend */}
      <p className="text-center text-[13px] text-muted-foreground">
        {countdown > 0 ? (
          <>
            {t("didntReceive")}{" "}
            <span className="font-semibold text-primary">
              {t("resendCountdown", { time: formattedCountdown })}
            </span>
          </>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="font-semibold text-primary hover:underline"
          >
            {t("resendOtp")}
          </button>
        )}
      </p>

      {/* Verify button */}
      <button
        onClick={() => onVerify(otp)}
        disabled={otp.length !== OTP_LENGTH || loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-bold text-white transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("verifyOtp")}
      </button>
    </div>
  );
}
