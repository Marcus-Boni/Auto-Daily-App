import brand from "@/lib/brand.json";

export function BrandMark({
  className,
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={brand.viewBox}
      width="32"
      height="32"
      className={className}
      fill="currentColor"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : brand.name}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      {!decorative && <title>{brand.name}</title>}
      <path d={brand.symbolPath} />
    </svg>
  );
}
