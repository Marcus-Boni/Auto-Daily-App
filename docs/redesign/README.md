# Proposta de redesign do Auto Daily

**Data:** 3 de outubro de 2026. **Status:** proposta aprovada e implementada. Este documento preserva o planejamento original. Consulte o [sistema atual](../../DESIGN.md) e as [evidências da implementação](IMPLEMENTATION-VALIDATION.md) para saber o que foi entregue.

## Recomendação

Transformar o gerador em um **espaço de preparação e revisão da daily**. O documento ocupa a área principal; fontes e opções ficam acessíveis ao lado. A experiência precisa comunicar três coisas imediatamente: de onde veio a informação, qual texto será compartilhado e o que depende de revisão humana.

Direção: **Clareza de trabalho**. Precisão de uma boa documentação técnica, ritmo de um documento bem editado e controles de uma ferramenta que pode ser usada todos os dias. Identidade discreta, mas reconhecível, com verde profundo, neutros levemente esverdeados, tipografia Geist e iconografia consistente. O aspecto premium nasce de hierarquia, acabamento e previsibilidade.

## Ver a proposta

O protótipo HTML foi aposentado após a implementação, para manter uma única interface baseada nos componentes shadcn/ui. As [capturas da proposta](screenshots/desktop-light.jpg) preservam a referência visual. Para executar o aplicativo atual, siga o [README principal](../../README.md).

As [evidências de validação](VALIDATION.md) registram os checks, as interações verificadas, as capturas finais e os limites desta entrega.

## O que foi observado

Auditoria de código e inspeção da tela principal no servidor local. A aparência atual usa tokens próximos do padrão shadcn, Geist/Geist Mono, cartões empilhados, ícone Sparkles e abas. Há acento laranja declarado, mas a ação principal é neutra. O fluxo da geração apresenta seletores, opções de formato, uma segunda síntese das opções e só então o resultado.

| Evidência atual | Efeito na experiência | Resposta proposta |
| --- | --- | --- |
| Configuração e resultado empilhados em `daily-generator.tsx` | A daily perde prioridade visual; a configuração ocupa a primeira tela | Documento principal e controles compactos ao lado |
| Períodos com emojis; emojis também nos prompts de `constants.ts` | Identidade visual e texto gerado seguem padrões diferentes | Uma família de ícones; templates de texto sóbrios |
| Quatro modos misturam fonte e instrução personalizada | O usuário precisa entender combinações internas | Selecionar fontes independentemente; instruções em área avançada |
| `setResult(null)` antes da nova resposta, no gerador | Uma falha elimina o resultado anterior | Manter o rascunho; substituí-lo após sucesso e escolha consciente |
| Gerador desmontado ao trocar aba no `app-shell.tsx` | Ajustar uma integração perde texto e opções | Estado do rascunho acima das telas de navegação |
| Validação baseada em presença de campos, em `use-user-config.ts` | “Configurado” pode parecer “conectado” | Vocabulário distinto para preenchimento e teste real |
| Falhas de fonte convertidas em `null`, em `api/generate/route.ts` | Relatório parcial ou erro pode parecer ausência de registros | Estados de origem explícitos e aviso de relatório parcial |
| Formato em botões sem semântica de seleção | Estado selecionado não é comunicado adequadamente | Grupo de rádio com rótulo e descrição |
| Texto “commits e work items” nas configurações | Promessa maior do que o fluxo implementado | Descrever commits enquanto work items não existir |
| Link do shell leva ao perfil do autor | Código e contribuição ficam menos diretos | Link ao repositório; autoria na documentação/homepage |

Referências para implementação: `src/components/app-shell.tsx:16`, `:119`, `:164`; `src/components/daily-generator.tsx:47`, `:69`, `:226`, `:304`; `src/hooks/use-user-config.ts:75`, `:112`; `src/app/api/generate/route.ts:60`, `:90`, `:143`, `:235`.

### Confiança antes da publicação

Há uma chave de desenvolvimento embutida na configuração padrão e no tutorial (`use-user-config.ts:14`, `constants.ts:336`). Seu valor não foi copiado para os artefatos desta proposta. Sua validade não foi testada. Antes de tornar o repositório público, retirar o valor, avaliar sua exposição no histórico e solicitar a revogação/rotação ao responsável, se ele representar acesso real. Um reset deve resultar em integrações vazias.

