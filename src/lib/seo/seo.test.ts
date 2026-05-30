import { describe, expect, it } from "vitest";
import { buildCanonicalUrl, buildHreflangLinks, pageRobots, serializeJsonLd } from "./meta";
import { poemJsonLd } from "./structured-data";

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
});
