/* eslint-disable @next/next/no-img-element */
interface ShareIconProps {
  className?: string;
}

export function ShareIcon({ className = "size-4" }: ShareIconProps) {
  return (
    <img
      src="/icons/share.png"
      alt="Share"
      className={className}
    />
  );
}
