"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string | null;
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ message, duration = 3000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrentMessage(null);
          onDismiss?.();
        }, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onDismiss]);

  if (!currentMessage) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-32px)] max-w-[388px] -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-center text-[13px] font-medium text-white shadow-lg transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {currentMessage}
    </div>
  );
}
