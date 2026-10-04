import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const { createDailyState, dailyReducer, getGenerationMode, getSourceHeaders, hasChangedOptions } =
  loadTypeScript("src/lib/daily-state.ts");

const options = {
  azure: true,
  optsolv: false,
  period: "24h",
  reportFormat: "standard",
  customPrompt: "",
};
const result = {
  content: "Rascunho original",
  generatedAt: "2026-10-03T12:00:00Z",
  mode: "azure-only",
  period: "24h",
  reportFormat: "standard",
  customPrompt: "",
  window: { start: "2026-10-02T12:00:00Z", end: "2026-10-03T12:00:00Z" },
  sources: { azure: [{ id: "sample", message: "Entrega de exemplo" }] },
};
function withResult() {
  return dailyReducer(dailyReducer(createDailyState(options), { type: "start", requestId: 1 }), {
    type: "success",
    requestId: 1,
    result,
  });
}

test("falha de uma nova geração preserva documento, fontes e opções", () => {
  const state = dailyReducer(withResult(), { type: "start", requestId: 2 });
  assert.equal(state.result, result);
  const failure = dailyReducer(state, { type: "failure", requestId: 2, error: "Falha temporária" });
  assert.equal(failure.content, result.content);
  assert.equal(failure.result.sources, result.sources);
  assert.equal(failure.options, options);
  assert.equal(failure.loading, false);
});

test("regerar texto editado exige escolha antes de mudar o documento", () => {
  let state = dailyReducer(withResult(), { type: "edit", content: "Revisão humana" });
  state = dailyReducer(state, { type: "start", requestId: 2 });
  const candidate = { ...result, content: "Novo rascunho", period: "48h" };
  state = dailyReducer(state, { type: "success", requestId: 2, result: candidate });
  assert.equal(state.content, "Revisão humana");
  assert.equal(state.result.period, "24h");
  assert.equal(state.pending, candidate);
  const kept = dailyReducer(state, { type: "keep" });
  assert.equal(kept.content, "Revisão humana");
  assert.equal(kept.result, result);
  const accepted = dailyReducer(state, { type: "accept" });
  assert.equal(accepted.content, "Novo rascunho");
  assert.equal(accepted.result.period, "48h");
  assert.equal(accepted.edited, false);
});

test("edições feitas enquanto gera também são protegidas", () => {
  let state = dailyReducer(withResult(), { type: "start", requestId: 2 });
  state = dailyReducer(state, { type: "edit", content: "Editar durante requisição" });
  state = dailyReducer(state, {
    type: "success",
    requestId: 2,
    result: { ...result, content: "Novo" },
  });
  assert.equal(state.content, "Editar durante requisição");
  assert.equal(state.pending.content, "Novo");
});

test("resposta tardia após cancelamento não substitui o documento", () => {
  let state = dailyReducer(withResult(), { type: "start", requestId: 2 });
  state = dailyReducer(state, { type: "cancel", requestId: 2 });
  assert.equal(
    dailyReducer(state, {
      type: "success",
      requestId: 2,
      result: { ...result, content: "Tardia" },
    }),
    state
  );
});

test("resposta de uma requisição anterior não vence a requisição atual", () => {
  const state = dailyReducer(withResult(), { type: "start", requestId: 3 });
  assert.equal(
    dailyReducer(state, { type: "failure", requestId: 2, error: "Falha antiga" }),
    state
  );
  assert.equal(dailyReducer(state, { type: "success", requestId: 2, result }), state);
});

test("opções mudam sem reescrever snapshot de período e fontes", () => {
  const state = dailyReducer(withResult(), {
    type: "options",
    updates: { period: "48h", optsolv: true },
  });
  assert.equal(state.result.period, "24h");
  assert.equal(state.result.sources, result.sources);
  assert.equal(hasChangedOptions(state.options, result), true);
  assert.equal(hasChangedOptions(options, result), false);
});

test("seleção independente preserva quatro contratos de modo", () => {
  assert.equal(getGenerationMode(options), "azure-only");
  assert.equal(getGenerationMode({ ...options, azure: false, optsolv: true }), "optsolv-only");
  assert.equal(getGenerationMode({ ...options, optsolv: true }), "combined-auto");
  assert.equal(
    getGenerationMode({ ...options, optsolv: true, customPrompt: " Seja conciso " }),
    "combined-custom"
  );
});

test("restaurar conteúdo original remove estado de edição humana", () => {
  const edited = dailyReducer(withResult(), { type: "edit", content: "Texto diferente" });
  assert.equal(dailyReducer(edited, { type: "edit", content: result.content }).edited, false);
});

test("envia apenas credenciais das fontes selecionadas", () => {
  const headers = {
    "x-azure-pat": "example-pat",
    "x-azure-project": "example",
    "x-optsolv-token": "example-token",
  };
  assert.deepEqual(getSourceHeaders(options, headers), {
    "x-azure-pat": "example-pat",
    "x-azure-project": "example",
  });
  assert.deepEqual(getSourceHeaders({ ...options, azure: false, optsolv: true }, headers), {
    "x-optsolv-token": "example-token",
  });
});

test("falha mantém estados das fontes tentadas separados do documento anterior", () => {
  const state = dailyReducer(withResult(), { type: "start", requestId: 2 });
  const statuses = { azure: { status: "error", count: 0, message: "Fonte indisponível" } };
  const failed = dailyReducer(state, {
    type: "failure",
    requestId: 2,
    error: "Consulta falhou",
    sourceStatus: statuses,
  });
  assert.equal(failed.failedSources, statuses);
  assert.equal(failed.result, result);
  assert.equal(failed.result.sources, result.sources);
});
