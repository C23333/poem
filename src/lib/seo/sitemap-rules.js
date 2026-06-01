export const NOINDEX_SITEMAP_PATHS = ["/me/"];

function pathnameFromUrl(url) {
  const pathname = new URL(url).pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function isNoindexSitemapUrl(url) {
  const pathname = pathnameFromUrl(url);
  return NOINDEX_SITEMAP_PATHS.includes(pathname);
}

export function isPublicSitemapUrl(url) {
  return !url.includes("?") && !isNoindexSitemapUrl(url);
}
