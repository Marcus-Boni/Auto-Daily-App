export function getSiteUrl(value?: string): URL | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error();
    return url;
  } catch {
    throw new Error(
      "SITE_URL deve ser uma URL HTTP(S) pública, sem credenciais, query ou fragmento."
    );
  }
}
