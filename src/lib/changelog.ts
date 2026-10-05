import { readFileSync } from "node:fs";
import path from "node:path";

export interface ReleaseNotes {
  version: string;
  date: string | null;
  body: string;
}

/**
 * Cabeçalhos gerados pelo release-it (`## [1.1.0](link) (2026-10-10)` ou `## 1.0.1 (2026-10-10)`)
 * e escritos à mão (`## [1.0.0] - 2026-10-04`).
 */
const RELEASE_HEADING =
  /^##\s+\[?v?(\d+\.\d+\.\d+[\w.-]*)\]?(?:\([^)]*\))?\s*(?:-\s*|\()?(\d{4}-\d{2}-\d{2})?/;

/** Seção mais recente do changelog: a primeira versão listada, até a próxima. */
export function parseLatestRelease(changelog: string): ReleaseNotes | null {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => RELEASE_HEADING.test(line));
  if (start === -1) return null;
  const match = lines[start].match(RELEASE_HEADING);
  if (!match) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  const body = (end === -1 ? rest : rest.slice(0, end))
    .join("\n")
    .replace(/\n-{3,}\s*$/, "")
    .trim();
  return { version: match[1], date: match[2] ?? null, body };
}

/** Lido no build: a página /app é estática, então as notas seguem junto com o HTML. */
export function getLatestReleaseNotes(): ReleaseNotes | null {
  try {
    return parseLatestRelease(readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8"));
  } catch {
    return null;
  }
}
