import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

function setup(initial, unavailable = false) {
  const values = new Map(initial ? [["auto-daily-config", JSON.stringify(initial)]] : []);
  const writes = [];
  const storage = {
    getItem: (key) => {
      if (unavailable) throw new Error("Storage unavailable");
      return values.get(key) ?? null;
    },
    setItem: (key, value) => {
      writes.push(key);
      if (unavailable) throw new Error("Storage unavailable");
      values.set(key, value);
    },
    removeItem: (key) => values.delete(key),
  };
  globalThis.localStorage = storage;
  const module = loadTypeScript("src/hooks/use-user-config.ts");
  return {
    ...module,
    values,
    writes,
    setUnavailable: (value) => {
      unavailable = value;
    },
    state: () => module.useUserConfigStore.getState(),
  };
}

test("fresh configuration and reset contain no credentials", () => {
  const app = setup();
  assert.equal(app.state().config.optsolvToken, "");
  assert.equal(app.state().config.azurePat, "");
  app.state().updateConfig({ azurePat: "session-pat", optsolvToken: "session-token" });
  app.state().resetConfig();
  assert.equal(app.state().config.optsolvToken, "");
  assert.equal(app.state().config.azurePat, "");
});

test("combined modes require both integrations", () => {
  const app = setup();
  app.state().updateConfig({ optsolvToken: "session-token" });
  assert.equal(app.state().hasRequiredConfig("optsolv-only"), true);
  assert.equal(app.state().hasRequiredConfig("combined-auto"), false);
  app.state().updateConfig({
    azurePat: "pat",
    azureOrganization: "org",
    azureProject: "project",
    azureRepositoryId: "repo",
  });
  assert.equal(app.state().hasRequiredConfig("combined-custom"), true);
});

test("credentials stay out of persistence until explicitly remembered", () => {
  const app = setup();
  app.state().updateConfig({
    azurePat: "session-pat",
    optsolvToken: "session-token",
    azureOrganization: "org",
  });
  let saved = JSON.parse(app.values.get("auto-daily-config"));
  assert.equal(saved.state.config.azurePat, "");
  assert.equal(saved.state.config.optsolvToken, "");
  app.state().updateConfig({ rememberCredentials: true });
  saved = JSON.parse(app.values.get("auto-daily-config"));
  assert.equal(saved.state.config.azurePat, "session-pat");
  app.state().updateConfig({ rememberCredentials: false });
  saved = JSON.parse(app.values.get("auto-daily-config"));
  assert.equal(saved.state.config.azurePat, "");
  assert.equal(app.state().config.azurePat, "session-pat");
});

test("legacy hydration drops saved secrets and preserves preferences", async () => {
  const app = setup({
    version: 0,
    state: {
      config: {
        azurePat: "legacy-pat",
        optsolvToken: "legacy-token",
        language: "en-US",
        azureOrganization: " org ",
      },
    },
  });
  await app.hydrateUserConfigStore();
  assert.equal(app.state().isHydrated, true);
  assert.equal(app.state().config.azurePat, "");
  assert.equal(app.state().config.optsolvToken, "");
  assert.equal(app.state().config.rememberCredentials, false);
  assert.equal(app.state().config.language, "en-US");
  assert.equal(app.state().config.azureOrganization, "org");
  assert.equal(
    JSON.stringify(JSON.parse(app.values.get("auto-daily-config"))).includes("legacy-pat"),
    false
  );
});

test("versioned hydration restores credentials only with a boolean opt-in", async () => {
  for (const rememberCredentials of [true, false, "true"]) {
    const app = setup({
      version: 1,
      state: {
        config: {
          azurePat: "remembered-pat",
          optsolvToken: "remembered-token",
          rememberCredentials,
        },
      },
    });
    await app.hydrateUserConfigStore();
    assert.equal(app.state().config.azurePat, rememberCredentials === true ? "remembered-pat" : "");
    assert.equal(
      app.state().config.optsolvToken,
      rememberCredentials === true ? "remembered-token" : ""
    );
  }
});

