import Image from "next/image";
import type { CSSProperties } from "react";

interface OptSolvLogoProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function OptSolvLogo({ size = 20, className, style }: OptSolvLogoProps) {
  const iconSize = Math.round(size * 0.6);
  const borderRadius = Math.max(4, Math.round(size * 0.3));

  return (
    <div
      role="img"
      aria-label="OptSolv Time Tracker"
      className={className}
      style={{
        background: "var(--brand, #f97316)",
        borderRadius: `${borderRadius}px`,
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(249,115,22,0.3)",
        flexShrink: 0,
        ...style,
      }}
    >
      <Image
        src="/logo-white.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        style={{ display: "block" }}
        unoptimized
      />
    </div>
  );
}
