"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuidePanel({
  onNavigate,
}: {
  onNavigate?: (view: "daily" | "integrations" | "guide") => void;
}) {
  return (
    <div className="narrow-view">
      <div className="page-heading">
        <div>
          <h1 id="guide-heading" tabIndex={-1}>
            Um relato com contexto.
          </h1>
          <p>A IA prepara o texto. Você confirma o que representa seu trabalho.</p>
        </div>
      </div>
      <div className="guide-content">
        <section>
          <h2>Comece com uma fonte</h2>
          <p>
            Azure DevOps fornece commits de um repositório; OptSolv Time Tracker fornece registros
            de tempo. Configure uma fonte ou combine as duas. Testar a conexão verifica o acesso com
            os dados preenchidos; salvar a integração torna esses dados disponíveis para gerar a
            daily.
          </p>
          {onNavigate ? (
            <Button
              type="button"
              variant="link"
              className="text-link"
              onClick={() => onNavigate("integrations")}
            >
              Configurar minhas fontes <ArrowRight aria-hidden="true" />
            </Button>
          ) : null}
        </section>
        <section>
          <h2>Escolha o período e o formato</h2>
          <p>
            O período é uma janela móvel que termina no momento da geração, de 24 horas a 30 dias. O
            Azure consulta commits nessa janela. Registros de tempo são filtrados pelas datas dos
            lançamentos; essa fonte tem precisão diária, e não por hora.
          </p>
          <p>
            Daily Scrum organiza o relato em atividades realizadas, próximos passos e impedimentos.
            Resumo executivo apresenta entregas e contexto. Instruções adicionais complementam o
            formato escolhido.
          </p>
        </section>
        <section>
          <h2>Revise antes de compartilhar</h2>
          <p>
            Abra os registros usados para conferir a origem do texto. Edite o rascunho em Markdown,
            remova detalhes sensíveis e copie o texto quando estiver pronto. O compartilhamento é
            manual.
          </p>
          <p>
            Atividades passadas não comprovam planos futuros, conclusão de entregas ou ausência de
            impedimentos. Complete esses pontos com o que você sabe. Contagens de commits e horas
            são contexto, não medidas de produtividade.
          </p>
          <p>
            Se uma fonte falhar, confira o aviso e os registros disponíveis. Uma falha na geração
            preserva o documento anterior. Quando há edições, você escolhe se deseja substituí-las
            pelo novo rascunho.
          </p>
        </section>
        <section>
          <h2>Saiba por onde os dados passam</h2>
          <ol className="data-flow">
            <li>
              <strong>Navegador</strong>
              <span>
                Guarda suas preferências e, por padrão, retém tokens apenas durante a sessão.
                Lembrar credenciais é uma escolha explícita.
              </span>
            </li>
            <li>
              <strong>API da aplicação</strong>
              <span>
                Recebe as credenciais por cabeçalhos e consulta Azure DevOps e OptSolv. Não há banco
                de dados de atividades nesta aplicação.
              </span>
            </li>
            <li>
              <strong>Provedor de IA</strong>
              <span>
                Recebe o contexto das atividades e as instruções para preparar o rascunho. A chave
                do provedor é configurada no servidor.
              </span>
            </li>
            <li>
              <strong>Seu rascunho</strong>
              <span>
                Retorna ao navegador para revisão. O texto é mantido enquanto o aplicativo permanece
                aberto.
              </span>
            </li>
          </ol>
          <p>
            Armazenamento no navegador não é garantia de segurança. Use credenciais de leitura com
            acesso adequado e confirme as políticas da sua organização antes de enviar atividades ao
            provedor de IA.
          </p>
        </section>
        <section>
          <h2>Entenda os limites da IA</h2>
          <p>
            O rascunho pode omitir contexto, repetir atividades ou interpretar registros de forma
            incorreta. As fontes mostram o que foi registrado, não tudo o que aconteceu. A revisão
            humana faz parte do fluxo.
          </p>
          <p>
            Este aplicativo consulta commits e registros de tempo. Ele não busca work items, não
            lança horas e não publica sua daily automaticamente.
          </p>
        </section>
        {onNavigate ? (
          <Button
            type="button"
            variant="link"
            className="text-link"
            onClick={() => onNavigate("daily")}
          >
            Preparar minha daily <ArrowRight aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
