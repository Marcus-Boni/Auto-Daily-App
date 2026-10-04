import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const nativeRequire = createRequire(import.meta.url);

// Each load has an isolated module cache, so store and route tests cannot share state.
export function loadTypeScript(relativePath, mocks = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const require = (specifier) => {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      if (specifier.startsWith("@/") || specifier.startsWith(".")) {
        const path = specifier.startsWith("@/")
          ? resolve(root, "src", specifier.slice(2))
          : resolve(dirname(filename), specifier);
        return load(path.endsWith(".ts") || path.endsWith(".tsx") ? path : `${path}.ts`);
      }
      return nativeRequire(specifier);
    };
    new Function("require", "module", "exports", source)(require, module, module.exports);
    return module.exports;
  }
  return load(resolve(root, relativePath));
}
