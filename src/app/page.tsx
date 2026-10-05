import { Closing, HomeFooter } from "@/components/home/closing";
import { Countdown } from "@/components/home/countdown";
import { DataFlow } from "@/components/home/data-flow";
import { Faq } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { HomeNav } from "@/components/home/home-nav";
import { HomeProviders } from "@/components/home/home-providers";
import { IntegrationsStrip } from "@/components/home/integrations-strip";
import { OpenSource } from "@/components/home/open-source";
import { Principles } from "@/components/home/principles";

export default function Home() {
  return (
    <HomeProviders>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <HomeNav />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        <IntegrationsStrip />
        <Countdown />
        <Principles />
        <DataFlow />
        <OpenSource />
        <Faq />
        <Closing />
      </main>
      <HomeFooter />
    </HomeProviders>
  );
}
