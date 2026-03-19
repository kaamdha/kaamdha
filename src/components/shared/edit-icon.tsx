/* eslint-disable @next/next/no-img-element */
interface EditIconProps {
  className?: string;
}

export function EditIcon({ className = "size-3.5" }: EditIconProps) {
  return (
    <img
      src="/icons/edit.png"
      alt="Edit"
      className={className}
    />
  );
}
