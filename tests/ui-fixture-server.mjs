// Local UI validation only. All API calls are intercepted with synthetic data.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

const upstream = "http://127.0.0.1:4050";
const scenarioFile = new URL("../.omx/state/redesign/ui-scenario.json", import.meta.url);

async function scenario() {
  try {
    return JSON.parse(await readFile(scenarioFile, "utf8")).scenario || "success";
  } catch {
    return "success";
  }
}

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", upstream);
    if (url.pathname.startsWith("/api/")) {
      const selectedScenario = await scenario();
      if (url.pathname !== "/api/generate") {
        send(response, selectedScenario === "error" ? 401 : 200, {
          success: selectedScenario !== "error",
          message: "Teste fictício de validação local.",
        });
        return;
      }
      let body = "";
      for await (const chunk of request) body += chunk.toString();
      const options = JSON.parse(body);
      const end = new Date().toISOString();
      const window = {
        start: new Date(Date.now() - (options.periodHours || 24) * 3_600_000).toISOString(),
        end,
      };
      const sources = {};
      const sourceStatus = {};
      if (options.mode !== "optsolv-only") {
        sources.azure = [
          {
            id: "a31f9c2",
            message: "Corrige validação do formulário de cadastro",
            author: "Colaborador de exemplo",
            date: "03/10/2026",
            changes: "+3 ~1 -0",
          },
          {
            id: "b28e401",
            message: "Adiciona filtros à lista de projetos",
            author: "Colaborador de exemplo",
            date: "03/10/2026",
            changes: "+8 ~2 -0",
          },
        ];
        sourceStatus.azure = {
          status: "success",
          count: 2,
          message: "Dados fictícios de validação local.",
        };
      }
      if (options.mode !== "azure-only") {
        sources.optsolv = [
          {
            id: "fixture-time",
            project: "Projeto de exemplo",
            task: "Implementação dos filtros",
            hours: 2.5,
            notes: "Revisão e testes da navegação",
            client: "",
            date: "03/10/2026",
          },
        ];
        sourceStatus.optsolv = {
          status: "success",
          count: 1,
          message: "Dados fictícios de validação local.",
        };
      }
      if (selectedScenario === "partial") {
        sources.optsolv = undefined;
        sourceStatus.optsolv = {
          status: "error",
          count: 0,
          message: "Fonte indisponível neste teste local.",
        };
      }
      if (selectedScenario === "error") {
        send(response, 503, {
          success: false,
          error: "Serviço de IA indisponível",
          sources,
          sourceStatus,
          window,
        });
        return;
      }
      if (selectedScenario === "empty") {
        send(response, 404, {
          success: false,
          error: "Nenhum dado encontrado",
          sourceStatus: { azure: { status: "empty", count: 0 } },
          window,
        });
        return;
      }
      if (selectedScenario === "slow") await new Promise((resolve) => setTimeout(resolve, 3000));
      const executive = options.reportFormat === "professional";
      send(response, 200, {
        success: true,
        daily: executive
          ? "## Entregas e progresso\n- Evolução do cadastro e da navegação por projetos.\n\n## Contexto de trabalho\n- Dados fictícios de validação local.\n\n## Pontos para confirmar\n- Validar prioridades e impedimentos com a equipe."
          : "## O que foi realizado\n- Corrigida a validação do formulário de cadastro.\n- Implementados filtros na lista de projetos.\n\n## Próximos passos\n- Não informado nos dados consultados; revisar antes de compartilhar.\n\n## Impedimentos\n- Não informado nos dados consultados; revisar antes de compartilhar.\n\nDados fictícios de validação local.",
        sources,
        sourceStatus,
        window,
        generatedAt: end,
      });
      return;
    }
    const upstreamResponse = await fetch(`${upstream}${url.pathname}${url.search}`);
    const headers = new Headers(upstreamResponse.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    response.writeHead(upstreamResponse.status, Object.fromEntries(headers));
    response.end(Buffer.from(await upstreamResponse.arrayBuffer()));
  } catch {
    send(response, 502, { success: false, error: "Local fixture unavailable" });
  }
}).listen(4100, "127.0.0.1", () => console.log("Synthetic UI validation: http://127.0.0.1:4100"));
