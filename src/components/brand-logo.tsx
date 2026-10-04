import { BrandMark } from "@/components/brand-mark";
import brand from "@/lib/brand.json";

export function BrandLogo({
  className = "",
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span
      className={`brand-logo ${className}`}
      role="img"
      aria-label={brand.name}
      aria-hidden={decorative || undefined}
    >
      <BrandMark className="brand-mark" decorative />
      <span aria-hidden="true">{brand.name}</span>
    </span>
  );
}
