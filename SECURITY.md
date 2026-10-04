# Segurança e dados

Não publique credenciais, dados privados de atividades ou detalhes de uma vulnerabilidade em uma issue pública.

Se o repositório oferecer reporte privado de vulnerabilidades no GitHub, use esse recurso. Caso ele não esteja habilitado, combine um canal privado com o mantenedor antes de enviar conteúdo sensível. Este documento não afirma que um canal já esteja configurado.

## Modelo atual

- Tokens das fontes ficam em memória por padrão; recarregar/fechar a página os descarta.
- Retenção em armazenamento local depende de escolha explícita e não usa criptografia.
- Dados e instruções passam pelo servidor da aplicação e pelo provedor de IA; revise as políticas da organização antes de usar dados operacionais.
- A chave do provedor de IA é configuração do servidor, não um campo público do cliente.
- Testes de conexão consultam fontes reais quando o usuário os solicita. Salvar campos não valida acesso.
- Rascunhos têm revisão e compartilhamento manuais; os testes locais não comprovam proteção universal.

## Antes de publicar o histórico

Uma chave de desenvolvimento foi removida dos defaults e do tutorial durante o redesign, mas aparece em um commit anterior. Sua validade não foi testada. Revogue/rotacione no serviço responsável se representar acesso real; revise o histórico e qualquer artefato já distribuído. Remover o valor só da versão atual não remove a exposição histórica.

Nunca inclua `.env` na distribuição ou em capturas/logs. Use credenciais com permissões mínimas e valide a implantação e o ambiente operacional separadamente dos checks locais.
