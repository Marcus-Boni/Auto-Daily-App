import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const azureHeaders = {
  "x-azure-pat": "dummy-pat",
  "x-azure-organization": "org",
  "x-azure-project": "project",
  "x-azure-repository": "repo",
};
const commit = {
  id: "12345678",
  message: "Fix loading",
  author: "Test",
  date: "2026-10-03",
  changes: "+0 ~1 -0",
};
function route(overrides = {}) {
  let prompt;
  let calls = 0;
  const module = loadTypeScript("src/app/api/generate/route.ts", {
    "@/lib/azure-service": {
      fetchAzureCommits: async () => ({ success: true, commits: [commit] }),
      ...overrides.azure,
    },
    "@/lib/optsolv-service": {
      fetchOptsolvEntries: async () => ({ success: true, entries: [] }),
      ...overrides.optsolv,
    },
    "@/lib/ai-service": {
      AIServiceError: class extends Error {},
      generateDailyWithAI: async (value) => {
        calls++;
        prompt = value;
        return "Test daily";
      },
    },
  });
  return {
    post: async (body, headers = azureHeaders) => {
      const response = await module.POST(
        new Request("http://localhost/api/generate", {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        })
      );
      return { status: response.status, body: await response.json() };
    },
    getPrompt: () => prompt,
    getCalls: () => calls,
  };
}

test("all legacy modes accept additional context without replacing evidence rules", async () => {
  for (const mode of ["azure-only", "optsolv-only", "combined-auto", "combined-custom"]) {
    const api = route({
      optsolv: {
        fetchOptsolvEntries: async () => ({
          success: true,
          entries: [
            {
              id: "1",
              task: "Task",
              project: "Project",
              hours: 1,
              notes: "Test",
              date: "2026-10-03",
              client: "Client",
            },
          ],
        }),
      },
    });
    const result = await api.post(
      { mode, customPrompt: "Priorize revisão", reportFormat: "professional" },
      { ...azureHeaders, "x-optsolv-token": "dummy" }
    );
    assert.equal(result.status, 200);
    assert.match(api.getPrompt(), /Priorize revisão/);
    assert.match(api.getPrompt(), /Resumo executivo/);
    assert.match(api.getPrompt(), /Não invente próximos passos/);
    assert.ok(result.body.generatedAt);
    assert.equal(
      new Date(result.body.window.end) - new Date(result.body.window.start),
      24 * 3600000
    );
  }
});
test("partial failure remains explicit while evidence generates a report", async () => {
  const api = route({
    optsolv: { fetchOptsolvEntries: async () => ({ success: false, error: "Acesso negado" }) },
  });
  const result = await api.post(
    { mode: "combined-auto" },
    { ...azureHeaders, "x-optsolv-token": "dummy" }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.sourceStatus.optsolv.status, "error");
  assert.equal(result.body.sourceStatus.azure.status, "success");
  assert.equal(result.body.sources.optsolv, undefined);
  assert.match(api.getPrompt(), /evidência indisponível/);
  assert.doesNotMatch(JSON.stringify(result.body), /dummy-pat/);
});
test("empty and unavailable sources have different errors and never call AI", async () => {
  const api = route({ azure: { fetchAzureCommits: async () => ({ success: true, commits: [] }) } });
  const empty = await api.post({ mode: "azure-only" });
  assert.equal(empty.status, 404);
  assert.equal(empty.body.sourceStatus.azure.status, "empty");
  assert.equal(empty.body.sourceStatus.optsolv, undefined);
  const unavailable = await api.post({ mode: "azure-only" }, {});
  assert.equal(unavailable.status, 502);
  assert.equal(unavailable.body.sourceStatus.azure.status, "not-configured");
  assert.equal(api.getCalls(), 0);
});
test("source requests share one anchored window and period map", async () => {
  const windows = [];
  const api = route({
    azure: {
      fetchAzureCommits: async (_c, h, o) => {
        assert.equal(h, 168);
        windows.push(o.window);
        return { success: true, commits: [commit] };
      },
    },
    optsolv: {
      fetchOptsolvEntries: async (_c, h, o) => {
        assert.equal(h, 168);
        windows.push(o.window);
        return { success: true, entries: [] };
      },
    },
  });
  const result = await api.post(
    { mode: "combined-auto", period: "7d" },
    { ...azureHeaders, "x-optsolv-token": "dummy" }
  );
  assert.deepEqual(windows[0], windows[1]);
  assert.deepEqual(result.body.window, windows[0]);
});
test("generation validates hours and instruction length before fetching", async () => {
  const api = route();
  for (const body of [
    { mode: "azure-only", periodHours: 721 },
    { mode: "azure-only", customPrompt: "x".repeat(10001) },
    { mode: "unknown" },
  ])
    assert.equal((await api.post(body)).status, 400);
  assert.equal(api.getCalls(), 0);
});

