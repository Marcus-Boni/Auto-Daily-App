# Evidência de validação da proposta

Registro histórico da etapa de proposta. Para a versão aplicada ao aplicativo, consulte [IMPLEMENTATION-VALIDATION.md](IMPLEMENTATION-VALIDATION.md).

O protótipo HTML e seu servidor foram aposentados após a migração do seletor para shadcn/ui. As capturas permanecem como evidência histórica.

Verificado em 3 de outubro de 2026. A validação cobre os artefatos de proposta, o protótipo fictício e a continuidade dos gates do aplicativo existente.

## Gates do repositório

- `npm run check`: passou, sem erros ou avisos no último resultado.
- `npm run type-check`: passou.
- `npm run build`: passou; `/`, `/api/azure`, `/api/optsolv` e `/api/generate` continuam presentes.
- `node --check` nos scripts da prévia: passou.
- `git status --short`: somente `PRODUCT.md` e `docs/redesign/` como novos artefatos. Nenhum arquivo em `src/`, dependência ou configuração de produção foi alterado.

## Interações verificadas no navegador

| Cenário | Resultado observado |
| --- | --- |
| Editar → Integrações → Daily | O texto editado permanece na sessão |
| Geração simulada falha | Texto anterior preservado; erro com recuperação |
| Copiar | Clipboard contém exatamente o rascunho editado de teste |
| Primeiro uso | Estado orientador; copiar e editar desabilitados |
| Sem registros | Mensagem contextual e orientação para ampliar período |
| Fonte parcial | Aviso de indisponibilidade; evidências mostram apenas 3 commits |
| Resumo executivo + semana | Título, formato e metadado de período atualizados após sucesso |
| Nenhuma fonte selecionada | Geração desabilitada |
| Mudar período/formato/fontes | Aviso informa que o documento atual é da geração anterior |
| Gerar após edição | Candidato disponível; documento atual só muda após escolha |
| Manter minhas edições | Documento e metadados anteriores preservados |
| Usar novo rascunho | Texto e período substituídos pelo candidato selecionado |
| Mobile | Único botão de geração passa para depois dos controles |
| Teste de integração | Estado explicitamente simulado; nenhuma API consultada |
| Guia | Conteúdo e navegação acessíveis; fluxo de dados explicado |

Larguras verificadas: 320, 390, 900 e 1280 px. `document.documentElement.scrollWidth` permaneceu menor ou igual a `innerWidth`; não foi encontrado overflow horizontal nessas verificações. Claro e escuro foram inspecionados. A viewport explícita foi restaurada ao tamanho padrão do painel ao terminar.

## Revisão visual

Uma revisão inicial identificou foco programático excessivo, ação desktop abaixo da primeira tela e texto do documento muito pequeno. Os ajustes foram feitos em conjunto. Uma revisão independente apontou proteção de edições, aviso de mudança de opções e posição da ação no mobile; os três reparos foram implementados e verificados.

As primeiras capturas mobile tinham um artefato envolvendo um link fixo fora da viewport. As imagens finais foram recapturadas com rolagem no topo, sem alterar a funcionalidade do skip-link, e inspecionadas novamente. O parecer independente final foi **pronta para avaliação**. As notas visuais são julgamento de design; não são um índice científico nem prova de conformidade de acessibilidade.

Capturas finais:

- [Desktop claro](screenshots/desktop-light.jpg)
- [Desktop escuro](screenshots/desktop-dark.jpg)
- [Mobile escuro](screenshots/mobile-dark.jpg)
- [Integrações no mobile escuro](screenshots/integrations-mobile.jpg)

## Contraste dos tokens

Cálculo de luminância relativa dos pares de cor, não auditoria completa de todos os componentes:

| Par | Razão |
| --- | --- |
| Texto principal claro / branco | 15,38:1 |
| Texto secundário claro / branco | 6,11:1 |
| Texto secundário claro / canvas | 5,68:1 |
| Texto / ação clara | 7,23:1 |
| Texto principal escuro / superfície | 14,04:1 |
| Texto secundário escuro / superfície | 8,32:1 |
| Texto / ação escura | 9,24:1 |
| Erro claro / superfície de erro | 6,11:1 |
| Erro escuro / superfície de erro | 8,13:1 |
| Atenção clara / superfície de atenção | 6,27:1 |
| Atenção escura / superfície de atenção | 8,67:1 |

## Isolamento da prévia

Verificações HTTP no servidor de loopback: `GET /` e `/prototype.js` retornam 200; `GET /.env`, `GET /../package.json` e `POST /` retornam 404. CSP inclui `connect-src 'none'`, assets locais e bloqueio de objetos/frames. O servidor só atende uma lista explícita de arquivos. Nenhum conteúdo de credencial foi retornado ou reproduzido nos artefatos.

## Não verificado

Integrações reais, disponibilidade do provedor de IA, rotação de credenciais, histórico Git de segredos, Lighthouse/Core Web Vitals, leitor de tela completo, matriz de navegadores e testes com usuários. A proposta define critérios para a implementação; o protótipo não comprova esses resultados de produção.
