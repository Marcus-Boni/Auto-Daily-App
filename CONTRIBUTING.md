# Contribuir com o Auto Daily

Use Node.js 20.9 ou superior e instale dependências com `npm ci`. Para trabalhar no aplicativo, siga o início rápido do README e as instruções de [AGENTS.md](AGENTS.md).

Mantenha mudanças focadas, com tipos explícitos e componentes de responsabilidade clara. Reutilize as primitivas e o [sistema visual](DESIGN.md). Não adicione dependências sem discutir a necessidade. Use exemplos fictícios em testes, screenshots e documentação; nunca inclua tokens ou atividades privadas.

O `npm ci` instala os hooks do Husky. A cada commit, o `pre-commit` roda `npm run check:ci`, `npm run type-check` e `npm test`; se o Biome apontar formatação ou lint, rode `npm run check` para corrigir e commite de novo. Antes de abrir um PR, confirme também o build:

```powershell
npm run build
```

A CI repete todas as verificações em cada push e pull request na `main`.

Para comportamento alterado, inclua uma regressão que prove o caso relevante. UI deve cobrir teclado, temas, estados, viewport pequena e conteúdo longo. Não confunda testes com mocks com validação de serviços reais.

Descreva o problema, a mudança resultante, a evidência de validação e os limites conhecidos. Commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), validado pelo commitlint no hook `commit-msg`:

```text
feat(daily): adiciona formato de resumo semanal
fix(azure): trata repositório sem commits no período
docs: atualiza variáveis de ambiente no README
```

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` e `revert`. Use o corpo da mensagem para contexto e decisões. `feat`, `fix`, `perf` e `revert` entram nas notas da próxima versão, geradas pelo release-it a partir desses commits. Não inclua segredos em mensagens, diffs ou logs.

Questões de segurança seguem [SECURITY.md](SECURITY.md). Mudanças de escopo, rotas públicas ou retenção de dados merecem discussão explícita antes de implementação.
