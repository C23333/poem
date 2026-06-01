import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { isNoindexSitemapUrl } from "../src/lib/seo/sitemap-rules.js";

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function jsonLdBlocks(html) {
  return Array.from(
    html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  ).map((match) => match[1].trim());
}

function normalizedSiteUrl(value) {
  return value ? value.replace(/\/+$/, "") : "";
}

export async function verifyDiscovery(options = {}) {
  const distDir = options.distDir || join(process.cwd(), "dist");
  const productionMode = Boolean(options.productionMode);
  const siteUrl = normalizedSiteUrl(options.siteUrl || process.env.PUBLIC_SITE_URL || "");
  const errors = [];

  if (!existsSync(distDir)) {
    return [`${distDir} does not exist. Run npm run build first.`];
  }

  const requiredFiles = ["robots.txt", "rss.xml", "sitemap-0.xml"];
  for (const file of requiredFiles) {
    if (!existsSync(join(distDir, file))) {
      errors.push(`${file} is missing from dist output.`);
    }
  }

  const sitemapPath = join(distDir, "sitemap-0.xml");
  if (existsSync(sitemapPath)) {
    const sitemap = await readFile(sitemapPath, "utf8");
    if (sitemap.includes("/poems/jiang-ye")) {
      errors.push("sitemap-0.xml must not contain the non-indexable poem jiang-ye.");
    }
    if (Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g)).some((match) => isNoindexSitemapUrl(match[1].trim()))) {
      errors.push("sitemap-0.xml must not contain noindex personal center URLs.");
    }

    if (productionMode) {
      if (!siteUrl || siteUrl === "https://example.com") {
        errors.push("PUBLIC_SITE_URL must be a real production domain before discovery verification.");
      }
      if (sitemap.includes("https://example.com")) {
        errors.push("sitemap-0.xml must not contain example.com in production mode.");
      }
      if (siteUrl && !sitemap.includes(siteUrl)) {
        errors.push(`sitemap-0.xml must contain the production site URL ${siteUrl}.`);
      }
    }
  }

  const htmlFiles = (await walkFiles(distDir)).filter((file) => file.endsWith(".html"));
  if (htmlFiles.length === 0) {
    errors.push("No HTML files were found in dist output.");
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const displayPath = relative(distDir, file).replace(/\\/g, "/");
    for (const block of jsonLdBlocks(html)) {
      try {
        JSON.parse(block);
      } catch (error) {
        errors.push(`${displayPath} has invalid JSON-LD: ${error.message}`);
      }
    }
  }

  return errors;
}

async function main() {
  const errors = await verifyDiscovery({
    productionMode: process.env.DISCOVERY_PRODUCTION === "true" || process.env.NODE_ENV === "production"
  });

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }

  console.log("Discovery verification passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
