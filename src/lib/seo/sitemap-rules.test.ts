import { describe, expect, it } from "vitest";
import { isNoindexSitemapUrl, isPublicSitemapUrl } from "./sitemap-rules.js";

describe("sitemap rules", () => {
  it("excludes personal center URLs from public sitemap output", () => {
    expect(isNoindexSitemapUrl("https://poem.example/me/")).toBe(true);
    expect(isNoindexSitemapUrl("https://poem.example/me")).toBe(true);
    expect(isPublicSitemapUrl("https://poem.example/me/")).toBe(false);
  });

  it("keeps query URLs out of sitemap output", () => {
    expect(isPublicSitemapUrl("https://poem.example/poems/jing-ye-si/?mode=en")).toBe(false);
  });

  it("keeps normal public pages indexable in sitemap output", () => {
    expect(isNoindexSitemapUrl("https://poem.example/poems/jing-ye-si/")).toBe(false);
    expect(isPublicSitemapUrl("https://poem.example/poems/jing-ye-si/")).toBe(true);
  });
});