A copy precisa explicar o caminho dos dados: navegador → API da aplicação → fontes de atividade → provedor de IA → navegador. As credenciais usadas para consultar fontes passam pela aplicação; o contexto das atividades é enviado ao provedor de IA. “Fica no navegador” não descreve sozinho esse fluxo. Oferecer sessão como padrão de retenção de segredos, opção explícita de lembrar no dispositivo e limpeza independente de credenciais e preferências. Isso exige implementação e revisão de segurança; não é uma promessa já atendida.

Os prompts também precisam distinguir evidência e inferência. Commits não confirmam planos futuros, e ausência de evidência de um bloqueio não comprova ausência de bloqueios. Substituir “Nenhum impedimento no momento” por uma indicação limitada às fontes e espaço para confirmação humana. Não apresentar horas ou volume de commits como medida de produtividade.

## Arquitetura da experiência

### Daily

Navegação curta; título contextual; preparação à esquerda; documento à direita. A ação primária é **Gerar rascunho**. Depois do resultado, **Copiar texto** é a ação de conclusão. A palavra rascunho explicita a revisão que ainda cabe à pessoa.

Controles iniciais: fontes, período e formato. Mostrar instruções adicionais sob disclosure. Retirar a segunda síntese que apenas repete o formulário. Depois de gerar, o documento mostra a janela efetivamente consultada, horário da geração e fontes realmente usadas. Se o usuário mudar opções, informar que o texto existente corresponde à geração anterior.

O protótipo oferece duas fontes independentes. Na implementação, a seleção traduz os modos atuais; eliminar a distinção visual entre combinado automático e customizado não pode alterar silenciosamente o contrato da API. A instrução complementar deve preservar regras do formato e da evidência; hoje ela substitui o prompt inteiro, o que precisa ser corrigido deliberadamente.

Resultado legível, com medida de texto confortável e três seções para o formato diário. Editor Markdown simples, aproveitando o renderer existente; evitar editor rich text e novas dependências nesta etapa. Ao regerar um texto editado, manter a versão anterior e oferecer **Usar novo rascunho** ou **Manter minhas edições**. Falha não substitui o texto atual.

Fontes ficam num disclosure junto ao documento. Mostrar origem, mensagens de commits, registros de tempo e aviso de sobreposição quando pertinente. A primeira versão pode exibir os dados já retornados pela geração. Selecionar/excluir registros antes de enviá-los à IA exige um fluxo adicional de coleta e revisão; fica fora do primeiro redesign.

### Integrações

Substituir o painel longo por duas seções reconhecíveis, com rótulos acima dos campos, orientações curtas e ajuda junto à dúvida. Separar **Salvar configuração** de **Testar conexão**. Salvar não transforma o estado em validado.

Estados: não configurado → dados preenchidos → verificando → acesso validado; ou falha com ação de recuperação. O teste deve usar a integração real, com escopo mínimo e política de timeout. Um teste anterior não garante disponibilidade permanente; mostrar quando ocorreu.

Azure: organização, projeto, repositório e PAT com Code · Read. OptSolv: chave e filtro opcional de colaborador. Nomear a função de cada campo; não usar logo da OptSolv para representar o produto inteiro. Tutorial passa a ser ajuda contextual e guia acessível, sem esconder instruções essenciais em acordeões sucessivos.

### Guia e primeiro uso

Uma instalação limpa abre a Daily com estado útil: **Conecte uma fonte para preparar seu primeiro rascunho**. A ação leva à integração mantendo o contexto. Depois da configuração, retornar à Daily com a fonte escolhida. Não criar wizard obrigatório, conta ou tour de várias telas.

Guia com configuração das duas fontes, limites da IA, retenção dos dados e uso do resultado. No futuro, um modo de demonstração explicitamente identificado pode permitir explorar o app sem credenciais. A simulação desta proposta não adiciona esse modo ao produto.

### Responsive e acessibilidade

Desktop amplo: navegação lateral estreita, preparação de cerca de 280–300 px e documento flexível. Larguras intermediárias: navegação horizontal e composição compacta. Abaixo de 700 px: preparar → revisar → copiar em coluna única. A hierarquia permanece; não comprimir três colunas numa tela pequena.

Meta de implementação: WCAG 2.2 AA. Contraste de texto normal de pelo menos 4,5:1, foco visível, estado sem depender somente de cor e foco não escondido por barras. Alvos confortáveis de 44 px como decisão de usabilidade; o critério AA de tamanho mínimo define 24 px com exceções. Testar teclado, zoom/reflow, leitores de tela, touch e movimento reduzido. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

