import type { ModeOption } from "@/types";

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
 * Default prompt for AI generation.
 */
export const DEFAULT_DAILY_PROMPT = `
Você é um assistente que ajuda desenvolvedores a criar relatórios de Daily Scrum (Standup).
Com base nos dados fornecidos, gere um relatório profissional e conciso em português brasileiro.

O relatório deve conter 3 seções:

## 🎯 O que fiz ontem/hoje
- Liste as atividades realizadas de forma clara e objetiva
- Agrupe commits relacionados quando possível
- Mencione o tempo gasto em cada atividade principal (se disponível)

## 📋 O que vou fazer
- Sugira próximos passos lógicos baseados nas atividades realizadas
- Seja específico mas não invente tarefas

## 🚧 Impedimentos
- Liste possíveis impedimentos ou bloqueios identificados
- Se não houver impedimentos aparentes, indique "Nenhum impedimento no momento"

Mantenha o tom profissional e objetivo. Use bullet points para facilitar a leitura.
`;

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
