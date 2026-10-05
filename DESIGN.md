# Auto Daily: sistema visual

Implementação: **Clareza de trabalho**. Aplicativo para operar; guia para compreender. Documento principal, preparação lateral e fontes sob demanda. A composição foi validada em desktop/mobile, com dados fictícios; não representa homologação de integrações. A página inicial pública (`/`) aplica o mesmo sistema com composição mais expressiva; o aplicativo fica em `/app`.

## Identidade e linguagem

Nome apresentado: Auto Daily. Marca própria **Daily aberto**, uma letra d com abertura lateral, e assinatura em Geist SemiBold. A identidade está em `public/brand/`; uso, variantes e provas em [docs/brand/README.md](docs/brand/README.md). Lucide continua sendo a família de ícones funcionais, sem emojis; ícone só se move para confirmar estado (copiar → copiado). Logos oficiais identificam apenas os serviços integrados (Azure DevOps, OptSolv, Hugging Face). Tom direto em português. IA prepara um rascunho; a pessoa revisa e compartilha.

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
| Campo de marca | `#176344` | `#145A3D` |
| Texto sobre campo | `#F4FBF7` | `#F4FBF7` |
| Texto secundário sobre campo | `#CFE9DA` | `#C4E3D1` |
| Linha sobre campo | `rgb(244 251 247 / 0.2)` | `rgb(244 251 247 / 0.16)` |

Verde é identidade; vermelho e âmbar descrevem estado. Estado também tem texto/ícone. Limites de controles têm contraste maior que divisórias de superfície. A variante destrutiva possui foreground próprio no tema escuro.

**Regra do campo verde.** O campo (`--field`) é a única superfície de cor plena do sistema e pertence à página inicial: atrás do documento no topo, em um cartão dos princípios e na tela inteira das 09:30. O app não o usa. No escuro ele aprofunda em vez de virar menta, porque é superfície, não ação. Sobre o campo, texto em `--field-foreground` (6,9:1 claro; 7,8:1 escuro) e apoio em `--field-muted` (5,6:1; 6,0:1). `--field-line` divide e contorna chips; nunca delimita controle. Botão sobre o campo inverte: fundo `--field-foreground`, texto `--field`.

## Tipo, ritmo e componentes

Geist, hospedada via Next/font. Geist Mono para código, editor, hashes, horas registradas e o trilho de horários. Escala em rem: metadados 12 px, controles 13–14 px, leitura 15 px, seções 16–18 px, documento 26 px, página 32 px. Escala de espaço: 4/8/12/16/24/32/48 px. Raios 8 px em controles e 10–12 px em agrupamentos; 16 px nos campos grandes da página inicial (campo do topo, bento, janela de comandos, bloco das 09:30 fora do palco). Bordas organizam; sem halo, glassmorphism ou cartões aninhados como estrutura.

Na página inicial a escala de exibição é fluida, toda em Geist: relógio Medium com algarismos tabulares (60–112 px no topo, até 288 px às 09:30); título principal 44–76 px; títulos de seção 36–56 px; encerramento até 88 px. Títulos em SemiBold, entrelinha 1–1,04, tracking de −0,032 a −0,038 em. Texto de apoio 17–18 px, entre 36 e 56 caracteres por linha.

**Regra da hora em Geist.** Hora em exibição usa Geist com algarismos tabulares, nunca Geist Mono: o zero cortado do Mono lê como Ø em tamanho grande e os dois pontos abrem um vão largo. O relógio é um odômetro de rolos (`ClockReels`); o HTML do servidor já mostra a hora correta e a animação só move as fitas.

Reutilizar Button/Input/Textarea/Radix existentes. Ações têm alvo mínimo de 44 px; CTAs da página inicial têm 48 px e texto de 15 px. Checkboxes para fontes, radios para formato, labels acima de campos e erro associado. Navbar tem estados consistentes e foco acompanha o título do destino. Controle nativo de disclosure mostra instruções e evidências.

Seletores devem usar exclusivamente o componente `Select` de `src/components/ui/select.tsx` (shadcn/ui sobre Radix). Não implementar selects HTML nativos ou imitações próprias. Preservar label, descrição, estado desabilitado e alvo de toque de 44 px.

## Estrutura e responsive

A aplicação da identidade usa `BrandLogo` para assinatura acessível e `BrandMark` para símbolo isolado. Nome, tagline, descrição, cores de marca e geometria são centralizados em `src/lib/brand.json`; ícones funcionais mantêm Lucide. Assets e manifest são regenerados por `npm run brand:build`, incluindo a imagem de compartilhamento 1200 × 630. `SITE_URL` configura o endereço público dos metadados no build.