Reutilizar Radix/shadcn para seleção, tabs e disclosures quando apropriado, preservando sua semântica e relações entre controles. Primitivas ajudam em foco e navegação; não comprovam acessibilidade de uma composição inteira. [Acessibilidade do Radix](https://www.radix-ui.com/primitives/docs/overview/accessibility).

## Estados como parte do design

| Situação | Resposta esperada |
| --- | --- |
| Nenhuma fonte | Estado orientador com ação para integrar; sem falso “conectado” |
| Campos preenchidos | Estado “Configuração salva”, independente de teste |
| Consultando/gerando | Feedback real de fase; não inventar percentuais ou tempo restante |
| Sem registros | Explicar período/origem e permitir ampliar a janela |
| Fonte indisponível | Identificar a fonte e a causa conhecida; não chamar de vazio |
| Resultado parcial | Avisar quais fontes foram usadas; permitir continuar ou tentar novamente |
| Falha da IA | Preservar documento e opções; oferecer nova tentativa |
| Resultado editado | Preservar edição na sessão e tornar substituição uma escolha |
| Erro ao copiar | Selecionar texto e oferecer cópia manual |
| Conteúdo muito longo | Documento sem corte de conteúdo; identificadores com quebra/scroll localizado |

O período inicial continua sendo uma janela móvel de 24 horas, não “ontem”. Datas inicial/final precisam ser capturadas no início da consulta e exibidas com fuso horário. Cancelamento real exige política de abort/timeout no cliente e servidor, não apenas esconder o loading.

## Organização do projeto

Preservar Next.js, React, TypeScript, Tailwind, Zustand, Zod, Radix/shadcn, Lucide e Motion existentes. Não instalar outro design system. Separar responsabilidades por feature sem construir um framework genérico de integrações.

Estrutura sugerida, a aplicar gradualmente:

```text
src/
  app/                       rotas e composição
    page.tsx                 mantém o app nesta primeira entrega
    api/                     contratos atuais preservados inicialmente
  components/
    app-shell.tsx            composição e navegação
    daily/
      generation-controls.tsx
      report-editor.tsx
      report-preview.tsx
      source-summary.tsx
      generation-feedback.tsx
    integrations/
      azure-connection-form.tsx
      optsolv-connection-form.tsx
      credential-storage-notice.tsx
    ui/                      primitivas compartilhadas
  hooks/
    use-daily-generation.ts  geração, recuperação e estado da sessão
    use-user-config.ts       preferências e acesso às credenciais
  lib/                       serviços, prompts e contratos de erro
  types/                     contratos concretos usados nas fronteiras
docs/
  redesign/                  esta proposta e seu conceito
```

Separar seleção atual, snapshot da última geração e texto editado. Credenciais não entram no estado serializável do rascunho. A navegação não deve destruir esse estado. Não persistir automaticamente conteúdo potencialmente sensível; retenção além da sessão merece decisão de produto própria.

Layouts e páginas podem permanecer Server Components; interatividade e APIs do navegador exigem ilhas Client. A documentação instalada de Next 16.3.8 foi consultada em `node_modules/next/dist/docs/01-app/01-getting-started/`. Não aplicar padrões de versões antigas sem verificar o guia correspondente. Não mover tudo para client só porque o gerador é interativo.

## Padronização da identidade

Usar **Auto Daily** em navegação, metadata e documentação; manter o slug do repositório. “IA” descreve o mecanismo, sem competir com o nome. Tom direto, português consistente, sem “mágica”, excesso de exclamações ou claims de segurança não demonstrados.

Lucide é a família existente: manter traço uniforme e rótulo acessível; remover emojis de períodos, formatos, ajuda e prompts. Ícones não substituem rótulos essenciais. O símbolo de documento do conceito é provisório; um logotipo definitivo e favicon precisam de uma etapa de identidade consistente.

O [sistema visual proposto](DESIGN.md) define tokens, escalas, temas e componentes. Após implementação e validação, promover o sistema real para `DESIGN.md` na raiz. A proposta não deve ser confundida com documentação da aparência atual.

## Preparação para open source e homepage

Primeiro consolidar uma experiência demonstrável e o comportamento de confiança. Atualizar README com screenshot real, início rápido, configuração mínima, fluxo de dados e limites. Acrescentar orientações de contribuição e reporte privado de vulnerabilidades por um canal efetivamente definido. Publicar exemplos fictícios, nunca valores operacionais.

A homepage futura pode herdar tipografia, verde, neutros e iconografia, com composição mais expressiva. Promessa recomendada: **Seu trabalho, bem contado.** Explicação: transformar commits e registros de tempo em um rascunho que a pessoa revisa. Mostrar captura real da nova Daily, funcionamento, integrações disponíveis, setup self-hosted e links para experimentar/documentação/código. Sem logos de clientes, adoção, economia de tempo ou garantias inventadas.

Quando essa homepage existir, planejar `/` como apresentação e `/app` como ferramenta, com migração explícita, links e metadata separados. Nesta proposta a rota atual continua intacta. Sem analytics auditado ou dados de ranking, não é possível declarar uma baseline de SEO; já há metadata e manifest no layout, mas Open Graph e screenshots públicos precisam de revisão própria.

## Sequência de implementação recomendada

| Entrega | Escopo | Evidência de conclusão |
| --- | --- | --- |
| 1. Base de confiança | Retirar chave embutida, início limpo, corrigir copy e semântica dos estados/erros; preservar rascunho | Regressão de hydrate/reset, falhas parciais e navegação sem perda |
| 2. Sistema e shell | Tokens, temas, navegação, tipografia, ícones e layout responsivo | Telas reais em claro/escuro; teclado e reflow; gates do repo |
| 3. Preparação e revisão | Fontes independentes, controles compactos, editor, recuperação e snapshot da geração | Exercitar sucesso, vazio, erro, parcial e substituição de texto editado |
| 4. Integrações e ajuda | Forms separados, teste real, retenção e ajuda contextual | Testar credencial válida/inválida/expirada com ambiente autorizado |
| 5. Publicação | README, contribuição, captura real, documentação e revisão do histórico de segredos | Setup reproduzível em checkout limpo; nenhuma credencial real nos exemplos |
| Posterior | Homepage, histórico opt-in e seleção prévia de registros | Requisitos e contratos próprios; sem contaminar a primeira entrega |

Cada entrega deve passar `npm run check`, `npm run type-check` e `npm run build`. Antes de alterar fluxos, adicionar regressões para preservação do rascunho, hydrate/reset, fontes parciais e seleção acessível. Os testes devem validar comportamento e contratos, não fotografar a implementação.

Metas de desempenho, ainda não medidas: LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 no percentil 75 de visitas reais. Lighthouse ajuda na avaliação local, mas não substitui essa medição. [Web Vitals](https://web.dev/articles/vitals).

## Alternativas consideradas

Exploração manual porque o motor auxiliar da skill não estava disponível. Nenhuma direção foi apresentada como sorteada ou aprovada.

| Referência de linguagem | Potencial | Decisão para esta proposta |
| --- | --- | --- |
| Documentação técnica bem editada | Hierarquia, leitura e confiança | Base principal |
| Programas de identidade suíça | Grid e composição consistente | Disciplina de alinhamento |
| Anotações de revisão editorial | Documento como centro do trabalho | Ritual de preparar e revisar |
| Sinalização de bibliotecas | Navegação precisa e vocabulário discreto | Orientação e ajuda |
| Atlas de informação | Origem e relação entre dados | Rastreabilidade sob disclosure |
| Publicações de engenharia | Densidade legível e metadados úteis | Fontes e períodos sem decoração |
| Agenda de trabalho | Continuidade entre preparação e próxima ação | Preservação do rascunho |

Uma direção grafite mais densa seria adequada para usuários habituados a ferramentas técnicas, mas arrisca transformar uma tarefa curta num cockpit. Uma direção editorial muito expressiva daria personalidade à homepage, mas disputa atenção com o documento no app. A recomendação usa familiaridade operacional e reserva expressão maior para a apresentação pública.

Parâmetros da proposta: `DESIGN_VARIANCE=5`, `MOTION_INTENSITY=2`, `VISUAL_DENSITY=5` no aplicativo. Para a homepage futura: referência inicial `6/4/3`, a definir conforme o conteúdo real. Esses valores descrevem a intenção, não um teste quantitativo de qualidade.

## Limites e decisões abertas

Esta entrega é uma proposta completa e um conceito navegável, não um redesign instalado nas telas de produção. Não houve validação com usuários, auditoria completa de segurança, teste de credenciais ou medição de Core Web Vitals. O protótipo não prova o comportamento das APIs.

Decisões que podem ser tomadas durante implementação: frequência de uso, retenção de rascunhos, tipologia definitiva do logotipo e canal privado de segurança. Elas não impedem avaliar a direção proposta. Os achados técnicos e as evoluções propostas estão separados para que o trabalho possa ser implementado em diffs pequenos e verificáveis.