test("connection test is an explicit lightweight source call with no returned evidence", async () => {
  for (const source of ["azure", "optsolv"]) {
    let options;
    const fn = async (_c, _h, o) => {
      options = o;
      return { success: true, commits: [commit], entries: [{ id: "secret-evidence" }] };
    };
    const { GET } = loadTypeScript(`src/app/api/${source}/route.ts`, {
      [`@/lib/${source}-service`]:
        source === "azure" ? { fetchAzureCommits: fn } : { fetchOptsolvEntries: fn },
    });
    const request = {
      headers: new Headers({ ...azureHeaders, "x-optsolv-token": "dummy" }),
      nextUrl: new URL(`http://localhost/api/${source}?operation=test`),
    };
    const response = await GET(request);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(options.test, true);
    assert.equal(body.commits, undefined);
    assert.equal(body.entries, undefined);
    request.nextUrl = new URL(`http://localhost/api/${source}?operation=unknown`);
    assert.equal((await GET(request)).status, 400);
  }
});

test("service errors never echo upstream secrets and include timeout protection", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  const { fetchAzureCommits } = loadTypeScript("src/lib/azure-service.ts");
  const { fetchOptsolvEntries } = loadTypeScript("src/lib/optsolv-service.ts");
  globalThis.fetch = async (_url, options) => {
    assert.ok(options.signal);
    assert.equal(options.cache, "no-store");
    return new Response("secret-upstream-token", { status: 500 });
  };
  const results = await Promise.all([
    fetchAzureCommits({ pat: "dummy", organization: "org", project: "p", repository: "r" }, 24),
    fetchOptsolvEntries({ token: "dummy" }, 24),
  ]);
  for (const result of results) {
    assert.equal(result.success, false);
    assert.doesNotMatch(JSON.stringify(result), /secret-upstream-token/);
  }
});

test("connection tests fetch at most one record and successful empty response is valid", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  const { fetchAzureCommits } = loadTypeScript("src/lib/azure-service.ts");
  const { fetchOptsolvEntries } = loadTypeScript("src/lib/optsolv-service.ts");
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("$top") ?? parsed.searchParams.get("limit"), "1");
    return Response.json({ value: [], data: [] });
  };
  assert.equal(
    (
      await fetchAzureCommits(
        { pat: "dummy", organization: "org", project: "p", repository: "r" },
        24,
        { test: true }
      )
    ).success,
    true
  );
  assert.equal((await fetchOptsolvEntries({ token: "dummy" }, 24, { test: true })).success, true);
});

test("malformed JSON is a client error", async () => {
  const { POST } = loadTypeScript("src/app/api/generate/route.ts");
  const response = await POST(
    new Request("http://localhost/api/generate", { method: "POST", body: "{" })
  );
  assert.equal(response.status, 400);
});

