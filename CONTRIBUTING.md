# Contribuir com o Auto Daily

Use Node.js 20.9 ou superior e instale dependências com `npm ci`. Para trabalhar no aplicativo, siga o início rápido do README e as instruções de [AGENTS.md](AGENTS.md).

Mantenha mudanças focadas, com tipos explícitos e componentes de responsabilidade clara. Reutilize as primitivas e o [sistema visual](DESIGN.md). Não adicione dependências sem discutir a necessidade. Use exemplos fictícios em testes, screenshots e documentação; nunca inclua tokens ou atividades privadas.

Antes de abrir um PR, execute:

```powershell
npm run check
npm run type-check
npm test
npm run build
```

Para comportamento alterado, inclua uma regressão que prove o caso relevante. UI deve cobrir teclado, temas, estados, viewport pequena e conteúdo longo. Não confunda testes com mocks com validação de serviços reais.

Descreva o problema, a mudança resultante, a evidência de validação e os limites conhecidos. Commits seguem o protocolo Lore do workspace: intenção primeiro, contexto e trailers úteis de decisão/validação. Não inclua segredos em mensagens, diffs ou logs.

Questões de segurança seguem [SECURITY.md](SECURITY.md). Mudanças de escopo, rotas públicas ou retenção de dados merecem discussão explícita antes de implementação.
