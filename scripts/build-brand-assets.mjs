import { spawnSync } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const project = new URL("../", import.meta.url);
// Keep SVG caption rendering cache in the workspace, without installing fonts.
if (process.platform === "win32" && !process.env.FONTCONFIG_FILE) {
  const fontCache = new URL(".omx/cache/brand-fontconfig/", project);
  await mkdir(new URL("cache/", fontCache), { recursive: true });
  const escapeXml = (value) =>
    value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  const fontDirectory = `${process.env.WINDIR || "C:/Windows"}/Fonts`.replaceAll("\\", "/");
  const config = `<fontconfig><dir>${escapeXml(fontDirectory)}</dir><cachedir>${escapeXml(fileURLToPath(new URL("cache/", fontCache)))}</cachedir></fontconfig>`;
  const configPath = new URL("fonts.conf", fontCache);
  await writeFile(configPath, config);
  const rendered = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
    env: { ...process.env, FONTCONFIG_FILE: fileURLToPath(configPath) },
    stdio: "inherit",
  });
  if (rendered.error) throw rendered.error;
  process.exit(rendered.status ?? 1);
}
const sharp = (await import("sharp")).default;
const assetRoot = new URL("public/brand/", project);
const docRoot = new URL("docs/brand/", project);
const outlines = JSON.parse(
  await readFile(new URL("fonts/wordmark-outlines.json", docRoot), "utf8")
);

const brand = JSON.parse(await readFile(new URL("src/lib/brand.json", project), "utf8"));
const markPath = brand.symbolPath;

const colors = brand.colors;
const manifestPath = new URL("public/manifest.json", project);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
await writeFile(
  manifestPath,
  `${JSON.stringify(
    {
      ...manifest,
      name: brand.name,
      short_name: brand.name,
      description: brand.description,
      theme_color: colors.green,
      id: "/",
      scope: "/",
      lang: "pt-BR",
    },
    null,
    2
  )}\n`
);
const svg = (body, width = 256, height = 256, title = "Auto Daily") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;
const mark = (color, x = 0, y = 0, size = 256) =>
  `<path fill="${color}" transform="translate(${x} ${y}) scale(${size / 256})" d="${markPath}"/>`;
const word = (color, x, y, height) =>
  `<path fill="${color}" fill-rule="evenodd" transform="translate(${x} ${y}) scale(${height / outlines.bounds.height}) translate(${-outlines.bounds.x} ${-outlines.bounds.y})" d="${outlines.path}"/>`;
const text = (value, x, y, size = 18, color = colors.ink, weight = 400) =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}">${value}</text>`;
const wordWidth = (height) => (outlines.bounds.width / outlines.bounds.height) * height;

await Promise.all([
  mkdir(assetRoot, { recursive: true }),
  mkdir(new URL("concepts/", docRoot), { recursive: true }),
]);

const concepts = [
  {
    name: "AD contínuo",
    note: "Monograma com haste compartilhada",
    body: '<path d="M32 216L104 40L176 216M60 152H148M128 40H148C192 40 228 78 228 128C228 178 192 216 148 216H128" fill="none" stroke="currentColor" stroke-width="30" stroke-linejoin="round"/>',
  },
  {
    name: "Daily aberto",
    note: "Letra própria com abertura de revisão",
    body: `<path fill="currentColor" d="${markPath}"/>`,
  },
  {
    name: "Síntese",
    note: "Duas entradas, uma expressão",
    body: '<path fill="currentColor" d="M36 48H132C185 48 228 83.8 228 128C228 172.2 185 208 132 208H36V168H132C162.9 168 188 150.1 188 128C188 105.9 162.9 88 132 88H36Z"/><path fill="currentColor" d="M36 108H132V148H36Z"/>',
  },
];

let conceptBody =
  '<rect width="1440" height="900" fill="#ffffff"/>' +
  text("Auto Daily · estudos de identidade", 56, 72, 32, colors.ink, 600) +
  text(
    "Uma ideia por símbolo. Avaliação em preto, branco e tamanhos reais.",
    56,
    111,
    18,
    "#58655e"
  );
