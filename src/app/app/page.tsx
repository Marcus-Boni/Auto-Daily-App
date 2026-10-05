import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import brand from "@/lib/brand.json";
import { getLatestReleaseNotes } from "@/lib/changelog";

export const metadata: Metadata = {
  title: `Prepare sua daily | ${brand.name}`,
  alternates: { canonical: "/app" },
};

// Estática: o CHANGELOG.md é lido no build e as notas da versão vão no HTML.
export const dynamic = "force-static";

export default function AppPage() {
  return <AppShell releaseNotes={getLatestReleaseNotes()} />;
}
