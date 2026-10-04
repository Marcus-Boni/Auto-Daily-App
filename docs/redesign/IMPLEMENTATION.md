# Implementação do redesign aprovado

Status: concluído e validado localmente. Escopo autorizado em 3 de outubro de 2026: aplicar o redesign completo da proposta ao aplicativo, sem publicar remotamente ou construir a homepage posterior. Evidências e limites em [IMPLEMENTATION-VALIDATION.md](IMPLEMENTATION-VALIDATION.md).

## Plano de mudança e simplificação

1. Proteger comportamento com regressões de configuração/hidratação, continuidade do rascunho, substituição de edições, janela consultada e falhas parciais.
2. Retirar segredo padrão e separar retenção de credenciais das preferências; preservar contratos existentes quando compatíveis.
3. Extrair estado da geração do componente visual e dividir preparação, documento, fontes e feedback em responsabilidades concretas.
4. Aplicar o sistema verde/neutro, navegação Daily/Integrações/Guia, temas, responsividade e estados acessíveis; retirar animação decorativa e emojis.
5. Tornar salvar e testar conexão ações distintas, com ajuda contextual e fluxo de dados claro.
6. Atualizar documentação e identidade dos assets para a implementação real; validar gates, testes, navegador e revisão independente.

Não adicionar dependências. Reutilizar primitivas, ReactMarkdown, Zustand e serviços existentes. Não persistir automaticamente rascunhos. A migração deve descartar credenciais anteriormente persistidas sem consentimento de retenção, preservando preferências e identificação das integrações.

## Prova necessária

- Rascunho sobrevive à navegação, falha e cancelamento; edição só é substituída após escolha.
- Opções atuais são distintas do snapshot da geração; metadados/fontes correspondem ao documento.
- Início/reset sem chave padrão; sessão como padrão; lembrar credenciais opt-in e armazenamento indisponível tolerado.
- Falha de fonte e ausência de registros são estados distintos; customPrompt complementa regras do formato.
- Conexões só aparecem validadas depois de teste; qualquer edição invalida teste anterior.
- Claro/escuro, teclado, viewport pequena, documentos longos, empty/error/partial/loading e cópia manual.
- `npm run check`, `npm run type-check`, `npm run build` e testes nativos passam.

Validação de integrações/provedor em ambiente operacional e rotação da chave antiga dependem de autorização/contexto específicos; não executar chamadas com credenciais reais durante o desenvolvimento local.
