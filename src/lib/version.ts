/** Injetada no build a partir do package.json (next.config.ts): o release-it só precisa atualizar um lugar. */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
export const GITHUB_REPO_URL = "https://github.com/Marcus-Boni/Auto-Daily-App";
export const RELEASES_URL = `${GITHUB_REPO_URL}/releases`;
export const CHANGELOG_URL = `${GITHUB_REPO_URL}/blob/main/CHANGELOG.md`;