for (const [index, concept] of concepts.entries()) {
  const x = 56 + index * 448;
  await writeFile(
    new URL(`concepts/${index + 1}-symbol.svg`, docRoot),
    svg(`<g color="#192820">${concept.body}</g>`)
  );
  conceptBody += `<g color="#192820" transform="translate(${x + 72} 176) scale(0.95)">${concept.body}</g>`;
  conceptBody +=
    text(concept.name, x, 484, 26, colors.ink, 600) + text(concept.note, x, 516, 17, "#58655e");
  conceptBody += `<g color="#ffffff" transform="translate(${x} 554)"><rect width="112" height="112" rx="18" fill="#192820"/><g transform="translate(8 8) scale(0.375)">${concept.body}</g></g>`;
  for (const [size, offset] of [
    [64, 146],
    [32, 246],
    [16, 318],
  ]) {
    conceptBody += `<g color="#192820" transform="translate(${x + offset} ${554 + (112 - size) / 2}) scale(${size / 256})">${concept.body}</g>`;
    conceptBody += text(`${size} px`, x + offset, 698, 13, "#58655e");
  }
  if (index === 1) conceptBody += text("Direção recomendada", x, 769, 18, colors.green, 600);
}
conceptBody += text(
  "Estudos originais. Cor e aplicações refinadas na direção Daily aberto.",
  56,
  850,
  16,
  "#58655e"
);
await writeFile(
  new URL("concepts/overview.svg", docRoot),
  svg(conceptBody, 1440, 900, "Estudos de identidade Auto Daily")
);
await sharp(Buffer.from(svg(conceptBody, 1440, 900)))
  .png()
  .toFile(fileURLToPath(new URL("concepts/overview.png", docRoot)));

const horizontalWidth = Math.ceil(288 + wordWidth(140) + 32);
const socialBody = `<rect width="1200" height="630" fill="#f5f7f6"/>${mark(colors.green, 72, 174, 256)}${word(colors.ink, 364, 220, 128)}${text(brand.tagline, 364, 414, 28, "#58655e")}`;
await sharp(Buffer.from(svg(socialBody, 1200, 630)))
  .png()
  .toFile(fileURLToPath(new URL("social-preview.png", assetRoot)));
const variants = [
  ["brand", colors.green, colors.ink],
  ["dark", colors.mint, "#eaf1ec"],
  ["black", "#000000", "#000000"],
  ["white", "#ffffff", "#ffffff"],
];
for (const [name, symbolColor, wordColor] of variants) {
  await writeFile(new URL(`symbol-${name}.svg`, assetRoot), svg(mark(symbolColor)));
  const horizontal = svg(mark(symbolColor) + word(wordColor, 288, 58, 140), horizontalWidth, 256);
  await writeFile(new URL(`horizontal-${name}.svg`, assetRoot), horizontal);
  await sharp(Buffer.from(horizontal))
    .resize({ width: 1600 })
    .png()
    .toFile(fileURLToPath(new URL(`horizontal-${name}.png`, assetRoot)));
  const stackedWidth = Math.ceil(wordWidth(112) + 64);
  await writeFile(
    new URL(`stacked-${name}.svg`, assetRoot),
    svg(
      mark(symbolColor, (stackedWidth - 256) / 2, 0) + word(wordColor, 32, 304, 112),
      stackedWidth,
      448
    )
  );
}
await writeFile(
  new URL("wordmark.svg", assetRoot),
  svg(word(colors.ink, 16, 16, 140), Math.ceil(wordWidth(140) + 32), 172)
);
await sharp(Buffer.from(svg(mark(colors.green))))
  .resize(1024, 1024)
  .png()
  .toFile(fileURLToPath(new URL("symbol-1024.png", assetRoot)));

const tileBody = `<rect width="512" height="512" rx="112" fill="${colors.green}"/>${mark(colors.white, 24, 20, 448)}`;
const tileSvg = svg(tileBody, 512, 512);
await writeFile(new URL("app-icon.svg", assetRoot), tileSvg);
const faviconBody = `<rect width="512" height="512" rx="112" fill="${colors.green}"/><g transform="translate(0 -8)">${mark(colors.white, 0, 0, 512)}</g>`;
const faviconSvg = svg(faviconBody, 512, 512);
const maskableSvg = svg(
  `<rect width="512" height="512" fill="${colors.green}"/>${mark(colors.white, 64, 56, 368)}`,
  512,
  512
);
const appleSvg = svg(
  `<rect width="512" height="512" fill="${colors.green}"/>${mark(colors.white, 24, 20, 448)}`,
  512,
  512
);
await writeFile(
  new URL("symbol-small.svg", assetRoot),
  svg(`<g transform="translate(0 -4)">${mark(colors.green)}</g>`)
);
await writeFile(new URL("favicon.svg", assetRoot), faviconSvg);
await writeFile(new URL("maskable.svg", assetRoot), maskableSvg);
await sharp(Buffer.from(maskableSvg))
  .resize(512, 512)
  .png()
  .toFile(fileURLToPath(new URL("icon-maskable-512.png", assetRoot)));
await sharp(Buffer.from(appleSvg))
  .resize(180, 180)
  .png()
  .toFile(fileURLToPath(new URL("apple-touch-icon.png", assetRoot)));
