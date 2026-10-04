# Auto Daily: sistema visual

Implementação: **Clareza de trabalho**. Aplicativo para operar; guia para compreender. Documento principal, preparação lateral e fontes sob demanda. A composição foi validada em desktop/mobile, com dados fictícios; não representa homologação de integrações.

## Identidade e linguagem

Nome apresentado: Auto Daily. Marca própria **Daily aberto**, uma letra d com abertura lateral, e assinatura em Geist SemiBold. A identidade está em `public/brand/`; uso, variantes e provas em [docs/brand/README.md](docs/brand/README.md). Lucide continua sendo a família de ícones funcionais, sem emojis ou animação decorativa. Tom direto em português. IA prepara um rascunho; a pessoa revisa e compartilha.

## Tokens

Fonte de verdade: `src/app/globals.css`.

| Papel | Claro | Escuro |
| --- | --- | --- |
| Canvas | `#F5F7F6` | `#131A17` |
| Superfície | `#FFFFFF` | `#1A231E` |
| Superfície secundária | `#EDF1EF` | `#232E27` |
| Texto | `#192820` | `#EAF1EC` |
| Texto secundário | `#58655E` | `#AFBEB4` |
| Ação | `#176344` | `#86D6AD` |
| Texto sobre ação | `#FFFFFF` | `#14261C` |
| Seleção suave | `#E5F2EA` | `#233E2F` |
| Divisória de superfície | `#D8E0DB` | `#3B4C40` |
| Limite de input | `#809184` | `#6A8172` |
| Foco | `#257E59` | `#86D6AD` |
| Erro | `#A53232` | `#FFB1A7` |
| Superfície de erro | `#FFF0EE` | `#3B2624` |
| Atenção / superfície | `#805000` / `#FFF4DC` | `#F2CC82` / `#3A2E18` |

Verde é identidade; vermelho e âmbar descrevem estado. Estado também tem texto/ícone. Limites de controles têm contraste maior que divisórias de superfície. A variante destrutiva possui foreground próprio no tema escuro.

## Tipo, ritmo e componentes

Geist, hospedada via Next/font. Geist Mono para código e editor. Escala em rem: metadados 12 px, controles 13–14 px, leitura 15 px, seções 16–18 px, documento 26 px, página 32 px. Escala de espaço: 4/8/12/16/24/32/48 px. Raios 8 px em controles e 10–12 px em agrupamentos. Bordas organizam; sem halo, glassmorphism ou cartões aninhados como estrutura.

Reutilizar Button/Input/Textarea/Radix existentes. Ações têm alvo mínimo de 44 px. Checkboxes para fontes, radios para formato, labels acima de campos e erro associado. Navbar tem estados consistentes e foco acompanha o título do destino. Controle nativo de disclosure mostra instruções e evidências.

Seletores devem usar exclusivamente o componente `Select` de `src/components/ui/select.tsx` (shadcn/ui sobre Radix). Não implementar selects HTML nativos ou imitações próprias. Preservar label, descrição, estado desabilitado e alvo de toque de 44 px.

## Estrutura e responsive

A aplicação da identidade usa `BrandLogo` para assinatura acessível e `BrandMark` para símbolo isolado. Nome, tagline, descrição, cores de marca e geometria são centralizados em `src/lib/brand.json`; ícones funcionais mantêm Lucide. Assets e manifest são regenerados por `npm run brand:build`, incluindo a imagem de compartilhamento 1200 × 630. `SITE_URL` configura o endereço público dos metadados no build.

Sidebar de 196 px no desktop; preparação de 280–300 px; documento flexível. Conteúdo limitado a 1240 px. Até 900 px a navegação é horizontal; abaixo de 700 px a composição é uma coluna e a geração fica depois dos controles. O mesmo documento e as mesmas opções permanecem ao mudar de área.

Estados de loading, vazio, erro e parcial preservam o texto anterior. Novo resultado editado precisa de aceitação. Metadados pertencem ao resultado, não à seleção atual. O contraste de tokens e o reflow foram verificados; isso não substitui auditoria completa de conformidade WCAG ou testes com usuários.

## Movimento e extensão

Transições curtas dos controles; animações e transições desativadas com movimento reduzido. Conteúdo visível sem entrada coreografada. Manter scroll nativo, foco explícito, caret e seleção derivados dos tokens.

A futura homepage pode usar a mesma marca com composição mais expressiva. Não adicionar gráficos de produtividade, provas comerciais, integrações ou garantias que o produto ainda não oferece.
