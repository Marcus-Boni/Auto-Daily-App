import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const { getSiteUrl } = loadTypeScript("src/lib/site-url.ts");

test("canonical remains optional until an actual deployment URL is configured", () => {
  assert.equal(getSiteUrl(), undefined);
  assert.equal(getSiteUrl("  "), undefined);
  assert.equal(getSiteUrl("https://example.com/").href, "https://example.com/");
  assert.equal(getSiteUrl("http://127.0.0.1:4050").origin, "http://127.0.0.1:4050");
});

test("deployment metadata rejects unsafe URLs without echoing their contents", () => {
  for (const value of [
    "file:///private",
    "javascript:alert(1)",
    "https://user:secret@example.com",
    "https://example.com/?token=secret",
    "https://example.com/#private",
    "not-a-url",
  ]) {
    assert.throws(
      () => getSiteUrl(value),
      (error) => !error.message.includes(value) && !error.message.includes("secret")
    );
  }
});

test("all manifest icon references resolve to production brand assets", () => {
  const manifest = JSON.parse(readFileSync("public/manifest.json", "utf8"));
  for (const icon of manifest.icons) assert.ok(existsSync(`public${icon.src}`), icon.src);
  const ico = readFileSync("src/app/favicon.ico");
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
});

test("exported SVGs share the approved geometry and remain font-independent", () => {
  const brand = JSON.parse(readFileSync("src/lib/brand.json", "utf8"));
  for (const variant of ["brand", "dark", "black", "white"]) {
    const svg = readFileSync(`public/brand/horizontal-${variant}.svg`, "utf8");
    assert.ok(svg.includes(brand.symbolPath));
    assert.doesNotMatch(svg, /<(text|image|script|filter|foreignObject)\b/);
  }
});

test("standalone lockup is named and decorative lockup stays out of the accessibility tree", () => {
  const brand = JSON.parse(readFileSync("src/lib/brand.json", "utf8"));
  const { BrandMark } = loadTypeScript("src/components/brand-mark.tsx", {
    "@/lib/brand.json": brand,
  });
  const { BrandLogo } = loadTypeScript("src/components/brand-logo.tsx", {
    "@/lib/brand.json": brand,
    "@/components/brand-mark": { BrandMark },
  });
  const named = renderToStaticMarkup(createElement(BrandLogo));
  const decorative = renderToStaticMarkup(createElement(BrandLogo, { decorative: true }));
  assert.match(named, /role="img" aria-label="Auto Daily"/);
  assert.match(decorative, /aria-hidden="true"/);
  assert.ok(named.includes(brand.symbolPath));
});
