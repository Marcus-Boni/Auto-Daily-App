import type { ModeOption, PeriodOption } from "@/types";

/**
 * Available time periods for data fetching.
 */
export const TIME_PERIODS: PeriodOption[] = [
  {
    value: "24h",
    label: "Últimas 24 horas",
    description: "Ideal para daily diário",
    hours: 24,
    icon: "⚡",
  },
  {
    value: "48h",
    label: "Últimas 48 horas",
    description: "Inclui ontem e hoje",
    hours: 48,
    icon: "📅",
  },
  {
    value: "72h",
    label: "Últimas 72 horas",
    description: "Útil após fim de semana",
    hours: 72,
    icon: "🗓️",
  },
  {
    value: "7d",
    label: "Última semana",
    description: "Resumo semanal",
    hours: 168,
    icon: "📊",
  },
  {
    value: "14d",
    label: "Últimas 2 semanas",
    description: "Visão de sprint",
    hours: 336,
    icon: "🏃",
  },
  {
    value: "30d",
    label: "Último mês",
    description: "Relatório mensal",
    hours: 720,
    icon: "📈",
  },
];

/**
 * Available generation modes with labels and descriptions.
 */
export const GENERATION_MODES: ModeOption[] = [
  {
    value: "azure-only",
    label: "Apenas Azure DevOps",
    description: "Gera o daily baseado apenas nos commits do Azure DevOps",
    requiresAzure: true,
    requiresHarvest: false,
  },
  {
    value: "harvest-only",
    label: "Apenas Harvest",
    description: "Gera o daily baseado apenas nos registros de tempo do Harvest",
    requiresAzure: false,
    requiresHarvest: true,
  },
  {
    value: "combined-auto",
    label: "Combinado (Automático)",
    description: "Combina dados do Azure DevOps e Harvest com prompt padrão",
    requiresAzure: true,
    requiresHarvest: true,
  },
  {
    value: "combined-custom",
    label: "Combinado (Customizado)",
    description: "Combina dados do Azure DevOps e Harvest com prompt personalizado",
    requiresAzure: true,
    requiresHarvest: true,
  },
];

/**
 * LocalStorage key for user configuration.
 */
export const STORAGE_KEY = "auto-daily-config";

/**
 * API endpoints.
 */
export const API_ENDPOINTS = {
  generate: "/api/generate",
  azure: "/api/azure",
  harvest: "/api/harvest",
} as const;

/**
 * Generates dynamic prompt based on the selected period.
 * Adjusts the language and context based on timeframe.
 */
export function generateDailyPrompt(periodHours: number): string {
  // Determine the appropriate time context based on period
  const getTimeContext = (): {
    timeDescription: string;
    reportType: string;
    focusAreas: string;
  } => {
    if (periodHours <= 24) {
      return {
        timeDescription: "nas últimas 24 horas",
        reportType: "Daily Scrum diário",
        focusAreas: "Foque nas atividades do dia e próximos passos imediatos.",
      };
    }
    if (periodHours <= 48) {
      return {
        timeDescription: "nos últimos 2 dias",
        reportType: "Daily Scrum",
        focusAreas: "Agrupe atividades por dia quando possível.",
      };
    }
    if (periodHours <= 72) {
      return {
        timeDescription: "nos últimos 3 dias",
        reportType: "Daily Scrum pós fim de semana",
        focusAreas: "Ideal para resumir atividades após um período de pausa. Agrupe por dia.",
      };
    }
    if (periodHours <= 168) {
      return {
        timeDescription: "na última semana",
        reportType: "Resumo Semanal",
        focusAreas: "Organize por áreas de trabalho ou projetos. Destaque marcos importantes.",
      };
    }
    if (periodHours <= 336) {
      return {
        timeDescription: "nas últimas 2 semanas",
        reportType: "Resumo de Sprint",
        focusAreas: "Foque em entregas, progresso de features e métricas de produtividade.",
      };
    }
    return {
      timeDescription: "no último mês",
      reportType: "Relatório Mensal",
      focusAreas: "Apresente uma visão executiva com principais conquistas e métricas.",
    };
  };

  const { timeDescription, reportType, focusAreas } = getTimeContext();

  // Dynamic section headers based on period
  const getSectionHeaders = (): { done: string; next: string; blockers: string } => {
    if (periodHours <= 48) {
      return {
        done: "🎯 O que fiz",
        next: "📋 O que vou fazer",
        blockers: "🚧 Impedimentos",
      };
    }
    if (periodHours <= 168) {
      return {
        done: "🎯 O que foi realizado",
        next: "📋 Próximos passos",
        blockers: "🚧 Impedimentos e riscos",
      };
    }
    return {
      done: "🎯 Principais conquistas",
      next: "📋 Planejamento",
      blockers: "🚧 Desafios e pontos de atenção",
    };
  };

  const sections = getSectionHeaders();

  return `
Você é um assistente que ajuda desenvolvedores a criar relatórios de ${reportType}.
Com base nos dados fornecidos ${timeDescription}, gere um relatório profissional e conciso em português brasileiro.

${focusAreas}

O relatório deve conter 3 seções:

## ${sections.done}
- Liste as atividades realizadas de forma clara e objetiva
- Agrupe commits relacionados quando possível
- Mencione o tempo gasto em cada atividade principal (se disponível)
${periodHours > 48 ? "- Organize cronologicamente ou por projeto/área" : ""}

## ${sections.next}
- Sugira próximos passos lógicos baseados nas atividades realizadas
- Seja específico mas não invente tarefas
${periodHours > 168 ? "- Inclua metas e objetivos para o próximo período" : ""}

## ${sections.blockers}
- Liste possíveis impedimentos ou bloqueios identificados
- Se não houver impedimentos aparentes, indique "Nenhum impedimento no momento"
${periodHours > 168 ? "- Inclua riscos potenciais identificados" : ""}

Mantenha o tom profissional e objetivo. Use bullet points para facilitar a leitura.
${periodHours > 168 ? "Inclua um breve resumo executivo no início." : ""}
`;
}

