"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

interface PhoneStepProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function PhoneStep({
  phone,
  onPhoneChange,
  onSubmit,
  loading,
  error,
}: PhoneStepProps) {
  const t = useTranslations("auth");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onPhoneChange(digits);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && phone.length === 10) {
      onSubmit();
    }
  };

  const isValid = phone.length === 10;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-muted-foreground">
          {t("phoneLabel")}
        </label>
        <div className="flex gap-2">
          <div className="flex h-11 items-center rounded-[10px] border-[1.5px] border-border bg-muted px-3 text-[15px] font-semibold text-muted-foreground">
            +91
          </div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder={t("phonePlaceholder")}
            value={phone}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
            className="h-11 flex-1 rounded-[10px] border-[1.5px] border-border bg-white px-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-destructive">{error}</p>
      )}

      <button
        onClick={onSubmit}
        disabled={!isValid || loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-bold text-white transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("sendOtp")}
      </button>
    </div>
  );
}
