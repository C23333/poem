import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildIndexNowSubmissionRequest, extractSitemapUrls, filterReviewedSubmissionUrls } from "../src/lib/search/submit-urls.mjs";

const dryRun = process.argv.includes("--dry-run");
const distDir = process.env.DIST_DIR || join(process.cwd(), "dist");
const sitemapPath = join(distDir, "sitemap-0.xml");
const siteUrl = (process.env.PUBLIC_SITE_URL || "https://example.com").replace(/\/+$/, "");

async function main() {
  if (!existsSync(sitemapPath)) {
    throw new Error("dist/sitemap-0.xml is missing. Run npm run build first.");
  }

  const urls = filterReviewedSubmissionUrls(extractSitemapUrls(await readFile(sitemapPath, "utf8")));
  const request = buildIndexNowSubmissionRequest({
    endpoint: process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow",
    siteUrl,
    key: process.env.INDEXNOW_KEY || "",
    urls
  });

  if (dryRun) {
    console.log(JSON.stringify({ url: request.url, body: request.body }, null, 2));
    return;
  }

  const response = await fetch(request.url, {
    ...request.init,
    body: JSON.stringify(request.body)
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`IndexNow submission failed: ${response.status} ${text}`);
  }

  console.log(`IndexNow submitted ${urls.length} URLs.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
