import type { ReactNode } from "react";

// Bare root layout — actual content is in [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
