"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareUrl: string;
  shareName: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  shareUrl,
  shareName,
}: ShareModalProps) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Check out ${shareName} on kaamdha: ${shareUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedSubject = encodeURIComponent(`Check out ${shareName} on kaamdha`);

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        {/* Title */}
        <p className="text-center font-heading text-[16px] font-bold text-foreground">
          {title}
        </p>

        {/* Link preview */}
        <div className="mt-4 rounded-[10px] bg-slate-100 px-3 py-2.5">
          <p className="truncate text-center text-[12px] font-medium text-slate-500">
            {shareUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>

        {/* Share options */}
        <div className="mt-5 flex items-start justify-center gap-6">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-green-500">
              <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-slate-600">
              {t("whatsapp")}
            </span>
          </a>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-500">
              <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-slate-600">
              {copied ? t("copied") : t("copyLink")}
            </span>
          </button>

          {/* SMS */}
          <a
            href={`sms:?body=${encodedText}`}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-500">
              <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-slate-600">
              {t("sms")}
            </span>
          </a>

          {/* Email */}
          <a
            href={`mailto:?subject=${encodedSubject}&body=${encodedUrl}`}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-orange-500">
              <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-slate-600">
              {t("email")}
            </span>
          </a>
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 text-center text-[12px] font-medium text-slate-500"
        >
          {t("cancel")}
        </button>
      </div>
    </>
  );
}
