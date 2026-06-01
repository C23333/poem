import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, buildHreflangLinks, jsonLdPayloads, pageRobots, serializeJsonLd } from "./meta";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  personJsonLd,
  poemJsonLd,
  websiteJsonLd
} from "./structured-data";

describe("SEO helpers", () => {
  it("builds canonical URLs from site config", () => {
    expect(buildCanonicalUrl("https://poem.example", "/poems/jing-ye-si")).toBe(
      "https://poem.example/poems/jing-ye-si"
    );
  });

  it("builds hreflang links for Chinese and English poem routes", () => {
    const links = buildHreflangLinks("https://poem.example", {
      zh: "/poems/jing-ye-si",
      en: "/en/poems/jing-ye-si"
    });

    expect(links).toContainEqual({ lang: "zh-CN", href: "https://poem.example/poems/jing-ye-si" });
    expect(links).toContainEqual({ lang: "en", href: "https://poem.example/en/poems/jing-ye-si" });
  });

  it("noindexes thin pages", () => {
    expect(pageRobots(false)).toBe("noindex,follow");
    expect(pageRobots(true)).toBe("index,follow");
  });

  it("builds poem JSON-LD as CreativeWork", () => {
    const json = poemJsonLd({
      siteUrl: "https://poem.example",
      path: "/poems/jing-ye-si",
      title: "静夜思",
      author: "李白",
      language: "zh-CN"
    });

    expect(json["@type"]).toBe("CreativeWork");
    expect(json.name).toBe("静夜思");
    expect(json.author.name).toBe("李白");
  });

  it("serializes JSON-LD without allowing a script close tag", () => {
    const html = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(html).not.toContain("</script>");
    expect(html).toContain("\\u003c/script>");
  });

  it("normalizes optional JSON-LD into renderable payloads", () => {
    expect(jsonLdPayloads(undefined)).toEqual([]);
    expect(jsonLdPayloads({ name: "one" })).toEqual([{ name: "one" }]);
    expect(jsonLdPayloads([{ name: "one" }, { name: "two" }])).toHaveLength(2);
  });

  it("builds WebSite JSON-LD with a canonical URL", () => {
    const json = websiteJsonLd({
      siteUrl: "https://poem.example",
      name: "未名诗阁",
      description: "Chinese poetry"
    });

    expect(json["@type"]).toBe("WebSite");
    expect(json.url).toBe("https://poem.example/");
  });

  it("builds breadcrumb JSON-LD", () => {
    const json = breadcrumbJsonLd("https://poem.example", [
      { name: "Poems", path: "/poems" },
      { name: "静夜思", path: "/poems/jing-ye-si" }
    ]);

    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(2);
  });

  it("builds Person JSON-LD for poet pages", () => {
    const json = personJsonLd({
      siteUrl: "https://poem.example",
      path: "/poets/li-bai",
      name: "李白",
      alternateName: "Li Bai"
    });

    expect(json["@type"]).toBe("Person");
    expect(json.alternateName).toBe("Li Bai");
  });

  it("builds CollectionPage JSON-LD", () => {
    const json = collectionPageJsonLd({
      siteUrl: "https://poem.example",
      path: "/collections/moon-and-home",
      name: "月与故乡",
      description: "Moon and home poems"
    });

    expect(json["@type"]).toBe("CollectionPage");
    expect(json.url).toBe("https://poem.example/collections/moon-and-home");
  });

  it("builds Article JSON-LD", () => {
    const json = articleJsonLd({
      siteUrl: "https://poem.example",
      path: "/articles/how-to-read-jing-ye-si",
      title: "如何读《静夜思》",
      description: "Reading guide",
      author: "未名诗阁编辑部",
      dateModified: "2026-05-31"
    });

    expect(json["@type"]).toBe("Article");
    expect(json.headline).toBe("如何读《静夜思》");
  });
});