O aplicativo vive em `/app`, com áreas em hash (`#daily`, `#history`, `#integrations`, `#guide`); links antigos `/#daily|history|integrations|guide` seguem para `/app#…` no cliente. Sidebar de altura fixa no desktop (`calc(100dvh - 68px)` com sticky), desacoplada da rolagem de telas longas. Suporta expansão (204 px) e recolhimento (64 px), com atalho `Ctrl+B`, transição suave e persistência em `localStorage`. O item ativo é marcado por uma pílula em Seleção suave que desliza entre itens. No modo recolhido, exibe tooltips acessíveis flutuantes via Radix UI com atalhos e nomes das seções. Preparação de 280–300 px; documento flexível; conteúdo limitado a 1240 px. Até 900 px a navegação é horizontal; abaixo de 700 px a composição é uma coluna e a geração fica depois dos controles. O mesmo documento e as mesmas opções permanecem ao mudar de área.

Estados de loading, vazio, erro e parcial preservam o texto anterior. Novo resultado editado precisa de aceitação. Metadados pertencem ao resultado, não à seleção atual. Trechos que as fontes não comprovam (texto padrão "Não informado nos dados consultados") aparecem no documento com marcador âmbar (Atenção sobre sua superfície), para revisão antes de compartilhar. O contraste de tokens e o reflow foram verificados; isso não substitui auditoria completa de conformidade WCAG ou testes com usuários.

## Movimento

Movimento explica estado e ritmo; nunca esconde conteúdo. Uma curva de desaceleração para tudo: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out-expo` no CSS, `EASE_OUT` no Motion, `expo.out` como padrão do GSAP em `src/lib/gsap.ts`). Controles respondem em 0,15–0,2 s, estados em 0,2–0,4 s, entradas em 0,6–1,5 s; desfoque de entrada até 8 px.

Cada ferramenta tem um papel:

- **Lenis** em todo o projeto, no layout raiz, rodando no ticker do GSAP para que rolagem e ScrollTrigger compartilhem o quadro. Pausa quando Dialog ou Select do Radix trava a rolagem. Âncoras passam pelo Lenis; sem JavaScript, âncora nativa.
- **GSAP** (ScrollTrigger, SplitText) para coreografia ligada à rolagem e sequências: entrada do topo da página inicial (linhas do título sob máscara), contagem fixa 09:12 → 09:30, linha do caminho dos dados, giro do símbolo no encerramento e chegada linha a linha de um rascunho novo no documento do app (só quando há novo resultado; edições e troca de modo não repetem).
- **Motion** para estado de interface: troca de área no app (opacidade e 10 px), pílula da navegação ativa, banners de feedback do documento, troca de ícone ao copiar, transição entre escolhas, cabeçalho da página inicial que recolhe ao descer e volta ao subir ou receber foco, atração magnética só com mouse nos CTAs "Abrir o app" do topo e do encerramento. A entrada ao rolar (`Reveal`) fica restrita ao bento de princípios e aos painéis da contagem empilhada.
- **CSS** para microestados: pressão de botão (escala 0,97), pulso do indicador de carregamento, brilho do skeleton, entrada do símbolo no estado vazio.

**Regra do conteúdo visível.** O HTML do servidor já mostra tudo. Entradas só escondem conteúdo com JavaScript ativo (classe `js` no `html`), e o topo tem um fallback CSS que revela tudo em 2,6 s se o GSAP não assumir. `Reveal` só arma elementos ainda abaixo da dobra.

**Regra do movimento reduzido.** Com movimento reduzido não há palco fixo (a contagem vira pilha), entrada do topo, scrub nem atração magnética; o Lenis acompanha o dispositivo 1:1; animações e transições CSS são desligadas e o Motion segue `reducedMotion="user"`.

**Regra das duas piscadas.** Nada pisca por mais de 5 s: os dois pontos do relógio piscam dois ciclos e param. Indicadores contínuos (carregamento, skeleton) existem só enquanto o estado dura.

Manter foco explícito, caret e seleção derivados dos tokens.

## Página inicial

Composição, sequência e narrativa ficam no brief da superfície (`.impeccable/surfaces/src-app-page-tsx.md`); aqui ficam as regras reutilizáveis.

Componentes reais do app são a imagem: documento, fontes, seletores, editor e evidências aparecem funcionando, nunca como captura estática. Dados de demonstração são fictícios e sempre rotulados ("Exemplo com dados fictícios"). Grade de 12 colunas até 1400 px, margens de 16 px (32 px a partir de 768 px); texto em 5 colunas e objeto em 7. A contagem só fixa o palco a partir de 1024 px e sem movimento reduzido; fora do palco, cada passo empilha em 5/12 + 7/12 a partir de 768 px e em uma coluna abaixo disso. O caminho dos dados é horizontal a partir de 1024 px e vertical abaixo.

Objetos exibidos (documento sobre o campo, janela de comandos, aviso de texto copiado na contagem) levam sombra longa, deslocada para baixo e tingida de verde escuro, nunca halo. Superfícies estruturais continuam planas; no app, sombra só em camadas flutuantes (tooltip, diálogo). A janela de comandos é escura nos dois temas, com os valores do tema escuro (fundo `#131A17`, texto `#EAF1EC`, aba ativa `#232E27`, prompt `#86D6AD`), linha `#2C3A32` e comentário `#8FA699` (6,8:1).

Não adicionar gráficos de produtividade, provas comerciais, depoimentos, números de adoção, integrações ou garantias que o produto ainda não oferece.
