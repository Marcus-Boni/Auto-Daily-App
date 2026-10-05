import { siHuggingface } from "simple-icons";
import { ProviderLogo } from "@/components/provider-logo";

function HuggingFaceLogo() {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
      style={{ background: `#${siHuggingface.hex}` }}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5 text-[#1f1f1f]"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={siHuggingface.path} />
      </svg>
    </span>
  );
}

const items = [
  {
    logo: <ProviderLogo provider="azure" size="md" aria-hidden="true" />,
    name: "Azure DevOps",
    role: "Commits",
  },
  {
    logo: <ProviderLogo provider="optsolv" size="md" aria-hidden="true" />,
    name: "OptSolv Time Tracker",
    role: "Registros de tempo",
  },
  { logo: <HuggingFaceLogo />, name: "Hugging Face", role: "Geração do rascunho" },
];

export function IntegrationsStrip() {
  return (
    <section aria-label="Integrações" className="mx-auto max-w-[1400px] px-4 md:px-8">
      <div className="flex flex-col gap-6 border-y border-border py-7 lg:flex-row lg:items-center lg:gap-14">
        <p className="text-[0.9375rem] text-muted-foreground lg:max-w-[22ch]">
          Lê de onde você já registra o trabalho.
        </p>
        <ul className="grid gap-5 sm:grid-cols-3 lg:flex lg:flex-1 lg:justify-between">
          {items.map((item) => (
            <li key={item.name} className="flex items-center gap-3">
              {item.logo}
              <span className="leading-tight">
                <span className="block text-[0.9375rem] font-medium">{item.name}</span>
                <span className="block text-[0.8125rem] text-muted-foreground">{item.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
