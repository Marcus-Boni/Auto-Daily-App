import Image from "next/image";
import type * as React from "react";
import { cn } from "@/lib/utils";

export type ProviderType = "azure" | "optsolv";
export type ProviderLogoSize = "xs" | "sm" | "md" | "lg";

export interface ProviderLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  provider: ProviderType;
  size?: ProviderLogoSize;
}

const SIZE_CONFIG = {
  xs: {
    container: "size-4.5 rounded-[4px]",
    imgAzure: 13,
    imgOptsolv: 11,
  },
  sm: {
    container: "size-5.5 rounded-[6px]",
    imgAzure: 16,
    imgOptsolv: 14,
  },
  md: {
    container: "size-8 rounded-lg",
    imgAzure: 22,
    imgOptsolv: 20,
  },
  lg: {
    container: "size-10 rounded-xl",
    imgAzure: 28,
    imgOptsolv: 24,
  },
} as const;

export function ProviderLogo({
  provider,
  size = "md",
  className,
  style,
  ...props
}: ProviderLogoProps) {
  const config = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  if (provider === "optsolv") {
    return (
      <div
        data-slot="provider-logo"
        data-provider="optsolv"
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden transition-shadow select-none",
          config.container,
          className
        )}
        style={{
          background: "var(--brand, #f97316)",
          boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)",
          ...style,
        }}
        {...props}
      >
        <Image
          src="/logo-optsolv-white.svg"
          alt="OptSolv Time Tracker"
          width={config.imgOptsolv}
          height={config.imgOptsolv}
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      data-slot="provider-logo"
      data-provider="azure"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border transition-shadow select-none",
        config.container,
        className
      )}
      style={{
        background: "rgba(0, 120, 215, 0.08)",
        borderColor: "rgba(0, 120, 215, 0.2)",
        boxShadow: "0 2px 8px rgba(0, 120, 215, 0.15)",
        ...style,
      }}
      {...props}
    >
      <Image
        src="/azure-devops-logo.svg"
        alt="Azure DevOps"
        width={config.imgAzure}
        height={config.imgAzure}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}