/**
 * Default prompt for AI generation (legacy - for backward compatibility).
 * @deprecated Use generateDailyPrompt(periodHours) instead
 */
export const DEFAULT_DAILY_PROMPT = generateDailyPrompt(24);

/**
 * Tutorial texts for configuration help.
 */
export const TUTORIALS = {
  azurePat: {
    title: "Como obter o Personal Access Token (PAT) do Azure DevOps",
    steps: [
      "Acesse o Azure DevOps (https://dev.azure.com)",
      "Clique no ícone do seu perfil no canto superior direito",
      "Selecione 'Personal access tokens'",
      "Clique em '+ New Token'",
      "Dê um nome ao token (ex: 'Auto Daily App')",
      "Defina a expiração (recomendado: 90 dias)",
      "Em 'Scopes', selecione:",
      "  • Code: Read",
      "  • Work Items: Read",
      "Clique em 'Create' e copie o token gerado",
    ],
    warning: "⚠️ Guarde o token em local seguro. Ele não será exibido novamente!",
  },
  azureOrganization: {
    title: "Onde encontrar o nome da Organização",
    steps: [
      "A organização é a primeira parte da URL do Azure DevOps",
      "Exemplo: https://dev.azure.com/SUA-ORGANIZACAO/...",
      "Copie apenas o nome, sem a URL completa",
    ],
  },
  azureProject: {
    title: "Onde encontrar o nome do Projeto",
    steps: [
      "O projeto aparece na URL após a organização",
      "Exemplo: https://dev.azure.com/org/SEU-PROJETO/...",
      "Ou veja no menu lateral do Azure DevOps",
    ],
  },
  azureRepository: {
    title: "Onde encontrar o ID do Repositório",
    steps: [
      "Acesse Repos > Files no Azure DevOps",
      "O nome do repositório aparece no topo",
      "Use o nome exato do repositório",
    ],
  },
  harvestToken: {
    title: "Como obter o Token do Harvest",
    steps: [
      "Acesse https://id.getharvest.com/developers",
      "Faça login na sua conta Harvest",
      "Clique em 'Create New Personal Access Token'",
      "Dê um nome ao token (ex: 'Auto Daily App')",
      "Copie o 'Your Token' gerado",
      "Copie também o 'Account ID' exibido",
    ],
    warning: "⚠️ Anote o Account ID junto com o Token!",
  },
  geminiApiKey: {
    title: "Como obter a API Key do Google Gemini",
    steps: [
      "Acesse https://aistudio.google.com/app/apikey",
      "Faça login com sua conta Google",
      "Clique em 'Create API Key'",
      "Selecione ou crie um projeto do Google Cloud",
      "Copie a API Key gerada",
    ],
    warning: "⚠️ A API Key é gratuita com limites generosos. Mantenha-a segura!",
  },
} as const;
