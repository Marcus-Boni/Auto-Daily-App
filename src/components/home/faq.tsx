import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    q: "Preciso usar Azure DevOps e OptSolv juntos?",
    a: "Não. Use uma fonte ou combine as duas. O Azure DevOps fornece commits do repositório e o OptSolv Time Tracker, registros de tempo.",
  },
  {
    q: "O Auto Daily lê work items do Azure DevOps?",
    a: "Não. A integração usa commits, limitada aos 100 mais recentes do período. Do OptSolv, a consulta traz a primeira página de até 200 registros.",
  },
  {
    q: "Onde ficam meus tokens?",
    a: "Por padrão, só na memória da página: recarregar descarta tudo. Você pode optar por lembrar neste dispositivo, sem criptografia, ou entrar com uma conta e guardar no cofre criptografado.",
  },
  {
    q: "O que é enviado para a IA?",
    a: "O contexto das atividades consultadas e as instruções adicionais que você escrever vão para o modelo configurado na Hugging Face. As credenciais servem para consultar as fontes.",
  },
  {
    q: "A IA pode errar?",
    a: "Pode omitir contexto ou interpretar mal um registro. Por isso o rascunho mostra as fontes usadas, marca o que não está nos dados e só sai do app quando você copia.",
  },
  {
    q: "Posso hospedar minha própria instância?",
    a: "Sim. O projeto é MIT e roda com Node.js 20.9 ou superior. O README descreve variáveis de ambiente, banco local e deploy.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-border">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-[clamp(88px,12vw,160px)] md:px-8 lg:grid-cols-12">
        <h2
          id="faq-title"
          className="text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.04] font-semibold tracking-[-0.032em] lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
        >
          Perguntas frequentes
        </h2>
        <div className="lg:col-span-8">
          <Accordion type="single" collapsible className="faq border-t border-border">
            {questions.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="min-h-[72px] items-center py-5 text-[1.0625rem] font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-[62ch] pb-6 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
