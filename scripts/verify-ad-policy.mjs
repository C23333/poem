import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

async function walkHtml(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkHtml(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

function relPath(distDir, filePath) {
  return relative(distDir, filePath).replace(/\\/g, "/");
}

function hasEnabledAd(html) {
  return html.includes("adsbygoogle");
}

function hasAdvertisementLabel(html) {
  return /aria-label=["']Advertisement["']|>\s*Advertisement\s*</i.test(html);
}

function hasMisleadingAdText(html) {
  return /(相关推荐|推荐阅读|Recommended poems?|Related poems?)/i.test(html) && hasEnabledAd(html);
}

function hasStickyAdPosition(html) {
  return /adsbygoogle[\s\S]{0,180}position\s*:\s*(fixed|sticky)|position\s*:\s*(fixed|sticky)[\s\S]{0,180}adsbygoogle/i.test(html);
}

export async function verifyAdPolicy(options = {}) {
  const distDir = options.distDir || join(process.cwd(), "dist");
  const files = await walkHtml(distDir);
  const errors = [];

  for (const file of files) {
    const html = await readFile(file, "utf8");
    if (!hasEnabledAd(html)) continue;

    const rel = relPath(distDir, file);
    if (!hasAdvertisementLabel(html)) {
      errors.push(`${rel} has an enabled ad without an Advertisement label.`);
    }
    if (hasMisleadingAdText(html)) {
      errors.push(`${rel} uses misleading recommendation text near an ad.`);
    }
    if (hasStickyAdPosition(html)) {
      errors.push(`${rel} uses sticky/fixed ad positioning.`);
    }
  }

  return errors;
}

async function main() {
  const errors = await verifyAdPolicy();
  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }

  console.log("Ad policy verification passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