for (const size of [16, 24, 32, 48, 64, 128, 180, 192, 512]) {
  await sharp(Buffer.from(size <= 64 ? faviconSvg : tileSvg))
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(`icon-${size}.png`, assetRoot)));
}
// PNG-in-ICO preserves transparent rounded corners and includes a true 16 px drawing.
const icoSizes = [16, 32, 48];
const iconBuffers = await Promise.all(
  icoSizes.map((size) => readFile(new URL(`icon-${size}.png`, assetRoot)))
);
const icoHeader = Buffer.alloc(6 + 16 * icoSizes.length);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(icoSizes.length, 4);
let offset = icoHeader.length;
for (const [index, size] of icoSizes.entries()) {
  const entry = 6 + index * 16;
  icoHeader[entry] = size;
  icoHeader[entry + 1] = size;
  icoHeader.writeUInt16LE(1, entry + 4);
  icoHeader.writeUInt16LE(32, entry + 6);
  icoHeader.writeUInt32LE(iconBuffers[index].length, entry + 8);
  icoHeader.writeUInt32LE(offset, entry + 12);
  offset += iconBuffers[index].length;
}
await writeFile(new URL("favicon.ico", assetRoot), Buffer.concat([icoHeader, ...iconBuffers]));
await copyFile(new URL("fonts/OFL.txt", docRoot), new URL("OFL-Geist.txt", assetRoot));
await copyFile(new URL("favicon.svg", assetRoot), new URL("public/favicon.svg", project));
await copyFile(new URL("favicon.ico", assetRoot), new URL("src/app/favicon.ico", project));
await writeFile(new URL("public/apple-touch-icon.svg", project), appleSvg);

let board =
  `<rect width="1600" height="1160" fill="#f5f7f6"/>` +
  text("Auto Daily", 64, 68, 24, colors.ink, 600) +
  text("Daily aberto · identidade visual", 64, 107, 18, "#58655e");
board +=
  '<rect x="48" y="148" width="1504" height="342" rx="20" fill="#ffffff"/>' +
  mark(colors.green, 112, 187, 256) +
  word(colors.ink, 418, 252, 130);
board +=
  `<rect x="48" y="522" width="728" height="302" rx="20" fill="${colors.dark}"/>${mark(colors.white, 100, 545, 256)}` +
  text("Uma cor. A mesma assinatura.", 392, 682, 22, "#eaf1ec", 500);
board +=
  `<rect x="808" y="522" width="744" height="302" rx="20" fill="${colors.green}"/>${mark(colors.white, 864, 552, 240)}` +
  text("Auto Daily", 1130, 653, 36, "#ffffff", 600) +
  text("Seu trabalho, bem contado.", 1130, 696, 19, "#ffffff");
board += text("Tamanhos reais", 64, 886, 20, colors.ink, 600);
for (const [index, size] of [16, 24, 32, 48, 64].entries()) {
  board +=
    mark(colors.green, 64 + index * 122, 916 + (64 - size) / 2, size) +
    text(`${size} px`, 64 + index * 122, 1014, 14, "#58655e");
}
board +=
  `<g transform="translate(944 892) scale(0.29)">${tileBody}</g>` +
  text("Ícone de aplicativo", 1140, 978, 19, colors.ink, 500);
board += text(
  "Vetor original · assinatura em curvas · paleta existente do produto",
  64,
  1110,
  17,
  "#58655e"
);
await writeFile(
  new URL("brand-board.svg", docRoot),
  svg(board, 1600, 1160, "Identidade Auto Daily")
);
await sharp(Buffer.from(svg(board, 1600, 1160)))
  .png()
  .toFile(fileURLToPath(new URL("brand-board.png", docRoot)));

let proof =
  '<rect width="1200" height="620" fill="#ffffff"/>' +
  text("Auto Daily · prova de redução e reversão", 40, 50, 25, colors.ink, 600);
for (const [row, background, foreground] of [
  [0, "#ffffff", "#176344"],
  [1, "#131a17", "#ffffff"],
]) {
  proof += `<rect x="24" y="${96 + row * 232}" width="1152" height="212" fill="${background}"/>`;
  for (const [index, size] of [16, 24, 32, 48, 64, 128].entries()) {
    proof +=
      mark(foreground, 56 + index * 174, 132 + row * 232 + (128 - size) / 2, size) +
      text(`${size} px`, 56 + index * 174, 282 + row * 232, 14, foreground);
  }
}
await sharp(Buffer.from(svg(proof, 1200, 620)))
  .png()
  .toFile(fileURLToPath(new URL("size-proof.png", docRoot)));
console.log("Brand assets generated: public/brand and docs/brand");
