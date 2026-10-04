# Auto Daily

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Transformar registros de trabalho em rascunhos de relatórios de daily e resumos executivos, com cópia manual do resultado. Esta descrição corresponde ao código inspecionado em 3 de outubro de 2026.

## Users

O código e o README atendem desenvolvedores que usam Azure DevOps e/ou OptSolv Time Tracker. A priorização de outros perfis ainda está aberta; não pressupor funções administrativas, organizações multiusuário ou cobrança.

## Operating Context

A aplicação consulta commits do Azure DevOps e registros de tempo do OptSolv através de rotas próprias. Hugging Face processa o contexto para gerar o relatório. O usuário configura fontes, período e formato, gera um texto e o copia.

## Capabilities and Constraints

- Quatro modos de geração: Azure, OptSolv, combinado automático e combinado personalizado.
- Seis janelas móveis: 24, 48 e 72 horas; 7, 14 e 30 dias.
- Dois formatos: padrão de daily e relatório profissional.
- Resultado em Markdown, com dados das fontes na resposta da geração.
- Configuração persistida no navegador com Zustand; tema claro, escuro ou do sistema.
- Editor Markdown, teste de conexão, preservação do rascunho e escolha antes de substituir edições estão implementados. Histórico, seleção individual de evidências antes da geração e modo de demonstração no produto ficam como evoluções futuras.
- O fluxo inspecionado do Azure usa commits; não anunciar suporte a work items.
- Credenciais ficam na memória da página por padrão; retenção local exige opt-in. Dados antigos sem consentimento não restauram tokens. O aplicativo tolera armazenamento indisponível e informa o estado. Não apresentar armazenamento local como garantia de segurança.

## Brand Commitments

O usuário solicitou e aprovou a direção completa, criativa, moderna e profissional para preparar o projeto para open source e uma futura homepage. O sistema implementado está em `DESIGN.md`; a proposta histórica e as evidências estão em `docs/redesign/`.

Nome apresentado: **Auto Daily**. O repositório continua **Auto-Daily-App**. A identidade usa o símbolo próprio **Daily aberto**, com assinatura em Geist SemiBold e variantes em `public/brand/`. Lucide permanece nos ícones funcionais. Mudanças futuras de marca não são autorização para renomear o repositório.

## Evidence on Hand

Código em `src/`, README, assets em `public/` e licença do projeto. Não foram fornecidos depoimentos, números de adoção, benchmarks ou provas de impacto. Dados do conceito visual são explicitamente fictícios.

## Product Principles

- Preservar o trabalho do usuário durante navegação e recuperação de falhas.
- Distinguir dados encontrados, inferências da IA e confirmação humana.
- Mostrar estados de integração com base em evidência, não só em campos preenchidos.
- Compartilhamento continua sendo uma decisão manual do usuário.

## Open Decisions

Retenção de rascunhos além da sessão, futuras integrações, suporte multilíngue e identidade definitiva não foram definidos. A homepage será uma etapa posterior. Não transformar essas possibilidades em promessas públicas.
