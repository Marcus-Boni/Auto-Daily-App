import type { DailyResult, ParsedCommit, ParsedTimeEntry } from "@/types";

/*
 * Dados fictícios usados apenas na demonstração da página inicial. Pessoas, projeto
 * e registros são inventados e aparecem rotulados como exemplo na interface.
 */

const PENDING = "Não informado nos dados consultados; revisar antes de compartilhar.";

export const DEMO_COMMITS: ParsedCommit[] = [
  {
    id: "3f9c2a71e8b04d55a1c6f0e2d9b7a4c3e1f58d20",
    message: "feat(checkout): valida CEP antes de calcular o frete",
    author: "Bruno Tavares",
    date: "2026-10-04T16:41:00",
    changes: "+3 ~2",
  },
  {
    id: "a71d0e4c9b3f2a8156e7d4c0b9a2f3e1d6c58b47",
    message: "test(checkout): cobre CEP inválido e CEP sem cobertura",
    author: "Bruno Tavares",
    date: "2026-10-04T17:58:00",
    changes: "+1 ~1",
  },
  {
    id: "c2e8b5f1a9d3047e6b1c8f2a5d9e3b7c0a4f6d18",
    message: "fix(cupom): corrige arredondamento do desconto parcelado",
    author: "Bruno Tavares",
    date: "2026-10-04T11:20:00",
    changes: "~2",
  },
  {
    id: "e4b19c7a2f6d3e8b0a5c1d9f7e2b4a6c8d0f3e59",
    message: "refactor(api): extrai cliente de frete para serviço próprio",
    author: "Bruno Tavares",
    date: "2026-10-04T14:05:00",
    changes: "+2 ~3 -1",
  },
];

export const DEMO_ENTRIES: ParsedTimeEntry[] = [
  {
    id: "te-2041",
    project: "Checkout v2",
    task: "Desenvolvimento",
    hours: 3.5,
    notes: "Validação de CEP e cálculo de frete",
    client: "Loja Aurora",
    date: "2026-10-04",
  },
  {
    id: "te-2042",
    project: "Checkout v2",
    task: "Revisão",
    hours: 1.25,
    notes: "Revisão do PR do cupom de desconto",
    client: "Loja Aurora",
    date: "2026-10-04",
  },
  {
    id: "te-2043",
    project: "Rituais",
    task: "Reunião",
    hours: 0.75,
    notes: "Refinamento da sprint 14",
    client: "Loja Aurora",
    date: "2026-10-04",
  },
];

export const DEMO_DRAFT = `## O que foi realizado
- Implementei a validação de CEP antes do cálculo de frete no checkout, com testes para CEP inválido e sem cobertura.
- Corrigi o arredondamento do desconto em compras parceladas.
- Extraí o cliente de frete para um serviço próprio na API.
- Revisei o PR do cupom de desconto e participei do refinamento da sprint 14 (5,5 h registradas).

## Próximos passos
- ${PENDING}

## Impedimentos
- ${PENDING}`;

export const DEMO_REVIEWED = DEMO_DRAFT.replace(
  `## Próximos passos\n- ${PENDING}`,
  "## Próximos passos\n- Publicar a validação de CEP em homologação e acompanhar o QA."
).replace(
  `## Impedimentos\n- ${PENDING}`,
  "## Impedimentos\n- Aguardando credenciais de homologação da transportadora."
);

export const DEMO_RESULT: DailyResult = {
  content: DEMO_DRAFT,
  // Sem fuso: servidor e navegador interpretam como horário local e exibem o mesmo texto.
  generatedAt: "2026-10-05T09:16:00",
  mode: "combined-auto",
  period: "24h",
  reportFormat: "standard",
  customPrompt: "",
  window: { start: "2026-10-04T09:12:00", end: "2026-10-05T09:12:00" },
  sources: { azure: DEMO_COMMITS, optsolv: DEMO_ENTRIES },
  sourceStatus: {
    azure: { status: "success", count: DEMO_COMMITS.length },
    optsolv: { status: "success", count: DEMO_ENTRIES.length },
  },
};