test("invalid stored JSON completes hydration and is replaced with safe defaults", async () => {
  const app = setup();
  app.values.set("auto-daily-config", "{invalid json");
  await app.hydrateUserConfigStore();
  assert.equal(app.state().isHydrated, true);
  assert.equal(app.state().config.optsolvToken, "");
  assert.equal(JSON.parse(app.values.get("auto-daily-config")).version, 1);
});

test("hydrate tolerates unavailable or malformed storage", async () => {
  for (const initial of [
    null,
    {
      version: 1,
      state: {
        config: {
          azurePat: 42,
          defaultMode: "invalid",
          language: false,
          rememberCredentials: "true",
        },
      },
    },
  ]) {
    const app = setup(initial, initial === null);
    await app.hydrateUserConfigStore();
    assert.equal(app.state().isHydrated, true);
    assert.equal(app.state().config.azurePat, "");
    assert.equal(app.state().config.defaultMode, "combined-auto");
    app.state().updateConfig({ azurePat: "session-pat" });
    assert.equal(app.state().config.azurePat, "session-pat");
  }
});

test("blocked persistence is visible while session remains usable, without recursive writes", async () => {
  const app = setup(null, true);
  await app.hydrateUserConfigStore();
  assert.equal(app.state().isHydrated, true);
  assert.equal(app.state().persistenceAvailable, false);
  const before = app.writes.length;
  app.state().updateConfig({ optsolvToken: "session-token", rememberCredentials: true });
  assert.equal(app.state().config.optsolvToken, "session-token");
  assert.equal(app.state().persistenceAvailable, false);
  assert.ok(app.writes.length - before <= 2);
  app.setUnavailable(false);
  app.state().updateConfig({ language: "en-US" });
  assert.equal(app.state().persistenceAvailable, true);
  const saved = JSON.parse(app.values.get("auto-daily-config"));
  assert.equal(Object.hasOwn(saved.state, "persistenceAvailable"), false);
  app.setUnavailable(true);
  app.state().clearCredentials();
  assert.equal(app.state().config.optsolvToken, "");
  assert.equal(app.state().persistenceAvailable, false);
});

test("saved input is trimmed, Azure accepts names, and OptSolv validates optional email", () => {
  const app = setup();
  app.state().updateConfig({
    optsolvToken: " token ",
    azureUserEmail: " Marcus Silva ",
    optsolvUserEmail: " person@example.com ",
  });
  assert.equal(app.state().getHeaders()["x-optsolv-token"], "token");
  assert.equal(app.state().getHeaders()["x-optsolv-user-email"], "person@example.com");
  assert.equal(app.state().getHeaders()["x-azure-user-email"], "Marcus Silva");
  assert.equal(app.state().getValidation().errors.azureUserEmail, undefined);
  app.state().updateConfig({ optsolvUserEmail: "bad-email" });
  assert.ok(app.state().getValidation().errors.optsolvUserEmail);
  app.state().updateConfig({ optsolvUserEmail: "" });
  assert.equal(app.state().getValidation().errors.optsolvUserEmail, undefined);
  app.state().updateConfig({ azureUserEmail: "" });
  assert.equal(app.state().getValidation().errors.azureUserEmail, undefined);
});

test("clearCredentials preserves preferences and identity", () => {
  const app = setup();
  app.state().updateConfig({
    azurePat: "pat",
    optsolvToken: "token",
    rememberCredentials: true,
    azureOrganization: "org",
    language: "en-US",
  });
  app.state().clearCredentials();
  assert.equal(app.state().config.azurePat, "");
  assert.equal(app.state().config.optsolvToken, "");
  assert.equal(app.state().config.rememberCredentials, false);
  assert.equal(app.state().config.azureOrganization, "org");
  assert.equal(app.state().config.language, "en-US");
  const saved = JSON.parse(app.values.get("auto-daily-config"));
  assert.equal(saved.state.config.azurePat, "");
  assert.equal(saved.state.config.optsolvToken, "");
});