test("report templates preserve evidence gaps and contain no emojis", () => {
  const { generateDailyPrompt, generateProfessionalPrompt } =
    loadTypeScript("src/lib/constants.ts");
  for (const build of [generateDailyPrompt, generateProfessionalPrompt]) {
    const prompt = build(24);
    assert.match(prompt, /Ausência de informação sobre impedimentos não significa ausência/);
    assert.match(prompt, /Não informado nos dados consultados/);
    assert.doesNotMatch(prompt, /\p{Extended_Pictographic}/u);
    assert.doesNotMatch(prompt, /Nenhum impedimento no momento/);
  }
});

test("cancellation during source lookup propagates its signal and skips AI", async () => {
  const controller = new AbortController();
  let aiCalls = 0;
  const { POST } = loadTypeScript("src/app/api/generate/route.ts", {
    "@/lib/azure-service": {
      fetchAzureCommits: async (_config, _hours, options) => {
        assert.ok(options.signal);
        controller.abort();
        assert.equal(options.signal.aborted, true);
        return { success: true, commits: [commit] };
      },
    },
    "@/lib/ai-service": {
      AIServiceError: class extends Error {},
      generateDailyWithAI: async () => {
        aiCalls++;
        return "Must not generate";
      },
    },
  });
  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: azureHeaders,
      body: JSON.stringify({ mode: "azure-only" }),
      signal: controller.signal,
    })
  );
  assert.equal(response.status, 499);
  assert.equal(aiCalls, 0);
});

test("upstream source signals abort when the incoming request aborts", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  const controller = new AbortController();
  globalThis.fetch = async (_url, options) => {
    controller.abort();
    assert.equal(options.signal.aborted, true);
    options.signal.throwIfAborted();
  };
  const { fetchAzureCommits } = loadTypeScript("src/lib/azure-service.ts");
  const result = await fetchAzureCommits(
    { pat: "dummy", organization: "org", project: "p", repository: "r" },
    24,
    { signal: controller.signal }
  );
  assert.equal(result.success, false);
});

test("generation passes the request signal to AI", async () => {
  const { POST } = loadTypeScript("src/app/api/generate/route.ts", {
    "@/lib/azure-service": {
      fetchAzureCommits: async () => ({ success: true, commits: [commit] }),
    },
    "@/lib/ai-service": {
      AIServiceError: class extends Error {},
      generateDailyWithAI: async (_prompt, signal) => {
        assert.ok(signal instanceof AbortSignal);
        return "Report";
      },
    },
  });
  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: azureHeaders,
      body: JSON.stringify({ mode: "azure-only" }),
    })
  );
  assert.equal(response.status, 200);
});

test("source routes reject missing or whitespace credentials without calling services", async () => {
  for (const source of ["azure", "optsolv"]) {
    let calls = 0;
    const call = async () => {
      calls++;
      return { success: true };
    };
    const { GET } = loadTypeScript(`src/app/api/${source}/route.ts`, {
      [`@/lib/${source}-service`]:
        source === "azure" ? { fetchAzureCommits: call } : { fetchOptsolvEntries: call },
    });
    const incomplete =
      source === "azure"
        ? { ...azureHeaders, "x-azure-project": "   " }
        : { "x-optsolv-token": "   " };
    for (const headers of [{}, incomplete]) {
      const response = await GET({
        headers: new Headers(headers),
        nextUrl: new URL(`http://localhost/api/${source}?operation=test`),
      });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error, "Configuração incompleta");
    }
    assert.equal(calls, 0);
  }
});

test("generation treats whitespace source credentials as not configured", async () => {
  let sourceCalls = 0;
  const api = route({
    azure: {
      fetchAzureCommits: async () => {
        sourceCalls++;
        return { success: true, commits: [commit] };
      },
    },
  });
  const result = await api.post({ mode: "azure-only" }, { ...azureHeaders, "x-azure-pat": "   " });
  assert.equal(result.body.sourceStatus.azure.status, "not-configured");
  assert.equal(sourceCalls, 0);
  assert.equal(api.getCalls(), 0);
});
