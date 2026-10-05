import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import brand from "@/lib/brand.json";

export const metadata: Metadata = {
  title: `Prepare sua daily | ${brand.name}`,
  alternates: { canonical: "/app" },
};

export default function AppPage() {
  return <AppShell />;
}
