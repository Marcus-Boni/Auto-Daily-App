# Validação da implementação

Concluída em 3 de outubro de 2026. Redesign aplicado ao aplicativo; homepage e publicação remota permanecem etapas posteriores.

## Resultado e simplificações

- Shell com Daily, Integrações e Guia, navegação com foco e reflow.
- Gerador dividido em preparação, documento e fontes; estado/requisições extraídos para hook e reducer testável.
- Documento e metadados preservados na navegação, falha, cancelamento e mudança de opções; nova geração não sobrescreve edições sem escolha.
- Integrações com formulários próprios, salvar separado de testar, invalidar teste ao editar e remover credenciais sem apagar o documento.
- Migração sem tokens padrão, sessão como padrão, retenção explícita e aviso quando armazenamento falha.
- APIs com estados de origem, janela ancorada, falhas parciais, contexto complementar, mensagens sanitizadas e cancelamento propagado.
- Identidade, manifest e documentação atualizados. Emojis, animações decorativas, componentes mortos de badges/logo/motion e assets do scaffold removidos. Nenhuma dependência adicionada.

## Gates

`npm run check`, `npm run type-check`, `npm test` e `npm run build` passaram. **35 regressões** cobrem configuração/hidratação/persistência, contratos de fonte, ausência de registros, falha parcial, instruções, metadados, cancelamento, respostas tardias, escolha antes de substituir e envio apenas dos headers das fontes selecionadas.

O build mantém `/`, `/api/azure`, `/api/optsolv` e `/api/generate`. Smoke HTTP no build real: os testes de conexão sem credenciais retornam 400; geração sem fonte configurada retorna estados explícitos e não consulta IA. Não foi realizada chamada com credenciais operacionais.

## Navegador

Interface real do build standalone, com servidor local de fixtures interceptando **todas** as APIs e fornecendo conteúdo fictício. Foram exercitados:

- Salvar integração, testar acesso fictício e invalidar teste ao editar.
- Gerar, editar, copiar e navegar sem perda de texto.
- Manter edições ou aceitar candidato, atualizando também o período do documento.
- Falha da IA, ausência de registros, cancelamento e resultado parcial.
- Remover tokens, reconfigurar uma única fonte e desmarcar a indisponível.
- Restaurar período/formato/instruções sem apagar o rascunho.
- Retenção opt-in após reload; sem opt-in, tokens são descartados e organização preservada.
- Navegação move foco aos títulos de Daily, Integrações e Guia.

Larguras 320, 375, 390, 650, 900 e 1280 px não apresentaram overflow horizontal. Em 375 px: `clientWidth=360`, `scrollWidth=360`, margens reais do documento de 18 px nos dois lados. Capturas full-page excluem a scrollbar, o que pode dar impressão de margem menor no arquivo; a geometria DOM foi verificada.

Tokens de texto normal e ações mantêm contraste acima de 4,5:1 nos pares principais. Limites de inputs: 3,33:1 no claro e 3,83:1 no escuro contra a superfície. Foco, labels, radios, checkbox, estado textual e movimento reduzido foram inspecionados. Não é uma declaração de conformidade WCAG completa.

## Capturas finais

As capturas desta seção registram a etapa de redesign anterior à logo definitiva. A identidade aprovada já está aplicada; as [capturas atuais](../brand/README.md#aplicação-completa) e o README principal mostram a versão completa da marca.

Os resultados preenchidos abaixo usam dados fictícios, rotulados no próprio documento:

- [Desktop claro](screenshots/implemented-desktop-light.jpg)
- [Desktop escuro](screenshots/implemented-desktop-dark.jpg)
- [Daily mobile](screenshots/implemented-mobile-dark.jpg)
- [Integrações mobile](screenshots/implemented-integrations-mobile.jpg)
- [Primeiro uso do build real](screenshots/implemented-first-use.jpg)

Revisão independente de código identificou fonte indisponível presa na seleção e falha de foco nas telas auxiliares; ambos corrigidos e exercitados no navegador. Revisão visual independente considerou a direção pronta, após checagem de overflow/margens em 375 px.

## Reproduzir os testes de interface

Build e servidor standalone, em um terminal na raiz:

```powershell
npm run build
Copy-Item public .next/standalone -Recurse -Force
Copy-Item .next/static .next/standalone/.next -Recurse -Force
$env:PORT = '4050'
$env:HOSTNAME = '127.0.0.1'
node --env-file=.env .next/standalone/server.js
```

Em outro terminal:

```powershell
New-Item -ItemType Directory -Force .omx/state/redesign | Out-Null
Set-Content .omx/state/redesign/ui-scenario.json '{"scenario":"success"}'
node tests/ui-fixture-server.mjs
```

Abra `http://127.0.0.1:4100` e preencha as integrações com valores fictícios. Cenários disponíveis no arquivo: `success`, `error`, `empty`, `partial` e `slow`. O proxy local utiliza apenas assets/páginas do build e substitui APIs; não distribua esse servidor como produto.

## Limites e publicação

### Padronização do seletor

O campo Período usa o Select existente do shadcn/ui, baseado em Radix, com seis opções, label/descrição, estado desabilitado e altura de toque de 44 px. Não há selects HTML nativos implementados no código do aplicativo. O protótipo HTML anterior foi aposentado e os estilos específicos de select nativo foram removidos.

Verificação no build real: clique, ArrowDown, End e Enter alteram a seleção; ao fechar o menu, o foco retorna a `daily-period`. Trigger medido com 44 px de altura. [Captura do menu shadcn](screenshots/shadcn-select.jpg). Check, TypeScript, 35 testes e build passaram após a troca.

Azure continua limitado a 100 commits; OptSolv a 200 registros e datas UTC de calendário. Paginação completa não foi adicionada. Histórico de relatórios, seleção prévia de registros e homepage não fazem parte desta implementação.

Não foram medidos Core Web Vitals em campo, feita auditoria completa com leitor de tela/matriz de navegadores ou homologadas integrações/provedor reais. O teste de UI com fixtures não comprova funcionamento operacional.

A versão atual de `src/` e `public/` não contém a chave de desenvolvimento removida. Auditoria de histórico encontrou ocorrência no commit `8469f02`; validade não testada. O histórico não foi reescrito e nenhum segredo foi revogado. Essa preparação precisa do responsável antes de uma publicação pública; veja [SECURITY.md](../../SECURITY.md).
