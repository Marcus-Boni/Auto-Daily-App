# Sistema visual proposto

**Status:** referência histórica da proposta aprovada. O sistema implementado e sua fonte de verdade estão em [DESIGN.md na raiz](../../DESIGN.md).

## Direção

Clareza de trabalho: documento como foco, controles previsíveis e informação de origem sob demanda. Aplicativo em modo Operate; guia em Read; futura homepage em Persuade. A mesma marca não exige a mesma composição em todas essas superfícies.

## Tokens de cor

| Papel | Claro | Escuro |
| --- | --- | --- |
| Canvas | `#F5F7F6` | `#131A17` |
| Superfície | `#FFFFFF` | `#1A231E` |
| Superfície secundária | `#EDF1EF` | `#232E27` |
| Texto principal | `#192820` | `#EAF1EC` |
| Texto secundário | `#58655E` | `#AFBEB4` |
| Divisória | `#D8E0DB` | `#3B4C40` |
| Ação/seleção | `#176344` | `#86D6AD` |
| Texto sobre ação | `#FFFFFF` | `#14261C` |
| Seleção suave | `#E5F2EA` | `#233E2F` |
| Erro / superfície | `#A53232` / `#FFF0EE` | `#FFB1A7` / `#3B2624` |
| Atenção / superfície | `#805000` / `#FFF4DC` | `#F2CC82` / `#3A2E18` |

Verde é o acento de identidade; vermelho e âmbar são semânticos, não acentos decorativos. Estados sempre incluem texto. Divisórias suaves agrupam regiões; controles selecionáveis precisam de limites e indicadores perceptíveis, não apenas a divisória de superfície. Validar contraste de texto e estados em cada combinação real durante implementação.

## Tipografia

Manter **Geist** do app. Geist Mono somente para hashes, código e editor Markdown. O conceito estático usa fallback Segoe UI quando Geist não está instalada.

Escala operacional proposta: 12 px para metadados, 14 px para controles, 15–16 px para leitura do relatório, 18 px para títulos de seção, 26 px para título do documento e 32 px para título de página. Rótulos importantes não devem depender de texto de 11 px usado em alguns detalhes da prévia. Usar rem na implementação, entrelinha de 1,5–1,8 para leitura, texto limitado a aproximadamente 65–75 caracteres por linha e pesos 400/500/600. H1 de produto tem escala fixa por breakpoint.

## Espaço e forma

Escala: 4, 8, 12, 16, 24, 32 e 48 px. Distância dentro de grupos menor que entre tarefas. Sidebar de aproximadamente 196 px no desktop; preparação de 280–300 px; documento flexível. Conteúdo máximo de 1240 px no interior do shell.

Raios: 8 px em controles, 10–12 px em agrupamentos, 12 px no documento. Sem pílulas grandes, grades de cartões genéricos ou cartões aninhados. Bordas em superfícies; sombras apenas em overlays que realmente flutuam. Uma ação primária por momento.

## Componentes e estados

Reutilizar Button, Input, Textarea, Select, Accordion e primitivas existentes. Definir variantes para ação principal, secundária, discreta e destrutiva. Campos possuem rótulo, ajuda opcional e erro associado por `aria-describedby`.

Formato como radios; fontes como checkboxes; avisos persistentes inline; toast apenas para feedback transitório. Loading preserva documento anterior e indica trabalho em andamento. Vazio explica como iniciar. Falha oferece recuperação. Nenhum controle só visual ou “conectado” sem evidência.

Lucide com `strokeWidth` uniforme de 1,7–2. Símbolo de documento no protótipo é uma marca provisória, não um logo definitivo. Não substituir emojis por desenhos de fornecedores inconsistentes.

## Movimento e navegador

Transições de 150–200 ms para hover e estado. Sem logo rotacionando, badges pulsando ou entradas coreografadas. Respeitar `prefers-reduced-motion`; conteúdo visível sem animação. Foco com anel claro e offset; seleção e caret derivados dos tokens. Rolagem nativa e numeração tabular para horários/contagens.

## Responsividade

Acima de 1150 px: shell lateral e dois planos de trabalho. Até 900 px: navegação horizontal. Abaixo de 700 px: uma coluna, preparação antes do documento. Campos de integração passam de duas colunas para uma. Nenhuma ação coberta por barra fixa no mobile.

## Critério de adoção

Promover este sistema a `DESIGN.md` na raiz somente depois de implementar e revisar telas reais, temas, teclado e estados. Documentar os tokens efetivamente usados. O protótipo é referência da composição, não um motivo para duplicar componentes, incluir JavaScript estático no app ou instalar dependências.
