"use client";

import { BookOpen, Code2, FileText, Github, Plug } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { GenerationAction } from "@/components/daily/generation-controls";
import { DailyGenerator } from "@/components/daily-generator";
import { GuidePanel } from "@/components/guide-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyGeneration } from "@/hooks/use-daily-generation";
import { useUserConfig } from "@/hooks/use-user-config";
import brand from "@/lib/brand.json";

type View = "daily" | "integrations" | "guide";
const navigation = [
  { id: "daily", label: "Daily", icon: FileText },
  { id: "integrations", label: "Integrações", icon: Plug },
  { id: "guide", label: "Guia", icon: BookOpen },
] as const;

export function AppShell() {
  const { isHydrated } = useUserConfig();
  if (!isHydrated)
    return (
      <div className="app-loading" role="status" aria-label="Carregando suas preferências">
        <BrandLogo />
        <Skeleton className="mt-12 h-10 w-80 max-w-full" />
        <Skeleton className="mt-8 h-80 w-full" />
      </div>
    );
  return <AppWorkspace />;
}

function AppWorkspace() {
  const daily = useDailyGeneration();
  const { validation } = useUserConfig();
  const [view, setView] = useState<View>("daily");
  const main = useRef<HTMLElement>(null);
  const navigate = (next: View) => {
    if (next === "daily" && !daily.state.options.azure && !daily.state.options.optsolv)
      daily.updateOptions({
        azure: validation.hasAzureConfig,
        optsolv: validation.hasOptsolvConfig,
      });
    setView(next);
    if (window.location.hash !== `#${next}`) window.history.pushState(null, "", `#${next}`);
    requestAnimationFrame(() => {
      const heading = main.current?.querySelector<HTMLElement>(`#${next} h1`);
      heading?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  };
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "daily" || hash === "integrations" || hash === "guide") setView(hash);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Ir para o conteúdo
      </a>
      <header className="app-header">
        <button
          type="button"
          className="brand"
          onClick={() => navigate("daily")}
          aria-label={`${brand.name}, início`}
        >
          <BrandLogo decorative />
        </button>
        <span className="header-separator" aria-hidden="true" />
        <span className="product-label">{brand.tagline}</span>
        <div className="header-actions">
          <ThemeToggle />
          <a
            className="icon-button"
            href="https://github.com/Marcus-Boni/Auto-Daily-App"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Repositório no GitHub"
          >
            <Github aria-hidden="true" />
            <span className="sr-only">Repositório no GitHub</span>
          </a>
        </div>
      </header>
      <div className="app-layout">
        <aside className="sidebar">
          <nav aria-label="Principal">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="nav-item"
                aria-current={view === item.id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(item.id);
                }}
              >
                <item.icon aria-hidden="true" />
                {item.label}
              </a>
            ))}
          </nav>
          <div className="sidebar-note">
            <p>Do registro ao relato.</p>
            <span>
              Reúna as fontes.
              <br />
              Revise com contexto.
              <br />
              Compartilhe com clareza.
            </span>
          </div>
          <div className="sidebar-bottom">
            <Code2 aria-hidden="true" />
            <span>Código e documentação</span>
          </div>
        </aside>
        <main id="main" className="app-main" ref={main} tabIndex={-1}>
          <section
            id="daily"
            className="view"
            hidden={view !== "daily"}
            aria-labelledby="daily-heading"
          >
            <div className="page-heading">
              <div>
                <h1 id="daily-heading" tabIndex={-1}>
                  Prepare sua daily.
                </h1>
                <p>Transforme os registros do seu trabalho em um relato que faz sentido.</p>
              </div>
              <div className="desktop-generation">
                <GenerationAction daily={daily} />
              </div>
            </div>
            <DailyGenerator daily={daily} onNavigate={navigate} />
          </section>
          <section
            id="integrations"
            className="view"
            hidden={view !== "integrations"}
            aria-labelledby="integrations-heading"
          >
            <SettingsPanel
              onNavigate={navigate}
              onResetPreferences={() =>
                daily.updateOptions({
                  azure: validation.hasAzureConfig,
                  optsolv: validation.hasOptsolvConfig,
                  period: "24h",
                  reportFormat: "standard",
                  customPrompt: "",
                })
              }
            />
          </section>
          <section
            id="guide"
            className="view"
            hidden={view !== "guide"}
            aria-labelledby="guide-heading"
          >
            <GuidePanel onNavigate={navigate} />
          </section>
        </main>
      </div>
    </>
  );
}
