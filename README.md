<div align="center">
  <img src="public/favicon.svg" alt="Auto Daily Logo" width="80" height="80" />
  
  # Auto Daily App
  
  **Gerador inteligente de relatórios de Daily Scrum com IA**
  
  Automatize suas dailies integrando Azure DevOps, Harvest e Google Gemini AI.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Começar](#-começando) •
[Funcionalidades](#-funcionalidades) •
[Configuração](#%EF%B8%8F-configuração) •
[Como Usar](#-como-usar) •
[Tecnologias](#-tecnologias)

</div>

---

## 📋 Sobre

O **Auto Daily App** é uma ferramenta profissional que automatiza a criação de relatórios de Daily Scrum. Ele coleta automaticamente seus commits do Azure DevOps e suas entradas de tempo do Harvest, e utiliza o Google Gemini AI para gerar relatórios estruturados e prontos para compartilhar.

### ✨ Por que usar?

- ⏱️ **Economize tempo** - Não perca mais 5-10 minutos escrevendo sua daily manualmente
- 🎯 **Precisão** - Baseado em dados reais dos seus commits e timesheet
- 🤖 **Inteligência** - IA que entende contexto e formata profissionalmente
- 🔒 **Privacidade** - Suas credenciais ficam apenas no seu navegador

---

## 🚀 Funcionalidades

- **📊 Integração Azure DevOps** - Busca automática de commits por período
- **⏰ Integração Harvest** - Importa entradas de tempo automaticamente
- **🤖 Geração com IA** - Google Gemini AI para relatórios inteligentes
- **📅 Períodos flexíveis** - Suporte para dailies de 24h até 30 dias
- **📝 Formatos de relatório** - Padrão (O que fiz/Vou fazer/Impedimentos) ou Executivo
- **🌓 Modo escuro** - Interface adaptável com suporte a tema claro/escuro
- **💾 Persistência local** - Configurações salvas no navegador
- **📱 Responsivo** - Funciona em desktop e mobile

---

## 🛠️ Tecnologias

| Categoria       | Tecnologia                                                                  |
| --------------- | --------------------------------------------------------------------------- |
| **Framework**   | [Next.js 16](https://nextjs.org/) (App Router)                              |
| **Linguagem**   | [TypeScript 5](https://www.typescriptlang.org/)                             |
| **Estilização** | [Tailwind CSS 4](https://tailwindcss.com/)                                  |
| **Componentes** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Estado**      | [Zustand](https://zustand-demo.pmnd.rs/)                                    |
| **IA**          | [Google Gemini AI](https://ai.google.dev/)                                  |
| **Ícones**      | [Lucide React](https://lucide.dev/)                                         |
| **Validação**   | [Zod](https://zod.dev/)                                                     |
| **Linting**     | [Biome](https://biomejs.dev/)                                               |

---

## 📦 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18.17 ou superior
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/) ou [bun](https://bun.sh/)
- Conta no Azure DevOps (opcional)
- Conta no Harvest (opcional)

### Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/Marcus-Boni/Auto-Daily-App.git
   cd Auto-Daily-App
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env.local
   ```

   Edite o arquivo `.env.local`:

   ```env
   GEMINI_API_KEY=sua_chave_gemini_aqui
   ```

4. **Execute o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**

   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## ⚙️ Configuração

### Google Gemini API Key

A chave da API do Gemini deve ser configurada no servidor (`.env.local`):

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Crie uma nova API Key
3. Adicione ao arquivo `.env.local`

### Azure DevOps (Opcional)

Na aba **Configurações** do app, você precisará informar:

| Campo                     | Descrição                                     |
| ------------------------- | --------------------------------------------- |
| **Organization**          | Nome da sua organização (ex: `minha-empresa`) |
| **Project**               | Nome do projeto Azure DevOps                  |
| **Repository**            | Nome do repositório                           |
| **Personal Access Token** | Token com permissão de leitura de código      |

<details>
<summary>📖 Como criar um Personal Access Token (PAT)</summary>

1. Acesse `https://dev.azure.com/{sua-org}/_usersSettings/tokens`
2. Clique em **"New Token"**
3. Dê um nome (ex: "Auto Daily App")
4. Em **Scopes**, selecione:
   - `Code` → **Read**
5. Clique em **"Create"** e copie o token gerado

</details>

### Harvest (Opcional)

Na aba **Configurações** do app, você precisará informar:

| Campo            | Descrição                        |
| ---------------- | -------------------------------- |
| **Account ID**   | ID numérico da sua conta Harvest |
| **Access Token** | Token de acesso pessoal          |

<details>
<summary>📖 Como obter credenciais do Harvest</summary>

1. Acesse [Harvest Developers](https://id.getharvest.com/developers)
2. Clique em **"Create New Personal Access Token"**
3. Dê um nome ao token (ex: "Auto Daily App")
4. Copie o **Access Token** e o **Account ID**

</details>

---

## 💡 Como Usar

1. **Configure suas credenciais** na aba "Configurações"
2. **Selecione o modo de geração**:
   - 🔷 **Azure DevOps** - Baseado em commits
   - 🟠 **Harvest** - Baseado em time entries
   - 🟢 **Combinado** - Usa ambas as fontes
3. **Escolha o período** (24h, 48h, 72h, 1 semana, etc.)
4. **Selecione o formato** do relatório (Padrão ou Executivo)
5. **Clique em "Gerar Daily"** e aguarde a mágica acontecer ✨
6. **Copie o resultado** e compartilhe com sua equipe!

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── azure/         # Proxy para Azure DevOps API
│   │   ├── generate/      # Geração de daily com Gemini
│   │   └── harvest/       # Proxy para Harvest API
│   ├── globals.css        # Estilos globais + tema
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página principal
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── app-shell.tsx      # Shell principal da aplicação
│   ├── daily-generator.tsx # Componente de geração
│   ├── settings-panel.tsx  # Painel de configurações
│   └── theme-toggle.tsx    # Toggle de tema claro/escuro
├── hooks/
│   └── use-user-config.ts  # Hook de configuração do usuário
├── lib/
│   ├── constants.ts        # Constantes e prompts
│   └── utils.ts            # Utilitários
└── types/
    └── index.ts            # Definições de tipos
```

---

## 🔒 Segurança

- ✅ **Credenciais no cliente** - Tokens são armazenados apenas no localStorage do navegador
- ✅ **Sem banco de dados** - Aplicação 100% stateless no servidor
- ✅ **Headers seguros** - Credenciais são enviadas via HTTP headers, nunca no body
- ✅ **API Routes como proxy** - Backend age como intermediário para evitar CORS

---

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build de produção
npm run start        # Inicia servidor de produção

# Qualidade de código
npm run lint         # Executa linting com Biome
npm run format       # Formata código com Biome
npm run check        # Lint + Format em um comando
npm run type-check   # Verifica tipos TypeScript
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Marcus Boni**

- GitHub: [@Marcus-Boni](https://github.com/Marcus-Boni)

---

<div align="center">
  
  ⭐ Se este projeto te ajudou, considere dar uma estrela!
  
  Feito com ❤️ e ☕ por [Marcus Boni](https://github.com/Marcus-Boni)

</div>
