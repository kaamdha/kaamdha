"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

interface RevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onReveal: () => Promise<{ success: boolean; phone?: string; error?: string }>;
  type: "worker" | "employer";
}

export function RevealModal({
  isOpen,
  onClose,
  name,
  onReveal,
  type,
}: RevealModalProps) {
  const t = useTranslations("reveal");
  const [isPending, startTransition] = useTransition();
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleReveal() {
    startTransition(async () => {
      const result = await onReveal();
      if (result.success && result.phone) {
        setRevealedPhone(result.phone);
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 rounded-t-[20px] bg-white px-5 pb-8 pt-5">
        {revealedPhone ? (
          // Revealed state
          <div className="text-center">
            <div className="mx-auto rounded-[12px] bg-green-50 px-4 py-4">
              <p className="font-mono text-[18px] font-bold text-green-700">
                📞 {revealedPhone}
              </p>
            </div>
            <a
              href={`tel:+91${revealedPhone.replace(/-/g, "")}`}
              className="mt-3 flex w-full items-center justify-center rounded-[10px] bg-green-600 py-2.5 text-[13px] font-bold text-white"
            >
              {t("call")}
            </a>
            <p className="mt-2 text-[11px] text-slate-500">
              {t("sentToWhatsApp")}
            </p>
            <button
              onClick={onClose}
              className="mt-3 text-[12px] font-medium text-slate-500"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          // Confirmation state
          <>
            <p className="text-center font-heading text-[16px] font-bold text-foreground">
              {type === "worker"
                ? t("revealWorkerTitle", { name })
                : t("revealEmployerTitle", { name })}
            </p>
            <p className="mt-1 text-center text-[12px] text-slate-500">
              <s className="text-slate-400">₹10</s>{" "}
              <span className="font-bold text-green-600">FREE</span>
            </p>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              {t("whatsappNote")}
            </p>

            {error && (
              <p className="mt-2 text-center text-[11px] text-red-500">{error}</p>
            )}

            <button
              onClick={handleReveal}
              disabled={isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t("revealViaWhatsApp")
              )}
            </button>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 text-center text-[12px] font-medium text-slate-500"
            >
              {t("cancel")}
            </button>
          </>
        )}
      </div>
    </>
  );
}
