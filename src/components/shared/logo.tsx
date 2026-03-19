import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  href?: string;
}

const sizes = {
  sm: { full: 32, icon: 28 },
  md: { full: 40, icon: 36 },
  lg: { full: 56, icon: 48 },
} as const;

// Aspect ratios from extracted assets
const FULL_ASPECT = 1111 / 300; // logo-full-light.png
const ICON_ASPECT = 366 / 300; // logo-icon-light.png

export function Logo({ size = "md", variant = "full", href = "/" }: LogoProps) {
  const height = sizes[size][variant];
  const width = Math.round(height * (variant === "full" ? FULL_ASPECT : ICON_ASPECT));
  const src = variant === "full" ? "/logo-full-light.png" : "/logo-icon-light.png";

  return (
    <Link href={href} className="flex shrink-0 items-center">
      <Image
        src={src}
        alt="kaamdha"
        width={width}
        height={height}
        priority
      />
    </Link>
  );
}
