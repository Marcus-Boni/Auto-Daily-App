"use client";

import {
  BookOpen,
  Code2,
  FileText,
  Github,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { BrandLogo } from "@/components/brand-logo";
import { GenerationAction } from "@/components/daily/generation-controls";
import { DailyGenerator } from "@/components/daily-generator";
import { GuidePanel } from "@/components/guide-panel";
import { HistoryPanel } from "@/components/history-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDailyGeneration } from "@/hooks/use-daily-generation";
import { useUserConfig } from "@/hooks/use-user-config";
import brand from "@/lib/brand.json";

type View = "daily" | "history" | "integrations" | "guide";
const navigation = [
  { id: "daily", label: "Daily", icon: FileText },
  { id: "history", label: "Histórico", icon: History },
  { id: "integrations", label: "Integrações", icon: Plug },
  { id: "guide", label: "Guia", icon: BookOpen },
] as const;

interface NavTooltipProps {
  label: string;
  isCollapsed: boolean;
  children: React.ReactNode;
  shortcut?: string;
}

function NavTooltip({ label, isCollapsed, children, shortcut }: NavTooltipProps) {
  if (!isCollapsed) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="rounded bg-background/20 px-1 py-0.5 font-mono text-[10px] text-inherit">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("auto-daily-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const main = useRef<HTMLElement>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("auto-daily-sidebar-collapsed", String(next));
      } catch {
        // Safe fallback for restricted environments
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

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
      if (hash === "daily" || hash === "history" || hash === "integrations" || hash === "guide") {
        setView(hash);
      }
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
    <TooltipProvider delayDuration={70} skipDelayDuration={250}>
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
          <UserMenu />
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              Ver repositório no GitHub
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
      <div className="app-layout" data-sidebar-collapsed={isSidebarCollapsed ? "true" : "false"}>
        <aside
          className="sidebar"
          data-collapsed={isSidebarCollapsed ? "true" : "false"}
          aria-label="Navegação lateral"
        >
          <div className="sidebar-header">
            {!isSidebarCollapsed && <span className="sidebar-section-title">Menu</span>}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="sidebar-toggle-btn"
                  onClick={toggleSidebar}
                  aria-label={
                    isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"
                  }
                  aria-expanded={!isSidebarCollapsed}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen aria-hidden="true" />
                  ) : (
                    <PanelLeftClose aria-hidden="true" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side={isSidebarCollapsed ? "right" : "bottom"}
                sideOffset={isSidebarCollapsed ? 12 : 8}
                className="flex items-center gap-2"
              >
                <span>
                  {isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
                </span>
                <kbd className="rounded bg-background/20 px-1 py-0.5 font-mono text-[10px] text-inherit">
                  Ctrl+B
                </kbd>
              </TooltipContent>
            </Tooltip>
          </div>
          <nav aria-label="Principal">
            {navigation.map((item) => (
              <NavTooltip key={item.id} label={item.label} isCollapsed={isSidebarCollapsed}>
                <a
                  href={`#${item.id}`}
                  className="nav-item"
                  aria-current={view === item.id ? "page" : undefined}
                  title={isSidebarCollapsed ? undefined : item.label}
                  aria-label={item.label}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(item.id);
                  }}
                >
                  <item.icon className="nav-icon" aria-hidden="true" />
                  <span className="nav-label">{item.label}</span>
                </a>
              </NavTooltip>
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
          <NavTooltip label="Código e documentação" isCollapsed={isSidebarCollapsed}>
            <div className="sidebar-bottom" tabIndex={isSidebarCollapsed ? 0 : undefined}>
              <Code2 aria-hidden="true" />
              <span className="sidebar-bottom-label">Código e documentação</span>
            </div>
          </NavTooltip>
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
            id="history"
            className="view"
            hidden={view !== "history"}
            aria-labelledby="history-heading"
          >
            <HistoryPanel />
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
    </TooltipProvider>
  );
}
