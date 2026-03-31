"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

const MINIMAL_ROUTES = ["/login", "/onboard"];

export function HeaderShell({
  minimalHeader,
  fullHeader,
}: {
  minimalHeader: ReactNode;
  fullHeader: ReactNode;
}) {
  const pathname = usePathname();
  const isMinimal = MINIMAL_ROUTES.some((r) => pathname.includes(r));

  return <>{isMinimal ? minimalHeader : fullHeader}</>;
}
