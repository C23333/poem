import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { verifyDiscovery } from "../../../scripts/verify-discovery.mjs";

async function createDist(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), "poetry-discovery-"));
  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(root, path);
    await mkdir(join(fullPath, ".."), { recursive: true });
    await writeFile(fullPath, content, "utf8");
  }
  return root;
}

describe("verifyDiscovery", () => {
  it("accepts complete discovery output with parseable JSON-LD", async () => {
    const dist = await createDist({
      "robots.txt": "Sitemap: https://poem.example/sitemap-index.xml\n",
      "rss.xml": "<rss></rss>",
      "sitemap-0.xml": "<urlset><url><loc>https://poem.example/poems/jing-ye-si</loc></url></urlset>",
      "index.html": '<script type="application/ld+json">{"@type":"WebSite"}</script>'
    });

    expect(await verifyDiscovery({ distDir: dist })).toEqual([]);
  });

  it("rejects thin poem URLs in sitemap output", async () => {
    const dist = await createDist({
      "robots.txt": "Sitemap: https://poem.example/sitemap-index.xml\n",
      "rss.xml": "<rss></rss>",
      "sitemap-0.xml": "<urlset><url><loc>https://poem.example/poems/jiang-ye</loc></url></urlset>",
      "index.html": "<html></html>"
    });

    await expect(verifyDiscovery({ distDir: dist })).resolves.toContain(
      "sitemap-0.xml must not contain the non-indexable poem jiang-ye."
    );
  });

  it("rejects personal center URLs in sitemap output", async () => {
    const dist = await createDist({
      "robots.txt": "Sitemap: https://poem.example/sitemap-index.xml\n",
      "rss.xml": "<rss></rss>",
      "sitemap-0.xml": "<urlset><url><loc>https://poem.example/me/</loc></url></urlset>",
      "index.html": "<html></html>"
    });

    await expect(verifyDiscovery({ distDir: dist })).resolves.toContain(
      "sitemap-0.xml must not contain noindex personal center URLs."
    );
  });

  it("rejects unparsable JSON-LD blocks", async () => {
    const dist = await createDist({
      "robots.txt": "Sitemap: https://poem.example/sitemap-index.xml\n",
      "rss.xml": "<rss></rss>",
      "sitemap-0.xml": "<urlset></urlset>",
      "index.html": '<script type="application/ld+json">{"@type":</script>'
    });

    const errors = await verifyDiscovery({ distDir: dist });
    expect(errors.some((error) => error.includes("has invalid JSON-LD"))).toBe(true);
  });
});
