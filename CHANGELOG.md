# Changelog

## [1.0.0] - 2026-10-04

### 🚀 Novas Funcionalidades
- **Geração Inteligente de Daily**: Geração de relatórios Daily Scrum e Resumo Executivo a partir de commits do Azure DevOps e registros de tempo do OptSolv Time Tracker via Hugging Face (`Qwen2.5-Coder-7B-Instruct` com fallback para `Llama-3.1-8B-Instruct`).
- **Autenticação Moderna**: Sistema de contas com Better Auth suportando login com 1 clique via **GitHub OAuth** e **Email/Senha**.
- **Banco de Dados em Nuvem (Turso / libSQL)**: Persistência serverless com Drizzle ORM, com fallback automático para SQLite local (`file:local.db`).
- **Cofre em Nuvem Criptografado (AES-256-GCM)**: PATs do Azure DevOps e tokens do OptSolv encriptados no servidor com vetor de inicialização (IV) e tag de autenticação únicos antes do armazenamento.
- **Histórico Pessoal de Dailies**: Painel lateral dedicado com busca por texto, filtros por período/formato, pré-visualização em Markdown, cópia para clipboard e exclusão.
- **Hospedagem Serverless na Vercel**: Configuração completa em produção ativa em [Auto Daily](https://auto-daily-app.vercel.app/).
- **Interface e Acessibilidade**: Barra lateral retrátil com atalho (`Ctrl+B`), temas claro/escuro via `next-themes`, componentes Radix UI e notificações com Sonner.

### 🛡️ Qualidade e Segurança
- Validação estrita de contratos de dados com Zod e TypeScript 5.
- Formatação e linting automatizados com Biome 2.5.
- Higienização de mensagens de erro para prevenir vazamento de credenciais.
- Proteção de tempo limite (`maxDuration = 60s`) para rotas serverless de IA.
