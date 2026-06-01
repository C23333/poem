export function buildCanonicalUrl(siteUrl: string, path: string): string {
  const normalizedSite = siteUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedSite}${normalizedPath}`;
}

export function buildHreflangLinks(siteUrl: string, paths: { zh?: string; en?: string }) {
  const links: Array<{ lang: string; href: string }> = [];

  if (paths.zh) links.push({ lang: "zh-CN", href: buildCanonicalUrl(siteUrl, paths.zh) });
  if (paths.en) links.push({ lang: "en", href: buildCanonicalUrl(siteUrl, paths.en) });

  return links;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function jsonLdPayloads(data: unknown | unknown[] | undefined): unknown[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

export function pageRobots(indexable: boolean): string {
  return indexable ? "index,follow" : "noindex,follow";
}
